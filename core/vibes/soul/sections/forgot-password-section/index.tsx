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
    <div className="@container">
      <div className="mx-auto mb-24 mt-12 max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-12">
        <h1 className="mb-5 text-4xl font-medium leading-none @xl:text-5xl">{title}</h1>
        <p className="mb-10 text-base font-light leading-none @xl:text-lg">{subtitle}</p>
        <ForgotPasswordForm action={action} emailLabel={emailLabel} submitLabel={submitLabel} />
      </div>
    </div>
  );
}
