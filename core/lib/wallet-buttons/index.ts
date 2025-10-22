import { InitializationError } from './error';
import { InitializeButtonProps } from './types';

export class WalletButtonsInitializer {
  private origin = window.location.origin;
  private checkoutSdkUrl = `${this.origin}/v1/loader.js`;

  async initialize(
    walletButtonsInitOptions: InitializeButtonProps[],
  ): Promise<InitializeButtonProps[]> {
    await this.initializeCheckoutKitLoader();

    const checkoutButtonInitializer = await this.initCheckoutButtonInitializer();

    return walletButtonsInitOptions.map((buttonOption) => {
      checkoutButtonInitializer.initializeWalletButton(buttonOption);

      return buttonOption;
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

    const checkoutButtonModule = await window.checkoutKitLoader.load('wallet-button');

    return checkoutButtonModule.createWalletButtonInitializer({
      graphQLEndpoint: 'api/wallets/graphql',
    });
  }
}
