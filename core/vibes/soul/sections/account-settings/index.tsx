import { ChangePasswordAction, ChangePasswordForm } from './change-password-form';
import { Account, UpdateAccountAction, UpdateAccountForm } from './update-account-form';

export interface AccountSettingsSectionProps {
  title?: string;
  account: Account;
  updateAccountAction: UpdateAccountAction;
  updateAccountSubmitLabel?: string;
  changePasswordTitle?: string;
  changePasswordAction: ChangePasswordAction;
  changePasswordSubmitLabel?: string;
  confirmPasswordLabel?: string;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --account-settings-section-font-family: var(--font-family-heading);
 *   --account-settings-section-text: hsl(var(--foreground));
 *   --account-settings-section-border: hsl(var(--contrast-100));
 * }
 * ```
 */
export function AccountSettingsSection({
  title = 'Account Settings',
  account,
  updateAccountAction,
  updateAccountSubmitLabel,
  changePasswordTitle = 'Change Password',
  changePasswordAction,
  changePasswordSubmitLabel,
  confirmPasswordLabel,
  currentPasswordLabel,
  newPasswordLabel,
}: AccountSettingsSectionProps) {
  return (
    <section className="w-full @container">
      <header className="mb-4 border-b border-b-contrast-100">
        <div className="mb-4 flex min-h-[42px] items-center justify-between">
          <h1 className="font-heading text-4xl font-medium leading-none">{title}</h1>
        </div>
      </header>
      <div className="flex flex-col gap-y-24 @xl:flex-row">
        <div className="my-4 flex w-full flex-col @xl:max-w-lg">
          <div className="pb-12">
            <UpdateAccountForm
              account={account}
              action={updateAccountAction}
              submitLabel={updateAccountSubmitLabel}
            />
          </div>
          <div className="border-t border-[var(--account-settings-section-border,hsl(var(--contrast-100)))] pt-12">
            <h1 className="mb-10 font-[family-name:var(--account-settings-section-font-family,var(--font-family-heading))] text-2xl font-medium leading-none text-[var(--account-settings-section-text,var(--foreground))] @xl:text-2xl">
              {changePasswordTitle}
            </h1>
            <ChangePasswordForm
              action={changePasswordAction}
              confirmPasswordLabel={confirmPasswordLabel}
              currentPasswordLabel={currentPasswordLabel}
              newPasswordLabel={newPasswordLabel}
              submitLabel={changePasswordSubmitLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
