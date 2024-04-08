import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "./initSupabase";

export async function supabaseTester() {
    noStore();
    const data = Promise.all([ //Can also use await but using promise to avoid waterfall requests
        // supabase.from('Invoices').select('*', { count: 'exact' }),
        supabase.from('Invoices').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('Invoices').select('*', { count: 'exact' }).eq('status', 'paid')
    ]);

    return data;
}