import { defaultLocale } from '~/i18n/locales';
import { redirect } from '~/i18n/routing';

export default function Page() {
  redirect({ href: '/not-found', locale: defaultLocale });
}
