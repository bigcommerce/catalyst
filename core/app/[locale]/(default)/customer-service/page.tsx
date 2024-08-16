import { unstable_setRequestLocale } from 'next-intl/server';
import { Link } from '~/components/link';
import { LocaleType } from '~/i18n';
import { fetchStrapiData } from '~/lib/strapi/data-fetcher';

interface Props {
  params: { locale: LocaleType };
}

export default async function CustomerService({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);
  
  const strapiSiteContentData = await fetchStrapiData({
    endpoint: `/api/static-site-content?locale=${locale}`,
  });
  const strapiQuestionCategoryData = await fetchStrapiData({
    endpoint: `/api/question-categories?locale=${locale}`,
  });

  return (
    <main className="container mx-auto py-6">
      <section className="py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
              {strapiSiteContentData.data.attributes.customer_service_title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600">
              {strapiSiteContentData.data.attributes.customer_service_tagline}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:gap-10">
            {strapiQuestionCategoryData.data?.map((post: any) => {
              const { name, description, slug } = post.attributes;
              return (
                <>
                  <Link href={`/customer-service/${slug}`}>
                    <div className="h-full overflow-hidden rounded bg-white shadow hover:bg-gray-50">
                      <div className="p-8">
                        <div className="flex items-center">
                          <div className="mr-auto">
                            <p className="text-xl font-semibold text-black">{name}</p>
                          </div>
                        </div>
                        <p className="mt-7 text-base leading-relaxed text-gray-600">
                          {description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </>
              );
            })}
          </div>

          {strapiSiteContentData.data.attributes.customer_service_anchor_text?.length > 0 && (
            <div className="mt-12 text-center">
              <Link
                href={strapiSiteContentData.data.attributes.customer_service_anchor_link}
                className="inline-flex p-3 font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline focus:text-blue-700"
              >
                {strapiSiteContentData.data.attributes.customer_service_anchor_text}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
