import { Streamable } from '@/vibes/soul/lib/streamable';
import { BlogPost } from '@/vibes/soul/primitives/blog-post-card';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { BlogPostList } from '@/vibes/soul/sections/blog-post-list';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description?: string;
  cta?: Link;
  posts: Streamable<BlogPost[]>;
}

export function FeaturedBlogPostList({ title, description, cta, posts }: Props) {
  return (
    <section className="@container">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
        <h1 className="mb-3 font-heading text-4xl font-medium leading-none text-foreground @xl:text-5xl @4xl:text-6xl">
          {title}
        </h1>

        {description != null && description !== '' && (
          <p className="max-w-lg text-lg text-contrast-500">{description}</p>
        )}

        <BlogPostList className="mb-8 mt-8 @4xl:mb-10 @4xl:mt-10" posts={posts} />

        {cta != null && cta.href !== '' && cta.label !== '' && (
          <ButtonLink href={cta.href} size="medium" variant="tertiary">
            {cta.label}
          </ButtonLink>
        )}
      </div>
    </section>
  );
}
