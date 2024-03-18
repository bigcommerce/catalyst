import { client } from '..';
import { graphql } from '../graphql';
import { revalidate } from '../revalidate-target';

const GET_RECAPTCHA_SETTINGS_QUERY = graphql(`
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
`);

export const getReCaptchaSettings = async () => {
  const response = await client.fetch({
    document: GET_RECAPTCHA_SETTINGS_QUERY,
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.settings?.reCaptcha;
};
