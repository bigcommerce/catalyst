import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
 
import { TabHeading } from '../_components/tab-heading';
 
import { getCustomerOrders } from './page-data';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { OrderListTabs } from './_components/order-list-tabs';
import { ExistingResultType } from '~/client/util';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import wavingHandIcon from '~/public/pdp-icons/wavingHandIcon.svg';
import { Link as CustomLink } from '~/components/link';
import { BcImage } from '~/components/bc-image';
import chevronRight from '~/public/orders/chevronRight.svg';
 
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
  const breadcrumbs: any = [
    {
      label: 'Orders',
      href: '#',
    },
  ];
  return (
    <>
      <div className="flex w-full justify-center text-[#353535]">
        <div className="flex w-full flex-col gap-5 px-5 xl:w-[70%] xl:p-0">
          <div className="flex items-center justify-center gap-[5px] xl:hidden">
            <div>
              <BcImage
                src={chevronRight}
                width={8}
                height={12}
                alt="Chevron Right"
                unoptimized={true}
              />
            </div>
            <CustomLink
              href="/account"
              className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-[#006380]"
            >
              Account Center
            </CustomLink>
          </div>
          <ComponentsBreadcrumbs className="hidden xl:block" breadcrumbs={breadcrumbs} />
          <div className="flex flex-col gap-[20px]">
            <div className="text-center text-[24px] font-normal leading-[32px] text-[#000000] xl:text-left">
              {t('heading')}
            </div>
            {orders.length === 0 ? (
              <div className="mx-auto w-fit">{t('noOrders')}</div>
            ) : (
              <>{<OrderListTabs orders={orders} pageInfo={pageInfo} icon={wavingHandIcon} />}</>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
 
export const runtime = 'edge';