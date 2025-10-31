import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Image } from '~/components/image';

interface Props {
  className?: string;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  label?: string;
}

export function GiftCertificateCardLogo({ className, logo: streamableLogo, label }: Props) {
  return (
    <Stream
      fallback={<div className="h-6 w-16 animate-pulse rounded-md bg-contrast-100" />}
      value={streamableLogo}
    >
      {(logo) => (
        <div
          aria-label={label}
          className={clsx(
            'relative font-[family-name:var(--logo-font-family,var(--font-family-heading))] font-semibold leading-none',
            className,
          )}
        >
          {typeof logo === 'object' && logo !== null && logo.src !== '' ? (
            <Image
              alt={logo.alt}
              className="h-auto w-full object-left"
              fill
              src={logo.src}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            typeof logo === 'string' && <span>{logo}</span>
          )}
        </div>
      )}
    </Stream>
  );
}
