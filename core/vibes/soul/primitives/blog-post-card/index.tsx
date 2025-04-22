import { clsx } from 'clsx';

import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { type BlogPostCardBlogPost } from '~/ui/blog-post-list';

interface Props {
  blogPost: BlogPostCardBlogPost;
  className?: string;
}

export function BlogPostCard({ blogPost, className }: Props) {
  const { author, content, date, href, image, title } = blogPost;

  return (
    <Link
      className={clsx(
        'group text-foreground ring-primary @container max-w-full rounded-t-2xl rounded-b-lg ring-offset-4 focus:outline-0 focus-visible:ring-2',
        className,
      )}
      href={href}
    >
      <div className="bg-contrast-100 relative mb-4 aspect-4/3 w-full overflow-hidden rounded-2xl">
        {image?.src != null && image.src !== '' ? (
          <Image
            alt={image.alt}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            fill
            sizes="(min-width: 80rem) 25vw, (min-width: 56rem) 33vw, (min-width: 28rem) 50vw, 100vw"
            src={image.src}
          />
        ) : (
          <div className="text-foreground/15 p-4 text-5xl leading-none font-bold tracking-tighter">
            {title}
          </div>
        )}
      </div>

      <div className="text-lg leading-snug font-medium">{title}</div>
      <p className="text-contrast-400 mt-1.5 mb-3 line-clamp-3 text-sm font-normal">{content}</p>
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
}

export function BlogPostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('flex max-w-md animate-pulse flex-col gap-2 rounded-xl', className)}>
      {/* Image */}
      <div className="bg-contrast-100 aspect-4/3 overflow-hidden rounded-xl" />

      {/* Title */}
      <div className="bg-contrast-100 h-4 w-24 rounded-lg" />

      {/* Content */}
      <div className="bg-contrast-100 h-3 w-full rounded-lg" />
      <div className="bg-contrast-100 h-3 w-full rounded-lg" />
      <div className="bg-contrast-100 h-3 w-1/2 rounded-lg" />

      <div className="flex flex-wrap items-center">
        {/* Date */}
        <div className="bg-contrast-100 h-4 w-16 rounded-lg" />
        <span className="after:text-contrast-100 after:mx-2 after:content-['•']" />
        {/* Author */}
        <div className="bg-contrast-100 h-4 w-20 rounded-lg" />
      </div>
    </div>
  );
}
