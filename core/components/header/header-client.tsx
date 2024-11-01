'use client';

import { ComponentPropsWithoutRef, createContext, forwardRef, useContext } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Navigation } from '@/vibes/soul/primitives/navigation';
import { localeLanguageRegionMap } from '~/i18n/routing';
import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftComponent } from '@makeswift/runtime/next';
import { List, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import { fetchSearchResults } from './_actions/fetch-search-results';

type HeaderContext = {
  locale: string;
  links: ComponentPropsWithoutRef<typeof Navigation>['links'];
  logo?: ComponentPropsWithoutRef<typeof Navigation>['logo'];
};

export const HeaderContext = createContext<HeaderContext>({
  locale: 'en',
  links: [],
});

export const HeaderProvider = ({ snapshot, ...props }: any) => {
  return (
    <HeaderContext.Provider value={props}>
      <MakeswiftComponent snapshot={snapshot} name="Header" type={MAKESWIFT_HEADER_TYPE} />
    </HeaderContext.Provider>
  );
};

type Props = {
  className?: string;
  links?: ComponentPropsWithoutRef<typeof Navigation>['links'];
};

const HeaderConsumer = forwardRef((props: Props, ref) => {
  const locale = useLocale();
  const context = useContext(HeaderContext);
  const t = useTranslations('Components.Header');

  const links = [...context.links, ...(props.links ?? [])];

  return (
    <Navigation
      accountHref="/account"
      activeLocale={locale}
      cartHref="/cart"
      links={links}
      locales={localeLanguageRegionMap}
      logo={context.logo}
      searchAction={fetchSearchResults}
      searchCtaLabel={t('viewAll')}
      searchHref="/search"
      ref={ref}
    />
  );
});

export const MAKESWIFT_HEADER_TYPE = 'makeswift-header';

runtime.registerComponent(HeaderConsumer, {
  type: MAKESWIFT_HEADER_TYPE,
  label: 'Catalyst / Tabs',
  props: {
    links: List({
      type: Shape({
        type: {
          label: TextInput({ label: 'Label', defaultValue: 'Link' }),
          href: TextInput({ label: 'Href', defaultValue: 'https://www.bigcommerce.com' }),
        },
      }),
    }),
  },
});
