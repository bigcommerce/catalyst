export interface SubscribeApi {
  subscribe(email: string, firstName: string, lastName: string): Promise<void>;
  unsubscribe(email: string): Promise<void>;
}

export { subscribeHttpClient } from './http';
