/**
 * Since these are placed in overview, the loading layer will only be applied to the main dash page and not the subfolders. If the loading file was in the root directory of the dashboard folder it will be used for all sub folders as well.
 * Can used folder names in parenthasis in order to separate out sections so that certain layers dont trickle into them. Creates separation ie (shops) (marketing) etc
 */

import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenueSB, fetchLatestInvoiceSB, fetchCardDataSB } from '../../lib/data';
import { Suspense } from 'react'; //Use for streaming singular components
import CardWrapper from '@/app/ui/dashboard/cards';
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton } from '@/app/ui/skeletons';

// export const revalidate = 0; //Timer for new fetch request

export default async function Page() {

  const {
    numberOfInvoicesSB: numberOfInvoices,
    numberOfCustomersSB: numberOfCustomers,
    totalPaidInvoicesSB: totalPaidInvoices,
    totalPendingInvoicesSB: totalPendingInvoices
  } = await fetchCardDataSB();
  // const revenue = await fetchRevenueSB();
  // const latestInvoices = await fetchLatestInvoiceSB();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
        <Card title="Collected" value={totalPaidInvoices} type="collected" />
        <Card title="Pending" value={totalPendingInvoices} type="pending" />
        <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
        <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">

        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
          {/* <RevenueChart revenue={revenue}  /> */}
        </Suspense>
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
          {/* <LatestInvoices latestInvoices={latestInvoices} /> */}
        </Suspense>
      </div>
    </main>
  );
}