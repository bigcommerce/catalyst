import { GetServerSideProps } from 'next';
import Head from 'next/head';

import { getServerClient } from '../../graphql/server';
import { gql } from '../../graphql/utils';

interface Product {
  name: string;
  plainTextDescription: string;
}

interface ProductQuery {
  site: {
    product: Product | null;
  };
}

interface ProductPageProps {
  product: Product;
}

interface ProductPageParams {
  [key: string]: string | string[];
  pid: string;
}

export const getServerSideProps: GetServerSideProps<ProductPageProps, ProductPageParams> = async ({
                                                                                                    params,
                                                                                                  }) => {
  if (!params?.pid) {
    return {
      notFound: true,
    };
  }

  const client = getServerClient();
  const productId = parseInt(params.pid, 10);

  const { data } = await client.query<ProductQuery>({
    query: gql`
        query productById($productId: Int!) {
            site {
                product(entityId: $productId) {
                    name
                    plainTextDescription
                }
            }
        }
    `,
    variables: {
      productId,
    },
  });

  if (data.site.product == null) {
    return { notFound: true };
  }

  return {
    props: {
      product: data.site.product,
    },
  };
};

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <>
      <Head>
        <title>{product.name}</title>
      </Head>
      <pre className="bg-slate-100 m-4 p-4 border-2 rounded">
        {JSON.stringify(product, undefined, 2)}
      </pre>
    </>
  );
}