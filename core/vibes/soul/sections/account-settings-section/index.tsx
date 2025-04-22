import { type AccountSettingsData } from '~/ui/account-settings-section';

import { ChangePasswordForm } from './change-password-form';
import { UpdateAccountForm } from './update-account-form';

interface Props extends AccountSettingsData {
  title?: string;
  updateAccountSubmitLabel?: string;
  changePasswordTitle?: string;
  changePasswordSubmitLabel?: string;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
}

export function AccountSettingsSection({
  title = 'Account Settings',
  account,
  updateAccountAction,
  updateAccountSubmitLabel,
  changePasswordTitle = 'Change Password',
  changePasswordAction,
  changePasswordSubmitLabel,
}: Props) {
  return (
    <div className="@container">
      <div className="flex flex-col gap-y-24 @xl:flex-row">
        <div className="flex w-full flex-col @xl:max-w-lg">
          <div className="pb-12">
            <h1 className="mb-10 text-4xl leading-none font-medium @xl:text-4xl">{title}</h1>
            <UpdateAccountForm
              account={account}
              action={updateAccountAction}
              submitLabel={updateAccountSubmitLabel}
            />
          </div>
          <div className="border-contrast-100 border-t pt-12">
            <h1 className="mb-10 text-2xl leading-none font-medium @xl:text-2xl">
              {changePasswordTitle}
            </h1>
            <ChangePasswordForm
              action={changePasswordAction}
              submitLabel={changePasswordSubmitLabel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
