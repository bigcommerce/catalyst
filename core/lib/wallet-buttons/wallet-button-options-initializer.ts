import { getCookieValue } from '~/lib/client-cookies';
import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

export default class WalletButtonOptionsInitializer {
  private readonly config: Record<string, () => InitializeButtonProps>;

  constructor(private readonly cartId?: string | null) {
    this.cartId = cartId || getCookieValue('cartId');

    this.config = {
      'paypalcommerce.paypal': () => this.getOptionsByMethodId('paypalcommerce'),
      'paypalcommerce.paypalcredit': () => this.getOptionsByMethodId('paypalcommercecredit'),
    };
  }

  getButtonOptionsConfig() {
    return this.config;
  }

  private getOptionsByMethodId(methodId: string): InitializeButtonProps {
    const cartId = this.getCartId();

    return {
      methodId,
      containerId: `${methodId}-button`,
      [methodId]: {
        style: { color: 'gold', label: 'checkout' },
        cartId,
      },
    };
  }

  private getCartId() {
    if (!this.cartId) {
      throw new Error('Could not find a cart');
    }

    return this.cartId;
  }
}
