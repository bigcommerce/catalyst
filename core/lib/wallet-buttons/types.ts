export interface InitializeButtonProps {
  [key: string]: unknown;
  containerId: string;
  methodId: string;
}

export interface CheckoutKitLoader {
  load(moduleName: string): Promise<CheckoutKitModule>;
}

interface CheckoutKitModule {
  createHeadlessCheckoutWalletInitializer(
    props: CreateHeadlessCheckoutButtonInitializerProps,
  ): CheckoutHeadlessButtonInitializer;
}

interface CreateHeadlessCheckoutButtonInitializerProps {
  host?: string;
}

interface CheckoutHeadlessButtonInitializer {
  initializeHeadlessButton(props: InitializeButtonProps): void;
}
