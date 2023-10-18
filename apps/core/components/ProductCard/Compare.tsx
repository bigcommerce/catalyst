'use client';

import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';
import { useEffect, useId, useState } from 'react';

import { useCompareProductsContext } from '../../app/contexts/CompareProductsContext';

export const Compare = ({ productId }: { productId: number }) => {
  const checkboxId = useId();
  const [checkedState, setCheckedState] = useState(false);
  const { productIds, setProductIds } = useCompareProductsContext();

  useEffect(() => {
    const checked = productIds.includes(String(productId));

    setCheckedState(checked);
  }, [productIds, productId]);

  const handleOnCheckedChange = (isChecked: boolean) => {
    setCheckedState(isChecked);

    if (isChecked) {
      setProductIds([...productIds, String(productId)]);
    } else {
      setProductIds(productIds.filter((id) => id !== String(productId)));
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
      <Label htmlFor={checkboxId}>Compare</Label>
    </div>
  );
};
