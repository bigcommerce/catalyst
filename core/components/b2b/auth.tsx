'use client';
import { useActionState, useEffect, useRef } from 'react';
import { logout } from '../header/_actions/logout';
import { Form } from '../ui/form';
import { useRouter } from 'next/navigation';

interface B2BProviderProps {
  b2bToken?: string;
}

const loginToB2b = async (b2bToken: string, refresh: () => void) => {
  const token = window.b2b.utils.user.getB2BToken();
  if (!b2bToken) {
    if (token) await window.b2b.utils.user.logout();
    return;
  }

  if (!token) {
    await window.b2b.utils.user.loginWithB2BStorefrontToken(b2bToken);
    refresh()
  }
};

export default function B2BProvider({ b2bToken }: B2BProviderProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(logout, null);
  const formRef = useRef<HTMLFormElement | null>(null)
  const refresh = () => router.refresh()
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.b2b?.utils) {
        window.b2b.callbacks.addEventListener('on-logout', () => {
          formRef.current?.submit();
        });
        loginToB2b(b2bToken ?? '', refresh);
        clearInterval(interval);
      }
    }, 500);
  }, []);

  return <Form ref={formRef} action={formAction} style={{ display: 'none' }}></Form>;
}

B2BProvider.displayName = 'B2BProvider';
