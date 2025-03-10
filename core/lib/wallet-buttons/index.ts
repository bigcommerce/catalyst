import { WalletButtonsInitializer } from './wallet-buttons-initializer';

const walletButtonsInitializer = new WalletButtonsInitializer({
  env: process.env.NODE_ENV,
});

export { walletButtonsInitializer };
