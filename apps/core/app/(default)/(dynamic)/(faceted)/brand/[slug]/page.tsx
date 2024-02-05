import { useCustomerProvider } from '~/app/contexts/CustomerContext';
import { useSearchParamsProvider } from '~/app/contexts/SearchParamsContext';
import { getSessionCustomerId } from '~/auth';

import BrandPageContents from './_pageContents';

interface BrandPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  useSearchParamsProvider(searchParams);

  const customerId = await getSessionCustomerId();

  useCustomerProvider(customerId);

  return <BrandPageContents params={params} />;
}

export const runtime = 'edge';
