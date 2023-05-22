import * as Accordion from '@radix-ui/react-accordion';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import * as Portal from '@radix-ui/react-portal';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import React, {
  CSSProperties,
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { BurgerMenu, Cart, ChevronDown, Compare, Gift, Heart, Profile, Search } from '../../icons';

interface SubnavLink {
  linkText?: string;
  link?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
}

interface SubnavGroup {
  heading: string;
  subnavLinks: SubnavLink[];
}

interface MainNavLink {
  text?: string;
  link?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
  subnavGroups: SubnavGroup[];
}

interface Props {
  className?: string;
  stickyNav?: boolean;
  linkTextStyle?: string;
  navWidth: number;
  navBackground?: string;
  logoImage?: { url: string; dimensions: { width: number; height: number } };
  logoWidth: number;
  logoAlt: string;
  logoLink?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
  mainNavLinks?: MainNavLink[];
  linkColor?: string;
  hoverColor?: string;
  linkGap?: number;
  ctaLink?: {
    target?: '_self' | '_blank';
    href: string;
    onClick(event: MouseEvent): void;
  };
  ctaText?: string;
  ctaColor?: string;
  ctaTextColor?: string;
  buttonCorners?: string;
}

export function Navigation({
  className,
  stickyNav,
  linkTextStyle,
  navWidth,
  navBackground,
  logoImage,
  logoAlt,
  logoWidth,
  logoLink,
  mainNavLinks,
  linkColor,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navElement = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!navElement.current) {
      return;
    }

    setHeight(navElement.current.clientHeight);

    const observer = new ResizeObserver(([element]) =>
      setHeight(element?.target.clientHeight ?? 0),
    );

    observer.observe(navElement.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', mobileNavOpen);
  }, [mobileNavOpen]);

  return (
    <>
      <header
        className={clsx(
          className,
          linkTextStyle,
          'z-[110]',
          stickyNav && 'fixed inset-x-0 top-0',
          mobileNavOpen && 'min-h-0',
        )}
        ref={navElement}
        style={{
          backgroundColor: navBackground,
        }}
      >
        <div className="relative z-10 w-full px-6 py-4 md:px-8 lg:justify-end lg:px-12">
          <div
            className="mx-auto flex w-full items-center justify-between gap-x-8"
            style={{
              maxWidth: `${navWidth}px`,
            }}
          >
            {logoImage && (
              <a {...logoLink}>
                <Image
                  alt={logoAlt}
                  height={logoWidth / (logoImage.dimensions.width / logoImage.dimensions.height)}
                  priority
                  src={logoImage.url}
                  width={logoWidth}
                />
              </a>
            )}

            <NavigationMenu.Root className="hidden flex-1 justify-center lg:flex" delayDuration={0}>
              <NavigationMenu.List className="flex items-center gap-x-0 md:gap-x-4">
                {mainNavLinks?.map((mainNavLink, mainNavLinkIndex) => (
                  <NavigationMenu.Item
                    className="relative"
                    key={mainNavLinkIndex}
                    style={{ color: linkColor }}
                  >
                    {mainNavLink.subnavGroups.length > 0 ? (
                      <NavigationMenu.Trigger asChild>
                        <span className="group flex cursor-pointer select-none items-center px-3 py-2.5 outline-none [text-transform:inherit]">
                          {mainNavLink.text}
                          <ChevronDown className="linear ml-1 fill-current transition-transform duration-300 group-data-[state=open]:-rotate-180" />
                        </span>
                      </NavigationMenu.Trigger>
                    ) : (
                      <NavigationMenu.Link asChild>
                        <a
                          {...mainNavLink.link}
                          className="select-none px-3 py-2.5 outline-none transition-opacity hover:opacity-50"
                        >
                          {mainNavLink.text}
                        </a>
                      </NavigationMenu.Link>
                    )}

                    {mainNavLink.subnavGroups.length > 0 && (
                      <NavigationMenu.Content asChild>
                        <div className="flex items-start justify-center gap-x-8 px-8 pb-12 pt-6 lg:px-12">
                          {mainNavLink.subnavGroups.map((subnavGroup, subnavGroupIndex) => (
                            <ul className="w-44 space-y-2 leading-8" key={subnavGroupIndex}>
                              <li className="font-semibold">{subnavGroup.heading}</li>
                              {subnavGroup.subnavLinks.map((subnavLink, i) => (
                                <li key={i}>
                                  <NavigationMenu.Link asChild>
                                    <a
                                      className="block cursor-pointer font-normal outline-none transition-opacity hover:opacity-50"
                                      {...subnavLink.link}
                                    >
                                      {subnavLink.linkText}
                                    </a>
                                  </NavigationMenu.Link>
                                </li>
                              ))}
                            </ul>
                          ))}
                        </div>
                      </NavigationMenu.Content>
                    )}
                  </NavigationMenu.Item>
                ))}
              </NavigationMenu.List>

              <div className="absolute inset-x-0 top-full w-full">
                <NavigationMenu.Viewport className="h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top overflow-hidden bg-white shadow-[0px_20px_20px_rgba(20,28,31,0.12)] transition-[width,_height] duration-200 sm:w-[var(--radix-navigation-menu-viewport-width)]" />
              </div>
            </NavigationMenu.Root>

            <div className="flex gap-2 [&>a:hover]:opacity-50 [&>a]:p-3 [&>a]:transition-opacity [&_svg]:fill-current">
              <Link className="hidden sm:block" href="#">
                <Search />
              </Link>
              <Link className="hidden md:block" href="#">
                <Compare />
              </Link>
              <Link className="hidden md:block" href="#">
                <Gift />
              </Link>
              <Link className="hidden md:block" href="#">
                <Heart />
              </Link>
              <Link className="hidden md:block" href="#">
                <Profile />
              </Link>
              <Link href="#">
                <Cart />
              </Link>

              <button
                className="block p-3 md:hidden"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
              >
                <BurgerMenu className="fill-current" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <Portal.Root asChild>
          <nav
            className={clsx(
              'animate-revealVertical fixed inset-x-0 bottom-0 top-[var(--top)] z-[100] flex flex-1 -translate-y-full flex-col overflow-auto md:px-8 lg:px-10',
              linkTextStyle,
            )}
            style={
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              {
                backgroundColor: navBackground,
                '--top': `${height}px`,
              } as CSSProperties
            }
          >
            <Accordion.Root className="flex-1" type="multiple">
              {mainNavLinks?.map((mainNavLink, footerMainNavLinkIndex) => (
                <Accordion.Item
                  className="border-black/15 border-b px-4 py-4"
                  key={footerMainNavLinkIndex}
                  style={{ color: linkColor }}
                  value={`item${footerMainNavLinkIndex}`}
                >
                  {mainNavLink.subnavGroups.length > 0 ? (
                    <>
                      <Accordion.Trigger asChild>
                        <span className="group flex w-full items-center justify-between text-[1rem] outline-none">
                          {mainNavLink.text}
                          <svg
                            className="linear duration-250 ml-2 h-2 w-3 stroke-current transition-transform group-data-[state=open]:-rotate-180"
                            fill="none"
                            viewBox="0 0 12 8"
                          >
                            <path
                              d="M0 0L6 6L12 0"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        </span>
                      </Accordion.Trigger>
                      <Accordion.AccordionContent asChild>
                        {mainNavLink.subnavGroups.map((subnavGroup, i) => (
                          <ul className="space-y-3" key={i}>
                            {subnavGroup.heading.length > 0 ? (
                              <li className="text-gray-600">{subnavGroup.heading}</li>
                            ) : null}

                            {subnavGroup.subnavLinks.map((subnavLink, footerSubnavLinkIndex) => (
                              <li key={footerSubnavLinkIndex}>
                                <a
                                  {...subnavLink.link}
                                  className="text leading-[27px] text-gray-600"
                                >
                                  {subnavLink.linkText}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ))}
                      </Accordion.AccordionContent>
                    </>
                  ) : (
                    <a
                      {...mainNavLink.link}
                      className="block text-[1rem] outline-none"
                      style={{ color: linkColor }}
                    >
                      {mainNavLink.text}
                    </a>
                  )}
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </nav>
        </Portal.Root>
      )}
    </>
  );
}
