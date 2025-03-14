import { InitializationError } from './error';
import { Option } from './types';

export class WalletButtonsInitializer {
  private checkoutSdkUrl = `${window.location.origin}/v1/loader.js`;

  constructor(private url: string) {}

  async initialize(walletButtons: Option[]): Promise<Option[]> {
    await this.initializeCheckoutKitLoader();

    const checkoutButtonInitializer = await this.initCheckoutButtonInitializer();

    return walletButtons.map((option) => {
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

    return checkoutButtonModule.createHeadlessCheckoutWalletInitializer({
      host: this.url,
    });
  }
}
