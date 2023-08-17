'use client';

import { ComponentPropsWithoutRef } from 'react';

import { handleAddToCart } from './_actions/addToCart';

export const ProductForm = ({ children }: ComponentPropsWithoutRef<'form'>) => (
  <form action={handleAddToCart} className="w-full">
    {children}
  </form>
);
