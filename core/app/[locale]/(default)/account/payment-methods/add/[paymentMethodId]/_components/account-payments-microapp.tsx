'use client';

import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { toast } from '@/vibes/soul/primitives/toaster';
import { buildMicroappStyles } from '~/lib/account-payments/styles';

interface ManifestScript {
  src: string;
  integrity: string;
}

interface Manifest {
  appVersion: string;
  scripts: ManifestScript[];
}

interface Props {
  storeContextData: Omit<
    HeadlessStoreContextDataInterface,
    'paymentProviderInitializationData' | 'vaultToken'
  >;
  manifest: Manifest;
  requiresInitialization: boolean;
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

interface VaultInitializationResponse {
  paymentProviderInitializationData: PaymentProviderInitializationData;
}

function isVaultInitializationResponse(value: unknown): value is VaultInitializationResponse {
  return (
    typeof value === 'object' && value !== null && 'paymentProviderInitializationData' in value
  );
}

class VaultTokenUnauthorizedError extends Error {}

export function AccountPaymentsMicroapp({
  storeContextData,
  manifest,
  requiresInitialization,
}: Props) {
  const t = useTranslations('Account.PaymentMethods.Add.Errors');
  const [vaultToken, setVaultToken] = useState<string>();
  const [initializationData, setInitializationData] = useState<PaymentProviderInitializationData>();
  const [initializationReady, setInitializationReady] = useState(!requiresInitialization);
  const [scriptsReady, setScriptsReady] = useState(0);
  // Guards against calling `renderAccountPayments` more than once for the lifetime of this component instance
  const hasRenderedRef = useRef(false);

  const { storeLocale, paymentMethodId } = storeContextData;

  useEffect(() => {
    async function fetchVaultToken() {
      // `locale` lets the route resolve the same channel this page's data was built for
      const res = await fetch(`/api/account/vault-token?locale=${encodeURIComponent(storeLocale)}`);

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
  }, [t, storeLocale]);

  useEffect(() => {
    if (!requiresInitialization) {
      return;
    }

    async function fetchVaultInitialization() {
      const params = new URLSearchParams({ paymentMethodId, locale: storeLocale });
      const res = await fetch(`/api/account/vault-initialization?${params.toString()}`);

      if (res.status === 401) {
        throw new VaultTokenUnauthorizedError();
      }

      if (!res.ok) {
        throw new Error(`Vault initialization request failed with status ${res.status}`);
      }

      const data: unknown = await res.json();

      if (!isVaultInitializationResponse(data)) {
        throw new Error('Invalid vault initialization response');
      }

      setInitializationData(data.paymentProviderInitializationData);
      setInitializationReady(true);
    }

    fetchVaultInitialization().catch((error: unknown) => {
      toast.error(
        error instanceof VaultTokenUnauthorizedError
          ? t('sessionExpired')
          : t('somethingWentWrong'),
      );
    });
  }, [t, requiresInitialization, paymentMethodId, storeLocale]);

  useEffect(() => {
    if (
      hasRenderedRef.current ||
      !vaultToken ||
      !initializationReady ||
      scriptsReady < manifest.scripts.length ||
      !window.BigCommerce?.renderAccountPayments
    ) {
      return;
    }

    hasRenderedRef.current = true;

    window.BigCommerce.renderAccountPayments({
      styles: buildMicroappStyles(),
      storeContextData: {
        ...storeContextData,
        vaultToken,
        paymentProviderInitializationData: initializationData,
      },
      errorHandler: (message: string) => {
        toast.error(message);
      },
    });
  }, [
    vaultToken,
    initializationReady,
    initializationData,
    scriptsReady,
    manifest.scripts.length,
    storeContextData,
  ]);

  return (
    <>
      <div id="bc-account-payments" />
      {manifest.scripts.map(({ src, integrity }) => (
        <Script
          crossOrigin="anonymous"
          integrity={integrity}
          key={src}
          onError={() => {
            toast.error(t('somethingWentWrong'));
          }}
          onReady={() => setScriptsReady((n) => n + 1)}
          src={src}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}
