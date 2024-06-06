'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { State as AccountState } from '../_actions/submit-customer-change-password-form';

export const AccountStatusContext = createContext<{
  accountState: AccountState;
  setAccountState: (state: AccountState | ((prevState: AccountState) => AccountState)) => void;
} | null>(null);

export const AccountStatusProvider = ({
  children,
  isPermanentBanner = false,
}: {
  children: ReactNode;
  isPermanentBanner?: boolean;
}) => {
  const [accountState, setAccountState] = useState<AccountState>({ status: 'idle', message: '' });

  useEffect(() => {
    if (accountState.status !== 'idle' && !isPermanentBanner) {
      setTimeout(() => {
        setAccountState({ status: 'idle', message: '' });
      }, 3000);
    }
  }, [accountState, setAccountState, isPermanentBanner]);

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
