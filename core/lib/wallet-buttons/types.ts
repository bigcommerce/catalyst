declare global {
  interface Window {
    checkoutKitLoader?: CheckoutKitLoader;
  }
}

interface CheckoutKitLoader {
  load(moduleName: string): Promise<CheckoutKitModule>;
}

interface CheckoutKitModule {
  createWalletButtonInitializer(options: {
    graphQLEndpoint: string;
  }): CheckoutHeadlessButtonInitializer;
}

interface CheckoutHeadlessButtonInitializer {
  initializeWalletButton(option: InitializeButtonProps): void;
}

export interface InitializeButtonProps {
  [key: string]: unknown;
  containerId: string;
  methodId: string;
}
