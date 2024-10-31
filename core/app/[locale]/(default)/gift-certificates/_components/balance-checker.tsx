'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/form';
import { Message } from '~/components/ui/message';

export default function GiftCertificateBalanceClient({
  checkBalanceAction,
}: {
  checkBalanceAction: (
    code: string,
  ) => Promise<{ balance?: number; currencyCode?: string; error?: string }>;
}) {
  const [result, setResult] = useState<{
    balance?: number;
    currencyCode?: string;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations('GiftCertificate.Check');
  const format = useFormatter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const code = formData.get('code')?.toString() || '';
    const response = await checkBalanceAction(code);

    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto mb-10 mt-8 lg:w-2/3">
      <h2 className="mb-4 text-2xl font-bold">{t('heading')}</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            className="w-full"
            name="code"
            placeholder={t('placeholder')}
            required
            type="text"
          />
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? t('buttonPendingText') : t('buttonSubmitText')}
          </Button>
        </div>
      </form>

      {result && (
        <div className="w-full text-center">
          {result.balance !== undefined ? (
            <Message className="mt-4" variant="success">
              <strong>
                {t('balanceResult', {
                  balance: format.number(result.balance, {
                    style: 'currency',
                    currency: result.currencyCode,
                  }),
                })}
              </strong>
            </Message>
          ) : (
            <Message className="mt-4" variant="error">
              {result.error}
            </Message>
          )}
        </div>
      )}
    </div>
  );
}
