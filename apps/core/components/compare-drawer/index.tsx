'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@bigcommerce/components/Accordion';
import { Button } from '@bigcommerce/components/Button';
import { X } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { CheckedProduct, useCompareProductsContext } from '~/app/contexts/compare-products-context';
import { Link } from '~/components/link';

const CompareLink = ({ products }: { products: CheckedProduct[] }) => {
  return (
    <Button asChild className="me-4 h-12 w-auto grow whitespace-nowrap px-8 md:grow-0">
      <Link href={`/compare?ids=${products.map(({ id }) => id).join(',')}`}>
        Compare ({products.length})
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
  return (
    <li
      className="mb-4 flex h-12 flex-shrink-0 items-center overflow-hidden border border-gray-200 pe-3 last:mb-0 md:mb-0 md:me-4"
      key={product.id}
    >
      {product.image ? (
        <Image
          alt={product.image.altText ?? product.name}
          className="object-contain"
          height={48}
          src={product.image.url ?? ''}
          width={48}
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center bg-gray-200 text-[8px] text-gray-500">
          Photo
        </span>
      )}
      <small className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-4 text-base font-semibold">
        {product.name}
      </small>
      <Button
        aria-label={`Remove ${product.name} from compare list`}
        className="grow-1 ms-auto w-auto border-0 bg-transparent p-0 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary"
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
        <CompareLink products={products} />
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
      <Accordion className="w-full md:hidden" collapsible defaultValue="compare" type="single">
        <AccordionItem className="flex flex-col" value="compare">
          <div className="flex">
            <CompareLink products={products} />
            <AccordionTrigger className="align-center flex aspect-square h-12 grow-0 justify-center border border-blue-primary text-blue-primary md:hidden [&[data-state=closed]>svg]:rotate-180 [&[data-state=open]>svg]:rotate-0" />
          </div>
          <AccordionContent className="mt-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
