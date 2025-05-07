import { SubmissionResult } from '@conform-to/react';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface AccountState {
  account: Account;
  successMessage?: string;
  lastResult: SubmissionResult | null;
}

interface Account {
  firstName: string;
  lastName: string;
  email: string;
  company?: string | undefined;
}

type ChangePasswordAction = Action<SubmissionResult | null, FormData>;

type UpdateAccountAction = Action<AccountState, FormData>;

export interface AccountSettingsSectionProps {
  account: Account;
  changePasswordAction: ChangePasswordAction;
  changePasswordSubmitLabel?: string;
  changePasswordTitle?: string;
  confirmPasswordLabel?: string;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  title?: string;
  updateAccountAction: UpdateAccountAction;
  updateAccountSubmitLabel?: string;
}
