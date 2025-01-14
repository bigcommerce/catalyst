'use client';
import { useState, useRef, useEffect } from 'react';
import { MegaMenuMenuItem, MegaMenuSecondaryMenuItem, MegaMenuProps } from './mega-menu-types';
import clsx from 'clsx';
import { Link } from '~/components/link';

export function MegaMenuDefault({ menuItems, secondaryMenuItems, classNames }: MegaMenuProps) {

  const variant = 'default';

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMenuEnter = (linkHref: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenMenuId(linkHref);
  };

  const handleMenuLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 200);
  };

  const handleMenuClose = () => {
    setOpenMenuId(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={clsx('header-bottom navigation', variant, classNames?.root)}>
      {menuItems && menuItems.length > 0 && (
        <nav className={clsx('main-menu', classNames?.mainMenu)}>
          <ul>
            {menuItems.map((menuItem: MegaMenuMenuItem, index: number) => (
              <li className={clsx('main-menu-item', classNames?.mainMenuItem)} key={index}>
                {menuItem.link?.href ? (
                  <Link
                    href={menuItem.link.href}
                    className={clsx('main-menu-link', classNames?.mainMenuLink)}
                    onMouseEnter={() => handleMenuEnter(`main-menu-id-${index}`)}
                    onMouseLeave={handleMenuLeave}
                  >
                    {menuItem.title}
                  </Link>
                ) : (
                  <span
                    className={clsx('main-menu-link', classNames?.mainMenuLink)}
                    onMouseEnter={() => handleMenuEnter(`main-menu-id-${index}`)}
                    onMouseLeave={handleMenuLeave}
                  >
                    {menuItem.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
      {secondaryMenuItems && secondaryMenuItems.length > 0 && (
        <nav className={clsx('secondary-menu', classNames?.secondaryMenu)}>
          <ul>
            {secondaryMenuItems.map((menuItem: MegaMenuSecondaryMenuItem, index: number) => (
              <li
                className={clsx('secondary-menu-item', classNames?.secondaryMenuItem)}
                key={index}
              >
                {menuItem.link?.href ? (
                  <Link
                    href={menuItem.link.href}
                    className={clsx('secondary-menu-link', classNames?.secondaryMenuLink)}
                  >
                    {menuItem.title}
                  </Link>
                ) : (
                  <span className={clsx('secondary-menu-link', classNames?.secondaryMenuLink)}>
                    {menuItem.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
