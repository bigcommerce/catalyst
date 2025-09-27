import { ForgotPasswordAction, ForgotPasswordForm } from './forgot-password-form';

interface Props {
  title?: string;
  subtitle?: string;
  action: ForgotPasswordAction;
  emailLabel?: string;
  submitLabel?: string;
}

export function ForgotPasswordSection({
  title = 'Forgot your password?',
  subtitle = 'Enter the email associated with your account below. We’ll send you instructions to reset your password.',
  emailLabel,
  submitLabel,
  action,
}: Props) {
  return (
    <div className="mx-auto mb-12 mt-6 w-full max-w-4xl @container">
      <div className="@4xl:py-undefined py-undefined @md:py-undefined @xl:py-undefined mx-auto max-w-[var(--section-max-width-lg,1024px)] px-4 @xl:px-6 @4xl:px-8">
        <header className="pb-8 @2xl:pb-12 @4xl:pb-16">
          <h1
            className="mb-5 font-heading text-4xl font-medium leading-none @xl:text-5xl"
            style={{ fontFamily: 'var(--font-family)' }}
          >
            {title}
          </h1>
          <p className="text-base font-semibold">{subtitle}</p>
        </header>
        <ForgotPasswordForm action={action} emailLabel={emailLabel} submitLabel={submitLabel} />
      </div>
    </div>
  );
}
