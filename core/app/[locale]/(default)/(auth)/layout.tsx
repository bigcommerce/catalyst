import { PropsWithChildren } from 'react';

import { AccountStatusProvider } from '../account/(tabs)/_components/account-status-provider';

export default function LoginLayout({ children }: PropsWithChildren) {
  return <AccountStatusProvider isPermanentBanner={true}>{children}</AccountStatusProvider>;
}
