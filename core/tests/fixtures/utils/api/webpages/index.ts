type WebPageType = 'page' | 'link' | 'contact_form' | 'raw';
type ContactFieldType = 'fullname' | 'companyname' | 'phone' | 'orderno' | 'rma';

export interface WebPage {
  readonly id: number;
  readonly parentId: number;
  readonly name: string;
  readonly isVisibleInNavigation: boolean;
  readonly isCustomersOnly: boolean;
  readonly type: WebPageType;
  readonly path?: string;
  readonly email?: string;
  readonly link?: string;
  readonly body?: string;
  readonly contactFields?: ContactFieldType[];
}

export interface CreateWebPageData {
  name: string;
  type: WebPageType;
  parentId?: number;
  isVisibleInNavigation?: boolean;
  isCustomersOnly?: boolean;
  path?: string;
  email?: string;
  link?: string;
  body?: string;
  contactFields?: ContactFieldType[];
}

export interface WebPagesApi {
  getById: (id: number) => Promise<WebPage>;
  create: (data: CreateWebPageData) => Promise<WebPage>;
  delete: (ids: number[]) => Promise<void>;
}

export { webPagesHttpClient } from './http';
