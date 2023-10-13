'use server';

import { cookies } from 'next/headers';

export const handleUpdateCompare = (productId: number, include: boolean) => {
  const id = String(productId);

  const selectedIds = cookies().get('compareProductsIds')?.value.split(',') || [];

  if (selectedIds.length > 0) {
    if (include) {
      if (!selectedIds.includes(id)) {
        selectedIds.push(id);
      }
    } else {
      const index = selectedIds.indexOf(id);

      if (index !== -1) {
        selectedIds.splice(index, 1);
      }
    }
  } else if (include) {
    selectedIds.push(id);
  }

  const value = selectedIds.join(',');

  if (value) {
    cookies().set({
      name: 'compareProductsIds',
      value,
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
  } else {
    cookies().delete('compareProductsIds');
  }
};
