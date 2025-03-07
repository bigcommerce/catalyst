import { useEffect, useRef, useState } from 'react';

import { WalletButtonsInitializer } from '~/lib/wallet-buttons';
import { Option } from '~/lib/wallet-buttons/types';

export const WalletButtons = ({ methodIds }: { methodIds: string[] }) => {
  const isMountedRef = useRef(false);
  const [buttons, setButtons] = useState<Option[]>([]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      const initWalletButtons = async () => {
        const initializedButtons = await new WalletButtonsInitializer(
          window.location.origin,
        ).initialize(methodIds);

        setButtons(initializedButtons);
      };

      void initWalletButtons();
    }
  }, [methodIds]);

  return (
    <div style={{ display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
      {buttons.map((button) =>
        button.containerId ? <div id={button.containerId} key={button.containerId} /> : null,
      )}
    </div>
  );
};
