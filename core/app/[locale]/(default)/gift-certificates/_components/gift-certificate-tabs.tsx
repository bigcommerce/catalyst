'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl';
import { Tabs } from '~/components/ui/tabs';
import GiftCertificateBalanceClient from './balance-checker';
import RedeemGiftCertificateDetails from './redeem-details';
import GiftCertificatePurchaseForm from './purchase-form';
import { lookupGiftCertificateBalance } from '../_actions/lookup-balance';

const defaultTab = "Purchase Gift Certificate"

export default function GiftCertificateTabs() {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const t = useTranslations('GiftCertificate.Tabs');

  const tabs = [
    {
      value: t('purchase'),
      content: <GiftCertificatePurchaseForm />
    },
    {
      value: t('check'),
      content: <GiftCertificateBalanceClient checkBalanceAction={lookupGiftCertificateBalance} />
    },
    {
      value: t('redeem'),
      content: <RedeemGiftCertificateDetails />
    }
  ];

  return (
    <div className="mx-auto mb-10 mt-8 lg:w-2/3">
      <Tabs
        defaultValue={defaultTab}
        label={t('label')}
        onValueChange={setActiveTab}
        tabs={tabs}
        value={activeTab}
        className="justify-center"
      /></div>
  )
}
