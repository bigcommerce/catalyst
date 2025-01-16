import { MegaMenuProps } from './mega-menu-types';
import { MegaMenuDefault } from './mega-menu-default';

export function MegaMenu({
  variant,
  menuItems,
  secondaryMenuItems,
  classNames
}: MegaMenuProps) {
  return (
    <>
      {(variant === 'default') && <MegaMenuDefault menuItems={[]} secondaryMenuItems={secondaryMenuItems} classNames={classNames} />}
    </>
  );
}