'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { KlevuMerchandising } from '@klevu/ui-react';
import React from 'react';

import { KlevuInitWrapper } from '~/components/ui/klevu/init';



export default function KlevuCategory({ category }) {
  const catBreadcrumbs = removeEdgesAndNodes(category.breadcrumbs);
  const getCategoryPath = () => {
    try {
      let categoryPath = '';

      if (catBreadcrumbs.length) {
        catBreadcrumbs.forEach((cat) => {
          if (cat.name) {
            categoryPath += (categoryPath !== '' ? ';' : '') + cat.name;
          }
        });
      }

      return categoryPath ?? category.name;
    } catch (error) {
      return category.name;
    }
  };

  return (
    <KlevuInitWrapper>
      <KlevuMerchandising category={getCategoryPath()} categoryTitle={category.name} />
    </KlevuInitWrapper>
  );
};
