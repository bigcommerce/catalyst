import { clsx } from 'clsx';

import { Image } from '~/components/image';

import { Breadcrumb, Breadcrumbs } from '../../primitives/breadcrumbs';
import { ButtonLink } from '../../primitives/button-link';

interface Tag {
  label: string;
  link: {
    href: string;
    target?: string;
  };
}

interface Image {
  src: string;
  alt: string;
}

interface Props {
  title: string;
  author?: string;
  date: string;
  tags?: Tag[];
  content: string;
  image?: Image;
  className?: string;
  breadcrumbs?: Breadcrumb[];
}

export const BlogPostContent = function BlogPostContent({
  title,
  author,
  date,
  tags,
  content,
  image,
  className = '',
  breadcrumbs,
}: Props) {
  return (
    <section className={clsx('@container', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <header className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
          {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

          <h1 className="mb-4 mt-8 font-heading text-4xl font-medium leading-none @xl:text-5xl @4xl:text-6xl">
            {title}
          </h1>
          <p>
            {date}{' '}
            {Boolean(author) && (
              <>
                <span className="px-1">•</span> {author}
              </>
            )}
          </p>

          {(tags?.length ?? 0) > 0 && (
            <div className="-ml-1 mt-4 flex flex-wrap gap-1.5 @xl:mt-6">
              {tags?.map((tag, index) => (
                <ButtonLink href={tag.link.href} key={index} size="small" variant="tertiary">
                  {tag.label}
                </ButtonLink>
              ))}
            </div>
          )}
        </header>

        {image?.src != null && image.src !== '' && (
          <Image
            alt={image.alt}
            className="mb-8 aspect-video w-full rounded-2xl bg-contrast-100 object-cover @2xl:mb-12 @4xl:mb-16"
            height={780}
            src={image.src}
            width={1280}
          />
        )}

        <article
          className="prose mx-auto w-full max-w-4xl space-y-4 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:leading-none [&_h2]:@xl:text-4xl [&_img]:mx-auto [&_img]:max-h-[600px] [&_img]:w-fit [&_img]:rounded-2xl [&_img]:object-cover"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};
