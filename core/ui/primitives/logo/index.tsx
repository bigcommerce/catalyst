import { clsx } from 'clsx';

import { Stream, Streamable } from '@/ui/lib/streamable';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

interface Props {
  className?: string;
  logo?: Streamable<string | { src: string; alt: string } | null>;
  label?: string;
  href: string;
  width: number;
  height: number;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --logo-focus: hsl(var(--primary));
 *   --logo-font-family: var(--font-family-heading);
 *   --logo-text: hsl(var(--foreground));
 * }
 * ```
 */
export function Logo({ className, logo: streamableLogo, href, width, height, label }: Props) {
  return (
    <Stream
      fallback={<div className="bg-contrast-100 h-6 w-16 animate-pulse rounded-md" />}
      value={streamableLogo}
    >
      {(logo) => (
        <Link
          aria-label={label}
          className={clsx(
            'relative ring-[var(--logo-focus,hsl(var(--primary)))] ring-offset-4 outline-0 focus-visible:ring-2',
            className,
          )}
          href={href}
          style={typeof logo === 'string' ? {} : { width, height }}
        >
          {typeof logo === 'object' && logo !== null && logo.src !== '' ? (
            <Image
              alt={logo.alt}
              className="object-contain object-left"
              fill
              sizes={`${width}px`}
              src={logo.src}
            />
          ) : (
            typeof logo === 'string' && (
              <span className="font-[family-name:var(--logo-font-family,var(--font-family-heading))] text-lg leading-none font-semibold text-[var(--logo-text,hsl(var(--foreground)))] @xl:text-2xl">
                {logo}
              </span>
            )
          )}
        </Link>
      )}
    </Stream>
  );
}
