'use client';

import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { State as AccountState } from '../settings/_actions/submit-customer-change-password-form';

const defaultState: AccountState = { status: 'idle', message: '' };

export const AccountStatusContext = createContext<{
  accountState: AccountState;
  setAccountState: (state: AccountState | ((prevState: AccountState) => AccountState)) => void;
} | null>(null);

export const AccountStatusProvider = ({ children }: { children: ReactNode }) => {
  const [accountState, setAccountState] = useState<AccountState>(defaultState);
  const pathname = usePathname();

  useEffect(() => {
    // Reset account state when changing the route except the Account Page
    if (pathname !== '/account/' && pathname !== '/login/') {
      setAccountState(defaultState);
    }
  }, [pathname]);

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
