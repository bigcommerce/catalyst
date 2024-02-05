import { useCustomerProvider } from '~/app/contexts/CustomerContext';
import { useSearchParamsProvider } from '~/app/contexts/SearchParamsContext';
import { getSessionCustomerId } from '~/auth';

import CategoryPageContents from './_pageContents';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  useSearchParamsProvider(searchParams);

  const customerId = await getSessionCustomerId();

  useCustomerProvider(customerId);

  return <CategoryPageContents params={params} />;
}

export const runtime = 'edge';
