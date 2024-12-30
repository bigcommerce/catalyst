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

  return (
    <div className='flex flex-col gap-[30px]'>
      <div>
      <ComponentsBreadcrumbs className="" breadcrumbs={breadcrumbs} />
      <TabHeading heading="addresses" />
      </div>
      <AddressBook addressesCount={addressesCount} customerAddresses={addresses} key={endCursor}>
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
