'use client';

import {
  ConsentManagerDialog as C15TConsentManagerDialog,
  ConsentManagerWidget as C15TConsentManagerWidget,
  CookieBanner as C15TCookieBanner,
  ConsentManagerDialogProps,
  ConsentManagerWidgetProps,
  CookieBannerProps,
  useConsentManager,
} from '@c15t/nextjs';
import { useTranslations } from 'next-intl';
import { PropsWithChildren, useCallback } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
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
  const t = useTranslations('Components.ConsentManager.CookieBanner');

  return (
    <C15TCookieBanner.RejectButton asChild noStyle themeKey="banner.footer.reject-button">
      <Button size="small" variant="tertiary">
        {t('declineAll')}
      </Button>
    </C15TCookieBanner.RejectButton>
  );
}

function CookieBannerAcceptButton() {
  const t = useTranslations('Components.ConsentManager.CookieBanner');

  return (
    <C15TCookieBanner.AcceptButton asChild noStyle themeKey="banner.footer.accept-button">
      <Button size="small" variant="primary">
        {t('acceptAll')}
      </Button>
    </C15TCookieBanner.AcceptButton>
  );
}

function CookieBannerCustomizeButton() {
  const t = useTranslations('Components.ConsentManager.CookieBanner');

  return (
    <C15TCookieBanner.CustomizeButton asChild noStyle themeKey="banner.footer.customize-button">
      <Button size="small" variant="secondary">
        {t('customize')}
      </Button>
    </C15TCookieBanner.CustomizeButton>
  );
}

export function CookieBanner(props: CookieBannerProps) {
  return (
    <C15TCookieBanner.Root {...props} asChild>
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

function ConsentManagerDialogHeaderTitle() {
  const t = useTranslations('Components.ConsentManager.Dialog');

  return (
    <C15TConsentManagerDialog.HeaderTitle asChild>
      <div className="font-heading !text-2xl !tracking-normal">{t('title')}</div>
    </C15TConsentManagerDialog.HeaderTitle>
  );
}

function ConsentManagerDialogHeaderDescription() {
  const t = useTranslations('Components.ConsentManager.Dialog');

  return (
    <C15TConsentManagerDialog.HeaderDescription asChild>
      <div className="font-body">{t('description')}</div>
    </C15TConsentManagerDialog.HeaderDescription>
  );
}

export function ConsentManagerDialog(props: ConsentManagerDialogProps) {
  return (
    <C15TConsentManagerDialog.Root {...props}>
      <C15TConsentManagerDialog.Card>
        <C15TConsentManagerDialog.Header>
          <ConsentManagerDialogHeaderTitle />
          <ConsentManagerDialogHeaderDescription />
        </C15TConsentManagerDialog.Header>
        <C15TConsentManagerDialog.Content>
          <ConsentManagerWidget />
        </C15TConsentManagerDialog.Content>
      </C15TConsentManagerDialog.Card>
    </C15TConsentManagerDialog.Root>
  );
}

function ConsentManagerWidgetRejectButton() {
  const t = useTranslations('Components.ConsentManager.Widget');

  return (
    <C15TConsentManagerWidget.RejectButton asChild noStyle>
      <Button size="small" variant="tertiary">
        {t('rejectAll')}
      </Button>
    </C15TConsentManagerWidget.RejectButton>
  );
}

function ConsentManagerWidgetAcceptAllButton() {
  const t = useTranslations('Components.ConsentManager.Widget');

  return (
    <C15TConsentManagerWidget.AcceptAllButton asChild noStyle>
      <Button size="small" variant="primary">
        {t('acceptAll')}
      </Button>
    </C15TConsentManagerWidget.AcceptAllButton>
  );
}

function ConsentManagerWidgetSaveButton() {
  const t = useTranslations('Components.ConsentManager.Widget');

  return (
    <C15TConsentManagerWidget.SaveButton asChild noStyle>
      <Button size="small" variant="secondary">
        {t('save')}
      </Button>
    </C15TConsentManagerWidget.SaveButton>
  );
}

type AllConsentNames = 'experience' | 'functionality' | 'marketing' | 'measurement' | 'necessary';

interface ConsentType {
  defaultValue: boolean;
  description: string;
  disabled?: boolean;
  display: boolean;
  gdprType: number;
  name: AllConsentNames;
}

function ConsentManagerAccordionItems() {
  const { selectedConsents, setSelectedConsent, getDisplayedConsents } = useConsentManager();

  const handleConsentChange = useCallback(
    (name: AllConsentNames, checked: boolean) => {
      setSelectedConsent(name, checked);
    },
    [setSelectedConsent],
  );

  return getDisplayedConsents().map((consent: ConsentType) => (
    <C15TConsentManagerWidget.AccordionItem
      key={consent.name}
      themeKey="widget.accordion.item"
      value={consent.name}
    >
      <C15TConsentManagerWidget.AccordionTrigger themeKey="widget.accordion.trigger">
        <C15TConsentManagerWidget.AccordionTriggerInner themeKey="widget.accordion.trigger.inner">
          <C15TConsentManagerWidget.AccordionArrow />
          {consent.name}
        </C15TConsentManagerWidget.AccordionTriggerInner>

        <Checkbox
          checked={selectedConsents[consent.name]}
          disabled={consent.disabled}
          onCheckedChange={(checked: boolean) => handleConsentChange(consent.name, checked)}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => e.stopPropagation()}
          onKeyUp={(e: React.KeyboardEvent<HTMLButtonElement>) => e.stopPropagation()}
        />
      </C15TConsentManagerWidget.AccordionTrigger>
      <C15TConsentManagerWidget.AccordionContent>
        {consent.description}
      </C15TConsentManagerWidget.AccordionContent>
    </C15TConsentManagerWidget.AccordionItem>
  ));
}

function ConsentManagerWidget(props: ConsentManagerWidgetProps) {
  return (
    <C15TConsentManagerWidget.Root {...props}>
      <C15TConsentManagerWidget.Accordion>
        <ConsentManagerAccordionItems />
      </C15TConsentManagerWidget.Accordion>
      <C15TConsentManagerWidget.Footer>
        <C15TConsentManagerWidget.FooterSubGroup themeKey="widget.footer.sub-group">
          <ConsentManagerWidgetRejectButton />
          <ConsentManagerWidgetAcceptAllButton />
        </C15TConsentManagerWidget.FooterSubGroup>
        <ConsentManagerWidgetSaveButton />
      </C15TConsentManagerWidget.Footer>
    </C15TConsentManagerWidget.Root>
  );
}
