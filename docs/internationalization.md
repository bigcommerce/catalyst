# Internationalization

You can localize your Catalyst storefront so that it appears in the shopper's preferred culture or language throughout their browsing and checkout experience. 

> [!NOTE] 
> Internationalization support in Catalyst is a work in progress. Full multilingual support in headless channels, like Catalyst, will be added in future releases.

## Use cases

Catalyst supports the following scenarios:

1. You are selling internationally and would like to tailor your storefront to multiple countries. Each country has its own language, currency, payment method, etc.

2. You are selling within a country would like to accommodate multiple languages within that country
 
To fully localize a store for a language or region, you will need to customize product catalog and storefront content in the BigCommerce control panel.

## Locale-specific URLs

Catalyst supports the following locale-specific URLs that you can use to localize your storefronts. Learn more about the pro and cons for each [locale-specific URL](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites#locale-specific-urls) in the Google Documentation.

Each Catalyst storefront can support one language per channel. However, Catalyst can service multiple languages by connecting multiple channels to the storefront and routing each language through different subpaths. To display multiple languages, we recommend setting up a separate channel for each lanuage.

| URL structure | Example | Recommended use case | How to implement for Catalyst | 
| :-- | :-- | :-- | :-- | 
| Root domain <br /><br /> Subdomain <br /><br /> gTLD | `store.com` <br /><br /> `fr.store.com` <br /><br /> `store.co.uk` | International selling, where you want to personlize the language, currency, payment method, and more. | Create a [storefront channel](/docs/storefront/multi-storefront) and point it to a domain, subdomain, or gTLD. |
| Domain subpath | `store.com/fr` | Providing multiple languages within a country. | The subpath can point to a different channel. |


For best practices on how to set up localized websites, see the [Managing multi-regional and multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites) guide in the Google Documentation.