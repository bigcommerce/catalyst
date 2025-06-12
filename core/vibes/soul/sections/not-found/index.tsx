'use client';

import { Button } from '@/vibes/soul/primitives/button';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { useSearch } from '~/lib/search';

export interface NotFoundProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --not-found-font-family: var(--font-family-body);
 *   --not-found-title-font-family: var(--font-family-heading);
 *   --not-found-title: hsl(var(--foreground));
 *   --not-found-subtitle: hsl(var(--contrast-500));
 * }
 * ```
 */
export function NotFound({
  title = 'Not found',
  subtitle = "Take a look around if you're lost.",
  ctaLabel = 'Search',
  className = '',
}: NotFoundProps) {
  const { setIsSearchOpen } = useSearch();

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <SectionLayout className={className} containerSize="2xl">
      <header className="font-[family-name:var(--not-found-font-family,var(--font-family-body))]">
        <h1 className="mb-3 font-[family-name:var(--not-found-title-font-family,var(--font-family-heading))] text-3xl font-medium leading-none text-[var(--not-found-title,hsl(var(--foreground)))] @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="mb-4 text-lg text-[var(--not-found-subtitle,hsl(var(--contrast-500)))]">
          {subtitle}
        </p>
        <Button onClick={handleOpenSearch}>{ctaLabel}</Button>
      </header>
    </SectionLayout>
  );
}
