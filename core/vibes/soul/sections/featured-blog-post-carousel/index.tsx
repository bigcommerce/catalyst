import { Link } from '~/components/link';

import { BlogPost } from '@/vibes/soul/primitives/blog-post-card';
import { BlogPostCarousel } from '@/vibes/soul/primitives/blog-post-carousel';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  cta?: Link;
  blogPosts: BlogPost[];
}

export function FeaturedBlogPostCarousel({ cta, title, blogPosts }: Props) {
  return (
    <div className="py-10 @4xl:py-24">
      <section className="mb-6 @container @xl:mb-8">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap justify-between gap-5 px-3 @xl:px-6 @4xl:items-end @5xl:px-20">
          <h2 className="font-heading text-2xl font-medium leading-none">{title}</h2>
          {cta != null && cta.href !== '' && cta.label !== '' && (
            <Link
              href={cta.href}
              className="rounded-lg font-semibold text-foreground ring-primary focus-visible:outline-0 focus-visible:ring-2"
            >
              {cta.label}
            </Link>
          )}
        </div>
      </section>

      <BlogPostCarousel blogPosts={blogPosts} />
    </div>
  );
}
