'use client';

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type PropsWithChildren,
  type ReactNode,
  type Ref,
  useContext,
} from 'react';

import { useStreamable } from '@/vibes/soul/lib/streamable';
import { HeaderSection } from '@/vibes/soul/sections/header-section';

import { COMPONENT_TYPE } from './site-header.makeswift';

type Props = ComponentPropsWithoutRef<typeof HeaderSection>;

const PropsContext = createContext<Props>({
  navigation: {
    accountHref: '',
    cartHref: '',
    searchHref: '',
    links: [],
  },
});

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

export const MakeswiftHeader = forwardRef(
  (
    {
      banner,
      links,
      logo,
      linksPosition,
    }: {
      banner?: {
        show: boolean;
        allowClose: boolean;
        children?: ReactNode;
      };
      links: Array<{
        text: string;
        link: { href: string };
        subLinks: Array<{ text: string; link: { href: string } }>;
      }>;
      logo?: {
        desktopSrc?: string;
        desktopAlt: string;
        desktopWidth?: number;
        mobileSrc?: string;
        mobileAlt: string;
        mobileWidth?: number;
        link?: { href: string };
      };
      linksPosition: 'center' | 'left' | 'right';
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { navigation: passedProps, banner: passedBanner } = useContext(PropsContext);
    const bannerElement = banner?.children ? { children: banner.children } : passedBanner;
    const passedLinks = useStreamable(passedProps.links);

    return (
      <HeaderSection
        banner={
          banner?.show
            ? {
                id: COMPONENT_TYPE, // Update this when we allow users to add multiple MakeswiftHeader
                hideDismiss: !banner.allowClose,
                children: bannerElement?.children,
              }
            : undefined
        }
        navigation={{
          ...passedProps,
          links: [
            ...passedLinks,
            ...links.map(({ text, link, subLinks }) => ({
              label: text,
              href: link.href,
              group: subLinks.map((subLink) => ({ label: subLink.text, href: subLink.link.href })),
            })),
          ],
          logo: logo?.desktopSrc
            ? { src: logo.desktopSrc, alt: logo.desktopAlt }
            : passedProps.logo,
          logoWidth: logo?.desktopWidth,
          mobileLogo: logo?.mobileSrc
            ? { src: logo.mobileSrc, alt: logo.mobileAlt }
            : passedProps.mobileLogo,
          mobileLogoWidth: logo?.mobileWidth,
          linksPosition,
        }}
        ref={ref}
      />
    );
  },
);
