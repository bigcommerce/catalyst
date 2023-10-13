'use client';

import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';
import { startTransition, useEffect, useId, useState } from 'react';

import { handleUpdateCompare } from './_actions/updateCompare';

export const Compare = ({ checked, productId }: { checked: boolean; productId: number }) => {
  const checkboxId = useId();
  const [checkedState, setCheckedState] = useState(checked);

  useEffect(() => {
    setCheckedState(checked);
  }, [checked]);

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        checked={checkedState}
        className="h-4 w-4"
        id={checkboxId}
        onCheckedChange={(isChecked) => {
          setCheckedState(Boolean(isChecked));
          startTransition(() => {
            handleUpdateCompare(productId, Boolean(isChecked));
          });
        }}
      />
      <Label htmlFor={checkboxId}>Compare</Label>
    </div>
  );
};
