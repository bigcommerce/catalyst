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
      showBanner,
      banner,
      links,
      logo,
      searchInputPlaceholder,
      searchCtaLabel,
      emptySearchTitle,
      emptySearchSubtitle,
    }: {
      showBanner: boolean;
      links: Array<{
        label: string;
        link: { href: string };
      }>;
      logo?: string;
      searchInputPlaceholder?: string;
      searchCtaLabel?: string;
      emptySearchTitle?: string;
      emptySearchSubtitle?: string;
      banner?: ReactNode;
    },
    ref: Ref<HTMLDivElement>,
  ) => {
    const { navigation: passedProps, banner: passedBanner } = useContext(PropsContext);
    const bannerElement = banner ? { children: banner } : passedBanner;

    return (
      <HeaderSection
        banner={showBanner ? bannerElement : undefined}
        navigation={{
          ...passedProps,
          links: [
            ...passedProps.links,
            ...links.map(({ label, link }) => ({ label, href: link.href })),
          ],
          logo: logo ? { src: logo, alt: 'Logo' } : passedProps.logo,
          searchInputPlaceholder: searchInputPlaceholder ?? passedProps.searchInputPlaceholder,
          searchCtaLabel: searchCtaLabel ?? passedProps.searchCtaLabel,
          emptySearchTitle: emptySearchTitle ?? passedProps.emptySearchTitle,
          emptySearchSubtitle: emptySearchSubtitle ?? passedProps.emptySearchSubtitle,
        }}
        ref={ref}
      />
    );
  },
);
