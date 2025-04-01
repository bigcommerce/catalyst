import { clsx } from 'clsx';

import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

export interface BlogPost {
  title: string;
  author?: string | null;
  content: string;
  date: string;
  image?: {
    src: string;
    alt: string;
  } | null;
  href: string;
}

export interface BlogPostCardProps extends BlogPost {
  className?: string;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --blog-post-card-focus: hsl(var(--primary));
 *   --blog-post-card-image-background: hsl(var(--contrast-100));
 *   --blog-post-card-empty-text: hsl(var(--foreground)/15%);
 *   --blog-post-card-title-text: hsl(var(--foreground));
 *   --blog-post-card-content-text: hsl(var(--contrast-400));
 *   --blog-post-card-author-date-text: hsl(var(--foreground));
 *   --blog-post-card-font-family: var(--font-family-body);
 *   --blog-post-card-summary-text: hsl(var(--contrast-400));
 *   --blog-post-card-author-date-text: hsl(var(--foreground));
 * }
 * ```
 */
export function BlogPostCard({
  author,
  content,
  date,
  href,
  image,
  title,
  className,
}: BlogPostCardProps) {
  return (
    <article
      className={clsx(
        'group relative w-full max-w-md font-[family-name:var(--blog-post-card-font-family,var(--font-family-body))] @container',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--blog-post-card-image-background,hsl(var(--contrast-100)))]">
        {image != null ? (
          <Image
            alt={image.alt}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="(min-width: 80rem) 25vw, (min-width: 56rem) 33vw, (min-width: 28rem) 50vw, 100vw"
            src={image.src}
          />
        ) : (
          <div className="p-4 text-5xl font-bold leading-none tracking-tighter text-[var(--blog-post-card-empty-text,hsl(var(--foreground)/15%))]">
            {title}
          </div>
        )}
      </div>
      <h5 className="mt-4 text-lg font-medium leading-snug text-[var(--blog-post-card-title-text,hsl(var(--foreground)))]">
        {title}
      </h5>
      <p className="mt-1.5 line-clamp-3 text-sm font-normal text-[var(--blog-post-card-content-text,hsl(var(--contrast-400)))]">
        {content}
      </p>
      <div className="mt-3 text-sm text-[var(--blog-post-card-author-date-text,hsl(var(--foreground)))]">
        <time dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {author != null && (
          <>
            <span className="after:mx-2 after:content-['•']" />
            <span>{author}</span>
          </>
        )}
      </div>
      <Link
        className={clsx(
          'absolute inset-0 rounded-b-lg rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blog-post-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
        )}
        href={href}
      >
        <span className="sr-only">View article</span>
      </Link>
    </article>
  );
}

export function BlogPostCardSkeleton({
  aspectRatio = '4:3',
  className,
}: {
  aspectRatio?: '5:6' | '3:4' | '4:3' | '1:1';
  className?: string;
}) {
  return (
    <div className={clsx('w-full max-w-md', className)}>
      <Skeleton.Box
        className={clsx(
          'mb-4 w-full rounded-2xl',
          {
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
            '4:3': 'aspect-[4/3]',
            '1:1': 'aspect-square',
          }[aspectRatio],
        )}
      />
      <Skeleton.Text characterCount={25} className="mt-4 rounded text-lg" />
      <div className="mt-1.5">
        <Skeleton.Text characterCount="full" className="rounded text-sm" />
        <Skeleton.Text characterCount="full" className="rounded text-sm" />
        <Skeleton.Text characterCount={15} className="rounded text-sm" />
      </div>
      <Skeleton.Text characterCount={10} className="mt-3 rounded text-sm" />
    </div>
  );
}
