import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceByIdSB, fetchCustomersSB } from '@/app/lib/data';
import { unstable_noStore as noStore } from 'next/cache';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  noStore();
  const id = params.id;
  // revalidatePath(`/dashboard/invoices/${id}/edit`); // This can also be used to avoid cash issues when editing data
  const [invoice, customers] = await Promise.all([
    fetchInvoiceByIdSB(id),
    fetchCustomersSB(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} />
    </main>
  );
}
