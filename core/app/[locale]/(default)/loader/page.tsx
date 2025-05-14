import { Streamable } from '@/vibes/soul/lib/streamable';
import { getSessionCustomerAccessToken } from '~/auth';
import { loader, StoreName } from '~/components/store-name';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function LoaderPage({ params }: Props) {
  const { locale } = await params;
  const customerAccessToken = await getSessionCustomerAccessToken();

  const streamableData = Streamable.from(() => loader({ customerAccessToken, locale }));

  return <StoreName data={streamableData} />;
}
