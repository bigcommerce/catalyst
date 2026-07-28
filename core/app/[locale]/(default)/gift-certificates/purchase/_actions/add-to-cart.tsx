'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getFormatter, getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import { z } from 'zod';

import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';
import { ExistingResultType } from '~/client/util';
import { Link } from '~/components/link';
import { addToOrCreateCart } from '~/lib/cart';
import { MissingCartError } from '~/lib/cart/error';
import { getPreferredCurrencyCode } from '~/lib/currency';

import { GiftCertificateSettingsFragment } from '../fragment';

interface State {
  fields: Array<Field | FieldGroup<Field>>;
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

const GiftCertificateSettingsQuery = graphql(
  `
    query GiftCertificateSettings($currencyCode: currencyCode) {
      site {
        settings {
          giftCertificates(currencyCode: $currencyCode) {
            ...GiftCertificateSettingsFragment
          }
        }
      }
    }
  `,
  [GiftCertificateSettingsFragment],
);

const schema = (
  giftCertificateSettings: ResultOf<typeof GiftCertificateSettingsFragment> | undefined,
  t: ExistingResultType<typeof getTranslations>,
) => {
  return z
    .object({
      senderName: z.string(),
      senderEmail: z.string().email(),
      recipientName: z.string(),
      recipientEmail: z.string().email(),
      message: z.string().optional(),
      amount: z.number({
        required_error: t('Form.Errors.amountRequired'),
        invalid_type_error: t('Form.Errors.amountInvalid'),
      }),
    })
    .superRefine((data, ctx) => {
      if (!giftCertificateSettings) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('Form.Errors.unexpectedSettingsError'),
        });

        return;
      }

      if (
        'minimumAmount' in giftCertificateSettings &&
        'maximumAmount' in giftCertificateSettings
      ) {
        const min = giftCertificateSettings.minimumAmount.value;
        const max = giftCertificateSettings.maximumAmount.value;

        if (data.amount < min || data.amount > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: t('Form.Errors.amountOutOfRange', {
              minAmount: String(min),
              maxAmount: String(max),
            }),
          });

          return;
        }
      }

      if ('amounts' in giftCertificateSettings) {
        const validAmounts = giftCertificateSettings.amounts.map((amt) => amt.value);

        if (!validAmounts.includes(data.amount)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['amount'],
            message: t('Form.Errors.amountInvalid'),
          });
        }
      }
    });
};

export async function addGiftCertificateToCart(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const t = await getTranslations('GiftCertificates.Purchase');
  const format = await getFormatter();
  const currencyCode = await getPreferredCurrencyCode();
  const settingsResp = await client.fetch({
    document: GiftCertificateSettingsQuery,
    variables: { currencyCode },
  });

  const submission = parseWithZod(formData, {
    schema: schema(settingsResp.data.site.settings?.giftCertificates ?? undefined, t),
  });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply(), fields: prevState.fields };
  }

  const amountFormatted = format.number(submission.value.amount, {
    style: 'currency',
    currency: currencyCode,
  });

  try {
    await addToOrCreateCart({
      giftCertificates: [
        {
          name: `${amountFormatted} Gift Certificate`,
          sender: {
            name: submission.value.senderName,
            email: submission.value.senderEmail,
          },
          recipient: {
            name: submission.value.recipientName,
            email: submission.value.recipientEmail,
          },
          message: submission.value.message ?? undefined,
          theme: 'GENERAL',
          amount: submission.value.amount,
          quantity: 1,
        },
      ],
    });

    return {
      lastResult: submission.reply(),
      fields: prevState.fields,
      successMessage: t.rich('successMessage', {
        cartLink: (chunks) => (
          <Link className="underline" href="/cart" prefetch="viewport" prefetchKind="full">
            {chunks}
          </Link>
        ),
      }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => {
            return message;
          }),
        }),
        fields: prevState.fields,
      };
    }

    if (error instanceof MissingCartError) {
      return {
        lastResult: submission.reply({ formErrors: [t('missingCart')] }),
        fields: prevState.fields,
      };
    }

    if (error instanceof Error) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        fields: prevState.fields,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: [t('unknownError')] }),
      fields: prevState.fields,
    };
  }
}
