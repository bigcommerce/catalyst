/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createClient } from '@leighton-digital/contentful-client';
import { Key } from 'react';

import { graphql } from '~/client/graphql';

const TestQuery = graphql(
  `query {
    productCollection {
      items {
        sys {
          id
        },
        title,
        description
      }
    }
  }',
`,
);

const ContentfulCard = async () => {
  const productData = await createClient(
    process.env.CONTENTFUL_SPACE_ID,
    process.env.CONTENTFUL_ACCESS_TOKEN,
    TestQuery,
  );

  return (
    <section className="flex">
      {productData.map(
        (product: { title: string; description: string }, index: Key | null | undefined) => (
          <div className="border m-3 p-3" key={index}>
            <p className="text-lg py-3 font-bold">{product.title}</p>
            <p className="py-1">{product.description}</p>
          </div>
        ),
      )}
    </section>
  );
};

export { ContentfulCard };
