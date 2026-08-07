'use client';

import { useEffect, useRef, useState } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { WalletButtonsInitializer } from '~/lib/wallet-buttons';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

const WalletButtonsList = ({
  buttonOptions,
  graphQLEndpoint,
}: {
  buttonOptions: InitializeButtonProps[];
  graphQLEndpoint: string;
}) => {
  const isInitializedRef = useRef(false);
  // Incrementing renderKey forces container divs to remount so zoid iframes attach to fresh DOM nodes
  const [renderKey, setRenderKey] = useState(0);

  // Re-initialize when page is restored from bfcache (back/forward navigation)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        isInitializedRef.current = false;
        setRenderKey((k) => k + 1);
      }
    };

    window.addEventListener('pageshow', handlePageShow);

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current && buttonOptions.length) {
      isInitializedRef.current = true;
      setRenderKey((k) => k + 1);

      const initWalletButtons = async () => {
        await new WalletButtonsInitializer().initialize(buttonOptions, graphQLEndpoint);
      };

      void initWalletButtons().finally(() => {
        isInitializedRef.current = false;
      });
    }
  }, [buttonOptions, renderKey, graphQLEndpoint]);

  return (
    <div className="flex flex-col items-end">
      {buttonOptions.map((button) => (
        <div id={button.containerId} key={`${button.containerId}-${renderKey}`} />
      ))}
    </div>
  );
};

export const ClientWalletButtons = ({
  walletButtonsInitOptions,
  graphQLEndpoint,
}: {
  walletButtonsInitOptions: Streamable<InitializeButtonProps[]>;
  graphQLEndpoint: string;
}) => {
  return (
    <Stream fallback={null} value={walletButtonsInitOptions}>
      {(buttonOptions) => (
        <WalletButtonsList buttonOptions={buttonOptions} graphQLEndpoint={graphQLEndpoint} />
      )}
    </Stream>
  );
};
