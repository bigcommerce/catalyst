# Localization

You can localize your Catalyst storefront so that it appears in the shopper's preferred language throughout browsing and checkout experience.
This provides a personalized shopping experience when you sell products internationally.

> [!NOTE]
> Internationalization support in Catalyst is a work in progress. Full multilingual support in headless channels, like Catalyst, will be added in future releases.
> Currently, each Catalyst storefront can only support a single language. To display multiple languages, we recommend setting up a separate channel for each language.
> To fully localize a store for a language or region, you will need to customize product catalog and storefront content in the BigCommerce control panel.

Catalyst uses [Next.js App Router Internationalization (i18n)](https://next-intl-docs.vercel.app/docs/getting-started/app-router) library to handle localization.

This guide describes how to provide static string translations for shoppers, including the required subdirectory, file structure and project configuration.

## Required subdirectory

Each Catalyst project reserves a top level `/messages/` subdirectory for localization.
For your storefront to function properly, both the `/messages/` subdirectory and the `/messages/en.json` file, which contains the default English phrases, must be present.
You can localize static phrases by providing other JSON translation files in the `/messages/` directory.

> [!NOTE]
> **Default language**
> When you set up the project [using the CLI](https://www.catalyst.dev/docs/cli), Catalyst hardcodes the default language file in US English. You can adjust the phrase strings in the resulting `en.json` file to meet your needs.

## Translation file

To translate static phrases, create a JSON file for each language you choose to support. Each language that you want to support must have its own JSON file.

Name your translation files based on the [BCP 47 specification](https://tools.ietf.org/html/bcp47) of language tags and country or region codes. For an overview of how these language tags are constructed, see [Language tags in HTML and XML](http://www.w3.org/International/articles/language-tags/).

You can find a list of code subtags in the [IANA Language Subtag Registry](http://www.iana.org/assignments/language-subtag-registry). These subtags are primitives that you can combine to create file name prefixes for individual regions. Here are some examples:

| Localization file name | Corresponding regional language variant | Subtags used |
| ----------- | ----------- | ----------- |
| `en.json` (default) | English | en (English) |
| `en-US.json` | US English | en (English) + US (United States) |
| `en-AU.json` | Australian English | en (English) + AU (Australia) |
| `es-US.json` | US Spanish | es (Spanish) + US (United States) |
| `es-ES.json` | Castilian Spanish | es (Spanish) + ES (Spain) |
| `fr.json` | French | en (French) |
| `fr-CA.json` | Canadian French | fr (French) + CA (Canada) |

### Translation keys

The JSON files should contain key-value pairs for each locale. You can define translations based on pre-defined keys used to translate the Catalyst storefront's [basic ecommerce functionality](https://www.catalyst.dev/docs#ecommerce-functionality). The translated values you specify will display to shoppers as static string translations.

Use the existing `en.json` file as a template for the schema. You can only provide translated values for the translation keys specified in the template.

For example, the `en.json` file contains the following translation keys:

```json
"Home": {
  "Carousel": {
    "bestSellingProducts": "Best Selling Products",
    "featuredProducts": "Featured Products",
    "newestProducts": "Newest products"
  }
}
```

In your newly-created JSON file, add a translation of the value to the new locale.

```json
"Home": {
  "Carousel": {
    "bestSellingProducts": "Produits les plus vendus",
    "featuredProducts": "Produits populaires",
    "newestProducts": "Produits les plus recentsProduits"
  }
}
```

Read more about i18n messages in [next-intl docs](https://next-intl-docs.vercel.app/docs/usage/messages).

## i18n configuration

After you created a language file, add its name to the `i18n.ts` config file.

For example, if you created a `fr.json` file, include `fr` when you define the locales:

```ts
const locales = ['en', 'fr'] as const;
```

## Using keys in React components

The following example shows how messages can be used in **server** component:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
// ...
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
  // ...

  return (
    <div>
      <NextIntlClientProvider locale={locale} messages={{ Product: messages.Product ?? {} }}>
        <ProductCardCarousel
          products={featuredProducts}
          title={t('Carousel.featuredProducts')}
        />
      </NextIntlClientProvider>
    </div>
  );
}
```

> [!NOTE]
> **unstable_setRequestLocale**
> Please pay attention to `unstable_setRequestLocale` call. You can read more in [next-intl docs](https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-unstable_setrequestlocale-to-all-layouts-and-pages).

The following example shows usage in a nested **client** component:

```tsx
'use client';

// ...
import { useTranslations } from 'next-intl';

export const AddToCart = () => {
  const t = useTranslations('Product.ProductSheet');

  return (
    <Button type="submit">
        t('addToCart')
    </Button>
  );
};
```

## Routing and locale detection

Even though the next-intl library supports several [locale detection strategies](https://next-intl-docs.vercel.app/docs/routing/middleware#strategies), Catalyst doesn't use any by default, as full internationalization support is still in progress. This strategy can be changed in the `i18n.ts` config file.

Currently, the shopper's browser preferences storefront detect locale by default. Catalyst uses the `Accept-Language` request HTTP header to determine which translation file to choose. If you do not have a JSON file matching the shopper's browser language, Catalyst will use the default English file.
