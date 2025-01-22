const { cookies } = require('next/headers');

/**
 *
 * Options mapper
 *
 */
function getWalletButtonsOption(paymentMethodId, cartId) {
  switch (paymentMethodId) {
    case 'paypalcommerce.paypal': {
      return {
        paymentMethodId,
        containerId: 'paypalcommerce-button',
        options: {
          style: { color: 'gold', label: 'checkout' },
          cartId,
        },
      };
    }

    case 'paypalcommerce.paypalcredit': {
      return {
        paymentMethodId,
        containerId: 'paypalcommerce-credit-button',
        options: {
          style: { color: 'gold', label: 'checkout' },
          cartId,
        },
      };
    }

    case 'braintree.paypal': {
      return {
        paymentMethodId,
        containerId: 'braintree-paypal-button',
        options: {
          style: { color: 'gold', label: 'checkout' },
          cartId,
        },
      };
    }

    default:
      return {};
  }
}

/**
 *
 * UI handlers
 *
 */

async function onRenderWalletButtonsButtonClick(paymentWalletsList) {
  const cookieStore = await cookies();
  const cartEntityId = cookieStore.get('cartId')?.value;

  if (!cartEntityId) {
    console.error("Can't render PayPal button because cart id is not provided");

    return;
  }

  // const paymentWalletsList = await fetchPaymentWalletButtons(cartEntityId);

  const walletButtonsOptions = paymentWalletsList.map((paymentMethodId) => {
    const walletButtonsOption = getWalletButtonsOption(paymentMethodId, cartEntityId);

    return {
      ...walletButtonsOption,
      options: {
        ...walletButtonsOption.options,
      },
    };
  });

  generateWalletButtonsContainers(walletButtonsOptions.map(({ containerId }) => containerId));

  await window.BigCommerce.renderWalletButtons({
    bcStoreUrl: 'https://store-jahyzasrnl.my-integration.zone',
    bcSiteUrl: 'https://nicktsybulko1734946527-testsworthy.my-integration.zone',
    storefrontJwtToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN,
    env: 'local',
    walletButtons: walletButtonsOptions,
  });
}

/**
 *
 * Tools
 *
 * */
function generateWalletButtonsContainers(walletButtonsContainers) {
  const mainContainer = document.getElementById('wallet-buttons-list');

  walletButtonsContainers.map((walletButtonContainer) => {
    const div = document.createElement('div');
    div.id = walletButtonContainer;

    mainContainer.appendChild(div);
  })
}

window.BigCommerce = {
  ...window.BigCommerce,
  onRenderWalletButtonsButtonClick,
};
