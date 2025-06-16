import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { CreateWebPageData, WebPage, WebPagesApi } from '.';

const WebPageTypeSchema = z.enum(['page', 'link', 'contact_form', 'raw']);
const ContactFieldTypeSchema = z.array(
  z.enum(['fullname', 'companyname', 'phone', 'orderno', 'rma']),
);

const WebPageSchema = z
  .object({
    id: z.number(),
    parent_id: z.number(),
    name: z.string(),
    is_visible: z.boolean(),
    is_customers_only: z.boolean(),
    type: WebPageTypeSchema,
    url: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    link: z.string().nullable().optional(),
    body: z.string().nullable().optional(),
    contact_fields: z.string().nullable().optional(),
  })
  .transform(
    (data): WebPage => ({
      id: data.id,
      parentId: data.parent_id,
      name: data.name,
      isVisibleInNavigation: data.is_visible,
      isCustomersOnly: data.is_customers_only,
      type: data.type,
      path: data.url ?? undefined,
      email: data.email ?? undefined,
      link: data.link ?? undefined,
      body: data.body ?? undefined,
      contactFields: ContactFieldTypeSchema.parse(data.contact_fields?.split(',') ?? []),
    }),
  );

const WebPageCreateSchema = z.object({
  name: z.string(),
  type: WebPageTypeSchema,
  channel_id: z.number(),
  parent_id: z.number().optional(),
  is_visible: z.boolean().optional(),
  is_customers_only: z.boolean().optional(),
  url: z.string().optional(),
  email: z.string().optional(),
  link: z.string().optional(),
  body: z.string().optional(),
  contact_fields: z.string().optional(),
});

const transformCreateWebPageData = (data: CreateWebPageData) =>
  WebPageCreateSchema.parse({
    name: data.name,
    type: data.type,
    channel_id: testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1,
    parent_id: data.parentId,
    is_visible: data.isVisibleInNavigation,
    is_customers_only: data.isCustomersOnly,
    url: data.path,
    email: data.email,
    link: data.link,
    body: data.body,
    contact_fields: data.contactFields?.join(','),
  });

export const webPagesHttpClient: WebPagesApi = {
  getById: async (id) => {
    const resp = await httpClient
      .get(`/v3/content/pages/${id}?include=body`)
      .parse(apiResponseSchema(WebPageSchema));

    return resp.data;
  },
  create: async (data) => {
    const resp = await httpClient
      .post('/v3/content/pages?include=body', transformCreateWebPageData(data))
      .parse(apiResponseSchema(WebPageSchema));

    return resp.data;
  },
  delete: async (ids) => {
    if (ids.length > 0) {
      // TODO: Switch to the bulk delete v3 endpoint when the DELETE /v3/content/pages API endpoint is fixed.
      // Currently, it does not reliably delete pages.
      await Promise.all(ids.map((id) => httpClient.delete(`/v2/pages/${id}`)));
    }
  },
};
