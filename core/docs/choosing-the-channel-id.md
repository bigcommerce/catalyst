# Choosing the channel ID for a Storefront GraphQL call

How Catalyst decides which BigCommerce channel a call is sent to, and how a storefront owner can set a specific or arbitrary channel ID where the default doesn't fit. This is guidance for a fork of Catalyst. Applying it needs no GraphQL schema or BigCommerce backend change, and the upstream code is not changed by it.

The case that surfaced it is analytics events, used as the worked example below. The same mechanism applies to any call that should reach a channel other than the one Catalyst picks: a proxy-level call, a background job, a webhook handler, a server action, or a one-off request for a specific channel.

## How the channel is chosen

BigCommerce takes the channel from the GraphQL endpoint hostname, `https://store-{hash}-{channelId}.mybigcommerce.com/graphql`. Nothing in the request body changes it, including URL fields inside an event input.

`client.fetch` (`core/client/index.ts`, `packages/client/src/client.ts`) builds that hostname per call, using the first of these that is available:

1. A `channelId` passed explicitly: `client.fetch({ document, variables, channelId })`.
2. `getChannelIdFromLocale` in `core/channels.config.ts`, applied to the current request locale (`getCurrentChannelId` in `core/lib/channel.ts`).
3. `BIGCOMMERCE_CHANNEL_ID`, the default channel.

Step 2 only works where the request locale can be read (pages, server components, actions). In the proxy (`core/proxies/`), route handlers, `generateStaticParams` and config resolution, `getLocale()` throws, so a call that passes no `channelId` falls through to step 3 and goes to the default channel.

## Setting the channel yourself

- **Map locales to channels.** In `core/channels.config.ts`, map each locale code to the channel it should use. Use locale codes, not URL subfolders, and keep codes distinct per channel. The resolver must depend only on the locale, because some callers (sitemap, robots) pass none. If locales can't tell channels apart, the resolver needs another input, such as a region cookie.
- **Pass `channelId` explicitly.** Wherever the locale can't be read, pass the channel to `client.fetch`. This also covers an arbitrary channel ID that isn't derived from the locale at all.
- **In the proxy, reuse what `withChannelId` already resolved.** `core/proxies/with-channel-id.ts` sets the `x-bc-channel-id` request header from the locale mapping. Anything that runs after it in the chain (see `core/proxy.ts`) can read that header. Anything that runs before it can't, and has to run its call after the rest of the chain has completed.
- **The storefront token must cover the channel.** Calls to a channel the token doesn't cover are rejected.

Don't try to steer the channel through a URL inside the request body. It has no effect.

## Worked example: analytics events

`visitStartedEvent` and `productViewedEvent` are sent from the proxy and pass no channel, so events for a non-default channel are recorded on the default channel (`BIGCOMMERCE_CHANNEL_ID`). The fix is to pass the channel the locale mapping resolves. Paths follow current upstream; adjust if the fork differs. The `startVisit` server action (consent-banner flow) already resolves the channel from the locale and needs no change.

**1. Resolver, `core/channels.config.ts`.**

```ts
const EU_CHANNEL_ID = '<EU channel ID>';

const localeToChannelsMappings: Record<string, string> = {
  // es: EU_CHANNEL_ID, fr: EU_CHANNEL_ID
};

function getChannelIdFromLocale(locale = '') {
  return localeToChannelsMappings[locale] ?? process.env.BIGCOMMERCE_CHANNEL_ID;
}

export { getChannelIdFromLocale };
```

**2. Event helpers, `core/lib/analytics/bigcommerce/data-events.ts`.** Accept an optional `channelId` and pass it to `client.fetch`.

```ts
interface AnalyticsEventBase {
  initiator: AnalyticsInitiator;
  request: AnalyticsRequest;
  channelId?: string;
}

type VisitStartedEvent = AnalyticsEventBase;

interface ProductViewedEvent extends AnalyticsEventBase {
  productId: number;
}

export async function sendVisitStartedEvent({ initiator, request, channelId }: VisitStartedEvent) {
  // ...existing input
  return client.fetch({
    document: VisitStartedMutation,
    variables: { input },
    fetchOptions: { cache: 'no-store' },
    channelId: channelId || undefined,
  });
}

// sendProductViewedEvent: destructure channelId the same way and add
// `channelId: channelId || undefined` to its client.fetch call.
```

**3. Read the resolved channel, `core/proxies/with-channel-id.ts`.**

```ts
export const CHANNEL_ID_HEADER = 'x-bc-channel-id';

export function getRequestChannelId(request: Request): string | undefined {
  return request.headers.get(CHANNEL_ID_HEADER) || undefined;
}

// inside withChannelId:
request.headers.set(CHANNEL_ID_HEADER, channelId);
```

**4. Product views, `core/proxies/with-routes.ts`.** `withRoutes` runs after `withChannelId`, so the header is set. In `recordProductVisit`, add `channelId: getRequestChannelId(request)` to the `sendProductViewedEvent` call.

**5. Visits, `core/proxies/with-analytics-cookies.ts`.** This proxy runs before `withIntl` and `withChannelId`, so send the event after the rest of the chain, and drop any client-sent channel header.

```ts
// first line of the returned handler:
request.headers.delete(CHANNEL_ID_HEADER);

// where a new visit starts, replace event.waitUntil(recordNewVisit(...)) with:
await setVisitIdCookie(visitId);

try {
  return await next(request, event);
} finally {
  event.waitUntil(recordNewVisit(request, visitorId, visitId));
}

// recordNewVisit: add the resolved channel to sendVisitStartedEvent
channelId: getRequestChannelId(request),
```

If a fork previously used an `overrideAnalyticsURL`-style workaround, remove it: it only changed the reported URL, never the channel.

### Known limitation

A visit that starts on a locale redirect (a shopper lands on `/` and is sent to `/eu-es/`) is still recorded on the default channel, because the redirect is returned before the channel is resolved. Shoppers landing directly on a localized URL, and product views after a redirect, are correct. Either don't start a visit on a redirect response (simpler), or resolve the channel from the redirect's target locale.

### Verify

1. Temporarily `console.log(getRequestChannelId(request))` in `recordNewVisit` and `recordProductVisit`, then read the hosting function logs.
2. In a fresh private window open a non-default-channel URL directly, then a product page. Expect that channel's ID for both events, and `BIGCOMMERCE_CHANNEL_ID` on default-locale pages.
3. After a day, compare channels in Analytics. If visits still don't show, share an example time and URL with BigCommerce support so they can check which channel each event arrived on.
