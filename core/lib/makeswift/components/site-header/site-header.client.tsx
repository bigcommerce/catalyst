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

import { HeaderSection } from '@/vibes/soul/sections/header-section';

type HeaderSectionProps = ComponentPropsWithoutRef<typeof HeaderSection>;

type NavigationProps = HeaderSectionProps['navigation'];

// MakeswiftHeader does not support streamable links
type ContextProps = Omit<HeaderSectionProps, 'navigation'> & {
  navigation: Omit<NavigationProps, 'links'> & {
    links: Awaited<NavigationProps['links']>;
  };
};

const PropsContext = createContext<ContextProps>({
  navigation: {
    accountHref: '',
    cartHref: '',
    searchHref: '',
    links: [],
  },
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface Props {
  banner?: {
    id: string;
    show: boolean;
    allowClose: boolean;
    children?: ReactNode;
  };
  links: Array<{
    label: string;
    link: { href: string };
    groups: Array<{
      label: string;
      link: { href: string };
      links: Array<{
        label: string;
        link: { href: string };
      }>;
    }>;
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
}

function combineLinks(
  passedLinks: Awaited<NavigationProps['links']>,
  links: Props['links'],
): ContextProps['navigation']['links'] {
  return [
    ...passedLinks,
    ...links.map(({ label, link, groups }) => ({
      label,
      href: link.href,
      groups: groups.map((group) => ({
        label: group.label,
        href: group.link.href,
        links: group.links.map((item) => ({ label: item.label, href: item.link.href })),
      })),
    })),
  ];
}

export const MakeswiftHeader = forwardRef(
  ({ banner, links, logo, linksPosition }: Props, ref: Ref<HTMLDivElement>) => {
    const { navigation: passedProps, banner: passedBanner } = useContext(PropsContext);
    const combinedBanner = banner?.show
      ? {
          ...passedBanner,
          id: banner.id,
          hideDismiss: !banner.allowClose,
          children: banner.children ?? passedBanner?.children,
        }
      : undefined;

    return (
      <HeaderSection
        banner={combinedBanner}
        navigation={{
          ...passedProps,
          links: combineLinks(passedProps.links, links),
          logo: logo?.desktopSrc
            ? { src: logo.desktopSrc, alt: logo.desktopAlt }
            : passedProps.logo,
          logoWidth: logo?.desktopWidth,
          mobileLogo: logo?.mobileSrc
            ? { src: logo.mobileSrc, alt: logo.mobileAlt }
            : passedProps.mobileLogo,
          mobileLogoWidth: logo?.mobileWidth,
          linksPosition,
          logoHref: logo?.link?.href ?? passedProps.logoHref,
        }}
        ref={ref}
      />
    );
  },
);
