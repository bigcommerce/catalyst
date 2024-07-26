'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { CheckedProduct, useCompareProductsContext } from '~/app/contexts/compare-products-context';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

import { BcImage } from '../bc-image';

const CompareLink = ({ products }: { products: CheckedProduct[] }) => {
  const t = useTranslations('Providers.Compare');

  return (
    <Button
      asChild
      className="me-4 h-12 w-auto grow whitespace-nowrap px-8 hover:text-white md:grow-0"
    >
      <Link href={`/compare?ids=${products.map(({ id }) => id).join(',')}`}>
        {t('compareButton', { products: products.length })}
      </Link>
    </Button>
  );
};

const CompareItem = ({
  product,
  removeItem,
}: {
  product: CheckedProduct;
  removeItem: () => void;
}) => {
  const t = useTranslations('Providers.Compare');

  return (
    <li
      className="mb-4 flex h-12 flex-shrink-0 items-center overflow-hidden border border-gray-200 pe-3 last:mb-0 md:mb-0 md:me-4"
      key={product.id}
    >
      {product.image ? (
        <BcImage
          alt={product.image.altText ?? product.name}
          className="object-contain"
          height={48}
          src={product.image.url ?? ''}
          width={48}
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center bg-gray-200 text-[8px] text-gray-500">
          {t('productPhoto')}
        </span>
      )}
      <small className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-4 text-base font-semibold">
        {product.name}
      </small>
      <Button
        aria-label={t('removeProductAriaLabel', { product: product.name })}
        className="grow-1 ms-auto w-auto border-0 bg-transparent p-0 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary"
        onClick={removeItem}
        type="button"
      >
        <X />
      </Button>
    </li>
  );
};

export const CompareDrawer = () => {
  const pathname = usePathname();
  const { products, setProducts } = useCompareProductsContext();

  if (pathname === '/compare' || products.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 start-0 w-full border-t border-gray-200 bg-white p-6 md:pe-0">
      <div className="hidden md:flex">
        <CompareLink key={products.toString()} products={products} />
        <ul className="flex overflow-auto">
          {products.map((product) => {
            return (
              <CompareItem
                key={product.id}
                product={product}
                removeItem={() => setProducts(products.filter(({ id }) => id !== product.id))}
              />
            );
          })}
        </ul>
      </div>

      <AccordionPrimitive.Root className="w-full md:hidden" collapsible type="single">
        <AccordionPrimitive.Item value="compare">
          <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between py-[9.5px] text-lg font-bold outline-none transition-all hover:text-secondary focus-visible:text-secondary [&[data-state=open]>svg]:rotate-180">
              <CompareLink products={products} />
              <ChevronDown className="h-6 w-6 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down mb-4 overflow-hidden transition-all">
            <ul className="flex max-h-44 flex-col overflow-auto">
              {products.map((product) => {
                return (
                  <CompareItem
                    key={product.id}
                    product={product}
                    removeItem={() => setProducts(products.filter(({ id }) => id !== product.id))}
                  />
                );
              })}
            </ul>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    </div>
  );
};
