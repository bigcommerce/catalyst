import { clsx } from 'clsx';

import { Breadcrumbs } from '@/vibes/soul/primitives/breadcrumbs';
import { BcImage } from '~/components/bc-image';

type Image = {
  src: string;
  alt: string;
};

type Props = {
  title: string;
  author: string;
  date: string;
  content: string;
  image?: Image | null;
  className?: string;
};

export const BlogPostContent = function BlogPostContent({
  title,
  author,
  date,
  content,
  image,
  className = '',
}: Props) {
  return (
    <section className={clsx('mx-auto max-w-screen-2xl @container', className)}>
      <div className="px-3 @xl:px-6 @5xl:px-20">
        <header className="mx-auto w-full max-w-4xl space-y-4 pb-10 pt-24 @4xl:pb-16 @4xl:pt-40">
          <Breadcrumbs
            breadcrumbs={[
              {
                label: 'Home',
                href: '#',
              },
              {
                label: 'Blog',
                href: '#',
              },
              {
                label: title,
                href: '#',
              },
            ]}
          />

          <h1 className="mt-2 font-heading text-4xl font-medium leading-[1.1] @4xl:text-6xl">
            {title}
          </h1>
          <p>
            {date} • {author}
          </p>
        </header>

        {image && (
          <BcImage
            alt={image.alt}
            className="mx-auto aspect-[5/3] w-full max-w-screen-2xl rounded-2xl bg-contrast-100 object-cover"
            height={780}
            src={image.src}
            width={1280}
          />
        )}

        <article
          className="prose mx-auto w-full max-w-4xl space-y-4 pb-20 pt-10 @4xl:py-20 [&_h2]:font-heading [&_h3]:font-heading [&_h4]:font-heading [&_h5]:font-heading [&_h6]:font-heading [&_img]:mx-auto [&_img]:max-h-[600px] [&_img]:w-fit [&_img]:rounded-2xl [&_img]:object-cover"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};
