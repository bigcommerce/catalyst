'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { State as AccountState } from '../_actions/submit-customer-change-password-form';

export const AccountStatusContext = createContext<{
  accountState: AccountState;
  setAccountState: (state: AccountState | ((prevState: AccountState) => AccountState)) => void;
} | null>(null);

export const AccountStatusProvider = ({ children }: PropsWithChildren) => {
  const [accountState, setAccountState] = useState<AccountState>({ status: 'idle', message: '' });

  useEffect(() => {
    if (accountState.status !== 'idle') {
      setTimeout(() => {
        setAccountState({ status: 'idle', message: '' });
      }, 3000);
    }
  }, [accountState, setAccountState]);

  return (
    <AccountStatusContext.Provider value={{ accountState, setAccountState }}>
      {children}
    </AccountStatusContext.Provider>
  );
};

export function useAccountStatusContext() {
  const context = useContext(AccountStatusContext);

  if (!context) {
    throw new Error('useAccountStatusContext must be used within a AccountStatusProvider');
  }

  return context;
}
