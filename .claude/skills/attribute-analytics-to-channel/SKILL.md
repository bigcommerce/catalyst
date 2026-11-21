---
name: attribute-analytics-to-channel
description: >
  Use when a Catalyst storefront needs a call sent to a specific or arbitrary BigCommerce channel ID, or
  when something is recorded or fetched on the default channel (`BIGCOMMERCE_CHANNEL_ID`) instead of the
  channel a locale maps to in `core/channels.config.ts`. Covers locale-to-channel mapping, passing
  `channelId` to `client.fetch`, and reusing the `x-bc-channel-id` header in the proxy. Typical case:
  `visitStartedEvent` and `productViewedEvent` analytics for a non-default channel landing on the default
  channel, but the approach applies to any proxy-level call, server action or background request that must
  reach a particular channel. Needs no GraphQL schema or BigCommerce backend change.
---

# Choosing the channel ID

The full guidance is in `core/docs/choosing-the-channel-id.md`. Read it and follow it. It is the single source of truth, kept as plain markdown so agents other than Claude can use it too.

In short: the channel comes from the GraphQL endpoint hostname, and `client.fetch` picks it from an explicit `channelId`, then the locale mapping in `core/channels.config.ts`, then `BIGCOMMERCE_CHANNEL_ID`. The locale isn't readable in the proxy, so calls made there fall back to the default channel unless they pass `channelId` (read from the `x-bc-channel-id` header that `withChannelId` sets). Analytics events are the worked example in the doc, but the same mechanism fits any situation where a call needs a specific channel.

This is a workaround for forks. Don't change `core/` unless the user asks for it to be applied.
