'use client';

import { useActionState, useEffect, useRef } from 'react';

import { logout } from '~/components/header/_actions/logout';
import { Form } from '~/components/ui/form';

interface B2BProviderProps {
  b2bToken?: string;
}

const loginToB2b = async (b2bToken: string) => {
  const token = window.b2b?.utils.user.getB2BToken();

  if (!b2bToken) {
    if (token) await window.b2b?.utils.user.logout();

    return;
  }

  if (!token || (token !== '' && token !== b2bToken)) {
    await window.b2b?.utils.user.loginWithB2BStorefrontToken(b2bToken);
    window.location.reload();
  }
};

export function B2BLogin({ b2bToken }: B2BProviderProps) {
  const [, formAction] = useActionState(logout, null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils) {
        window.b2b.callbacks.addEventListener('on-logout', () => {
          formRef.current?.submit();
        });
        void loginToB2b(b2bToken ?? '');
        clearInterval(interval);
      }
    }, 500);
  }, [b2bToken]);

  return <Form action={formAction} ref={formRef} style={{ display: 'none' }} />;
}
