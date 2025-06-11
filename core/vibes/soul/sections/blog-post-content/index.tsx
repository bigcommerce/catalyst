import { clsx } from 'clsx';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { Image } from '~/components/image';

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

export interface BlogPostContentBlogPost {
  title: string;
  author?: string;
  date: string;
  tags?: Tag[];
  content: string;
  image?: Image;
}

interface Props {
  blogPost: Streamable<BlogPostContentBlogPost>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  className?: string;
}

export function BlogPostContent({
  blogPost: streamableBlogPost,
  className = '',
  breadcrumbs,
}: Props) {
  return (
    <section className={clsx('@container', className)}>
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <Stream fallback={<BlogPostContentSkeleton />} value={streamableBlogPost}>
          {(blogPost) => {
            const { title, author, date, tags, content, image } = blogPost;

            return (
              <>
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
                        <ButtonLink
                          href={tag.link.href}
                          key={index}
                          size="small"
                          variant="tertiary"
                        >
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
                  className="@-xl:[&_h2]:text-4xl prose mx-auto w-full max-w-4xl space-y-4 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:font-normal [&_h2]:leading-none [&_img]:mx-auto [&_img]:max-h-[600px] [&_img]:w-fit [&_img]:rounded-2xl [&_img]:object-cover"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </>
            );
          }}
        </Stream>
      </div>
    </section>
  );
}

function BlogPostTitleSkeleton() {
  return (
    <div className="mb-4 mt-8 animate-pulse">
      <div className="h-9 w-5/6 rounded-lg bg-contrast-100 @xl:h-12 @4xl:h-[3.75rem]" />
    </div>
  );
}

function BlogPostAuthorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-1/4 rounded-lg bg-contrast-100" />
    </div>
  );
}

function BlogPostTagsSkeleton() {
  return (
    <div className="mt-4 flex w-2/6 min-w-[250px] animate-pulse flex-wrap gap-3 @xl:mt-6">
      <div className="-ml-1 h-10 w-[64px] flex-[0.75] rounded-full bg-contrast-100" />
      <div className="-ml-1 h-10 w-[64px] flex-1 rounded-full bg-contrast-100" />
      <div className="-ml-1 h-10 w-[64px] flex-1 rounded-full bg-contrast-100" />
    </div>
  );
}

function BlogPostImageSkeleton() {
  return (
    <div className="mb-8 aspect-video w-full animate-pulse rounded-2xl bg-contrast-100 object-cover @2xl:mb-12 @4xl:mb-16">
      <div className="h-full w-full" />
    </div>
  );
}

function BlogPostBodySkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse pb-8 @2xl:pb-12 @4xl:pb-16">
      <div className="mb-8 h-[1lh] w-3/5 rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-full rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-full rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-full rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-full rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-full rounded-lg bg-contrast-100" />
      <div className="mb-4 h-[0.5lh] w-3/4 rounded-lg bg-contrast-100" />
    </div>
  );
}

export function BlogPostContentSkeleton() {
  return (
    <div>
      <div className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
        <BreadcrumbsSkeleton />
        <BlogPostTitleSkeleton />
        <BlogPostAuthorSkeleton />
        <BlogPostTagsSkeleton />
      </div>
      <BlogPostImageSkeleton />
      <BlogPostBodySkeleton />
    </div>
  );
}
