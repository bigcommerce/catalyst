import { client } from '..';
import { graphql } from '../generated';
import { revalidate } from '../revalidate-target';

const GET_RECAPTCHA_SETTINGS_QUERY = /* GraphQL */ `
  query getReCaptchaSettings {
    site {
      settings {
        reCaptcha {
          isEnabledOnStorefront
          siteKey
        }
      }
    }
  }
`;

export const getReCaptchaSettings = async () => {
  const query = graphql(GET_RECAPTCHA_SETTINGS_QUERY);
  const response = await client.fetch({ document: query, fetchOptions: { next: { revalidate } } });

  return response.data.site.settings?.reCaptcha;
};
