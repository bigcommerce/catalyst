import chalk from 'chalk';

import { type BigCommerceChannelsV3Response, type BigCommerceStoreInfo } from './https';

export const checkStorefrontLimit = (
  channels: BigCommerceChannelsV3Response,
  storeInfo: BigCommerceStoreInfo,
) => {
  const { data: availableChannels } = channels;
  const { features } = storeInfo;

  if (availableChannels.length >= features.storefront_limits.total_including_inactive) {
    console.error(
      chalk.yellow(
        `You have reached the maximum number of storefronts allowed for your plan. Please select an existing channel below, purchase additional storefront seats in your BigCommerce Control Panel, or contact BigCommerce Support: ${chalk.cyan(
          'https://support.bigcommerce.com',
        )}\n`,
      ),
    );

    return false;
  }

  const activeChannels = availableChannels.filter((channel) => channel.status === 'active');

  if (activeChannels.length >= features.storefront_limits.active) {
    console.error(
      chalk.yellow(
        'You have reached the maximum number of active storefronts allowed for your plan. Please select an existing channel below, de-activate an active channel, or purchase additional storefront seats in your BigCommerce Control Panel.\n',
      ),
    );

    return false;
  }

  return true;
};
