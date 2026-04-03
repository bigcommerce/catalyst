'use client';

import {
  ConsentManagerDialog as C15TConsentManagerDialog,
  ConsentManagerWidget as C15TConsentManagerWidget,
  ConsentManagerDialogProps,
  ConsentManagerWidgetProps,
  useConsentManager,
} from '@c15t/nextjs';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { Checkbox } from '@/vibes/soul/form/checkbox';
import { Button } from '@/vibes/soul/primitives/button';

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
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TConsentManagerWidget.RejectButton asChild noStyle themeKey="widget.footer.reject-button">
      <Button size="small" variant="tertiary">
        {t('rejectAll')}
      </Button>
    </C15TConsentManagerWidget.RejectButton>
  );
}

function ConsentManagerWidgetAcceptAllButton() {
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TConsentManagerWidget.AcceptAllButton
      asChild
      noStyle
      themeKey="widget.footer.accept-button"
    >
      <Button size="small" variant="primary">
        {t('acceptAll')}
      </Button>
    </C15TConsentManagerWidget.AcceptAllButton>
  );
}

function ConsentManagerWidgetSaveButton() {
  const t = useTranslations('Components.ConsentManager.Common');

  return (
    <C15TConsentManagerWidget.SaveButton asChild noStyle themeKey="widget.footer.save-button">
      <Button size="small" variant="secondary">
        {t('save')}
      </Button>
    </C15TConsentManagerWidget.SaveButton>
  );
}

function ConsentManagerAccordionItems() {
  const { selectedConsents, setSelectedConsent, getDisplayedConsents } = useConsentManager();
  const t = useTranslations('Components.ConsentManager.ConsentTypes');
  const handleConsentChange = useCallback(
    (
      name: 'necessary' | 'functionality' | 'marketing' | 'measurement' | 'experience',
      checked: boolean,
    ) => {
      setSelectedConsent(name, checked);
    },
    [setSelectedConsent],
  );

  return getDisplayedConsents().map((consent) => (
    <C15TConsentManagerWidget.AccordionItem
      key={consent.name}
      themeKey="widget.accordion.item"
      value={consent.name}
    >
      <C15TConsentManagerWidget.AccordionTrigger themeKey="widget.accordion.trigger">
        <C15TConsentManagerWidget.AccordionTriggerInner themeKey="widget.accordion.trigger-inner">
          <C15TConsentManagerWidget.AccordionArrow />
          {t(`${consent.name}.title`)}
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
      <C15TConsentManagerWidget.AccordionContent
        theme={{
          content: { themeKey: 'widget.accordion.content' },
          contentInner: { themeKey: 'widget.accordion.content-inner' },
        }}
      >
        {t(`${consent.name}.description`)}
      </C15TConsentManagerWidget.AccordionContent>
    </C15TConsentManagerWidget.AccordionItem>
  ));
}

function ConsentManagerWidget(props: ConsentManagerWidgetProps) {
  return (
    <C15TConsentManagerWidget.Root {...props}>
      <C15TConsentManagerWidget.Accordion themeKey="widget.accordion" type="multiple">
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
