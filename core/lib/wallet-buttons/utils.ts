import { InitializeButtonProps } from '~/lib/wallet-buttons/types';

/**
 *
 * Provider specific initialization option return
 *
 * */

export function getWalletButtonOption(
  paymentMethodId: string,
  cartId: string,
): InitializeButtonProps | undefined {
  switch (paymentMethodId) {
    case 'paypalcommerce.paypal': {
      return {
        methodId: 'paypalcommerce',
        containerId: 'paypalcommerce-button',
        paypalcommerce: {
          style: { color: 'gold', label: 'checkout' },
          cartId,
        },
      };
    }

    case 'paypalcommerce.paypalcredit': {
      return {
        methodId: 'paypalcommercecredit',
        containerId: 'paypalcommerce-credit-button',
        paypalcommercecredit: {
          style: { color: 'gold', label: 'checkout' },
          cartId,
        },
      };
    }

    default:
      console.log(`Wallet button with "${paymentMethodId}" payment method id is not implemented`);

      return undefined;
  }
}
