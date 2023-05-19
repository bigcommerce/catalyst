import { Fragment } from 'react';

import { getStoreSettings } from '@client';

export const ContactInformation = async () => {
  const settings = await getStoreSettings();
  const contact = settings?.contact;

  if (!contact) {
    return null;
  }

  return (
    <>
      <address className="mb-2 not-italic">
        {contact.address.split('\n').map((line) => (
          <Fragment key={line}>
            {line}
            <br />
          </Fragment>
        ))}
      </address>
      {contact.phone ? <p>{contact.phone}</p> : null}
    </>
  );
};
