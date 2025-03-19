'use client';

import {
  Environment,
  Footer,
  Header,
  SharedComponentsProvider,
} from '@channel/shared-header-footer';
import type { PropsWithChildren } from 'react';

export const AviosSharedHeaderFooter = ({ children }: PropsWithChildren) => {
  const handleLogin = () => {
    return true;
  };
  const handleOut = () => {
    return true;
  };

  const accessToken = process.env.NEXT_PUBLIC_AVIOS_SHARED_CMS_ACCESS_TOKEN || '';
  const loginUrl = process.env.NEXT_PUBLIC_AVIOS_SHARED_LOGIN_CALLBACK || '';
  const logoutUrl = process.env.NEXT_PUBLIC_AVIOS_SHARED_LOGOUT_CALLBACK || '';

  const userBalance = 28403;
  const userDetails = {
    membershipNumber: '012345678',
    name: 'Jane Doe',
  };

  return (
    <SharedComponentsProvider cms={{ accessToken, environment: Environment.DEV }}>
      <Header
        auth={{
          loginProps: {
            href: loginUrl,
            onClick: handleLogin,
          },
          logoutProps: {
            href: logoutUrl,
            onClick: handleOut,
          },
        }}
        userBalance={userBalance}
        userDetails={userDetails}
      />
      {children}
      <Footer />
    </SharedComponentsProvider>
  );
};
