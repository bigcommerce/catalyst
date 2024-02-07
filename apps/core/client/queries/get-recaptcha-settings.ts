import { client } from '..';
import { graphql } from '../generated';

const GET_RECAPTCHA_SETTINGS_QUERY = /* GraphQL */ `
  query getReCaptchaSettings {
    site {
      settings {
        reCaptcha {
          siteKey
        }
      }
    }
  }
`;

export const getReCaptchaSettings = async () => {
  const query = graphql(GET_RECAPTCHA_SETTINGS_QUERY);
  const response = await client.fetch({ document: query });

  return response.data.site.settings?.reCaptcha;
};
