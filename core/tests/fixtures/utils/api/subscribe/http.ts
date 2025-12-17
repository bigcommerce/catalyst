import { httpClient } from '../client';

import { SubscribeApi } from '.';

export const subscribeHttpClient: SubscribeApi = {
  unsubscribe: async (email: string) => {
    await httpClient.delete(`/v3/customers/subscribers?email=${encodeURIComponent(email)}`);
  },
};
