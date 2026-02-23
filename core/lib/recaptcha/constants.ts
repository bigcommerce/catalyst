export interface ReCaptchaSettings {
  failedLoginLockoutDurationSeconds: number | null;
  isEnabledOnCheckout: boolean;
  isEnabledOnStorefront: boolean;
  siteKey: string;
}

/** FormData key used to pass the reCAPTCHA token from client to server actions */
export const RECAPTCHA_TOKEN_FORM_KEY = 'recaptchaToken';
