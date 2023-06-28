import { getStoreSettings } from '@bigcommerce/catalyst-client';
import { Fragment } from 'react';

export const ContactInformation = async () => {
  const settings = await getStoreSettings();
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
