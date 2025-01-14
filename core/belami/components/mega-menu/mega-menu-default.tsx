'use client';
import { useState, useRef, useEffect } from 'react';
import { MegaMenuMenuItem, MegaMenuSubMenuItem, MegaMenuSubSubMenuItem, MegaMenuSecondaryMenuItem, MegaMenuProps } from './mega-menu-types';
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
              <li className={clsx('main-menu-item', classNames?.mainMenuItem)} key={`main-menu-item-${index}`}>
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
                {openMenuId === `main-menu-id-${index}` && 
                  <div
                    className={clsx('sub-menu', classNames?.subMenuRoot)}
                    onMouseEnter={() => handleMenuEnter(`main-menu-id-${index}`)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <div className={clsx('sub-menu-content', classNames?.subMenuContent)}>
                      <button title="Close menu" className={clsx('sub-menu-close-button', classNames?.subMenuCloseButton)} onClick={handleMenuClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    {menuItem.subMenuItems && menuItem.subMenuItems.length > 0 && (
                      <ul>
                        {menuItem.subMenuItems.map((menuItem: MegaMenuSubMenuItem, index2: number) => (
                          <li className={clsx('main-sub-menu-item', classNames?.mainSubMenuItem)} key={`main-sub-menu-item-${index2}`}>
                            {menuItem.link?.href ? (
                              <Link
                                href={menuItem.link.href}
                                className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                              >
                                {menuItem.title}
                              </Link>
                            ) : (
                              <span
                                className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                              >
                                {menuItem.title}
                              </span>
                            )}

                            {menuItem.subSubMenuItems && menuItem.subSubMenuItems.length > 0 && (
                              <ul>
                                {menuItem.subSubMenuItems.map((menuItem: MegaMenuSubSubMenuItem, index3: number) => (
                                  <li className={clsx('main-sub-sub-menu-item', classNames?.mainSubSubMenuItem)} key={`main-sub-sub-menu-item-${index3}`}>
                                    {menuItem.link?.href ? (
                                      <Link
                                        href={menuItem.link.href}
                                        className={clsx('main-sub-sub-menu-link', classNames?.mainSubSubMenuLink)}
                                      >
                                        {menuItem.title}
                                      </Link>
                                    ) : (
                                      <span
                                        className={clsx('main-sub-sub-menu-link', classNames?.mainSubSubMenuLink)}
                                      >
                                        {menuItem.title}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}


                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                }
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
