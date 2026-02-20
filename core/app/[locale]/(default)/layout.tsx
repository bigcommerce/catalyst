import { setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { Footer } from '~/components/footer';
import { Header } from '~/components/header';
import { ReCaptchaProvider } from '~/components/recaptcha-provider';
import { getReCaptchaSettings } from '~/lib/recaptcha';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

export default async function DefaultLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const reCaptchaSettings = await getReCaptchaSettings();

  return (
    <ReCaptchaProvider settings={reCaptchaSettings}>
      <Header />

      <main>{children}</main>

      <Footer />
    </ReCaptchaProvider>
  );
}
