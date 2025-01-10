import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import { Maintenance as MaintenanceSection } from '@/vibes/soul/sections/maintenance';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';

const MaintenancePageQuery = graphql(
  `
    query MaintenancePageQuery {
      site {
        settings {
          contact {
            phone
            email
          }
          statusMessage
          ...StoreLogoFragment
        }
      }
    }
  `,
  [StoreLogoFragment],
);

export async function generateMetadata() {
  const t = await getTranslations('Maintenance');

  return {
    title: t('title'),
  };
}

const Container = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto flex h-screen flex-row items-center px-4 md:px-10">{children}</main>
);

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Maintenance({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Maintenance');

  const { data } = await client.fetch({
    document: MaintenancePageQuery,
  });

  const storeSettings = data.site.settings;

  if (!storeSettings) {
    return (
      <Container>
        <MaintenanceSection className="flex-1" />
      </Container>
    );
  }

  const { contact, statusMessage } = storeSettings;
  const logo = data.site.settings ? logoTransformer(data.site.settings) : '';

  return (
    <Container>
      <MaintenanceSection
        className="flex-1"
        contactEmail={contact?.email}
        contactPhone={contact?.phone}
        contactText={t('contactUs')}
        logo={logo}
        statusMessage={statusMessage ?? undefined}
        title={t('message')}
      />
    </Container>
  );
}
