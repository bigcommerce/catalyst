'use client';

import { PropsWithChildren } from 'react';

export enum FieldNameToFieldId {
  email = 1,
  password,
  confirmPassword,
  firstName,
  lastName,
  company,
  phone,
  address1,
  address2,
  city,
  countryCode,
  stateOrProvince,
  postalCode,
  currentPassword = 24,
  exclusiveOffers = 25,
}

const LAYOUT_SINGLE_LINE_FIELDS = [
  FieldNameToFieldId.email,
  FieldNameToFieldId.company,
  FieldNameToFieldId.phone,
];

export const FieldWrapper = ({ children, fieldId }: { fieldId: number } & PropsWithChildren) => {
  if (LAYOUT_SINGLE_LINE_FIELDS.includes(fieldId)) {
    return (
      <div className="grid grid-cols-1 gap-y-6 lg:col-span-2 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-2">
        {children}
      </div>
    );
  }

  return children;
};
