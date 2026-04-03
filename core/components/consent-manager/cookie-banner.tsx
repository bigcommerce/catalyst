'use client';

import { CookieBanner as C15TCookieBanner, CookieBannerProps } from '@c15t/nextjs';
import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';

import { Button } from '@/vibes/soul/primitives/button';

function CookieBannerTitle() {
  const t = useTranslations('Components.ConsentManager.CookieBanner');

  return (
    <C15TCookieBanner.Title asChild>
      <div className="font-heading !text-xl">{t('title')}</div>
    </C15TCookieBanner.Title>
  );
}

function CookieBannerDescription() {
  const t = useTranslations('Components.ConsentManager.CookieBanner');

  return (
    <C15TCookieBanner.Description asChild>
      <div className="font-body">{t('description')}</div>
    </C15TCookieBanner.Description>
  );
}

function CookieBannerFooter({ children }: PropsWithChildren) {
  return (
    <C15TCookieBanner.Footer asChild>
      <div className="!border-none !bg-transparent !pt-0">{children}</div>
    </C15TCookieBanner.Footer>
  );
}

function CookieBannerRejectButton() {
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TCookieBanner.RejectButton asChild noStyle themeKey="banner.footer.reject-button">
      <Button size="small" variant="tertiary">
        {t('rejectAll')}
      </Button>
    </C15TCookieBanner.RejectButton>
  );
}

function CookieBannerAcceptButton() {
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TCookieBanner.AcceptButton asChild noStyle themeKey="banner.footer.accept-button">
      <Button size="small" variant="primary">
        {t('acceptAll')}
      </Button>
    </C15TCookieBanner.AcceptButton>
  );
}

function CookieBannerCustomizeButton() {
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TCookieBanner.CustomizeButton asChild noStyle themeKey="banner.footer.customize-button">
      <Button size="small" variant="secondary">
        {t('customize')}
      </Button>
    </C15TCookieBanner.CustomizeButton>
  );
}

export function CookieBanner({
  theme,
  noStyle,
  disableAnimation,
  scrollLock,
  trapFocus,
}: CookieBannerProps) {
  return (
    <C15TCookieBanner.Root
      disableAnimation={disableAnimation}
      noStyle={noStyle}
      scrollLock={scrollLock}
      theme={theme}
      trapFocus={trapFocus}
    >
      <C15TCookieBanner.Card className="!max-w-lg">
        <C15TCookieBanner.Header>
          <CookieBannerTitle />
          <CookieBannerDescription />
        </C15TCookieBanner.Header>
        <CookieBannerFooter>
          <C15TCookieBanner.FooterSubGroup>
            <CookieBannerRejectButton />
            <CookieBannerAcceptButton />
          </C15TCookieBanner.FooterSubGroup>
          <CookieBannerCustomizeButton />
        </CookieBannerFooter>
      </C15TCookieBanner.Card>
    </C15TCookieBanner.Root>
  );
}
