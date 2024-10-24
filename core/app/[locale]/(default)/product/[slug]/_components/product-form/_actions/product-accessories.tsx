'use client';

import { useFormatter } from 'next-intl';
import { useEffect, useState } from 'react';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { BcImage } from '~/components/bc-image';
import { Select } from '~/components/ui/form';

interface Props {
  accessories: any;
  index: number;
}
export const ProductAccessories = ({ accessories, index }: Props ) => {
  console.log('========accessories=======', accessories);
  console.log('========index=======', index);
  let accessoriesProducts: any = accessories?.productData?.map(({ sku, id, price, name }: {sku: any, id: any, price: any, name: any}) => ({
    value: id,
    label: `(+$${price}) ${sku}-  ${name}`,
  }));
  console.log('========accessoriesProducts=======', accessoriesProducts);
  const onProductChange = (item: any) => {
    console.log('========item=======', item);
  }
  return (
    <>
    {accessories?.length}
      <div className='left-container'>
        <BcImage
          alt={accessories?.name}
          className="object-contain"
          height={150}
          src={accessories?.image}
          width={150}
        />
      </div>
      <div className='right-container'>
        <div className='accessories-label'>{accessories?.label}</div>
        <Select
          name={`accessories-products-${index}`}
          id={`accessories-products-${index}`}
          options={accessoriesProducts}
          placeholder={accessories?.label}
        />
      </div>
    </>
  );
}