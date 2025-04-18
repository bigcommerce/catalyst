import { Stream, Streamable } from '@/ui/lib/streamable';
import { Breadcrumb, Breadcrumbs, BreadcrumbsSkeleton } from '@/ui/sections/breadcrumbs';

export interface WebPage {
  title: string;
  content: string;
  breadcrumbs: Breadcrumb[];
  seo: {
    pageTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
}

interface Props {
  webPage: Streamable<WebPage>;
  breadcrumbs?: Streamable<Breadcrumb[]>;
  children?: React.ReactNode;
}

export function WebPageContent({ webPage: streamableWebPage, breadcrumbs, children }: Props) {
  return (
    <section className="w-full max-w-4xl">
      <Stream fallback={<WebPageContentSkeleton />} value={streamableWebPage}>
        {(webPage) => {
          const { title, content } = webPage;

          return (
            <>
              <header className="pb-8 @2xl:pb-12 @4xl:pb-16">
                {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

                <h1 className="font-heading mt-8 mb-4 text-4xl leading-none font-medium @xl:text-5xl @4xl:text-6xl">
                  {title}
                </h1>
              </header>

              <div
                className="prose [&_h2]:font-heading space-y-4 [&_h2]:text-3xl [&_h2]:leading-none [&_h2]:font-normal @-xl:[&_h2]:text-4xl [&_img]:mx-auto [&_img]:max-h-[600px] [&_img]:w-fit [&_img]:rounded-2xl [&_img]:object-cover"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              {children}
            </>
          );
        }}
      </Stream>
    </section>
  );
}

function WebPageTitleSkeleton() {
  return (
    <div className="mt-8 mb-4 animate-pulse">
      <div className="bg-contrast-100 h-9 w-5/6 rounded-lg @xl:h-12 @4xl:h-[3.75rem]" />
    </div>
  );
}

function WebPageBodySkeleton() {
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

function WebPageContentSkeleton() {
  return (
    <div>
      <div className="mx-auto w-full max-w-4xl pb-8 @2xl:pb-12 @4xl:pb-16">
        <BreadcrumbsSkeleton />
        <WebPageTitleSkeleton />
      </div>
      <WebPageBodySkeleton />
    </div>
  );
}
