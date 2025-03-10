'use client';

import { useEffect, useRef } from 'react';

import { walletButtonsInitializer } from '~/lib/wallet-buttons';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

export const ClientWalletButtons = ({
  walletButtons,
}: {
  walletButtons: InitializeButtonProps[];
}) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      const initWalletButtons = async () =>
        walletButtonsInitializer.initialize({
          walletButtonsOptions: walletButtons,
        });

      void initWalletButtons();
    }
  }, [walletButtons]);

  return (
    <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
      {walletButtons.map((button) =>
        button.containerId ? <div id={button.containerId} key={button.containerId} /> : null,
      )}
    </div>
  );
};
