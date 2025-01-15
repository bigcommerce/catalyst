'use client';
import { useState, useRef, useEffect } from 'react';
import { MegaMenuMenuItem, MegaMenuMenuItemColumn, MegaMenuSubMenuItem, MegaMenuSubSubMenuItem, MegaMenuSecondaryMenuItem, MegaMenuProps } from './mega-menu-types';
import clsx from 'clsx';
//import { Link } from '~/components/link';
import Link from 'next/link';

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
    /*
    timeoutRef.current = setTimeout(() => {
      setOpenMenuId(null);
    }, 200);
    */
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

  return ((menuItems && menuItems.length > 0) || (secondaryMenuItems && secondaryMenuItems.length > 0)) && (
    <div className={clsx('mega-menu header-bottom navigation', `mega-menu-${variant}`, classNames?.root)}>
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
                {openMenuId === `main-menu-id-${index}` && menuItem.columns && menuItem.columns.length > 0 && 
                  <div
                    className={clsx('sub-menu', classNames?.subMenuRoot)}
                    onMouseEnter={() => handleMenuEnter(`main-menu-id-${index}`)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <button title="Close menu" className={clsx('sub-menu-close-button', classNames?.subMenuCloseButton)} onClick={handleMenuClose}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className={clsx('sub-menu-columns', classNames?.subMenuColumns)}>
                      {menuItem.columns.map((menuItemColumn: MegaMenuMenuItemColumn, index2: number) => (
                        <ul className={clsx('sub-menu-column', classNames?.mainSubMenuColumn)} key={`main-menu-column-${index2}`}>
                          {menuItemColumn.subMenuItems.map((menuItem: MegaMenuSubMenuItem, index3: number) => (
                            <li className={clsx('main-sub-menu-item', classNames?.mainSubMenuItem)} key={`main-sub-menu-item-${index3}`}>

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

                              {menuItem.imageSrc &&
                                <figure>
                                  {menuItem.link?.href ? (
                                    <Link href={menuItem.link.href}><img src={menuItem.imageSrc} alt={menuItem.title ?? menuItem.button ?? 'Menu item image'} className={clsx('sub-menu-image', classNames?.mainSubMenuImage)} /></Link>
                                  ) : (
                                    <img src={menuItem.imageSrc} alt={menuItem.title} className={clsx('sub-menu-image', classNames?.mainSubMenuImage)} />
                                  )}
                                </figure>
                              }

                              {menuItem.description && <div className={clsx('sub-menu-description', classNames?.mainSubMenuDescription)}>{menuItem.description}</div>}

                              {menuItem.button && menuItem.link?.href && <div className={clsx('sub-menu-button', classNames?.mainSubMenuButton)}>{menuItem.button}</div>}

                              {menuItem.subSubMenuItems && menuItem.subSubMenuItems.length > 0 && (
                                <ul>
                                  {menuItem.subSubMenuItems.map((menuItem: MegaMenuSubSubMenuItem, index4: number) => (
                                    <li className={clsx('main-sub-sub-menu-item', classNames?.mainSubSubMenuItem)} key={`main-sub-sub-menu-item-${index4}`}>
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
                      ))}
                    </div>
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
