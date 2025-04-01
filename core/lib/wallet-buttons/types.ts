declare global {
  interface Window {
    checkoutKitLoader?: CheckoutKitLoader;
  }
}

interface CheckoutKitLoader {
  load(moduleName: string): Promise<CheckoutKitModule>;
}

interface CheckoutKitModule {
  createHeadlessCheckoutWalletInitializer(): CheckoutHeadlessButtonInitializer;
}

interface CheckoutHeadlessButtonInitializer {
  initializeHeadlessButton(option: InitializeButtonProps): void;
}

export interface InitializeButtonProps {
  [key: string]: unknown;
  containerId: string;
  methodId: string;
}
