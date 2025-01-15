//import { Suspense } from 'react';
import { MegaMenuProps } from './mega-menu-types';
import { MegaMenuDefault } from './mega-menu-default';

export function MegaMenu({
  variant,
  menuItems,
  secondaryMenuItems,
  classNames,
  loadingMessage = 'Loading...',
}: MegaMenuProps & {
  loadingMessage?: string;
}) {
  return (
    <>
    {/* <Suspense fallback={<MegaMenuSkeleton classNames={classNames} message={loadingMessage} />}> */}
      {(variant === 'default') && <MegaMenuDefault menuItems={menuItems} secondaryMenuItems={secondaryMenuItems} classNames={classNames} />}
    {/* </Suspense> */}
    </>
  );
}

export function MegaMenuSkeleton({
  classNames,
  message
}: {
  classNames?: {
    root?: string;
    mainMenu?: string;
    secondaryMenu?: string;
  },
  message?: string;
}) {
  return <></>;
  //return <div className={classNames?.root}>{message}</div>;
}
