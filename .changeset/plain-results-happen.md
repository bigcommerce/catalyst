---
"@bigcommerce/catalyst-client": minor
---

`locale` is now a parameter on `client.fetch()` and is required for all queries. It is passed through to channel ID resolution so the `getChannelId` callback can return a locale-specific channel, and it is used to set the `Accept-Language` request header on each GraphQL call.

The `getChannelId` config callback signature now accepts `locale` as an optional second argument:

```diff
- getChannelId?: (defaultChannelId: string) => Promise<string> | string;
+ getChannelId?: (defaultChannelId: string, locale?: string) => Promise<string> | string;
```

## Migration

### Step 1: Update all `client.fetch()` calls

Pass `locale` as a parameter to every `client.fetch()` call across your page data files:

```diff
  const { data } = await client.fetch({
    document: PageQuery,
    variables: { ... },
+   locale,
    fetchOptions: { cache: 'no-store' },
  });
```

### Step 2: Update the `getChannelId` callback in `core/client/index.ts`

Update the callback to accept and forward the `locale` parameter:

```diff
- getChannelId: (defaultChannelId: string) => {
-   return getChannelIdFromLocale() ?? defaultChannelId;
- },
+ getChannelId: (defaultChannelId: string, locale?: string) => {
+   return getChannelIdFromLocale(locale) ?? defaultChannelId;
+ },
```
