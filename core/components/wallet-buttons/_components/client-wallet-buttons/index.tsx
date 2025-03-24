'use client';

import { useEffect, useRef, useState } from 'react';

import { WalletButtonsInitializer } from '~/lib/wallet-buttons';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

export const ClientWalletButtons = ({
  walletButtons,
  cartId,
}: {
  walletButtons: string[];
  cartId: string;
}) => {
  const isMountedRef = useRef(false);
  const [buttons, setButtons] = useState<InitializeButtonProps[]>([]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      const initWalletButtons = async () => {
        const initializedButtons = await new WalletButtonsInitializer(cartId).initialize(
          walletButtons,
        );

        setButtons(initializedButtons);
      };

      void initWalletButtons();
    }
  }, [walletButtons]);

  return (
    <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
      {buttons.map((button) =>
        button.containerId ? <div id={button.containerId} key={button.containerId} /> : null,
      )}
    </div>
  );
};
