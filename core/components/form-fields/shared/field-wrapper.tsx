import { PropsWithChildren } from 'react';

import { FieldNameToFieldId } from '../utils';

const LAYOUT_HALF_OF_SINGLE_LINE_FIELDS = [FieldNameToFieldId.company, FieldNameToFieldId.phone];
const LAYOUT_SINGLE_LINE_FIELDS = [FieldNameToFieldId.email];

export const FieldWrapper = ({ children, fieldId }: { fieldId: number } & PropsWithChildren) => {
  if (LAYOUT_HALF_OF_SINGLE_LINE_FIELDS.includes(fieldId)) {
    return (
      <div className="grid grid-cols-1 gap-y-6 lg:col-span-2 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
        {children}
      </div>
    );
  }

  if (LAYOUT_SINGLE_LINE_FIELDS.includes(fieldId)) {
    return <div className="grid grid-cols-1 lg:col-span-2">{children}</div>;
  }

  return children;
};
