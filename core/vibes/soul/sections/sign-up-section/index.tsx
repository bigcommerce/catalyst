import { SignUpAction, SignUpForm } from './sign-up-form';

type Props = {
  title?: string;
  action: SignUpAction;
  submitLabel?: string;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
};

export function SignUpSection({
  title = 'Create Account',
  submitLabel,
  firstNameLabel,
  lastNameLabel,
  emailLabel,
  passwordLabel,
  confirmPasswordLabel,
  action,
}: Props) {
  return (
    <div className="@container">
      <div className="flex flex-col justify-center gap-y-24 px-3 py-10 @xl:flex-row @xl:px-6 @4xl:py-20 @5xl:px-20">
        <div className="flex w-full flex-col @xl:max-w-lg @xl:pr-10 @4xl:pr-20">
          <h1 className="mb-10 text-4xl font-medium leading-none @xl:text-5xl">{title}</h1>
          <SignUpForm
            action={action}
            submitLabel={submitLabel}
            firstNameLabel={firstNameLabel}
            lastNameLabel={lastNameLabel}
            emailLabel={emailLabel}
            passwordLabel={passwordLabel}
            confirmPasswordLabel={confirmPasswordLabel}
          />
        </div>
      </div>
    </div>
  );
}
