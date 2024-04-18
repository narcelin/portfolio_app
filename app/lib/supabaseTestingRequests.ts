import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./initSupabase";

export async function fetchRevenueSB() {
    noStore();
    try {
        const { data, error } = await supabase.from('Revenue').select('*').order('revenue', { ascending: true });
        return data;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}

export async function fetchLatestInvoiceSB() {
    noStore();

    // console.log("Fetching Invoice data...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    // console.log("Fetching data after 3 sec");

    // console.log("Async Function Fetching Invoice")
    try {
        const { data, error } = await supabase.from('Invoices').select(`*, Customers(*)`).order('date', { ascending: false }).limit(2); //order then limits to the number of rows returned. 2 most recent invoices
        // console.log("Invoice Fetched Data: ", data);
        return data;
    } catch (error) {
        // console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}


export async function supabaseTester() {
    noStore();

    try {
        console.log("Running Queries");
        const data = Promise.all([ //Can also use await but using promise to avoid waterfall requests
            // supabase.from('Invoices').select(`*`, { count: 'exact' }),
            // supabase.from('Invoices').select('*', { count: 'exact' }),
            // supabase.from('Invoices').select('*', { count: 'exact' }).eq('status', 'pending'),
            // supabase.from('Invoices').select('*', { count: 'exact' }).eq('status', 'paid')
            // supabase.from('Revenue').select('*').order('revenue', { ascending: true }),
            // supabase.rpc(`calculate_total_amount`, { table_name: 'Invoices' }),
        ]);

        const { data: joinedQuery } = await supabase.from('Customers').select(`name, email, Invoices(amount, date, status)`).textSearch('name', 'Lee', { type: 'websearch' });
        console.log('JOINED QUERY -> ', joinedQuery);

        // const searchedQueryRaw = await supabase.from('Customers').select(`'name', 'email', Invoices ('*')`)
        //     .textSearch('name', 'status', { type: 'websearch' })
        //     .textSearch('Invoices.status', 'status', { type: 'websearch' });
        // console.log('status' + " -> fetchFilteredInvoicesSB: ", searchedQueryRaw)

        const { data: searchById } = await supabase.from('Invoices').select('*').eq('id', '98dc5d19-08cb-4114-91bb-faf4f9de5e5f')
        console.log('RETURN VIA ID ', searchById)
        return data;

    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}