import { PackageOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';

export const EmptyState = () => {
  const t = useTranslations('Category.Empty');

  return (
    <div className="my-10 flex flex-col items-center justify-center rounded-lg text-center">
      <PackageOpen className="text-muted-foreground mb-4 h-16 w-16" />
      <h2 className="mb-2 text-2xl font-semibold tracking-tight">{t('message')}</h2>

      <div>
        <Button asChild variant="subtle">
          <Link href="/">{t('cta')}</Link>
        </Button>
      </div>
    </div>
  );
};
