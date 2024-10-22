import { getTranslations } from 'next-intl/server';
import GiftCertificateTabs from './_components/gift-certificate-tabs'

export async function generateMetadata() {
  const t = await getTranslations('GiftCertificate');

  return {
    title: t('title'),
  };
}

export default async function GiftCertificateBalancePage() {
  const t = await getTranslations('GiftCertificate');

  return (
    <div>
      <div className="pb-12">
        <GiftCertificateTabs />
      </div>
    </div>
  );
}

export const runtime = 'edge';
