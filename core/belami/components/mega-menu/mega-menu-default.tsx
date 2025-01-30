'use client';
import { useState, useRef, useEffect } from 'react';
import { MegaMenuMenuItem, MegaMenuMenuItemColumn, MegaMenuSubMenuItem, MegaMenuSubSubMenuItem, MegaMenuSecondaryMenuItem, MegaMenuProps } from './mega-menu-types';
import { ChevronLeft, ChevronRight, Menu, X, Plus, Minus } from 'lucide-react';
import clsx from 'clsx';
//import { Link } from '~/components/link';
import Link from 'next/link';

export function MegaMenuDefault({ menuItems, secondaryMenuItems, classNames }: MegaMenuProps) {

  const variant = 'default';

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const [openMenuItems, _setOpenMenuItems] = useState<string[]>([]);
  function setOpenMenuItems(value: string[]) {
    _setOpenMenuItems(value);
  }
  function toggleMenuItem(menuItemId: string) {
    if (openMenuItems.includes(menuItemId)) {
      setOpenMenuItems(openMenuItems.filter((item) => item !== menuItemId));
      if (menuItemId.includes('main-menu-item-') && openMenuId === menuItemId) {
        setOpenMenuId(null);
      }
    } else {
      setOpenMenuItems([...openMenuItems, menuItemId]);
      if (menuItemId.includes('main-menu-item-'))
        setOpenMenuId(menuItemId);
    }
  }

  function resetSidebarMenu() {
    setOpenMenuItems([]);
    setOpenMenuId(null);
  }

  const [showSidebarMenu, _setShowSidebarMenu] = useState(false);
  function setShowSidebarMenu(value: boolean) {
    _setShowSidebarMenu(value);
    setOpenMenuId(null);
    resetSidebarMenu();
  }

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

  const handleClick = (e: any, menuItemId: string) => {
    e.preventDefault();
    toggleMenuItem(menuItemId);
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return ((menuItems && menuItems.length > 0) || (secondaryMenuItems && secondaryMenuItems.length > 0)) && (
    <>
      <button type="button" title="Open menu" className={clsx(
        'mega-menu-sidebar-open-button',
        `mega-menu-sidebar-open-button-${variant}`,
        'block lg:hidden absolute z-20 top-10 left-3'
      )} onClick={() => setShowSidebarMenu(true)}><Menu /></button>
      {showSidebarMenu &&
        <div className="hidden sm:block fixed inset-0 w-full h-full pointer-events-auto z-[9995] bg-black bg-opacity-60 backdrop-blur-sm opacity-100" onClick={() => setShowSidebarMenu(false)}></div>
      }
      <aside className={clsx(
        'mega-menu-sidebar',
        `mega-menu-sidebar-${variant}`,
        'fixed p-8 z-[9999] pointer-events-auto bg-white box-border w-full top-0 left-0 facets sm:max-w-[450px] max-h-full h-screen duration-300 ease-in-out overflow-y-auto',
        showSidebarMenu ? 'shadow-2xl shadow-blue-gray-900/10 translate-x-0' : '-translate-x-full'
      )}>
        <div className={clsx('mega-menu-sidebar-header')}>
          <div className={clsx('mega-menu-sidebar-logo')}></div>
          <button type="button" title="Close menu" className="mega-menu-sidebar-close-button" onClick={() => setShowSidebarMenu(false)}><X /></button>
        </div>
        {menuItems && menuItems.length > 0 && (
          <nav className={clsx('main-menu', classNames?.mainMenu)}>
            <ul>
              {menuItems.map((menuItem: MegaMenuMenuItem, index: number) => (

                (!openMenuId || openMenuId === `main-menu-item-${index}`) &&
                <li className={clsx('main-menu-item', classNames?.mainMenuItem)} key={`main-menu-item-${index}`}>

                  {menuItem.columns && menuItem.columns.length > 0 ? (
                    <>
                      {openMenuId === `main-menu-item-${index}` ? (
                        <span
                          className={clsx('main-menu-back-link')}
                        >
                          <span onClick={() => resetSidebarMenu()}><ChevronLeft /> Main Menu</span>
                          {menuItem.link?.href ? (
                            <Link className={clsx('main-menu-shop-all-link')} href={menuItem.link.href} onClick={() => setShowSidebarMenu(false)}>Shop All</Link>
                          ) : (
                            <></>
                          )}
                        </span>
                      ) : (
                        menuItem.link?.href ? (
                          <Link
                            href={menuItem.link.href}
                            className={clsx('main-menu-link', classNames?.mainMenuLink)}
                            onClick={(e) => handleClick(e, `main-menu-item-${index}`)}
                          >
                            <span>{menuItem.title}</span>
                            <span><ChevronRight /></span>
                          </Link>
                        ) : (
                          <span
                            className={clsx('main-menu-link', classNames?.mainMenuLink)}
                            onClick={(e) => handleClick(e, `main-menu-item-${index}`)}
                          >
                            <span>{menuItem.title}</span>
                            <span><ChevronRight /></span>
                          </span>
                        )
                      )}

                      {openMenuItems.includes(`main-menu-item-${index}`) && (
                        menuItem.columns.map((menuItemColumn: MegaMenuMenuItemColumn, index2: number) => (

                          menuItemColumn.subMenuItems && menuItemColumn.subMenuItems.length > 0 && (menuItemColumn.subMenuItems.length > 1 || (menuItemColumn.subMenuItems[0]?.title && menuItemColumn.subMenuItems[0]?.link && !menuItemColumn.subMenuItems[0]?.imageSrc)) && (
                          <ul className={clsx('sub-menu-column', classNames?.mainSubMenuColumn)} key={`main-sub-menu-column-${index2}`}>
                            {menuItemColumn.subMenuItems.map((menuItem: MegaMenuSubMenuItem, index3: number) => (
                              <li className={clsx('main-sub-menu-item', classNames?.mainSubMenuItem)} key={`main-sub-menu-column-${index2}-sub-menu-item-${index3}`}>
                                {menuItem.subSubMenuItems && menuItem.subSubMenuItems.length > 0 ? (
                                  <>
                                    {menuItem.link?.href ? (
                                      <Link
                                        href={menuItem.link.href}
                                        className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                                        onClick={(e) => handleClick(e, `main-sub-menu-column-${index2}-sub-menu-item-${index3}`)}
                                      >
                                        <span>{menuItem.title}</span>
                                        <span>{openMenuItems.includes(`main-sub-menu-column-${index2}-sub-menu-item-${index3}`) ? <Minus /> : <Plus />}</span>
                                      </Link>
                                    ) : (
                                      <span
                                        className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                                        onClick={(e) => handleClick(e, `main-sub-menu-column-${index2}-sub-menu-item-${index3}`)}
                                      >
                                        <span>{menuItem.title}</span>
                                        <span>{openMenuItems.includes(`main-sub-menu-column-${index2}-sub-menu-item-${index3}`) ? <Minus /> : <Plus />}</span>
                                      </span>
                                    )}
                                    {openMenuItems.includes(`main-sub-menu-column-${index2}-sub-menu-item-${index3}`) && (
                                      <ul>
                                        {menuItem.subSubMenuItems.map((menuItem: MegaMenuSubSubMenuItem, index4: number) => (
                                          <li className={clsx('main-sub-sub-menu-item', classNames?.mainSubSubMenuItem)} key={`main-sub-sub-menu-item-${index4}`}>
                                            {menuItem.link?.href ? (
                                              <Link
                                                href={menuItem.link.href}
                                                className={clsx('main-sub-sub-menu-link', classNames?.mainSubSubMenuLink)}
                                                onClick={() => setShowSidebarMenu(false)}
                                              >
                                                <span>{menuItem.title}</span>
                                              </Link>
                                            ) : (
                                              <span
                                                className={clsx('main-sub-sub-menu-link', classNames?.mainSubSubMenuLink)}
                                              >
                                                <span>{menuItem.title}</span>
                                              </span>
                                            )}
                                          </li>
                                        ))}
                                        <li className={clsx('main-sub-sub-menu-item', classNames?.mainSubSubMenuItem)} key={`main-sub-sub-menu-item-shop-all`}>
                                          {menuItem.link?.href ? (
                                            <Link className={clsx('main-sub-sub-menu-shop-all-link')} href={menuItem.link.href} onClick={() => setShowSidebarMenu(false)}>Shop All</Link>
                                          ) : (
                                            <></>
                                          )}
                                        </li>
                                      </ul>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {menuItem.link?.href ? (
                                      <Link
                                        href={menuItem.link.href}
                                        className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                                        onClick={() => setShowSidebarMenu(false)}
                                      >
                                        <span>{menuItem.title}</span>
                                      </Link>
                                    ) : (
                                      <span
                                        className={clsx('main-sub-menu-link', classNames?.mainSubMenuLink)}
                                      >
                                        <span>{menuItem.title}</span>
                                      </span>
                                    )}
                                  </>
                                )}

                              </li>
                            ))}
                          </ul>
                          )
                        ))
                      )}
                    </>
                  ) : (
                    <>
                    {menuItem.link?.href ? (
                      <Link
                        href={menuItem.link.href}
                        className={clsx('main-menu-link', classNames?.mainMenuLink)}
                        onClick={() => setShowSidebarMenu(false)}
                      >
                        <span>{menuItem.title}</span>
                      </Link>
                    ) : (
                      <span
                        className={clsx('main-menu-link', classNames?.mainMenuLink)}
                      >
                        <span>{menuItem.title}</span>
                      </span>
                    )}
                    </>
                  )}

                </li>

              ))}
            </ul>
          </nav>
        )}
        {!openMenuId && secondaryMenuItems && secondaryMenuItems.length > 0 && (
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
                      onClick={() => setShowSidebarMenu(false)}
                    >
                      <span>{menuItem.title}</span>
                    </Link>
                  ) : (
                    <span className={clsx('secondary-menu-link', classNames?.secondaryMenuLink)}>
                      <span>{menuItem.title}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>

      <div className={clsx('mega-menu', `mega-menu-${variant}`, classNames?.root)}>
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
                      <button type="button" title="Close menu" className={clsx('sub-menu-close-button', classNames?.subMenuCloseButton)} onClick={handleMenuClose}>
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
                                    onClick={handleMenuClose}
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
                                      <Link href={menuItem.link.href} onClick={handleMenuClose}><img src={menuItem.imageSrc} alt={menuItem.title ?? menuItem.button ?? 'Menu item image'} className={clsx('sub-menu-image', classNames?.mainSubMenuImage)} /></Link>
                                    ) : (
                                      <img src={menuItem.imageSrc} alt={menuItem.title} className={clsx('sub-menu-image', classNames?.mainSubMenuImage)} />
                                    )}
                                  </figure>
                                }

                                {menuItem.description && <div className={clsx('sub-menu-description', classNames?.mainSubMenuDescription)}>{menuItem.description}</div>}

                                {menuItem.button && menuItem.link?.href && <Link href={menuItem.link.href} className={clsx('sub-menu-button', classNames?.mainSubMenuButton)} onClick={handleMenuClose}>{menuItem.button}</Link>}

                                {menuItem.subSubMenuItems && menuItem.subSubMenuItems.length > 0 && (
                                  <ul>
                                    {menuItem.subSubMenuItems.map((menuItem: MegaMenuSubSubMenuItem, index4: number) => (
                                      <li className={clsx('main-sub-sub-menu-item', classNames?.mainSubSubMenuItem)} key={`main-sub-sub-menu-item-${index4}`}>
                                        {menuItem.link?.href ? (
                                          <Link
                                            href={menuItem.link.href}
                                            className={clsx('main-sub-sub-menu-link', classNames?.mainSubSubMenuLink)}
                                            onClick={handleMenuClose}
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
    </>
  );
}
