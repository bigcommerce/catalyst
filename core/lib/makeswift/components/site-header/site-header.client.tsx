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

interface ImageProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  banner: {
    show: boolean;
    centerText: string;
    rightText: {
      text: string;
      link: { href: string };
    };
    links: Array<{
      label: string;
      link: { href: string };
    }>;
    // allowClose: boolean;
    // children?: ReactNode;
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
  logo: {
    desktop: ImageProps;
    mobile: ImageProps;
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
    const { navigation: passedProps } = useContext(PropsContext);

    return (
      <HeaderSection
        banner={banner}
        navigation={{
          ...passedProps,
          links: combineLinks(passedProps.links, links),
          logo: logo.desktop.src
            ? { src: logo.desktop.src, alt: logo.desktop.alt }
            : passedProps.logo,
          logoWidth: logo.desktop.width,
          logoHeight: logo.desktop.height,
          mobileLogo: logo.mobile.src
            ? { src: logo.mobile.src, alt: logo.mobile.alt }
            : passedProps.mobileLogo,
          mobileLogoWidth: logo.mobile.width,
          mobileLogoHeight: logo.mobile.height,
          linksPosition,
          logoHref: logo.link?.href ?? passedProps.logoHref,
        }}
        ref={ref}
      />
    );
  },
);
