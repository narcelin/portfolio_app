import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCustomers, fetchCustomersSB } from '@/app/lib/data';

export default async function Page() {
  // const customers = await fetchCustomers();
  const customers = await fetchCustomersSB();
  // console.log(customers);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Create Invoice',
            href: '/dashboard/invoices/create',
            active: true,
          },
        ]}
      />
      {/* NULL PARAMETER */}
      <Form customers={customers ?? []} />
    </main>
  );
}
