# Localization

This guide describes how to provide static string translations for shoppers, including the required subdirectory, file structure, and project configuration.

Catalyst uses [Next.js App Router Internationalization (i18n)](https://next-intl-docs.vercel.app/docs/getting-started/app-router) library to handle localization.

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
    "featuredProducts": "Featured Products",
    "newestProducts": "Newest products"
  }
}
```

In your newly-created JSON file, add a translation of the value to the new locale.

```json
"Home": {
  "Carousel": {
    "featuredProducts": "Produits populaires",
    "newestProducts": "Produits les plus recentsProduits"
  }
}
```

Read more about i18n messages in [next-intl docs](https://next-intl-docs.vercel.app/docs/usage/messages).

## i18n configuration

After you created a language file, add its name to the `routing.ts` config file.

For example, if you created a `fr.json` file, include `fr` when you define the locales:

```ts
const locales = ['en', 'fr'] as const;
```

## Subpath configuration (optional)

If you are using domain subpaths to localize your storefront for a specific language, map the subpath to a channel in the `channels.config.ts` file.

For example, if you want the `/fr` subpath to point a channel ID of `12345`, include the following:

```ts
const localeToChannelsMappings: Partial<RecordFromLocales> = {
  fr: '12345',
};
```

## Using keys in React components

The following example shows how messages can be used in **server** component:

```tsx
import { getTranslations } from 'next-intl/server';
// ...

export default async function Home() {
  const t = await getTranslations('Home');
  // ...

  return (
    <div>
      <ProductCardCarousel
        products={featuredProducts}
        title={t('Carousel.featuredProducts')}
      />
    </div>
  );
}
```

**Client** and **shared** components use regular hooks to translate messages:

```tsx
'use client';

import { useTranslations } from 'next-intl';
// ...

const Component = () => {
  const t = useTranslations('Cart');
  // ...

  return (
    <Button>
      {t('proceedToCheckout')}
    </Button>
  );
}
```

> [!NOTE]
> **unstable_setRequestLocale**
> Please pay attention to `unstable_setRequestLocale` call. You can read more in [next-intl docs](https://next-intl-docs.vercel.app/docs/getting-started/app-router#add-unstable_setrequestlocale-to-all-layouts-and-pages).

## Routing and locale detection

Even though the next-intl library supports several [locale detection strategies](https://next-intl-docs.vercel.app/docs/routing/middleware#strategies), Catalyst doesn't use any by default, as full internationalization support is still in progress. This strategy can be changed in the `i18n.ts` config file.

Currently, the shopper's browser preferences storefront detect locale by default. Catalyst uses the `Accept-Language` request HTTP header to determine which translation file to choose. If you do not have a JSON file matching the shopper's browser language, Catalyst will use the default English file.
