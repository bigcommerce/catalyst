import { FragmentOf, graphql } from '~/client/graphql';

export const CopyrightFragment = graphql(`
  fragment CopyrightFragment on Settings {
    storeName
  }
`);

interface Props {
  data: FragmentOf<typeof CopyrightFragment>;
}

export const Copyright = ({ data }: Props) => {
  return (
    <p className="text-gray-500 sm:order-first">
      © {new Date().getFullYear()} {data.storeName} – Powered by BigCommerce
    </p>
  );
};
