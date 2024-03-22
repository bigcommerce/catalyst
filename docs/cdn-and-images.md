**Overview**
# `<BcImage />` and `bcCdnImageLoader`

For loading images from the BigCommerce platform, Catalyst provides [`<BcImage />`](https://github.com/bigcommerce/catalyst/blob/main/apps/core/components/bc-image/index.tsx) as a wrapper for Next's `<Image />` component to allow you to use the BigCommerce CDN directly to reduce load on the Next.js application and hosting costs.

This component expects to receive the `urlTemplate` field from GraphQL Storefront API which contains a `{:size}` placeholder which the custom [`bcCdnImageLoader` image loader](https://github.com/bigcommerce/catalyst/blob/main/apps/core/lib/cdn-image-loader.ts) will replace with the desired image dimensions. Width is required and height is optional. You may also optionally supply a `lossy` parameter to indicate if you would like images to be compressed lossily; the default is `true`. If you supply `false`, lossless compression will be used.
