declare global {
  interface Window {
    checkoutKitLoader?: CheckoutKitLoader;
  }
}

interface CheckoutKitLoader {
  load(moduleName: string): Promise<CheckoutKitModule>;
}

interface CheckoutKitModule {
  createHeadlessCheckoutWalletInitializer(props: {
    host?: string;
  }): CheckoutHeadlessButtonInitializer;
}

interface CheckoutHeadlessButtonInitializer {
  initializeHeadlessButton(option: Option): void;
}

interface OptionProps {
  style: {
    color: string;
    label: string;
  };
  cartId: string;
}

interface PaypalCommerceOption {
  methodId: 'paypalcommerce';
  containerId: string;
  paypalcommerce: OptionProps;
}

interface PaypalCommerceCreditOption {
  methodId: 'paypalcommercecredit';
  containerId: string;
  paypalcommercecredit: OptionProps;
}

export type Option = PaypalCommerceOption | PaypalCommerceCreditOption;
