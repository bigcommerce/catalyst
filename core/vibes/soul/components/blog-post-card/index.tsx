import { clsx } from 'clsx';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

interface Image {
  src: string;
  altText: string;
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
  className = '',
}: BlogPost) {
  return (
    <Link
      className={clsx(
        'group flex max-w-md flex-col gap-2 rounded-xl text-foreground ring-primary focus:outline-0 focus:ring-2',
        className,
      )}
      href={href}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-primary-highlight bg-opacity-10">
        {image?.src != null && image.src !== '' ? (
          <BcImage
            alt={image.altText}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
            height={349}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={image.src}
            width={466}
          />
        ) : (
          <h3 className="pl-2 pt-3 text-7xl font-bold leading-[0.8] tracking-tighter text-primary-shadow opacity-10 transition-transform duration-500 ease-out group-hover:scale-105">
            {title}
          </h3>
        )}
      </div>
      <h3 className="pb-1 pt-3 text-lg font-medium">{title}</h3>
      <p className="line-clamp-3 text-contrast-400">{content}</p>
      <div className="flex flex-wrap items-center">
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
