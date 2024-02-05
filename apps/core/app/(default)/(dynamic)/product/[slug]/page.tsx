import { useCustomerProvider } from '~/app/contexts/CustomerContext';
import { useSearchParamsProvider } from '~/app/contexts/SearchParamsContext';
import { getSessionCustomerId } from '~/auth';

import ProductPageContents from './_pageContents';

interface ProductPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  useSearchParamsProvider(searchParams);

  const customerId = await getSessionCustomerId();

  useCustomerProvider(customerId);

  return <ProductPageContents params={params} />;
}

export const runtime = 'edge';
