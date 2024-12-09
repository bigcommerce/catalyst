'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link as CustomLink } from '~/components/link';

import searchKeywords from './search-keywords.json';

type DynamicObject = {
  [key: string]: number;
};

const searchKeywordsWeight: DynamicObject = searchKeywords;

export const BrandsList = ({ brands }: any) => {
  const t = useTranslations('Brands'); 

  const [category, setCategory] = useState<string | null>(null);

  return (
    <>
      <div className="grid items-start gap-8 grid-cols-1 md:grid-cols-[minmax(min-content,_300px)_1fr]">
        <div className="md:max-w-[300px]">
          <ul className="flex md:block space-x-5 md:space-x-0 text-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <li className="py-1 mb-1 md:mb-2 md:text-xl cursor-pointer" onClick={() => setCategory(null)}><span className={!category ? "font-bold md:font-medium underline" : ""}>{t('all')}</span></li>
            {brands && brands.length > 0 &&
              brands.map((brand: any) => brand.searchKeywords).flat().map((keyword: string) => keyword.charAt(0).toUpperCase() + keyword.slice(1)).filter((x: string, i: number, a: string[]) => a.indexOf(x) == i)
              .sort((a: string, b: string) => (searchKeywordsWeight[b] || 0) - (searchKeywordsWeight[a] || 0))
              .map((keyword: string, index: number) => 
                <li key={index} className="py-1 mb-1 cursor-pointer" onClick={() => setCategory(keyword)}><span className={category == keyword ? "font-bold underline" : ""}>{keyword}</span></li>
              )
            }
          </ul>
        </div>
        <div>
          {brands && brands.length > 0 &&
            brands.filter((brand: any) => !category || brand.searchKeywords.includes(category)).map((brand: any) => brand.name.charAt(0).toUpperCase()).filter((x: string, i: number, a: string[]) => a.indexOf(x) == i).map((letter: string) => 
              <React.Fragment key={letter}>
              <h2 className="py-2 mb-2 text-3xl font-medium border-b border-color-gray-400 text-center md:text-left">{letter}</h2>
              <ul className="mt-2 mb-4 columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
                {
                  brands.filter((brand: any) => (!category || brand.searchKeywords.includes(category)) && brand.name.charAt(0).toUpperCase() == letter).map((brand: any, index: number) => 
                    <li key={index} className="text-center sm:text-left py-1 mb-1">
                      {brand.path ? <CustomLink href={brand.path} className="!inline !justify-normal">{brand.name}</CustomLink> : brand.name }
                    </li>
                  )
                }
              </ul>
              </React.Fragment>
            )
          }
        </div>
      </div>
    </>
  );
}