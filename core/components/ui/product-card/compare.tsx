'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { useCompareDrawerContext } from '../compare-drawer';
import { Checkbox } from '../form/checkbox';
import { Label } from '../form/label';

interface Image {
  altText?: string;
  src?: string;
}

interface Props {
  id: string;
  image?: Image;
  name: string;
}

export const Compare = ({ id, image, name }: Props) => {
  const checkboxId = useId();
  const t = useTranslations('Components.ProductCard.Compare');

  const [checkedState, setCheckedState] = useState(false);
  const { products, setProducts } = useCompareDrawerContext();

  useEffect(() => {
    setCheckedState(products.some(({ id: productId }) => productId === id));
  }, [products, id]);

  const handleOnCheckedChange = (isChecked: boolean) => {
    setCheckedState(isChecked);

    if (isChecked) {
      setProducts([
        ...products,
        {
          id,
          image: image?.src ? { src: image.src, altText: image.altText ?? name } : undefined,
          name,
        },
      ]);
    } else {
      setProducts(
        products.filter(({ id: productId }) => {
          return productId !== id;
        }),
      );
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        aria-label={t('compare')}
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
