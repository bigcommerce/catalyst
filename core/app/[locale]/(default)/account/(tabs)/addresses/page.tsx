import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Pagination } from '~/components/ui/pagination';

import { TabHeading } from '../_components/tab-heading';

import { AddressBook } from './_components/address-book';
import { getCustomerAddresses } from './page-data';

import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';


interface Props {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
    before?: string;
    after?: string;
  }>;
}

export async function generateMetadata() {
  const t = await getTranslations('Account.Addresses');

  return {
    title: t('title'),
  };
}

export default async function Addresses({ searchParams }: Props) {
  //  const t = useTranslations('Account.Addresses');
  const breadcrumbs: any = [
    {
      label: 'Account Center',
      href: '/account',
    },
    {
      label: 'Addresses',
      href: '',
    },
  ];

  const { before, after } = await searchParams;

  const data = await getCustomerAddresses({
    ...(after && { after }),
    ...(before && { before }),
    limit: 10,
  });

  if (!data) {
    notFound();
  }

  const { addresses, pageInfo, addressesCount } = data;
  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = pageInfo;
const reversedOrder = [...addresses].reverse();
  return (
    <div className='flex flex-col  [&_.login-div]:hidden [&_.login-div]:lg:hidden'>
      <div>
      <ComponentsBreadcrumbs className="mb-5 px-10" breadcrumbs={breadcrumbs} />
      
      {/* <TabHeading heading="addresses" /> */}
      </div>
      <h2 className="mb-[20px] px-10 text-[24px] font-normal leading-[32px] text-[#353535] xl:mb-[30px] xl:text-left">Addresses</h2>
      <AddressBook addressesCount={addressesCount} customerAddresses={reversedOrder} key={endCursor}>
        <Pagination
          className="my-0 inline-flex justify-center text-center"
          endCursor={endCursor ?? undefined}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          startCursor={startCursor ?? undefined}
        />
      </AddressBook>
    </div>
  );
}

export const runtime = 'edge'; 
