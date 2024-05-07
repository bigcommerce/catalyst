'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';

import { useCompareProductsContext } from '../../app/contexts/compare-products-context';

export const Compare = ({
  productId,
  productImage,
  productName,
}: {
  productId: number;
  productImage?: {
    altText?: string;
    url?: string;
  } | null;
  productName: string;
}) => {
  const checkboxId = useId();
  const t = useTranslations('Product.ProductSheet');
  const [checkedState, setCheckedState] = useState(false);
  const { products, setProducts } = useCompareProductsContext();

  useEffect(() => {
    setCheckedState(products.some(({ id }) => id === productId));
  }, [products, productId]);

  const handleOnCheckedChange = (isChecked: boolean) => {
    setCheckedState(isChecked);

    if (isChecked) {
      setProducts([...products, { id: productId, image: productImage, name: productName }]);
    } else {
      setProducts(
        products.filter(({ id }) => {
          return id !== productId;
        }),
      );
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={checkedState}
        className="h-4 w-4"
        id={checkboxId}
        onCheckedChange={handleOnCheckedChange}
      />
      <Label className="font-normal" htmlFor={checkboxId}>
        {t('compare')}
      </Label>
    </div>
  );
};
