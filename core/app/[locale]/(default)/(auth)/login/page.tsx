import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

<<<<<<< HEAD
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
=======
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { locales } from '~/i18n/routing';
>>>>>>> 1d4aa1e5 (feat: add soul SignInSection)

import { login } from './_actions/login';

export async function generateMetadata({ params }: Props) {
  const { locale } = params;
  const t = await getTranslations('Login');

  setRequestLocale(locale);

  return {
    title: t('title'),
  };
}

interface Props {
  params: { locale: (typeof locales)[number] };
}

export default function Login({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const t = useTranslations('Login');

  return (
    <SignInSection
      action={login}
      forgotPasswordHref="/login/forgot-password"
      forgotPasswordLabel={t('Form.forgotPassword')}
      submitLabel={t('Form.logIn')}
      title={t('heading')}
    >
      <div className="">
        <h3 className="mb-3 text-xl font-bold lg:text-2xl">{t('CreateAccount.heading')}</h3>
        <p className="text-base font-semibold">{t('CreateAccount.accountBenefits')}</p>
        <ul className="mb-4 list-disc ps-4">
          <li>{t('CreateAccount.fastCheckout')}</li>
          <li>{t('CreateAccount.multipleAddresses')}</li>
          <li>{t('CreateAccount.ordersHistory')}</li>
          <li>{t('CreateAccount.ordersTracking')}</li>
          <li>{t('CreateAccount.wishlists')}</li>
        </ul>
        <ButtonLink href="/register" variant="secondary">
          {t('CreateAccount.createLink')}
        </ButtonLink>
      </div>
    </SignInSection>
  );
}
