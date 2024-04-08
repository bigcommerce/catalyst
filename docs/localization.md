# Localization 

You can localize your Catalyst storefront so the theme appears in the shopper's preferred language.
Your storefront displays the language stored in the shopper's browser cookie if you provided translations for that language. 
Shoppers can then see theme content in the language of their choice throughout their browsing and checkout experience.
This provides a personalized shopping experience when you sell products internationally. 

Catalyst uses [Next.js App Router Internationalization (i18n)](https://next-intl-docs.vercel.app/docs/getting-started/app-router) library to handle localization.

This guide describes how to provide static string translations for shoppers, including the required subdirectory, file structure, and browser settings. 

[!Note]
> - Each storefront can only support a single language. To display multiple languages, we recommend setting up a separate store for each language.
> - To fully localize a store for a language or region, you will need to customize Storefront content in the BigCommerce control panel. Catalyst does not translate content rendered from a store's catalog database (for example, the name of a product). 


## Required subdirectory

Each Catalyst project reserves a top level `/messages/` subdirectory for localization.
For your theme to function properly, both the `/messages/` subdirectory and the `/messages/en.json` file, which contains the English-language default, must be present.
You can localize your theme by providing other JSON translation files in the `/messages/` directory. 

[!Note]
> #### Default language
> Catalyst hardcodes the `en.json` file as the default language file, which contains U.S. English translations when you set up the project [using the CLI](https://www.catalyst.dev/docs/cli).

## Translation file

To translate your theme, create a JSON file for each language you choose to support. Each language that you want to support must have its own JSON file. These can include non-U.S. versions of English, each with their own spellings.

Name your translation files based on the [BCP 47 specification](https://tools.ietf.org/html/bcp47) of language tags and region codes. For an overview of how these language tags are constructed, see [Language tags in HTML and XML](http://www.w3.org/International/articles/language-tags/).

You can find a list of code subtags in the [IANA Language Subtag Registry](http://www.iana.org/assignments/language-subtag-registry). These subtags are primitives that you can combine to create file name prefixes for individual regions. Here are some examples:

| Localization file name | Corresponding regional language variant | Subtags used |
| ----------- | ----------- | ----------- |
| `en.json` | English (default file)| en (English) |
| `en-US.json` | American English | en (English) + US (United States) |
| `en-AU.json` | Australian English | en (English) + AU (Australia) |
| `fr.json` | French | en (French) |
| `fr-CA.json` | Canadian French | fr (French) + CA (Canada) |

For more examples of frequently-used codes, see [ISO 639-2 Codes for the Representation of Names of Languages](http://www.loc.gov/standards/iso639-2/php/code_list.php).


### Translation keys

The JSON files should contain key-value pairs for each translation. You can define translations based on a predefined schema. The translated values you specify will display to shoppers as static string translations.

Use the existing `en.json` file as a template for the schema. The template provides pre-defined keys used to translate the themes in Catalyst's [basic ecommerce functionality](https://www.catalyst.dev/docs#ecommerce-functionality).
You can only provide translated values for the translation keys specified in the template. 


For example, the `en.json` file contains translation keys for 

```json
"Home": {
  "Carousel": {
    "bestSellingProducts": "Best Selling Products",
    "featuredProducts": "Featured Products",
    "newestProducts": "Newest products"
  }
}
``` 

In your newly-created JSON file, add a translation of the value in the new language.

```json
"Home": {
  "Carousel": {
    "bestSellingProducts": "Produits les plus vendus",
    "featuredProducts": "Produits populaires",
    "newestProducts": "Produits les plus recentsProduits"
  }
}
``` 



### {} 

<!-- What are the variables?? -->

## i18n.ts file

You must add the language translations to the `i18n.ts` file.

For example, if you created a `fr.json` file, include the `fr` [BCP 47 specification](https://tools.ietf.org/html/bcp47) when you define the locales:   

```ts
const locales = ['en', 'fr'] as const;
```

## page.tsx file

For client-side components, the `getTranslations` method passes the desired translation keys from the `.json` files as a `namespace`. `NextIntlClientProvider` returns the namespace translations from your `.json` files.  

The following shows an example for the `page.tsx` file for the storefront homepage.

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { getFeaturedProducts } from '~/client/queries/get-featured-products';
import { ProductCardCarousel } from '~/components/product-card-carousel';
import { LocaleType } from '~/i18n';

interface Props {
  params: {
    locale: LocaleType;
  };
}

export default async function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Home' });
  const messages = await getMessages({ locale });
  const [featuredProducts] = await Promise.all([
    getFeaturedProducts({ imageWidth: 500, imageHeight: 500 }),
  ]);

  return (
    <>
      <div>
        <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
          <ProductCardCarousel
            products={featuredProducts}
            title={t('Carousel.featuredProducts')}
          />
        </NextIntlClientProvider>
      </div>
    </>
  );
}
```

## Browser settings

The storefront displays the language selected in the shopper's browser preferences. 
[Next.js App Router Internationalization (i18n)](https://next-intl-docs.vercel.app/docs/getting-started/app-router) library creates a cookie that stores the shopper’s language in the browser. 
Catalyst then uses the `Accept-Language` request HTTP header from the cookie to determine which language translation to use. 
If you do not have a JSON file matching the shopper's browser language, the storefront theme will revert to the values in the default English-language JSON file.