# Sitemap

The `/sitemap.xml` URL provides the complete BigCommerce sitemap, which includes canonical URLs for all channels associated with Catalyst.
These URLs correspond to the [permanent URLs](/docs/storefront/graphql#i-want-to-run-requests-in-the-context-of-another-channel) used when making requests to the GraphQL Storefront API. The URLs correspond to a specific channel, and when accessed, returns the relevant sitemap for that channel.

For an example, see the sitemap for the demo version of Catalyst https://catalyst-demo.site/sitemap.xml. 

## Proxying the sitemap

Catalyst acts as an intermediary when handling requests to `/sitemap.xml`. When a request is made, Catalyst fetches the sitemap index from BigCommerce by making a request to the canonical URL of the channel. 
Catalyst then returns the XML response, allowing the sitemap to appear as though it’s served directly from Catalyst.

You can find the [implementation for the route](https://github.com/bigcommerce/catalyst/blob/main/core/app/sitemap.xml/route.ts) in the Catalyst Monorepo.

## Flexibility and limitations

The sitemaps don't need to reside on the same domain as the website they represent, providing flexibility in managing your site's structure.

For your convenience, BigCommerce automatically redirects any requests for the legacy [Stencil sitemap](https://support.bigcommerce.com/s/article/Sitemaps#access) `/xmlsitemap.php` to `/sitemap.xml` on Catalyst storefronts.

Catalyst's sitemap solution works seamlessly with BigCommerce-managed URLs (such as products, brands, and categories). 
However, if your storefront also uses third-party systems that generate content with different URLs, you will need to submit multiple sitemaps to cover the URLs from various sources.