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
      <div className="flex flex-col justify-center gap-y-24 px-3 py-10 @xl:flex-row @xl:px-6 @4xl:py-20 @5xl:px-20">
        <div className="flex w-full flex-col @xl:max-w-md @xl:pr-10 @4xl:pr-20">
          <h1 className="mb-5 text-4xl font-medium leading-none @xl:text-5xl">{title}</h1>
          <p className="mb-10 text-base font-light leading-none @xl:text-lg">{subtitle}</p>
          <ForgotPasswordForm action={action} submitLabel={submitLabel} emailLabel={emailLabel} />
        </div>
      </div>
    </div>
  );
}
