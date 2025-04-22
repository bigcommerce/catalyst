import { clsx } from 'clsx';

import { Stream } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { BreadcrumbsSkeleton } from '@/vibes/soul/sections/breadcrumbs';
import { Image } from '~/components/image';
import { type BlogPostContentData } from '~/ui/blog-post-content';
import { Breadcrumbs } from '~/ui/breadcrumbs';

interface Props extends BlogPostContentData {
  className?: string;
}

export function BlogPostContent({
  blogPost: streamableBlogPost,
  className = '',
  breadcrumbs,
}: Props) {
  return (
    <section className={clsx('@container', className)}>
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <Stream fallback={<BlogPostContentSkeleton />} value={streamableBlogPost}>
          {(blogPost) => {
            const { title, author, date, tags, content, image } = blogPost;

            return (
              <>
                <header className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
                  {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

                  <h1 className="font-heading mt-8 mb-4 text-4xl leading-none font-medium @xl:text-5xl @4xl:text-6xl">
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
                    <div className="mt-4 -ml-1 flex flex-wrap gap-1.5 @xl:mt-6">
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
                    className="bg-contrast-100 mb-8 aspect-video w-full rounded-2xl object-cover @2xl:mb-12 @4xl:mb-16"
                    height={780}
                    src={image.src}
                    width={1280}
                  />
                )}

                <article
                  className="prose [&_h2]:font-heading mx-auto w-full max-w-4xl space-y-4 [&_h2]:text-3xl [&_h2]:leading-none [&_h2]:font-normal @-xl:[&_h2]:text-4xl [&_img]:mx-auto [&_img]:max-h-[600px] [&_img]:w-fit [&_img]:rounded-2xl [&_img]:object-cover"
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
    <div className="mt-8 mb-4 animate-pulse">
      <div className="bg-contrast-100 h-9 w-5/6 rounded-lg @xl:h-12 @4xl:h-[3.75rem]" />
    </div>
  );
}

function BlogPostAuthorSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-contrast-100 h-6 w-1/4 rounded-lg" />
    </div>
  );
}

function BlogPostTagsSkeleton() {
  return (
    <div className="mt-4 flex w-2/6 min-w-[250px] animate-pulse flex-wrap gap-3 @xl:mt-6">
      <div className="bg-contrast-100 -ml-1 h-10 w-[64px] flex-[0.75] rounded-full" />
      <div className="bg-contrast-100 -ml-1 h-10 w-[64px] flex-1 rounded-full" />
      <div className="bg-contrast-100 -ml-1 h-10 w-[64px] flex-1 rounded-full" />
    </div>
  );
}

function BlogPostImageSkeleton() {
  return (
    <div className="bg-contrast-100 mb-8 aspect-video w-full animate-pulse rounded-2xl object-cover @2xl:mb-12 @4xl:mb-16">
      <div className="h-full w-full" />
    </div>
  );
}

function BlogPostBodySkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse pb-8 @2xl:pb-12 @4xl:pb-16">
      <div className="bg-contrast-100 mb-8 h-[1lh] w-3/5 rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-full rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-full rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-full rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-full rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-full rounded-lg" />
      <div className="bg-contrast-100 mb-4 h-[0.5lh] w-3/4 rounded-lg" />
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
