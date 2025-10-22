'use client';

import { useEffect, useRef } from 'react';

import { Stream, Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { WalletButtonsInitializer } from '~/lib/wallet-buttons';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

export const ClientWalletButtons = ({
  walletButtonsInitOptions,
  cartId,
}: {
  walletButtonsInitOptions: Streamable<InitializeButtonProps[]>;
  cartId: string;
}) => {
  const isMountedRef = useRef(false);
  const initButtonProps = useStreamable(walletButtonsInitOptions);

  useEffect(() => {
    if (!isMountedRef.current && initButtonProps.length) {
      isMountedRef.current = true;

      const initWalletButtons = async () => {
        await new WalletButtonsInitializer().initialize(initButtonProps);
      };

      void initWalletButtons();
    }
  }, [cartId, initButtonProps]);

  return (
    <Stream fallback={null} value={walletButtonsInitOptions}>
      {(buttonOptions) => (
        <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
          {buttonOptions.map((button) =>
            button.containerId ? <div id={button.containerId} key={button.containerId} /> : null,
          )}
        </div>
      )}
    </Stream>
  );
};
