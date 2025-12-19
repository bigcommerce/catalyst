export interface SubscribeApi {
  unsubscribe(email: string): Promise<void>;
}

export { subscribeHttpClient } from './http';
