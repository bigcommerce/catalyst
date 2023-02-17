import { GetServerSideProps } from 'next';
import Head from 'next/head';

import { http } from '../../client';

interface Product {
  name: string;
  plainTextDescription: string;
}

interface ProductQuery {
  data: {
    site: {
      product: Product | null;
    };
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

  const productId = parseInt(params.pid, 10);

  const { data } = await http.query<ProductQuery>(
    `
    query productById($productId: Int!) {
      site {
        product(entityId: $productId) {
          name
          plainTextDescription
        }
      }
    }
  `,
    { productId },
  );

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
