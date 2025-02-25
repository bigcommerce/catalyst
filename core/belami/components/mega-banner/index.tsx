'use client';
import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { MegaBannerProps, MegaBannerCustomProps } from './mega-banner-types';
import { MegaBanner as MegaBannerWidget } from './mega-banner';

const PropsContext = createContext<MegaBannerCustomProps | null>(null);
  
export const MegaBannerContextProvider = ({ value, children }: PropsWithChildren<{ value: MegaBannerCustomProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export function MegaBanner({
  items
}: MegaBannerProps) {

  const customProps = useContext(PropsContext) || undefined;

  return (
    <>
      <MegaBannerWidget items={items} customProps={customProps} />
    </>
  );
}