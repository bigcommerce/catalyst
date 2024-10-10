import { BlogPost } from '@/vibes/soul/components/blog-post-card';
import { BlogPostList } from '@/vibes/soul/components/blog-post-list';
import { Button } from '@/vibes/soul/components/button';
import { Link } from '~/components/link';

interface Link {
  label: string;
  href: string;
}

interface Props {
  title: string;
  description?: string;
  cta?: Link;
  posts: BlogPost[];
}

export const FeaturedBlogPostList = function FeaturedBlogPostList({
  title,
  description,
  cta,
  posts,
}: Props) {
  return (
    <section className="bg-background @container">
      <div className="relative mx-auto max-w-screen-2xl px-3 pb-20 pt-24 @xl:px-6 @4xl:pt-28 @5xl:px-20">
        <h2 className="mb-2 font-heading text-3xl font-semibold leading-none text-foreground @4xl:text-6xl @4xl:font-medium">
          {title}
        </h2>
        {description != null && description !== '' && (
          <p className="max-w-md text-foreground">{description}</p>
        )}
        <BlogPostList className="mt-6 @4xl:mt-8" posts={posts} />
        {cta != null && cta.href !== '' && cta.label !== '' && (
          <Button asChild className="mx-auto mt-12 bg-primary @4xl:mt-16">
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        )}
      </div>
    </section>
  );
};
