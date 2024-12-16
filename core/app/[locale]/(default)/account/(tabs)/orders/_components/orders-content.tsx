import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../../_components/tab-heading';
import { getCustomerOrders, getOrderDetails } from '../page-data';

import { OrderDetails } from './order-details';
import { OrdersList } from './orders-list';

import { Search as SearchIcon } from 'lucide-react';

import { imageManagerImageUrl } from '~/lib/store-assets';
import Link from 'next/link';
import { BcImage } from '~/components/bc-image';

type CustomerOrders = NonNullable<Awaited<ReturnType<typeof getCustomerOrders>>>;

interface Props {
  orderId?: string;
  orders: CustomerOrders['orders'];
  pageInfo: CustomerOrders['pageInfo'];
}

export const OrdersContent = async ({ orderId, orders, pageInfo }: Props) => {
  console.log('========inside orfer content=======',);

  const icon = imageManagerImageUrl("waving-hand-1-.png", '24w')

  const t = await getTranslations('Account.Orders');
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;
  console.log('========orderId=======', orderId);
  if (orderId) {
    const orderData = await getOrderDetails({ orderId });
    console.log('========innnnn=======', JSON.stringify(orderData));
    return orderData ? <OrderDetails data={orderData} /> : notFound();
  }

  return (
    <>
      {/* <TabHeading heading="My Orders" /> */}
      <h4 className='text-2xl mt-[20px]'>{t('heading')}</h4>
      <h4 className="text-2xl mt-[20px] text-[#008BB7]">{t('lookupAnOrder')}</h4>
      <div className='mt-[20px] flex flex-row justify-between items-center py-[6px] px-[20px] gap-[10px] h-[44px] border border-[#CCCBCB] rounded-[3px]'>
        <input className="w-[1120px] text-[16px] tracking-[0.5px] leading-8 font-normal outline-none" placeholder="Search by keyword or Order Number" />
        <SearchIcon />
      </div>
      <div className ="flex flex-row gap-[10px] mt-[20px]">
        <BcImage src={icon} className="fill-[#fffff]" alt="hand-icon" width={24} unoptimized={true} />
      <span> {t('stillNeedHelp')} </span>
      <Link href="#" className="text-base font-semibold text-[#008BB7]"> {t('contact')}</Link> 
      </div>


      {orders.length === 0 ? (
        <div className="mx-auto w-fit">{t('noOrders')}</div>
      ) : (
        <OrdersList customerOrders={orders} key={endCursor} />
      )}
      <div className="mb-14 inline-flex w-full justify-center py-6">
        <Pagination
          className="my-0 flex justify-center text-center"
          endCursor={endCursor ?? undefined}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          startCursor={startCursor ?? undefined}
        />
      </div>
    </>
  );
};
