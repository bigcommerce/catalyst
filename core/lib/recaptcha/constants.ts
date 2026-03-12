export interface ReCaptchaSettings {
  failedLoginLockoutDurationSeconds: number | null;
  isEnabledOnCheckout: boolean;
  isEnabledOnStorefront: boolean;
  siteKey: string;
}

export const RECAPTCHA_TOKEN_FORM_KEY = 'g-recaptcha-response';
