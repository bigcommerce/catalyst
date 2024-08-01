import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BcImage } from '~/components/bc-image';

import { Button } from '../button';

interface ProductChip {
  id: number;
  name: string;
  image?: {
    altText?: string;
    url?: string;
  } | null;
}

interface Props {
  product: ProductChip;
  onDismiss?: () => void;
}

const ProductChip = ({ product, onDismiss }: Props) => {
  const t = useTranslations('Providers.Compare');

  return (
    <li
      className="mb-4 flex h-12 flex-shrink-0 items-center overflow-hidden border border-gray-200 pe-3 last:mb-0 md:mb-0 md:me-4"
      key={product.id}
    >
      {product.image ? (
        <BcImage
          alt={product.image.altText ?? product.name}
          className="object-contain"
          height={48}
          src={product.image.url ?? ''}
          width={48}
        />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center bg-gray-200 text-[8px] text-gray-500">
          {t('productPhoto')}
        </span>
      )}
      <small className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap px-4 text-base font-semibold">
        {product.name}
      </small>
      <Button
        aria-label={t('removeProductAriaLabel', { product: product.name })}
        className="grow-1 ms-auto w-auto border-0 bg-transparent p-0 text-black hover:bg-transparent hover:text-primary focus-visible:text-primary"
        onClick={onDismiss}
        type="button"
      >
        <X />
      </Button>
    </li>
  );
};

export { ProductChip };
