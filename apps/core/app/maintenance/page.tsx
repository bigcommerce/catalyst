import { Phone } from 'lucide-react';
import { ReactNode } from 'react';

import client from '~/client';
import { StoreLogo } from '~/components/StoreLogo';

const Container = ({ children }: { children: ReactNode }) => (
  <main className="mx-auto mt-[64px] px-6 md:px-10 lg:mt-[128px]">{children}</main>
);

export default async function MaintenancePage() {
  const storeSettings = await client.getStoreSettings();

  if (!storeSettings) {
    return (
      <Container>
        <h1 className="my-4 text-h2">We are down for maintenance</h1>
      </Container>
    );
  }

  const { contact, statusMessage } = storeSettings;

  return (
    <Container>
      <StoreLogo />

      <h1 className="my-8 text-h2">We are down for maintenance</h1>

      {Boolean(statusMessage) && <p className="mb-4">{statusMessage}</p>}

      {contact && (
        <address className="flex flex-col gap-2 not-italic">
          <p>You can contact us at:</p>

          <p className="flex items-center gap-2">
            <Phone aria-hidden="true" />
            <a className="text-blue-primary" href={`tel:${contact.phone}`}>
              {contact.phone}
            </a>
          </p>
        </address>
      )}
    </Container>
  );
}

export const runtime = 'edge';
