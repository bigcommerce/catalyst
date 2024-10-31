import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

import { clsx } from 'clsx';

interface Image {
  src: string;
  alt: string;
}

export interface BlogPost {
  id: string;
  author?: string | null;
  content: string;
  date: string;
  image?: Image | null;
  href: string;
  title: string;
  className?: string;
}

export const BlogPostCard = function BlogPostCard({
  title,
  image,
  content,
  href,
  date,
  author,
  className,
}: BlogPost) {
  return (
    <Link
      href={href}
      className={clsx(
        'group max-w-full rounded-b-lg rounded-t-2xl text-foreground ring-primary ring-offset-4 @container focus:outline-0 focus-visible:ring-2',
        className,
      )}
    >
      <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-contrast-100">
        {image?.src != null && image.src !== '' ? (
          <BcImage
            src={image.src}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt={image.alt}
            className="transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="pl-4 pt-4 text-5xl font-bold leading-none tracking-tighter text-foreground/15">
            {title}
          </div>
        )}
      </div>

      <div className="text-lg font-medium leading-snug">{title}</div>
      <p className="mb-3 mt-1.5 line-clamp-3 text-sm font-normal text-contrast-400">{content}</p>
      <div className="text-sm">
        <time dateTime={date}>
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        {date !== '' && author != null && author !== '' && (
          <span className="after:mx-2 after:content-['•']" />
        )}
        {author != null && author !== '' && <span>{author}</span>}
      </div>
    </Link>
  );
};

interface BlogPostCardSkeletonProps {
  className?: string;
}

export const BlogPostCardSkeleton = function BlogPostCardSkeleton({
  className,
}: BlogPostCardSkeletonProps) {
  return (
    <div className={clsx('flex max-w-md animate-pulse flex-col gap-2 rounded-xl', className)}>
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-contrast-100" />

      {/* Title */}
      <div className="h-4 w-24 rounded-lg bg-contrast-100" />

      {/* Content */}
      <div className="h-3 w-full rounded-lg bg-contrast-100" />
      <div className="h-3 w-full rounded-lg bg-contrast-100" />
      <div className="h-3 w-1/2 rounded-lg bg-contrast-100" />

      <div className="flex flex-wrap items-center">
        {/* Date */}
        <div className="h-4 w-16 rounded-lg bg-contrast-100" />
        <span className="after:mx-2 after:text-contrast-100 after:content-['•']" />
        {/* Author */}
        <div className="h-4 w-20 rounded-lg bg-contrast-100" />
      </div>
    </div>
  );
};
