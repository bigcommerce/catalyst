import { graphql } from '~/client/graphql';

export const ResetPasswordFormFragment = graphql(`
  fragment ResetPasswordFormFragment on ReCaptchaSettings {
    isEnabledOnStorefront
    siteKey
  }
`);
