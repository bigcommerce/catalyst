'use client';
import React, { createContext, useContext, type PropsWithChildren } from 'react';
import { MegaMenuProps, MegaMenuCustomProps } from './mega-menu-types';
import { MegaMenuDefault } from './mega-menu-default';

const PropsContext = createContext<MegaMenuCustomProps | null>(null);
  
export const MegaMenuContextProvider = ({ value, children }: PropsWithChildren<{ value: MegaMenuCustomProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export function MegaMenu({
  variant,
  menuItems,
  secondaryMenuItems,
  classNames
}: MegaMenuProps) {

  const customProps = useContext(PropsContext) || undefined;

  return (
    <>
      {(variant === 'default') && <MegaMenuDefault menuItems={menuItems} secondaryMenuItems={secondaryMenuItems} customProps={customProps} classNames={classNames} />}
    </>
  );
}