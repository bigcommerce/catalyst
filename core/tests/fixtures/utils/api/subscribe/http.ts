import { httpClient } from '../client';

import { SubscribeApi } from '.';

export const subscribeHttpClient: SubscribeApi = {
  subscribe: async (email: string, firstName: string, lastName: string) => {
    await httpClient.post('/v3/customers/subscribers', {
      email,
      first_name: firstName,
      last_name: lastName,
    });
  },
  unsubscribe: async (email: string) => {
    await httpClient.delete(`/v3/customers/subscribers?email=${encodeURIComponent(email)}`);
  },
};
