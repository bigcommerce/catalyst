# Example: a brand strip

The user asks: "Show our brands in a row on the home page."

## Step 2: find the data

```sh
node .agents/skills/create-component/scripts/schema.mjs search brands
node .agents/skills/create-component/scripts/schema.mjs type Brand
```

`Site.brands` returns brands. A `Brand` has `entityId`, `name`, `path`, and `defaultImage`.

## Step 4: add a fragment to the shared request

The home page gets all its data in one request, `HomePageQuery` in `page-data.ts`. Thus, write a fragment, not a separate request.

In `components/brand-strip/fragment.ts`:

```ts
import { graphql } from '~/client/graphql';

export const BrandStripFragment = graphql(`
  fragment BrandStripFragment on Site {
    brands(first: 6) {
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
`);
```

In `app/[locale]/(default)/page-data.ts`, add the fragment to `site` and to the fragment list:

```ts
const HomePageQuery = graphql(
  `
    query HomePageQuery($currencyCode: currencyCode) {
      site {
        ...BrandStripFragment
        # The existing fields stay here.
      }
    }
  `,
  [BrandStripFragment, FeaturedProductsCarouselFragment, FeaturedProductsListFragment],
);
```

## Step 5: the section

In `vibes/soul/sections/brand-strip/index.tsx`. Each color and font is a theme class. `rounded-lg` and `border-contrast-100` come from the nearest components.

```tsx
import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
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
}

const gridClassName = 'grid grid-cols-2 gap-4 @md:grid-cols-3 @3xl:grid-cols-6';

export function BrandStrip({ title, brands }: Props) {
  return (
    <Stream fallback={<BrandStripSkeleton />} value={brands}>
      {(items) =>
        items.length > 0 && (
          <SectionLayout>
            <h2 className="mb-6 font-heading text-2xl text-foreground">{title}</h2>
            <ul className={gridClassName}>
              {items.map(({ id, name, href, image }) => (
                <li key={id}>
                  <Link
                    className="flex h-24 items-center justify-center rounded-lg border border-contrast-100 bg-background p-4 font-body text-foreground transition-colors hover:border-primary"
                    href={href}
                  >
                    {image ? (
                      <Image
                        alt={image.alt || name}
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
          </SectionLayout>
        )
      }
    </Stream>
  );
}

function BrandStripSkeleton() {
  return (
    <SectionLayout>
      <Skeleton.Root className={gridClassName} pending>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton.Box className="h-24 rounded-lg" key={index} />
        ))}
      </Skeleton.Root>
    </SectionLayout>
  );
}
```

## Step 6: put it on the page

In `app/[locale]/(default)/page.tsx`. `streamablePageData` is the shared request.

```tsx
import { BrandStrip } from '@/vibes/soul/sections/brand-strip';

// Inside the page function:
const streamableBrands = Streamable.from(async () => {
  const data = await streamablePageData;

  return removeEdgesAndNodes(data.site.brands).map(({ entityId, name, path, defaultImage }) => ({
    id: String(entityId),
    name,
    href: path,
    image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
  }));
});

// Inside the returned JSX:
<BrandStrip brands={streamableBrands} title={t('BrandStrip.title')} />;
```

Add `BrandStrip.title` under `Home` in `messages/en.json`.
