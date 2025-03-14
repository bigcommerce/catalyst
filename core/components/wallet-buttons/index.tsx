import { createWalletButtonsInitOptions } from '~/components/wallet-buttons/_actions/create-wallet-buttons-init-options';

import { ClientWalletButtons } from './_components/client-wallet-buttons';

export const WalletButtons = async () => {
  const walletButtons = await createWalletButtonsInitOptions();

  return <ClientWalletButtons walletButtons={walletButtons} />;
};
