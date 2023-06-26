import { getStoreSettings } from '@bigcommerce/catalyst-client';
import {
  FooterContactInformationAddress,
  FooterContactInformationPhoneNumber,
} from '@bigcommerce/reactant/Footer';
import { Fragment } from 'react';

export const ContactInformation = async () => {
  const settings = await getStoreSettings();
  const contact = settings?.contact;

  if (!contact) {
    return null;
  }

  return (
    <>
      <FooterContactInformationAddress>
        {contact.address.split('\n').map((line) => (
          <Fragment key={line}>
            {line}
            <br />
          </Fragment>
        ))}
      </FooterContactInformationAddress>
      {contact.phone ? (
        <FooterContactInformationPhoneNumber>
          <p>{contact.phone}</p>
        </FooterContactInformationPhoneNumber>
      ) : null}
    </>
  );
};
