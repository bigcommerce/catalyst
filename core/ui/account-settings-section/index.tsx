import { type SubmissionResult } from '@conform-to/react';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface Account {
  email: string;
  firstName: string;
  lastName: string;
  company?: string | undefined;
}

interface UpdateAccountState {
  account: Account;
  successMessage?: string;
  lastResult: SubmissionResult | null;
}

export interface AccountSettingsData {
  account: Account;
  updateAccountAction: Action<UpdateAccountState, FormData>;
  changePasswordAction: Action<SubmissionResult | null, FormData>;
}

export { AccountSettingsSection } from '@/vibes/soul/sections/account-settings-section';
