import { fetchPaymentWalletButtons } from '~/client/queries/get-wallet-buttons';

export const WalletButtons = async (cartId: string) => {
  const buttons = await fetchPaymentWalletButtons(cartId);

  // @ts-expect-error
  // window.renderWalletButtons({ bcStoreUrl: 'https://store-pglgv7endi.my-integration.zone', bcSiteUrl: 'https://nicktsybulko1737462323-testly-the-third.my-integration.zone/', storefrontJwtToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN, env: 'dev', walletButtons: buttons })

  console.log(buttons);

  return null;
};
