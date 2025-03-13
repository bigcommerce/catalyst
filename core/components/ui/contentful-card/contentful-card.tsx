'use client';

import { useGetCarouselQuery } from '~/contentful/generated/graphql';

const ContentfulCard = () => {
  const { data } = useGetCarouselQuery({ variables: { slug: '/wine/white-wine' } });

  return (
    <section className="flex">
      Card
      {data?.carouselCollection?.items.map((carousel) => (
        <div className="border m-3 p-3" key={carousel?.sys.id}>
          <p className="text-lg py-3 font-bold">{carousel?.title}</p>
          <p className="text-lg py-3 font-bold">{carousel?.carouselType}</p>
        </div>
      ))}
    </section>
  );
};

export { ContentfulCard };
