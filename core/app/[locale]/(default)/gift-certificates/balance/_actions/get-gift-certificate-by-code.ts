'use server';

import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getFormatter, getTranslations } from 'next-intl/server';

import { GiftCertificateData } from '@/vibes/soul/sections/gift-certificate-balance-section';
import { giftCertificateCodeSchema } from '@/vibes/soul/sections/gift-certificate-balance-section/schema';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';

import { GiftCertificateFragment } from '../fragment';

interface State {
  lastResult: SubmissionResult | null;
  data: GiftCertificateData | null;
  errorMessage?: string;
}

const GetGiftCertificateByCodeQuery = graphql(
  `
    query GetGiftCertificateByCode($code: String!) {
      site {
        giftCertificate(code: $code) {
          ...GiftCertificateFragment
        }
      }
    }
  `,
  [GiftCertificateFragment],
);

function transformGiftCertificate(
  giftCertificate: ResultOf<typeof GiftCertificateFragment>,
  format: ExistingResultType<typeof getFormatter>,
): GiftCertificateData | null {
  if (!giftCertificate.amount.formattedV2 || !giftCertificate.balance.formattedV2) {
    return null;
  }

  return {
    code: giftCertificate.code,
    currencyCode: giftCertificate.currencyCode,
    status: giftCertificate.status,
    amount: giftCertificate.amount.formattedV2,
    balance: giftCertificate.balance.formattedV2,
    senderName: giftCertificate.sender.name,
    recipientName: giftCertificate.recipient.name,
    purchasedAt: format.dateTime(new Date(giftCertificate.purchasedAt.utc), { dateStyle: 'long' }),
    expiresAt: giftCertificate.expiresAt?.utc
      ? format.dateTime(new Date(giftCertificate.expiresAt.utc), { dateStyle: 'long' })
      : null,
  };
}

export async function getGiftCertificateByCode(
  prevState: Awaited<State>,
  formData: FormData,
): Promise<State> {
  const t = await getTranslations('GiftCertificates.CheckBalance');
  const format = await getFormatter();
  const schema = giftCertificateCodeSchema({ required_error: t('Errors.codeRequired') });
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return {
      ...prevState,
      lastResult: submission.reply(),
    };
  }

  try {
    const { code } = schema.parse(submission.value);
    const response = await client.fetch({
      document: GetGiftCertificateByCodeQuery,
      fetchOptions: { cache: 'no-store' },
      variables: { code },
    });

    if (!response.data.site.giftCertificate) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.invalidCode')] }),
        errorMessage: t('Errors.invalidCode'),
      };
    }

    const giftCertificate = transformGiftCertificate(response.data.site.giftCertificate, format);

    if (!giftCertificate) {
      return {
        ...prevState,
        lastResult: submission.reply({ formErrors: [t('Errors.somethingWentWrong')] }),
        errorMessage: t('Errors.somethingWentWrong'),
      };
    }

    return {
      lastResult: submission.reply(),
      data: giftCertificate,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      ...prevState,
      lastResult: submission.reply({ formErrors: [t('Errors.somethingWentWrong')] }),
      errorMessage: t('Errors.somethingWentWrong'),
    };
  }
}
