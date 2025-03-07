import { InitializationError } from './error';
import { Option } from './types';

const options: Option[] = [
  {
    methodId: 'paypalcommerce',
    containerId: 'paypalcommerce-button',
    paypalcommerce: {
      style: { color: 'gold', label: 'checkout' },
      cartId: 'cartId',
    },
  },
  {
    methodId: 'paypalcommercecredit',
    containerId: 'paypalcommerce-credit-button',
    paypalcommercecredit: {
      style: { color: 'gold', label: 'checkout' },
      cartId: 'cartId',
    },
  },
];

export class WalletButtonsInitializer {
  private checkoutSdkUrl = `${window.location.origin}/v1/loader.js`;
  // private checkoutSdkUrl = 'https://checkout-sdk.bigcommerce.com/v1/loader.js';

  constructor(private url: string) {}

  async initialize(methodIds: string[]): Promise<Option[]> {
    await this.initializeCheckoutKitLoader();

    const checkoutButtonInitializer = await this.initCheckoutButtonInitializer();

    return options
      .filter(({ methodId }) => methodIds.includes(methodId))
      .map((option) => {
        checkoutButtonInitializer.initializeHeadlessButton(option);

        return option;
      });
  }

  private async initializeCheckoutKitLoader(): Promise<void> {
    if (window.checkoutKitLoader) {
      return;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement('script');

      script.type = 'text/javascript';
      script.defer = true;
      script.src = this.checkoutSdkUrl;

      script.onload = resolve;
      script.onerror = reject;
      script.onabort = reject;

      document.body.append(script);
    });
  }

  private async initCheckoutButtonInitializer() {
    if (!window.checkoutKitLoader) {
      throw new InitializationError();
    }

    const checkoutButtonModule = await window.checkoutKitLoader.load('headless-checkout-wallet');
    const initializer = checkoutButtonModule.createHeadlessCheckoutWalletInitializer({
      host: this.url,
    });

    return initializer;
  }
}
