type RedirectToType = 'product' | 'brand' | 'category' | 'page' | 'post' | 'url';

interface RedirectToEntity {
  type: Exclude<RedirectToType, 'url'>;
  entityId: number;
}

interface RedirectToUrl {
  type: 'url';
  url: string;
}

export interface Redirect {
  readonly id: number;
  readonly siteId: number;
  readonly fromPath: string;
  readonly to: RedirectToEntity | RedirectToUrl;
}

export interface UpsertRedirectData {
  fromPath: string;
  to: RedirectToEntity | RedirectToUrl;
}

export interface RedirectsApi {
  upsert: (data: UpsertRedirectData) => Promise<Redirect | undefined>;
  delete: (ids: number[]) => Promise<void>;
}

export { redirectsHttpClient } from './http';
