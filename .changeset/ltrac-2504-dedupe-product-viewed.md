---
'@bigcommerce/catalyst-core': patch
---

Send the `ProductViewed` analytics event once per product per visit. Before, every PDP request with the visit cookies sent one, so refreshes and repeat hits each cost BigCommerce an uncacheable GraphQL mutation. The product ids already reported are kept in a new `catalyst.productViews` cookie tied to the current visit id, with the same 30-minute lifetime as `catalyst.visitId`, and the cookie is removed along with the other analytics cookies when measurement consent is declined.

## Migration

Add `core/lib/analytics/bigcommerce/product-views.ts` (with `addProductView` and `parseProductViews`), and `getProductViewsCookie`, `setProductViewsCookie` and `deleteProductViewsCookie` to `core/lib/analytics/bigcommerce/index.ts`.

In `core/proxies/with-routes.ts`, only record the visit on the first view of the product in the current visit:

```ts
if (!isPrefetch && !isRSC && (await isFirstViewInVisit(node.entityId))) {
  event.waitUntil(recordProductVisit(req, node.entityId));
}

async function isFirstViewInVisit(productId: number) {
  const visitId = await getVisitIdCookie();

  if (!visitId) {
    return false;
  }

  const productViews = addProductView(await getProductViewsCookie(), visitId, productId);

  if (!productViews) {
    return false;
  }

  await setProductViewsCookie(productViews);

  return true;
}
```

In `core/proxies/with-analytics-cookies.ts`, delete the cookie when consent is declined:

```ts
if ((await getProductViewsCookie()) != null) {
  await deleteProductViewsCookie();
}
```
