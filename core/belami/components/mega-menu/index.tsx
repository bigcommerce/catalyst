import { MegaMenuProps } from './mega-menu-types';
import { MegaMenuDefault } from './mega-menu-default';

export function MegaMenu({
  variant,
  logoSrc,
  menuItems,
  secondaryMenuItems,
  classNames
}: MegaMenuProps) {
  return (
    <>
      {(variant === 'default') && <MegaMenuDefault logoSrc={logoSrc} menuItems={menuItems} secondaryMenuItems={secondaryMenuItems} classNames={classNames} />}
    </>
  );
}