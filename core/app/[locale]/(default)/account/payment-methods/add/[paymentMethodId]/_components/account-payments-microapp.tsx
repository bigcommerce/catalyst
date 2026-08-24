'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { toast } from '@/vibes/soul/primitives/toaster';
import { ACCOUNT_PAYMENTS_MICROAPP_BASE, Manifest } from '~/lib/account-payments/manifest';
import { buildMicroappStyles } from '~/lib/account-payments/styles';

interface Props {
  storeContextData: Omit<HeadlessStoreContextDataInterface, 'vaultToken'>;
  manifest: Manifest;
}

interface VaultTokenResponse {
  vaultToken: string;
}

function isVaultTokenResponse(value: unknown): value is VaultTokenResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'vaultToken' in value &&
    typeof value.vaultToken === 'string'
  );
}

class VaultTokenUnauthorizedError extends Error {}

export function AccountPaymentsMicroapp({ storeContextData, manifest }: Props) {
  const t = useTranslations('Account.PaymentMethods.Add.Errors');
  const [vaultToken, setVaultToken] = useState<string>();
  const [scriptsReady, setScriptsReady] = useState(0);
  // Guards against calling `renderAccountPayments` more than once for the lifetime of this component instance
  const hasRenderedRef = useRef(false);

  useEffect(() => {
    async function fetchVaultToken() {
      const res = await fetch('/api/account/vault-token');

      if (res.status === 401) {
        throw new VaultTokenUnauthorizedError();
      }

      if (!res.ok) {
        throw new Error(`Vault token request failed with status ${res.status}`);
      }

      const data: unknown = await res.json();

      if (!isVaultTokenResponse(data)) {
        throw new Error('Invalid vault token response');
      }

      setVaultToken(data.vaultToken);
    }

    fetchVaultToken().catch((error: unknown) => {
      toast.error(
        error instanceof VaultTokenUnauthorizedError
          ? t('sessionExpired')
          : t('somethingWentWrong'),
      );
    });
  }, [t]);

  useEffect(() => {
    if (
      hasRenderedRef.current ||
      !vaultToken ||
      scriptsReady < manifest.js.length ||
      !window.BigCommerce?.renderAccountPayments
    ) {
      return;
    }

    hasRenderedRef.current = true;

    window.BigCommerce.renderAccountPayments({
      styles: buildMicroappStyles(),
      storeContextData: { ...storeContextData, vaultToken },
      errorHandler: (message: string) => {
        toast.error(message);
      },
    });
  }, [vaultToken, scriptsReady, manifest.js.length, storeContextData]);

  return (
    <>
      {manifest.js.map((src) => (
        <Script
          crossOrigin="anonymous"
          integrity={manifest.integrity[src]}
          key={src}
          onLoad={() => setScriptsReady((n) => n + 1)}
          src={`${ACCOUNT_PAYMENTS_MICROAPP_BASE}/${src}`}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}
