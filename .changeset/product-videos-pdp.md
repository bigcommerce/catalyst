---
"@bigcommerce/catalyst-core": minor
---

Display product videos (YouTube) on the PDP in a dedicated section below the primary product content, mirroring the Stencil/Cornerstone layout. The Storefront GraphQL API exposes product videos as a `{ title, url }` pair (`Product.videos`); Catalyst now fetches them and renders a featured player with a thumbnail strip (clicking a thumbnail swaps the featured video) using [`lite-youtube-embed`](https://github.com/paulirish/lite-youtube-embed) — a lightweight facade that loads the YouTube player only when a shopper clicks. A small `getYouTubeId()` helper extracts the video id from the watch URL the API returns.

## Migration

Additive — no breaking changes; existing PDP markup, the image gallery, and image pagination are unchanged. Forks adopting this manually need to:

- add the `lite-youtube-embed` dependency;
- request `videos(first: 25) { edges { node { title url } } }` on the PDP product query (`product/[slug]/page-data.ts`);
- stream those videos and render the new `ProductVideos` section below `ProductDetail` (`product/[slug]/page.tsx`);
- allow `i.ytimg.com/vi/**` in `next.config.ts` `images.remotePatterns` for poster thumbnails.
