import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { usePathname } from '~/navigation';

import { Button } from '../button';
import { ProductChip } from '../product-chip';

import { CheckedProduct, useCompareDrawerContext } from './context';

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

const CompareDrawer = () => {
  const pathname = usePathname();

  const { products, setProducts } = useCompareDrawerContext();

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
              <ProductChip
                key={product.id}
                onDismiss={() => setProducts(products.filter(({ id }) => id !== product.id))}
                product={product}
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
                  <ProductChip
                    key={product.id}
                    onDismiss={() => setProducts(products.filter(({ id }) => id !== product.id))}
                    product={product}
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

export { CompareDrawer };
