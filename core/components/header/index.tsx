import { ShoppingCart, User } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import { getSessionCustomerId } from '~/auth';
import { FragmentOf } from '~/client/graphql';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { Link } from '../link';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/dropdown';
import { Header as ComponentsHeader } from '../ui/header';

import { logout } from './_actions/logout';
import { CartLink } from './cart';
import { HeaderFragment } from './fragment';
import { QuickSearch } from './quick-search';

interface Props {
  cart: ReactNode;
  data: FragmentOf<typeof HeaderFragment>;
}

export const Header = async ({ cart, data }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');

  const customerId = await getSessionCustomerId();

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  const links = categoryTree.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));

  return (
    <ComponentsHeader
      account={
        customerId ? (
          <Dropdown
            items={[
              { href: '/account', label: t('Account.myAccount') },
              { href: '/account/addresses', label: t('Account.addresses') },
              { href: '/account/settings', label: t('Account.accountSettings') },
              { action: logout, name: t('Account.logout') },
            ]}
            trigger={
              <Button
                aria-label={t('Account.account')}
                className="p-3 text-black hover:bg-transparent hover:text-primary"
                variant="subtle"
              >
                <User>
                  <title>{t('Account.account')}</title>
                </User>
              </Button>
            }
          />
        ) : (
          <Link aria-label={t('Account.login')} className="block p-3" href="/login">
            <User />
          </Link>
        )
      }
      activeLocale={locale}
      cart={
        <p role="status">
          <Suspense
            fallback={
              <CartLink>
                <ShoppingCart aria-label="cart" />
              </CartLink>
            }
          >
            {cart}
          </Suspense>
        </p>
      }
      links={links}
      locales={localeLanguageRegionMap}
      logo={data.settings ? logoTransformer(data.settings) : undefined}
      search={<QuickSearch logo={data.settings ? logoTransformer(data.settings) : ''} />}
    />
  );
};
