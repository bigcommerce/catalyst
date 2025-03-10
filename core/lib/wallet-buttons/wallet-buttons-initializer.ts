import { CheckoutKitLoader, InitializeButtonProps } from './types';

declare global {
  interface Window {
    checkoutKitLoader?: CheckoutKitLoader;
  }
}

type envs = 'development' | 'production' | 'test';

interface WalletButtonsConfig {
  bcStoreUrl?: string;
  env?: envs;
}

export class WalletButtonsInitializer {
  constructor(private config: WalletButtonsConfig = {}) {
    this.config.env = config.env || 'development';
  }

  async initialize(initData?: { walletButtonsOptions?: InitializeButtonProps[] }): Promise<void> {
    this.config.bcStoreUrl = this.config.bcStoreUrl || window.location.origin;

    await this.initializeCheckoutKitLoader();

    const checkoutButtonInitializer = await this.initCheckoutButtonInitializer();

    initData?.walletButtonsOptions?.forEach(checkoutButtonInitializer.initializeHeadlessButton);
  }

  private async initializeCheckoutKitLoader() {
    if (!window.checkoutKitLoader) {
      return new Promise((resolve) => {
        const script = document.createElement('script');

        script.type = 'text/javascript';
        script.defer = true;
        script.src = this.getCheckoutSdkSrc();

        script.onload = resolve;

        document.body.append(script);
      });
    }

    return window.checkoutKitLoader;
  }

  private async initCheckoutButtonInitializer() {
    if (!window.checkoutKitLoader) {
      throw new Error(
        'Unable to initialize the checkout button because the required script has not been loaded yet.',
      );
    }

    const checkoutButtonModule = await window.checkoutKitLoader.load('headless-checkout-wallet');

    return checkoutButtonModule.createHeadlessCheckoutWalletInitializer({
      host: this.config.bcStoreUrl,
    });
  }

  private getCheckoutSdkSrc() {
    const env = this.config.env;

    if (env === 'development') {
      return `${window.location.origin}/v1/loader.js`;
    } else if (env === 'production') {
      return 'https://checkout-sdk.bigcommerce.com/v1/loader.js';
    }

    throw new Error('Unable to load checkout sdk');
  }
}
