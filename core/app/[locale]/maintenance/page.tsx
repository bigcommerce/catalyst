import { Metadata } from 'next';
import { cacheLife } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { Maintenance as MaintenanceSection } from '@/vibes/soul/sections/maintenance';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
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

async function getCachedMaintenancePageData() {
  'use cache';

  cacheLife({ revalidate });

  const { data } = await client.fetch({
    document: MaintenancePageQuery,
    fetchOptions: { cache: 'no-store' },
  });

  return data;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Maintenance');

  return {
    title: t('title'),
  };
}

const Container = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto flex h-screen w-full flex-col items-center justify-center px-4 md:px-10">
    {children}
  </main>
);

export default async function Maintenance() {
  const t = await getTranslations('Maintenance');

  const data = await getCachedMaintenancePageData();

  const storeSettings = data.site.settings;

  if (!storeSettings) {
    return (
      <Container>
        <MaintenanceSection className="w-full" />
      </Container>
    );
  }

  const { contact, statusMessage } = storeSettings;
  const logo = data.site.settings ? logoTransformer(data.site.settings) : '';

  return (
    <Container>
      <MaintenanceSection
        className="w-full"
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
