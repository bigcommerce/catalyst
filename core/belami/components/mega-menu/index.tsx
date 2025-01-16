import { Suspense } from 'react';
import { MegaMenuProps } from './mega-menu-types';
import { MegaMenuDefault } from './mega-menu-default';

export function MegaMenu({
  variant,
  menuItems,
  secondaryMenuItems,
  classNames
}: MegaMenuProps) {
  return (
    <Suspense fallback={<>Loading...</>}>
      {(variant === 'default') && <MegaMenuDefault menuItems={menuItems} secondaryMenuItems={secondaryMenuItems} classNames={classNames} />}
    </Suspense>
  );
}