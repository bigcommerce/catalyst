import { ExistingResultType } from '~/client/util';

import { getCustomerSettingsQuery } from '../page-data';

import { ChangePasswordForm } from './change-password-form';
import { UpdateSettingsForm } from './update-settings-form';

interface Props {
  action?: string | string[];
  customerSettings: CustomerSettings;
}

type CustomerSettings = ExistingResultType<typeof getCustomerSettingsQuery>;

export const SettingsContent = ({ action, customerSettings }: Props) => {
  if (action === 'change_password') {
    return (
      <div className="mx-auto lg:w-2/3">
        <ChangePasswordForm />
      </div>
    );
  }

  return (
    <div className="mx-auto lg:w-2/3">
      <UpdateSettingsForm {...customerSettings} />
    </div>
  );
};
