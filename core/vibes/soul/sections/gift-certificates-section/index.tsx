import { clsx } from 'clsx';
import { ArrowRightIcon } from 'lucide-react';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { GiftCertificateCard } from '@/vibes/soul/primitives/gift-certificate-card';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';

interface Props {
  title?: string;
  description?: string;
  logo: string | { src: string; alt: string };
  checkBalanceLabel?: string;
  checkBalanceHref: string;
  exampleBalance?: string;
  purchaseLabel?: string;
  purchaseHref: string;
  variant?: 'left' | 'right';
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --gift-certificate-title-font-family: var(--font-family-heading);
 *   --gift-certificate-title: hsl(var(--foreground));
 * }
 * ```
 */
export function GiftCertificatesSection({
  title = 'Gift certificates',
  description = 'Give the perfect gift that never goes out of style. Let friends and loved ones choose exactly what they want from our entire collection.',
  logo,
  purchaseLabel = 'Shop now',
  purchaseHref,
  checkBalanceLabel = 'Check Balance',
  checkBalanceHref,
  exampleBalance,
  variant = 'left',
}: Props) {
  return (
    <SectionLayout containerSize="xl">
      <div className="flex flex-col justify-center gap-x-4 gap-y-6 py-10 @md:gap-x-6 @lg:gap-x-8 @xl:flex-row @xl:gap-y-24 @2xl:gap-x-12 @4xl:gap-x-24">
        <div
          className={clsx(
            'flex w-full flex-1 flex-col',
            {
              left: 'order-1 @xl:order-1',
              right: 'order-2 @xl:order-2',
            }[variant],
          )}
        >
          <h1 className="mb-10 font-[family-name:var(--gift-certificate-title-font-family,var(--font-family-heading))] text-4xl font-medium leading-none text-[var(--gift-certificate-title,hsl(var(--foreground)))] @xl:text-5xl">
            {title}
          </h1>
          <div className="text-contrast-500">
            <p>{description}</p>
          </div>
          <div className="hidden @xl:flex">
            <ButtonLink className="mt-10" href={purchaseHref}>
              <div className="flex items-center">
                {purchaseLabel}
                <ArrowRightIcon className="ml-2" size={20} />
              </div>
            </ButtonLink>
            <ButtonLink className="ml-4 mt-10" href={checkBalanceHref} variant="ghost">
              {checkBalanceLabel}
            </ButtonLink>
          </div>
        </div>

        <div
          className={clsx(
            'flex flex-1 rounded-xl bg-contrast-100 @container',
            {
              left: 'order-2 @xl:order-2',
              right: 'order-1 @xl:order-1',
            }[variant],
          )}
        >
          <div
            className={clsx(
              'flex flex-1 items-center justify-center p-2 @[250px]:p-4 @[300px]:p-8 @[350px]:p-12 @[450px]:p-16',
            )}
          >
            <GiftCertificateCard balance={exampleBalance ?? '....'} logo={logo} />
          </div>
        </div>

        <div className="order-3 flex flex-col space-y-2 @xl:hidden">
          <ButtonLink href={purchaseHref}>
            <div className="flex items-center">
              {purchaseLabel}
              <ArrowRightIcon className="ml-2" size={20} />
            </div>
          </ButtonLink>
          <ButtonLink href={checkBalanceHref} variant="ghost">
            {checkBalanceLabel}
          </ButtonLink>
        </div>
      </div>
    </SectionLayout>
  );
}
