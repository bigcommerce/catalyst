'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import type { ProductsViewer } from './utils/products-api';

// Defaults to the session-based request, so a missing provider never yields a shared cached URL.
const ProductsViewerContext = createContext<ProductsViewer>({ guest: false });

export function ProductsViewerProvider({
  value,
  children,
}: PropsWithChildren<{ value: ProductsViewer }>) {
  return <ProductsViewerContext.Provider value={value}>{children}</ProductsViewerContext.Provider>;
}

export const useProductsViewer = () => useContext(ProductsViewerContext);
