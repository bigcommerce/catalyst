import { gql } from '@apollo/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import { serverClient } from '../../client/server';
import { sessionOptions } from '../../session';
import { withIronSessionSsr } from 'iron-session/next';


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

export const config = {
  runtime: 'nodejs',
  unstable_allowDynamic: [
    '/node_modules/@peculiar/webcrypto/**',
  ],
}

const test: GetServerSideProps<ProductPageProps, ProductPageParams> = async ( { params, req, res } ) => {

  if (!params?.pid) {
    return {
      notFound: true,
    };
  }

  const productId = parseInt(params.pid, 10);

  req.session.recentlyViewedProducts.push(productId);

  await req.session.save();

  const { data } = await serverClient.query<ProductQuery>({
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
    context: {
      // pass in context here
    }
  });

  if (data.site.product == null) {
    return { notFound: true };
  }

  return {
    props: {
      product: data.site.product
    },
  };
};

export const getServerSideProps = withIronSessionSsr<ProductPageParams>(test, sessionOptions)

// export const getServerSideProps: GetServerSideProps<ProductPageProps, ProductPageParams> = async ({ params, req, res }) => {
//   const session = await getIronSession(req, res, sessionOptions)
//
//   if (!params?.pid) {
//     return {
//       notFound: true,
//     };
//   }
//
//   const productId = parseInt(params.pid, 10);
//
//   // session.recentlyViewedProducts.push(productId);
//
//   // await session.save();
//
//   const { data } = await serverClient.query<ProductQuery>({
//     query: gql`
//       query productById($productId: Int!) {
//         site {
//           product(entityId: $productId) {
//             name
//             plainTextDescription
//           }
//         }
//       }
//     `,
//     variables: {
//       productId,
//     },
//     context: {
//       // pass in context here
//     }
//   });
//
//   if (data.site.product == null) {
//     return { notFound: true };
//   }
//
//   return {
//     props: {
//       product: data.site.product,
//     },
//   };
// };

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
