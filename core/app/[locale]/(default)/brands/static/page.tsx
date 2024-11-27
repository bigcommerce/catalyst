import { locales } from '~/i18n/routing';

import BrandsPage from '../page';

export default BrandsPage;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
export const revalidate = 600;
