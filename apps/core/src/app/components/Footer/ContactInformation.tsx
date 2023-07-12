import { Fragment } from 'react';

import client from '~/client';

export const ContactInformation = async () => {
  const settings = await client.getStoreSettings();
  const contact = settings?.contact;

  if (!contact) {
    return null;
  }

  return (
    <>
      <address className="not-italic">
        {contact.address.split('\n').map((line) => (
          <Fragment key={line}>
            {line}
            <br />
          </Fragment>
        ))}
      </address>
      {contact.phone ? (
        <a href={`tel:${contact.phone}`}>
          <p>{contact.phone}</p>
        </a>
      ) : null}
    </>
  );
};
