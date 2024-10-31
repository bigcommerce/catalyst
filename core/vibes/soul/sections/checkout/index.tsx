'use client';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { useEffect, useState } from 'react';

import * as Accordion from '@radix-ui/react-accordion';
import { clsx } from 'clsx';

import { Button } from '@/vibes/soul/primitives/button';
import { Checkbox } from '@/vibes/soul/primitives/checkbox';
import { Input } from '@/vibes/soul/primitives/input';
import { CartLineItem } from '@/vibes/soul/sections/cart';
import { CheckoutForm } from '@/vibes/soul/sections/checkout/checkout-form';

export const Checkout = function Checkout({ products }: { products: CartLineItem[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | undefined>(undefined);

  // TODO: Remove this when we have a real API
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleAccordionChange = (value: string | undefined) => {
    setOpenAccordion(value);
  };

  const accordions = [
    {
      title: 'Customer',
      preview: <span>email@email.com</span>,
      form: (
        <form className="space-y-4">
          <div className="flex items-end gap-4">
            <Input label="Email" value="test@test.com" />
            <Button
              variant="secondary"
              size="small"
              className="h-[48px]"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleAccordionChange('');
              }}
            >
              Continue
            </Button>
          </div>
          <Checkbox
            id="newsletter-subscribe"
            checked={checked}
            setChecked={setChecked}
            label="Subscribe to our newsletter"
          />
          <span className="block pt-8 text-xs">
            Already have an account?{' '}
            <Link href="#" className="font-semibold">
              Log in
            </Link>
          </span>
        </form>
      ),
    },
    {
      title: 'Shipping',
      preview: (
        <div className="flex flex-col">
          <span>Jane Jones</span>
          <span>Monogram</span>
          <span>+1 (404) 555 0123</span>
          <span>1234 Main St, Atlanta, GA 30303</span>
          <span className="mt-1 w-fit border-t pt-1">
            Free Shipping <span className="font-medium">$0.00</span>
          </span>
        </div>
      ),
      form: (
        <CheckoutForm
          includeSameAsBillingAddress
          includeOrderComments
          includeShippingMethod
          onSubmit={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            handleAccordionChange('');
          }}
        />
      ),
    },
    {
      title: 'Billing',
      preview: (
        <div className="flex flex-col">
          <span>Jane Jones</span>
          <span>Monogram</span>
          <span>+1 (404) 555 0123</span>
          <span>1234 Main St, Atlanta, GA 30303</span>
        </div>
      ),
      form: (
        <CheckoutForm
          onSubmit={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            handleAccordionChange('');
          }}
        />
      ),
    },
    {
      title: 'Payment',
      preview: <></>,
      form: <></>,
    },
  ];

  return (
    <div className="mx-auto max-w-screen-2xl @container">
      <div className="flex w-full flex-col gap-4 pb-10 pt-24 @3xl:flex-row @4xl:pb-20 @4xl:pt-32">
        {/* Customer Form Side */}
        <div className={clsx(products.length > 0 && '@3xl:w-1/2 @6xl:w-2/3', 'w-full max-w-3xl')}>
          <h1 className="mb-10 px-3 font-heading text-4xl font-medium leading-none @xl:pl-6 @xl:text-5xl @5xl:pl-20">
            Checkout
            {!isLoading && products.length > 0 && (
              <span className="ml-4 text-contrast-200">{products.length}</span>
            )}
          </h1>

          <Accordion.Root
            type="single"
            collapsible
            value={openAccordion}
            onValueChange={handleAccordionChange}
            asChild
          >
            <ul>
              {accordions.map((accordion, i) => (
                <Accordion.Item key={i} value={`${i + 1}`} asChild>
                  <li className="group px-3 transition-colors duration-500 @container/accordion data-[state=closed]:bg-transparent data-[state=open]:bg-contrast-100/50 @xl:rounded-r-lg @xl:px-6 @5xl:pl-20 @5xl:pr-10 @6xl:px-20 @7xl:rounded-lg">
                    <Accordion.Header>
                      <div className="grid grid-cols-[max-content_1fr_minmax(max-content,auto)] gap-x-4 py-5 group-data-[state=closed]:grid-rows-[auto,auto] group-data-[state=open]:grid-rows-1 @md:gap-x-8 @xl/accordion:grid-rows-1">
                        <h2 className="w-32 justify-stretch whitespace-nowrap font-heading text-3xl font-medium">
                          {accordion.title}
                        </h2>

                        {((typeof openAccordion === 'string' &&
                          parseInt(openAccordion, 10) !== i + 1) ||
                          openAccordion === undefined) && (
                          <div className="col-span-3 row-start-2 mt-4 flex w-full flex-col gap-2 overflow-hidden pb-2 text-sm group-data-[state=closed]:h-full group-data-[state=open]:h-0 @xl/accordion:col-span-1 @xl/accordion:col-start-2 @xl/accordion:row-start-1">
                            {accordion.preview}
                          </div>
                        )}
                        <Accordion.Trigger asChild>
                          <Button
                            variant="secondary"
                            size="small"
                            className="col-start-3 h-min group-data-[state=open]:pointer-events-none group-data-[state=closed]:opacity-100 group-data-[state=open]:opacity-0"
                          >
                            Edit
                          </Button>
                        </Accordion.Trigger>
                      </div>
                    </Accordion.Header>
                    <Accordion.Content className="data-[state=closed]:animate-collapse data-[state=open]:animate-expand w-full overflow-hidden">
                      <div className="pb-8 pt-2">{accordion.form}</div>
                    </Accordion.Content>
                    <hr
                      className={clsx(
                        openAccordion !== undefined && openAccordion !== ''
                          ? 'opacity-0'
                          : 'opacity-100',
                      )}
                    />
                  </li>
                </Accordion.Item>
              ))}
            </ul>
          </Accordion.Root>
        </div>

        {/* Summary Side */}
        <div className="w-full px-3 @xl:mx-auto @xl:pr-6 @3xl:w-1/2 @5xl:pr-20 @6xl:w-1/3">
          {isLoading ? (
            // Skeleton Loader
            <div className="animate-pulse">
              <div className="mb-20 mt-6 h-10 w-44 rounded bg-contrast-100"></div>
              <div className="h-96 w-full rounded bg-contrast-100"></div>
            </div>
          ) : (
            products.length > 0 && (
              <div>
                <div className="mb-10 flex items-end justify-between">
                  <h2 className="inline font-heading text-4xl font-medium leading-none @xl:text-5xl">
                    Summary
                  </h2>
                  <Link
                    href="#"
                    className="mb-0.5 text-sm text-contrast-300 transition-colors duration-300 hover:text-foreground"
                  >
                    Edit Cart
                  </Link>
                </div>

                {/* Mini Products List in Order Summary */}
                <ul className="flex flex-col gap-y-4">
                  {products.map(({ id, title, image, price, quantity }) => (
                    <li key={id} className="flex items-center justify-between gap-x-4">
                      <div className="flex items-center gap-x-4">
                        {image?.src != null && image.src !== '' && (
                          <div className="relative aspect-[3/4] w-16 overflow-hidden rounded-lg bg-contrast-100">
                            <BcImage
                              src={image.src}
                              alt={image.alt}
                              fill
                              sizes="64px"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-sm">{title}</span>
                          <span className="block text-sm text-contrast-300">x{quantity}</span>
                        </div>
                      </div>
                      <span>{price}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-end gap-2 pb-7 pt-10">
                  <Input label="Coupon / Gift Certificate" />
                  <Button variant="secondary" size="small" className="h-[48px]">
                    Apply
                  </Button>
                </div>

                <table aria-label="Receipt Summary" className="w-full">
                  <caption className="sr-only">Receipt Summary</caption>
                  <tbody>
                    <tr className="border-b border-contrast-100">
                      <td>Subtotal</td>
                      <td className="py-4 text-right">$50.00</td>
                    </tr>
                    <tr className="border-b border-contrast-100">
                      <td>Shipping</td>
                      <td className="py-4 text-right">
                        {/* Add Address Button and Modal Form */} --
                      </td>
                    </tr>
                    <tr className="border-b border-contrast-100">
                      <td>Tax</td>
                      <td className="py-4 text-right">$4.50</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="text-xl">
                      <th className="text-left">Grand Total</th>
                      <td className="py-10 text-right">$59.50</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
