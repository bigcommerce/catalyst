'use client'

import { useTranslations } from 'next-intl';

export default function RedeemGiftCertificateDetails() {
  const t = useTranslations('GiftCertificate.Redeem');

  return (
    <div className="text-base mx-auto mb-10 mt-8 lg:w-2/3">
      <h2 className="text-2xl font-bold mb-4">Redeem Gift Certificate</h2>
      <p className="text-lg mb-4 text-gray-600">{t('instructionIntro')}</p>
      <ul className="space-y-3 list-disc pl-5 text-gray-700">
        {t('instructionOne') ? <li>{t('instructionOne')}</li> : ''}
        {t('instructionTwo') ? <li>{t('instructionTwo')}</li> : ''}
        {t('instructionThree') ? <li>{t('instructionThree')}</li> : ''}
        {t('instructionFour') ? <li>{t('instructionFour')}</li> : ''}
      </ul>
    </div>
  )
}
