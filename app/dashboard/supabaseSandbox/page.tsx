import { supabaseTester } from "@/app/lib/supabaseTestingRequests";

export default async function Page() {
  const supabaseSandboxQuery = await supabaseTester();
  console.log(supabaseSandboxQuery);

  return (
    <main>SUPABASE TESTING PAGE</main>)
}