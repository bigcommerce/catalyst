import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { locales } from '~/i18n/routing';
 
import { BlogPostCard } from '~/components/blog-post-card';
import { Pagination } from '~/components/ui/pagination';
 
import { Page as MakeswiftPage } from '~/lib/makeswift';
 
import { getBlogPosts } from './page-data';
 
interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
 
 
 
export async function generateMetadata(props: Props): Promise<Metadata> {
  const searchParams = await props.searchParams;
 
  const t = await getTranslations('Blog');
  const blogPosts = await getBlogPosts(searchParams);
 
  return {
    title: blogPosts?.name ?? t('title'),
    description:
      blogPosts?.description && blogPosts.description.length > 150
        ? `${blogPosts.description.substring(0, 150)}...`
        : blogPosts?.description,
  };
}
 
export default async function Blog(props: Props) {
  const searchParams = await props.searchParams;
  const blogPosts = await getBlogPosts(searchParams);
 
  const params = await props.params;
  const {locale} = params;
 
  if (!blogPosts) {
    return notFound();
  }
 
  return <MakeswiftPage locale={locale} path="/blog" />
}