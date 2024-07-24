import { ComponentPropsWithRef } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<'div'> {
  author?: string | null;
  content: string;
  date: string;
  link: { href: string };
  thumbnail?: { altText: string; url: string } | null;
  title: string;
}

const BlogPostCard = ({
  author,
  children,
  className,
  content,
  date,
  link,
  thumbnail,
  title,
  ...props
}: Props) => {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      {thumbnail ? (
        <div className="mb-2 flex h-44 lg:h-56">
          <Link className="block w-full" href={link.href}>
            <BcImage
              alt={thumbnail.altText}
              className="h-full w-full object-cover object-center"
              height={300}
              src={thumbnail.url}
              width={300}
            />
          </Link>
        </div>
      ) : (
        <div className="mb-3 flex h-44 justify-between bg-primary/10 p-4 lg:h-56">
          <h3 className="mb-0 line-clamp-3 flex-none basis-1/2 self-start text-3xl font-bold text-primary">
            {title}
          </h3>
          <small className="mb-0 flex-none self-end text-xl font-bold text-primary">{date}</small>
        </div>
      )}

      <h3 className="mb-2 text-2xl font-bold">
        <Link href={link.href}>{title}</Link>
      </h3>

      <p className="mb-2">{content}</p>

      <small className="mb-2 text-base text-gray-500">{date}</small>

      {Boolean(author) && <small className="text-base text-gray-500">, by {author}</small>}
    </div>
  );
};

BlogPostCard.displayName = 'BlogPostCard';

export { BlogPostCard };
