import { BlocksRenderer, type BlocksContent } from '@strapi/blocks-react-renderer';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';
import { fetchStrapiData } from '~/lib/strapi/data-fetcher';

interface Props {
  params: { locale: LocaleType; slug: string };
}

export default async function Home({ params: { locale, slug } }: Props) {
  unstable_setRequestLocale(locale);

  const strapiSiteContentData = await fetchStrapiData({
    endpoint: `/api/static-site-content?locale=${locale}`,
  });
  const strapiQuestionCategoriesData = await fetchStrapiData({
    endpoint: `/api/question-categories?locale=${locale}`,
  });
  const strapiQuestionCategoryData = await fetchStrapiData({
    endpoint: `/api/question-categories?locale=${locale}&filters[slug][$eq]=${slug}&populate=*`,
  });
  const strapiQuestionAnswerData = await fetchStrapiData({
    endpoint: `/api/customer-service-questions?locale=${locale}&filters[category][id][$eq]=${strapiQuestionCategoryData.data[0].id}`,
  });

  return (
    <main className="mx-auto max-w-5xl py-4">
      <div className="flex flex-col md:flex-row">
        <div className="w-full flex-none md:w-64">
          <Link
            href={`/customer-service/`}
            className="mb-4 mt-2 flex items-center text-black hover:text-primary"
          >
            <svg
              className="-ml-2 mr-2 h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            {strapiSiteContentData.data.attributes.customer_service_title}
          </Link>
          {strapiQuestionCategoriesData.data?.map((post: any) => {
            const { name, slug } = post.attributes;
            return (
              <>
                {strapiQuestionCategoryData.data[0].id === post.id && (
                  <h5 className="mb-5 border-l-2 pl-2 text-lg font-semibold text-black">{name}</h5>
                )}
                {strapiQuestionCategoryData.data[0].id != post.id && (
                  <Link href={`/customer-service/${slug}`}>
                    <h5 className="mb-5 border-l-2 border-transparent pl-2 text-lg text-black hover:text-secondary">
                      {name}
                    </h5>
                  </Link>
                )}
              </>
            );
          })}
        </div>
        <div className="flex-auto">
          <section className="max-w-prose">
            <div className="mx-auto md:px-4 md:px-6 lg:px-8">
              {strapiQuestionAnswerData.data?.map((post: any) => {
                const { question, answer } = post.attributes;
                return (
                  <>
                    <h1 className="text-3xl font-bold">{question}</h1>
                    <p className="mb-12 mt-4 flex flex-col space-y-4 text-lg">
                      <BlocksRenderer content={answer} />
                    </p>
                  </>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
