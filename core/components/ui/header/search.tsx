'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';
import debounce from 'lodash.debounce';
import { Search as SearchIcon, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { Button } from '../button';
import { Price } from '../product-card';

import { Input } from './input';

interface Image {
  src: string;
  altText: string;
}

interface Product {
  href: string;
  name: string;
  price?: Price;
  image?: Image;
}

interface Category {
  href: string;
  label: string;
}

interface Brand {
  href: string;
  label: string;
}

interface SearchResults {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

interface Props {
  initialTerm?: string;
  logo: string | Image;
  onSearch: (term: string) => Promise<SearchResults | null>;
}

const Search = ({ initialTerm = '', logo, onSearch }: Props) => {
  const [term, setTerm] = useState(initialTerm);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedOnSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        const results = await onSearch(query);

        setSearchResults(results);
      }, 1000),
    [onSearch],
  );

  const fetchSearchResults = useCallback(
    async (query: string) => {
      await debouncedOnSearch(query);
    },
    [debouncedOnSearch],
  );

  useEffect(() => {
    if (term.length < 3) {
      setSearchResults(null);
    } else {
      setPending(true);

      void fetchSearchResults(term);
    }
  }, [term, fetchSearchResults]);

  useEffect(() => {
    setPending(false);
  }, [searchResults]);

  const handleTermChange = (e: React.FormEvent<HTMLInputElement>) => {
    setTerm(e.currentTarget.value);
  };
  const handleTermClear = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <SheetPrimitive.Root onOpenChange={setOpen} open={open}>
      <SheetPrimitive.Trigger asChild>
        <Button
          aria-label="Open search popup"
          className="border-0 bg-transparent p-3 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary"
        >
          <SearchIcon />
        </Button>
      </SheetPrimitive.Trigger>
      <SheetPrimitive.Overlay className="fixed inset-0 bg-transparent backdrop-blur-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <SheetPrimitive.Portal>
          <SheetPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              'fixed inset-x-0 top-0 items-center overflow-auto border-b bg-white px-4 shadow-lg transition ease-in-out data-[state=closed]:duration-0 data-[state=open]:duration-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top md:px-10 lg:px-12',
              searchResults && searchResults.products.length > 0 && 'h-full lg:h-3/4',
            )}
          >
            <SheetPrimitive.Title asChild>
              <h2 className="sr-only">Search bar</h2>
            </SheetPrimitive.Title>

            <div className="grid h-[92px] w-full grid-cols-5 items-center">
              <div className="me-2 hidden lg:block lg:justify-self-start">
                <CustomLink className="overflow-hidden text-ellipsis py-3" href="/">
                  {typeof logo === 'object' ? (
                    <BcImage
                      alt={logo.altText}
                      className="max-h-16 object-contain"
                      height={32}
                      priority
                      src={logo.src}
                      width={155}
                    />
                  ) : (
                    <span className="truncate text-2xl font-black">{logo}</span>
                  )}
                </CustomLink>
              </div>
              <Form.Root
                action="/search"
                className="col-span-4 flex lg:col-span-3"
                method="get"
                role="search"
              >
                <Form.Field className="w-full" name="term">
                  <Form.Control asChild required>
                    <Input
                      aria-controls="categories products brands"
                      aria-expanded={!!searchResults}
                      onChange={handleTermChange}
                      onClickClear={handleTermClear}
                      pending={pending}
                      placeholder="Search..."
                      ref={inputRef}
                      role="combobox"
                      showClear={term.length > 0}
                      value={term}
                    />
                  </Form.Control>
                </Form.Field>
              </Form.Root>
              <SheetPrimitive.Close asChild>
                <Button
                  aria-label="Close search popup"
                  className="w-auto justify-self-end border-0 bg-transparent p-2.5 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 peer-hover:text-primary peer-focus-visible:text-primary"
                >
                  <small className="me-2 hidden text-base md:inline-flex">Close</small>
                  <X />
                </Button>
              </SheetPrimitive.Close>
            </div>
            {searchResults && searchResults.products.length > 0 && (
              <div className="mt-8 grid overflow-auto px-1 lg:grid-cols-3 lg:gap-6">
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Categories
                  </h3>
                  <ul id="categories" role="listbox">
                    {searchResults.categories.map(({ label, href }) => {
                      return (
                        <li className="mb-3 last:mb-6" key={label}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={href}
                          >
                            {label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Products
                  </h3>
                  <ul id="products" role="listbox">
                    {searchResults.products.map(({ name, href, price, image }) => {
                      return (
                        <li key={href}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={href}
                          >
                            {image ? (
                              <BcImage
                                alt={image.altText}
                                className="self-start object-contain"
                                height={80}
                                src={image.src}
                                width={80}
                              />
                            ) : (
                              <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-gray-200 text-lg font-bold text-gray-500">
                                Photo
                              </span>
                            )}

                            <span className="flex flex-col">
                              <p className="text-lg font-bold lg:text-2xl">{name}</p>
                              {Boolean(price) &&
                                (typeof price === 'object' ? (
                                  <p className="flex flex-col gap-1">
                                    {price.type === 'range' && (
                                      <span>
                                        {price.minValue} - {price.maxValue}
                                      </span>
                                    )}

                                    {price.type === 'sale' && (
                                      <>
                                        <span>
                                          Was:{' '}
                                          <span className="line-through">
                                            {price.previousValue}
                                          </span>
                                        </span>
                                        <span>Now: {price.currentValue}</span>
                                      </>
                                    )}
                                  </p>
                                ) : (
                                  <span>{price}</span>
                                ))}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                <section>
                  <h3 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold lg:text-2xl">
                    Brands
                  </h3>
                  <ul id="brands" role="listbox">
                    {searchResults.brands.map(({ label, href }) => {
                      return (
                        <li className="mb-3 last:mb-6" key={label}>
                          <a
                            className="align-items mb-6 flex gap-x-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            href={href}
                          >
                            {label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </div>
            )}
            {searchResults && searchResults.products.length === 0 && (
              <p className="p-6">
                No products matched with <b>"{term}"</b>
              </p>
            )}
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      </SheetPrimitive.Overlay>
    </SheetPrimitive.Root>
  );
};

export { Search, type SearchResults };
