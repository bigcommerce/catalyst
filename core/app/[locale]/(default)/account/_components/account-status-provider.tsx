'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { usePathname } from '~/i18n/routing';

export interface AccountState {
  status: 'idle' | 'error' | 'success';
  messages: string[];
}

const defaultState: AccountState = { status: 'idle', messages: [''] };

export const AccountStatusContext = createContext<{
  accountState: AccountState;
  setAccountState: (state: AccountState | ((prevState: AccountState) => AccountState)) => void;
} | null>(null);

export const AccountStatusProvider = ({ children }: { children: ReactNode }) => {
  const [accountState, setAccountState] = useState<AccountState>(defaultState);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/account/' && pathname !== '/login/' && pathname !== '/account/addresses/') {
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
