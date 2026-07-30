'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { Image } from '~/components/image';

import { LiteYouTube } from './lite-youtube';
import { getYouTubeId, getYouTubePosterUrl } from './video-embed';

export interface ProductVideo {
  url: string;
  title: string;
}

export interface ProductVideosProps {
  videos: ProductVideo[];
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * Renders product videos as a dedicated section below the primary product
 * content (mirroring the Stencil/Cornerstone `product_below_content` layout)
 * rather than inside the image gallery. A single featured player is shown with
 * a horizontal strip of thumbnails; clicking a thumbnail swaps the featured
 * video. Product videos are YouTube-only, matching BigCommerce's supported
 * provider, so non-YouTube URLs are dropped.
 *
 * Theming CSS variables (shared with the gallery):
 *
 * ```css
 * :root {
 *   --product-gallery-focus: hsl(var(--primary));
 *   --product-gallery-image-background: hsl(var(--contrast-100));
 *   --product-gallery-image-border-active: hsl(var(--foreground));
 *   --product-detail-primary-text: hsl(var(--foreground));
 *   --product-detail-title-font-family: var(--font-family-heading);
 * }
 * ```
 */
export function ProductVideos({ videos, className }: ProductVideosProps) {
  const t = useTranslations('Product.ProductDetails');

  // Resolve to YouTube ids up front; non-YouTube URLs are skipped (YouTube is
  // the only supported product-video provider).
  const youtubeVideos = videos
    .map((video) => ({ id: getYouTubeId(video.url), title: video.title }))
    .filter((video): video is { id: string; title: string } => video.id !== null);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const panelId = useId();

  const featured = youtubeVideos[Math.min(selectedIndex, youtubeVideos.length - 1)];

  // No renderable (YouTube) videos — render nothing. The `!featured` check also
  // narrows the indexed access to a defined value for the rest of the render.
  if (!featured) return null;

  return (
    <section aria-label={t('videosTitle')} className={clsx('@container', className)}>
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--product-detail-title-font-family,var(--font-family-heading))] text-2xl font-medium text-[var(--product-detail-primary-text,hsl(var(--foreground)))] @xl:text-3xl @4xl:text-4xl">
            {t('videosTitle')}
          </h2>
          <button
            aria-controls={panelId}
            aria-expanded={isOpen}
            className="text-sm font-semibold text-[var(--product-detail-primary-text,hsl(var(--foreground)))] underline-offset-4 transition-opacity hover:opacity-80"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            {isOpen ? t('hideVideos') : t('showVideos')}
          </button>
        </div>

        {isOpen && (
          <div className="duration-200 animate-in fade-in" id={panelId}>
            {/* Featured player */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))]">
              <LiteYouTube
                className="h-full w-full max-w-none"
                // Remount when the featured video changes so the previously
                // playing player stops (and frees its audio).
                key={featured.id}
                playLabel={`${t('playVideo')}: ${featured.title}`}
                videoId={featured.id}
              />
            </div>
            {Boolean(featured.title) && (
              <p className="mb-4 mt-3 text-sm font-semibold text-[var(--product-detail-primary-text,hsl(var(--foreground)))]">
                {featured.title}
              </p>
            )}

            {/* Thumbnail strip — only when there's more than one video to choose from. */}
            {youtubeVideos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {youtubeVideos.map((video, index) => (
                  <button
                    aria-label={`${t('viewVideo')}: ${video.title}`}
                    aria-pressed={index === selectedIndex}
                    className={clsx(
                      'group relative w-40 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-gallery-focus,hsl(var(--primary)))] focus-visible:ring-offset-2 @md:w-48',
                      index === selectedIndex
                        ? 'border-[var(--product-gallery-image-border-active,hsl(var(--foreground)))]'
                        : 'border-transparent',
                    )}
                    key={`${video.id}-${index}`}
                    onClick={() => setSelectedIndex(index)}
                    type="button"
                  >
                    <div className="relative aspect-video w-full bg-[var(--product-gallery-image-background,hsl(var(--contrast-100)))]">
                      <Image
                        alt={video.title}
                        className={clsx(
                          'object-cover transition-opacity',
                          index === selectedIndex
                            ? 'opacity-100'
                            : 'opacity-70 group-hover:opacity-100',
                        )}
                        fill
                        sizes="12rem"
                        src={getYouTubePosterUrl(video.id)}
                      />
                      {/* Play badge marks the thumbnail as a video. */}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
                          <svg
                            aria-hidden="true"
                            fill="currentColor"
                            height="14"
                            viewBox="0 0 24 24"
                            width="14"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
