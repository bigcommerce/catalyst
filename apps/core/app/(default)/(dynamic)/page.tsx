import { useCustomerProvider } from '~/app/contexts/CustomerContext';
import { getSessionCustomerId } from '~/auth';

import { useSearchParamsProvider } from '../../contexts/SearchParamsContext';

import HomeContents from './_pageContents';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Home({ searchParams }: Props) {
  useSearchParamsProvider(searchParams);

  const customerId = await getSessionCustomerId();

  useCustomerProvider(customerId);

  return <HomeContents />;
}

export const runtime = 'edge';
