import { z } from 'zod';

export const cartIdSchema = z
  .string()
  .uuid()
  .or(z.literal('undefined')) // auth.js seems to pass the cart id as a string literal 'undefined' when not set.
  .optional()
  .transform((val) => (val === 'undefined' ? undefined : val));

export const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
});

export const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
  }),
});

export const LoginResponse = z.object({
  customerAccessToken: z
    .object({
      value: z.string(),
      expiresAt: z.string(),
    })
    .nullable(),
  customer: z
    .object({
      entityId: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
      phone: z.string(),
      customerGroupId: z.number(),
      customerGroupName: z.string().nullable(),
      company: z.string(),
      taxExemptCategory: z.string(),
      attributeCount: z.number(),
    })
    .nullable(),
  cart: z
    .object({
      entityId: z.string(),
    })
    .nullable(),
});

export const LoginWithPasswordResponse = z.object({
  login: LoginResponse,
});

export const LoginWithTokenResponse = z.object({
  loginWithCustomerLoginJwt: LoginResponse,
});

export const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});
