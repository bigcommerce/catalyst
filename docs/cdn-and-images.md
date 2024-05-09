**Overview**

Catalyst takes full advantage of the BigCommerce CDN to provide globally-distributed asset hosting and on-the-fly image resizing. This functionality is included with all BigCommerce plans and is agnostic to the hosting provider you use to host your Catalyst storefront.

## `<BcImage />` and `bcCdnImageLoader`

For loading images from the BigCommerce platform, Catalyst provides [`<BcImage />`](https://github.com/bigcommerce/catalyst/blob/main/core/components/bc-image/index.tsx) as a wrapper for Next's `<Image />` component to allow you to use the BigCommerce CDN directly to reduce load on the Next.js application and hosting costs.

This component expects to receive the `urlTemplate` field from GraphQL Storefront API which contains a `{:size}` placeholder which the custom [`bcCdnImageLoader` image loader](https://github.com/bigcommerce/catalyst/blob/main/core/lib/cdn-image-loader.ts) will replace with the desired image dimensions. Width is required and height is optional. You may also optionally supply a `lossy` parameter to indicate if you would like images to be compressed lossily; the default is `true`. If you supply `false`, lossless compression will be used.

## Using store assets uploaded via WebDAV

Two helper functions are provided in [lib/store-assets](https://github.com/bigcommerce/catalyst/blob/main/core/lib/store-assets.ts) to help build URLs for assets living in your store's object storage.

`contentAssetUrl()` can be used to generate a URL to an arbitrary file asset in the `/content/` folder in WebDAV on your store.

Usage:

```javascript
<Link href={contentAssetUrl('pdfs/user-manual.pdf')} >
   User Manual
</Link>
```

For image assets uploaded to `/content`, you may use `contentImageUrl()` to build a resizeable image URL that can be used with `<BcImage>`.

Usage:

```javascript
<BcImage
    alt="an assortment of brandless products against a blank background"
    src={contentImageUrl('newsletter-images/april.png')}
/>
```

You may optionally request a specific size for the image, using a size parameter of the form `123w`, `123x123`, or `original`.

Usage:

```javascript
<Image
    src={contentImageUrl('newsletter-images/april.png', '1000w')}
/>
```


## Using Images uploaded to the Image Manager

Use the `imageManagerImageUrl()` function to build a CDN URL for an image asset that has been uploaded to the Image Manager. This returns a resizeable URL template that can be used with `<BcImage>`.

Usage:

```javascript
<BcImage
    alt="an assortment of brandless products against a blank background"
    src={imageManagerImageUrl('slideshow-bg-01.jpg')}
/>
```

You may optionally request a specific size for the image, using a size parameter of the form `123w`, `123x123`, or `original`.

Usage:

```javascript
<Image
    src={imageManagerImageUrl('slideshow-bg-01.jpg', '1000w')}
/>
```
