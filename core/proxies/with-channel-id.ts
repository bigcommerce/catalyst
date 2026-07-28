import { getChannelIdFromLocale } from '~/channels.config';

import { type ProxyFactory } from './compose-proxies';

export const withChannelId: ProxyFactory = (next) => {
  return (request, event) => {
    const locale = request.headers.get('x-bc-locale') ?? '';
    const channelId = getChannelIdFromLocale(locale) ?? '';

    request.headers.set('x-bc-channel-id', channelId);

    return next(request, event);
  };
};
