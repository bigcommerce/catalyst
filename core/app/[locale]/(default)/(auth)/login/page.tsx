import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { SignInSection } from '@/vibes/soul/sections/sign-in-section';
import { ForceRefresh } from '~/components/force-refresh';
import { Slot } from '~/lib/makeswift/slot';

import { login } from './_actions/login';

interface Props {
  searchParams: Promise<{ redirectTo?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const t = await getTranslations('Login');
  const { redirectTo } = await searchParams;

  // The header's Sign In link appends ?redirectTo=<current path> on every
  // page site-wide, so Google was crawling and indexing a distinct
  // /login?redirectTo=... URL per page on the whole catalog — all rendering
  // identical content, flagged in GSC as "Duplicate without user-selected
  // canonical." Canonical + nofollow on the link discourage/consolidate
  // this; noindex here is the hard guarantee that no ?redirectTo= variant
  // is ever indexable, regardless of how Google discovers it. The bare
  // /login (no redirectTo) stays indexable and canonical, as intended.
  const canonicalUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
    : 'https://gitool.com/login';

  return {
    title: t('title'),
    alternates: { canonical: canonicalUrl },
    ...(redirectTo && { robots: { index: false, follow: true } }),
  };
}

export default async function Login() {
  const t = await getTranslations('Login');

  return (
    <>
      <ForceRefresh />
      <SignInSection
        // @ts-ignore
        action={login}
        forgotPasswordHref="/login/forgot-password"
        forgotPasswordLabel={t('Form.forgotPassword')}
        submitLabel={t('Form.logIn')}
        title={t('heading')}
      >
        <Slot
          fallback={
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
          }
          label="Login sidebar content"
          snapshotId="login-sidebar-content"
        />
      </SignInSection>
    </>
  );
}
