'use client';

import { Button } from '@bigcommerce/components/Button';
import { Field, FieldControl, Form } from '@bigcommerce/components/Form';
import { Input, InputIcon } from '@bigcommerce/components/Input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
} from '@bigcommerce/components/Sheet';
import debounce from 'lodash.debounce';
import { Search, Loader2 as Spinner, X } from 'lucide-react';
import Image from 'next/image';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { getQuickSearchResults } from '~/client/queries/get-quick-search-results';
import { ExistingResultType } from '~/client/util';
import { cn } from '~/lib/utils';

import { Pricing } from '../pricing';

import { getSearchResults } from './_actions/get-search-results';

interface SearchProps extends PropsWithChildren {
  initialTerm?: string;
}

type SearchResults = ExistingResultType<typeof getQuickSearchResults>;

const isSearchQuery = (data: unknown): data is SearchResults => {
  if (typeof data === 'object' && data !== null && 'products' in data) {
    return true;
  }

  return false;
};

const fetchSearchResults = debounce(
  async (
    term: string,
    setSearchResults: React.Dispatch<React.SetStateAction<SearchResults | null>>,
  ) => {
    const searchResults = await getSearchResults(term);

    if (isSearchQuery(searchResults)) {
      setSearchResults(searchResults);
    }
  },
  1000,
);

export const QuickSearch = ({ children, initialTerm = '' }: SearchProps) => {
  const [term, setTerm] = useState(initialTerm);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (term.length < 3) {
      setSearchResults(null);
    } else {
      setPending(true);
      void fetchSearchResults(term, setSearchResults);
    }
  }, [term]);

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
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button
          aria-label="Open search popup"
          className="border-0 bg-transparent p-3 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary"
        >
          <Search />
        </Button>
      </SheetTrigger>
      <SheetOverlay className="bg-transparent backdrop-blur-none">
        <SheetContent
          className={cn(
            'flex min-h-[92px] flex-col px-6 py-4 data-[state=closed]:duration-0 data-[state=open]:duration-0 md:px-10 md:py-4 lg:px-12',
            searchResults && searchResults.products.length > 0 && 'h-full lg:h-3/4',
          )}
          side="top"
        >
          <SheetTitle className="sr-only">Search bar</SheetTitle>
          <div className="grid grid-cols-5 items-center">
            <div className="me-2 hidden lg:block lg:justify-self-start">{children}</div>
            <Form
              action="/search"
              className="col-span-4 flex lg:col-span-3"
              method="get"
              role="search"
            >
              <Field className="w-full" name="term">
                <FieldControl asChild required>
                  <Input
                    aria-controls="categories products brands"
                    aria-expanded={!!searchResults}
                    className="peer appearance-none border-2 px-12 py-3"
                    onChange={handleTermChange}
                    placeholder="Search..."
                    ref={inputRef}
                    role="combobox"
                    value={term}
                  >
                    <InputIcon className="start-3 peer-hover:text-blue-primary peer-focus:text-blue-primary">
                      <Search />
                    </InputIcon>
                    {term.length > 0 && !pending && (
                      <Button
                        aria-label="Clear search"
                        className="absolute end-1.5 top-1/2 w-auto -translate-y-1/2 border-0 bg-transparent p-1.5 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
                        onClick={handleTermClear}
                        type="button"
                      >
                        <X />
                      </Button>
                    )}
                    {pending && (
                      <InputIcon className="end-3 text-blue-primary">
                        <Spinner aria-hidden="true" className="animate-spin" />
                        <span className="sr-only">Processing...</span>
                      </InputIcon>
                    )}
                  </Input>
                </FieldControl>
              </Field>
            </Form>
            <SheetClose asChild>
              <Button
                aria-label="Close search popup"
                className="w-auto justify-self-end border-0 bg-transparent p-2.5 text-black hover:bg-transparent hover:text-blue-primary focus:text-blue-primary peer-hover:text-blue-primary peer-focus:text-blue-primary"
              >
                <small className="me-2 hidden text-base md:inline-flex">Close</small>
                <X />
              </Button>
            </SheetClose>
          </div>
          {searchResults && searchResults.products.length > 0 && (
            <div className="mt-8 grid overflow-auto px-1 lg:grid-cols-3 lg:gap-6">
              <section>
                <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Categories</h3>
                <ul id="categories" role="listbox">
                  {Object.entries(
                    searchResults.products.reduce<Record<string, string>>((categories, product) => {
                      product.categories.edges?.forEach((category) => {
                        if (category) {
                          categories[category.node.name] = category.node.path;
                        }
                      });

                      return categories;
                    }, {}),
                  ).map(([name, path]) => {
                    return (
                      <li className="mb-3 last:mb-6" key={name}>
                        <a
                          className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                          href={path}
                        >
                          {name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <section>
                <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Products</h3>
                <ul id="products" role="listbox">
                  {searchResults.products.map((product) => {
                    return (
                      <li key={product.entityId}>
                        <a
                          className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                          href={product.path}
                        >
                          {product.defaultImage ? (
                            <Image
                              alt={product.defaultImage.altText}
                              className="self-start object-contain"
                              height={80}
                              src={product.defaultImage.url}
                              width={80}
                            />
                          ) : (
                            <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center bg-gray-200 text-h6 text-gray-500">
                              Photo
                            </span>
                          )}

                          <span className="flex flex-col">
                            <p className="text-h5">{product.name}</p>
                            <Pricing prices={product.prices} />
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <section>
                <h3 className="mb-6 border-b border-gray-200 pb-3 text-h5">Brands</h3>
                <ul id="brands" role="listbox">
                  {Object.entries(
                    searchResults.products.reduce<Record<string, string>>((brands, product) => {
                      if (product.brand) {
                        brands[product.brand.name] = product.brand.path;
                      }

                      return brands;
                    }, {}),
                  ).map(([name, path]) => {
                    return (
                      <li className="mb-3 last:mb-6" key={name}>
                        <a
                          className="focus:ring-primary-blue/20 align-items mb-6 flex gap-x-6 focus:outline-none focus:ring-4"
                          href={path}
                        >
                          {name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}
          {searchResults && searchResults.products.length === 0 && (
            <p className="pt-6">
              No products matched with <b>"{term}"</b>
            </p>
          )}
        </SheetContent>
      </SheetOverlay>
    </Sheet>
  );
};
