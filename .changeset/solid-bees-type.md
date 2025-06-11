---
"@bigcommerce/catalyst-core": patch
---

Fix persistent cart behavior during login.

## Migration

In `core/auth/index.ts`, create the `cartIdSchema` variable:

```ts
const cartIdSchema = z
  .string()
  .uuid()
  .or(z.literal('undefined')) // auth.js seems to pass the cart id as a string literal 'undefined' when not set.
  .optional()
  .transform((val) => (val === 'undefined' ? undefined : val));
```

Then, update all `Credentials` schemas to use this new `cartIdSchema`:

```ts
const PasswordCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  cartId: cartIdSchema,
});

const AnonymousCredentials = z.object({
  cartId: cartIdSchema,
});

const JwtCredentials = z.object({
  jwt: z.string(),
  cartId: cartIdSchema,
});

const SessionUpdate = z.object({
  user: z.object({
    cartId: cartIdSchema,
  }),
});
```
