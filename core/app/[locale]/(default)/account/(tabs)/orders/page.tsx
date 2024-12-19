import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { TabHeading } from '../_components/tab-heading';

import { getCustomerOrders } from './page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { OrderListTabs } from './_components/order-list-tabs';
import { ExistingResultType } from '~/client/util';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';

interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export type Orders = ExistingResultType<typeof getCustomerOrders>['orders'];

export default async function Orders({ searchParams }: Props) {
  const { before, after } = await searchParams;
  const t = await getTranslations('Account.Orders');

  const customerOrdersDetails = await getCustomerOrders({
    ...(after && { after }),
    ...(before && { before }),
  });

  if (!customerOrdersDetails) {
    notFound();
  }

  const { orders, pageInfo } = customerOrdersDetails;
  const icon = imageManagerImageUrl("waving-hand-1-.png", '24w');
  const breadcrumbs: any = [{
    label: "Orders",
    href: '#'
  }];
  return (
    <>
      <div className="my-[2rem] flex w-full justify-center text-[#353535]">
        <div className="flex w-[76%] flex-col gap-[20px]">
          <ComponentsBreadcrumbs className="mt-10" breadcrumbs={breadcrumbs} />
          <div className="flex flex-col gap-[20px]">
            <div className="text-[24px] font-normal leading-[32px] text-[#000000]">{t('heading')}</div>
            {orders.length === 0 ? (
              <div className="mx-auto w-fit">{t('noOrders')}</div>
            ) : (
              <>
                {<OrderListTabs orders={orders} pageInfo={pageInfo} icon={icon} />}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const runtime = 'edge';