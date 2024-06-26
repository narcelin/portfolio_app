import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';

import { supabase } from './initSupabase';

import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenueSB() {
  noStore();
  // console.log("Fetching revenue data from Supabase");/

  //Creating artificial delay in information retreival 
  // console.log("Fetching Revenue data...");
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  // console.log("Fetching data after 3 sec");

  try {
    const { data, error } = await supabase.from('Revenue').select('*').order('revenue', { ascending: true });
    // console.log("SUPABASE FETCH: ", data);
    return data;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }


}

export async function fetchLatestInvoiceSB() {
  // noStore();

  // console.log("Fetching Invoice data...");
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  // console.log("Fetching data after 3 sec");

  // console.log("Async Function Fetching Invoice")
  try {
    const { data, error } = await supabase.from('Invoices').select(`*, Customers(*)`).order('date', { ascending: false }).limit(5); //order then limits to the number of rows returned. 2 most recent invoices
    // console.log("Invoice Fetched Data: ", data);
    return data;
  } catch (error) {
    // console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    // console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardDataSB() { //Promise to avoid waterfall requests
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.

    // const invoiceResponse = await supabase.from('Invoices').select('*');
    // const customersResponse = await supabase.from('Customers').select('*');
    // const response = await supabase.from('Invoices').select('*');

    // console.log("CARD FETCHED RESPONSE: ", response.data);

    // const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;

    // const { count: invoiceCountPromiseSB } = await supabase.from('invoices').select('*', { count: 'exact' });

    // const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;

    // const { count: customerCountPromiseSB } = await supabase.from('customers').select('*', { count: 'exact' });

    // const invoiceStatusPromise = sql`SELECT
    //      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    //      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    //      FROM invoices`;

    const dataSB = await Promise.all([ //Can also use await but using promise to avoid waterfall requests
      // supabase.from('Invoices').select('*', { count: 'exact' }),
      supabase.from('Invoices').select('*', { count: 'exact' }),
      supabase.from('Customers').select('*', { count: 'exact' }),
      supabase.rpc('calculate_total_amount', { table_name: 'Invoices', status: 'pending' }),
      supabase.rpc('calculate_total_amount', { table_name: 'Invoices', status: 'paid' })
    ]);

    const numberOfInvoicesSB = Number(dataSB[0].count ?? '0');
    const numberOfCustomersSB = Number(dataSB[1].count ?? '0');
    const totalPaidInvoicesSB = formatCurrency(dataSB[2].data ?? 0); //Issue with the query. Need to return a number which is the sum of all the $ amounts requested
    const totalPendingInvoicesSB = formatCurrency(dataSB[3].data ?? 0);
    // const totalPaidInvoicesSB = formatCurrency(3000);
    // const totalPendingInvoicesSB = formatCurrency(4700);

    // const data = await Promise.all([
    //   invoiceCountPromise,
    //   customerCountPromise,
    //   invoiceStatusPromise,
    // ]);

    // const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    // const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    // const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    // const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomersSB,
      numberOfInvoicesSB,
      totalPaidInvoicesSB,
      totalPendingInvoicesSB,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchFilteredInvoicesSB(
  query: string,
  currentPage: number,
) {
  noStore(); // Would like to set a timer on here or some sort of requirment
  const { data: queriedInvoiceData } = await supabase.from('Invoices').select('*').textSearch('status', query, {
    type: 'websearch'
  });
  // console.log(queriedInvoiceData);

  return queriedInvoiceData;
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceByIdSB(id: string) {
  try {
    // console.log(id);
    const { data } = await supabase.from('Invoices').select('*').eq('id', id);
    const invoice = data?.map((data) => ({ ...data, amount: data.amount / 100 }));
    return invoice?.[0];

    // const invoice = data.map((invoice) => ({
    //   ...invoice,
    //   // Convert amount from cents to dollars
    //   amount: invoice.amount / 100,
    // }));

    // return invoice[0];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchCustomersSB() {
  try {
    const { data: customerData } = await supabase.from('Customers').select('id, name').order('name', { ascending: true });
    return customerData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers using Supabase Client.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
