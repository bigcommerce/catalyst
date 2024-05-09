import { locales } from '~/i18n';

import HomePage from '../page';

export default HomePage;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';
export const revalidate = 600;
