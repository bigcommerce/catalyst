'use client';

import { Printer } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const PrintButton = () => {
  const t = useTranslations('Blog.SharingLinks');

  return (
    <button
      className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      onClick={() => {
        window.print();

        return false;
      }}
      type="button"
    >
      <Printer size={24}>
        <title>{t('print')}</title>
      </Printer>
    </button>
  );
};
