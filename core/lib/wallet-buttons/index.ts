import { InitializationError } from './error';
import { InitializeButtonProps } from './types';
import WalletButtonOptionsInitializer from './wallet-button-options-initializer';

export class WalletButtonsInitializer {
  private origin = window.location.origin;
  private checkoutSdkUrl = `${this.origin}/v1/loader.js`;

  constructor(private cartId: string) {}

  async initialize(walletButtons: string[]): Promise<InitializeButtonProps[]> {
    const walletButtonOptionInitializer = new WalletButtonOptionsInitializer(this.cartId);

    await this.initializeCheckoutKitLoader();

    const checkoutButtonInitializer = await this.initCheckoutButtonInitializer();

    const buttonOptionsConfig = walletButtonOptionInitializer.getButtonOptionsConfig();

    return walletButtons
      .filter((methodId) => Object.keys(buttonOptionsConfig).includes(methodId))
      .map((methodId) => {
        const buttonOptions = buttonOptionsConfig[methodId]?.();

        if (buttonOptions) {
          checkoutButtonInitializer.initializeHeadlessButton(buttonOptions);

          return buttonOptions;
        }

        throw new Error(`Could not initialize the checkout button with ${methodId}`);
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

    return checkoutButtonModule.createHeadlessCheckoutWalletInitializer();
  }
}
