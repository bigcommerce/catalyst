'use client';

import { useTranslations } from 'next-intl';

export default function RedeemGiftCertificateDetails() {
  const t = useTranslations('GiftCertificate.Redeem');

  return (
    <div className="mx-auto mb-10 mt-8 text-base lg:w-2/3">
      <h2 className="mb-4 text-2xl font-bold">Redeem Gift Certificate</h2>
      <p className="mb-4 text-lg text-gray-600">{t('instructionIntro')}</p>
      <ul className="list-disc space-y-3 pl-5 text-gray-700">
        {t('instructionOne') ? <li>{t('instructionOne')}</li> : ''}
        {t('instructionTwo') ? <li>{t('instructionTwo')}</li> : ''}
        {t('instructionThree') ? <li>{t('instructionThree')}</li> : ''}
        {t('instructionFour') ? <li>{t('instructionFour')}</li> : ''}
      </ul>
    </div>
  );
}
