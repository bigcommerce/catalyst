import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Badge } from '@/vibes/soul/primitives/badge';
import { GiftCertificateCardLogo } from '@/vibes/soul/primitives/gift-certificate-card/gift-certificate-card-logo';
import { GiftCertificateStatus } from '@/vibes/soul/sections/gift-certificate-balance-section';

interface Props {
  balance?: Streamable<string>;
  expiresAt?: Streamable<string | null>;
  expiresAtLabel?: string;
  status?: Streamable<GiftCertificateStatus>;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  logoLabel?: string;
  className?: string;
  loading?: boolean;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --gift-certificate-background-gradient-top: #212B1B;
 *   --gift-certificate-background-gradient-bottom: #3C4E31;
 * }
 * ```
 */
export function GiftCertificateCard({
  balance: streamableBalance,
  expiresAtLabel = 'Valid thru',
  expiresAt: streamableExpiresAt,
  status: streamableStatus,
  loading,
  logo,
  logoLabel,
  className,
}: Props) {
  return (
    <div
      className={clsx(
        'flex aspect-[16/9] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-[var(--gift-certificate-background-gradient-top,#212B1B)] to-[var(--gift-certificate-background-gradient-bottom,#3C4E31)] px-6 py-4 text-primary-highlight @container',
        className,
      )}
    >
      <div className="flex min-h-8 items-center justify-start self-stretch">
        <GiftCertificateCardLogo
          className="h-[clamp(1.25rem,8cqw,2.25rem)] flex-1 text-[clamp(1.25rem,8cqw,2.25rem)]"
          label={logoLabel}
          logo={logo}
        />
        <Stream fallback={null} value={streamableStatus}>
          {(status) =>
            !loading &&
            status != null &&
            status !== 'ACTIVE' && (
              <Badge variant={status === 'PENDING' ? 'info' : 'error'}>{status}</Badge>
            )
          }
        </Stream>
      </div>

      <div className="flex justify-between font-heading text-[clamp(1.5rem,14cqw,4rem)] leading-none text-white">
        <div className="flex flex-col justify-end font-body text-[clamp(0.7rem,4cqw,2rem)]">
          <Stream fallback={null} value={streamableExpiresAt}>
            {(expiresAt) =>
              !loading &&
              expiresAt != null && (
                <div className="flex flex-col space-y-1 @xs:space-y-2">
                  <span className="text-primary">{expiresAtLabel}</span>
                  <time dateTime={expiresAt}>{expiresAt}</time>
                </div>
              )
            }
          </Stream>
        </div>
        <Stream fallback={<span className="animate-pulse">....</span>} value={streamableBalance}>
          {(balance) => (
            <span className={loading ? 'animate-pulse' : ''}>
              {loading ? '....' : (balance ?? '....')}
            </span>
          )}
        </Stream>
      </div>
    </div>
  );
}
