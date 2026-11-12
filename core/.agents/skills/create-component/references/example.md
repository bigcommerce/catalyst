# Example: a brand strip

The user asks: "Show our brands in a row on the home page."

Steps 2 to 6 produce three pieces. The query and the UI are separate files.

This example makes a separate request, to show each piece. The home page has a shared request in `page-data.ts`. Thus, in a real build, add a fragment to that request (step 4).

## Contents

- Step 2: find the data
- Step 4: the query
- Step 5: the UI
- Step 6: use it on the page
- Step 7: what a wrong field looks like

## Step 2: find the data

```sh
node .agents/skills/create-component/scripts/schema.mjs search brands
node .agents/skills/create-component/scripts/schema.mjs type Brand
```

`Site.brands` returns brands. `Brand` has `entityId`, `name`, `path`, and `defaultImage`.

## Step 4: the query, in `components/brand-strip/data.ts`

The function returns the shape the UI needs. The UI does not know about GraphQL.

```ts
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';

const BrandStripQuery = graphql(`
  query BrandStripQuery($first: Int!) {
    site {
      brands(first: $first) {
        edges {
          node {
            entityId
            name
            path
            defaultImage {
              altText
              url: urlTemplate(lossy: true)
            }
          }
        }
      }
    }
  }
`);

export const getBrandStripData = cache(async (first: number) => {
  const { data } = await client.fetch({
    document: BrandStripQuery,
    variables: { first },
    fetchOptions: { next: { revalidate } },
  });

  return removeEdgesAndNodes(data.site.brands).map(({ entityId, name, path, defaultImage }) => ({
    id: String(entityId),
    name,
    href: path,
    image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
  }));
});
```

## Step 5: the UI, in `vibes/soul/sections/brand-strip/index.tsx`

Every color and font is a theme class. `rounded-lg` and `border-contrast-100` come from the corner and border habits that `brand.mjs` printed for this project. Another project can print other values.

```tsx
import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface Brand {
  id: string;
  name: string;
  href: string;
  image?: { src: string; alt: string };
}

interface Props {
  title: string;
  brands: Streamable<Brand[]>;
  placeholderCount?: number;
  className?: string;
}

export function BrandStrip({ title, brands, placeholderCount = 6, className }: Props) {
  return (
    <section className={clsx('@container', className)}>
      <h2 className="mb-6 font-heading text-2xl text-foreground">{title}</h2>
      <Stream fallback={<BrandStripSkeleton placeholderCount={placeholderCount} />} value={brands}>
        {(items) => (
          <ul className="grid grid-cols-2 gap-4 @md:grid-cols-3 @3xl:grid-cols-6">
            {items.map(({ id, name, href, image }) => (
              <li key={id}>
                <Link
                  className="flex h-24 items-center justify-center rounded-lg border border-contrast-100 bg-background p-4 font-body text-foreground transition-colors hover:border-primary"
                  href={href}
                >
                  {image ? (
                    <Image
                      alt={image.alt}
                      className="object-contain"
                      height={64}
                      src={image.src}
                      width={128}
                    />
                  ) : (
                    name
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Stream>
    </section>
  );
}

export function BrandStripSkeleton({ placeholderCount = 6 }: { placeholderCount?: number }) {
  return (
    <Skeleton.Root pending>
      <div className="grid grid-cols-2 gap-4 @md:grid-cols-3 @3xl:grid-cols-6">
        {Array.from({ length: placeholderCount }).map((_, index) => (
          <Skeleton.Box className="h-24 rounded-lg" key={index} />
        ))}
      </div>
    </Skeleton.Root>
  );
}
```

## Step 6: use it on the page, in `app/[locale]/(default)/page.tsx`

```tsx
import { BrandStrip } from '@/vibes/soul/sections/brand-strip';
import { getBrandStripData } from '~/components/brand-strip/data';

// Inside the page function:
const streamableBrands = Streamable.from(async () => getBrandStripData(6));

// Inside the returned JSX:
<BrandStrip brands={streamableBrands} title={t('BrandStrip.title')} />;
```

Add `BrandStrip.title` under `Home` in `messages/en.json`. Existing keys are nested the same way, for example `Home.FeaturedProducts.title`.

## Step 7: what a wrong field looks like

If the query has `nme` and not `name`, `pnpm typecheck` fails where the code reads `name`. The error says the property does not exist. Change the query to the field name that `schema.mjs type Brand` prints.
