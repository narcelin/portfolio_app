'use server'; //By adding the 'use server', you mark all the exported functions within the file as server functions. These server functions can then be imported into Client and Server components, making them extremely versatile.

import { z } from 'zod';
import { supabase } from './initSupabase';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }), // Maybe adjust to allow negative values
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

// const FormSchema = z.object({
//     id: z.string(),
//     customerId: z.string({
//         invalid_type_error: 'Please select a customer.',
//     }),
//     amount: z.coerce.number().gt(-1, { message: 'Please enter an amount greater than $0.' }),
//     status: z.enum(['pending', 'paid'], {
//         invalid_type_error: 'Please select an invoice status.',
//     }),
//     date: z.string(),
// })

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoiceSB(prevState: State, formData: FormData) {

    // const { customerId, amount, status } = CreateInvoice.parse({
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice',
        }
    }

    const { customerId, amount, status } = validatedFields.data; //So cool to know

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        const response = await supabase.from('Invoices').insert({ id: randomUUID(), amount: amountInCents, status: status, date: date, customers_id: customerId });
        console.log("Action: Create Invoice Ran: ", response);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice',
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices'); //redirects client to new page. Would only be reachable if try is successful? Chapter 13. Weird


};

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoiceSB(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {

        const response = await supabase.from('Invoices').update({ amount: amountInCents, status: status, date: date, customers_id: customerId }).eq('id', id);
        // console.log(id);
        console.log("UPDATE INVOICE SERVER STATUS: ", response.status); // If deleted, response will need to be called
    } catch (err) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoiceSB(id: string) {
    throw new Error('Failed to Delete Invoice');

    try {
        const response = await supabase.from('Invoices').delete().eq('id', id)
        console.log(id, response);

    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
    revalidatePath('/dashboard/invoices'); // UPDATE revalidate to current params path
}