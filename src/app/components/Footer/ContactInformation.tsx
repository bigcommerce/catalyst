import { Fragment } from 'react';

import { bcFetch } from '../../../lib/fetcher';

import { getContactInformationQuery } from './query';

export const ContactInformation = async () => {
  const { data } = await bcFetch({
    query: getContactInformationQuery,
  });

  if (!data.site.settings?.contact) {
    return null;
  }

  const { contact } = data.site.settings;

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
