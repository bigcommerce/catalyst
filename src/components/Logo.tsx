import Image from 'next/image';
import Link from 'next/link';

interface StoreTextLogo {
  __typename: 'StoreTextLogo';
  text: string;
}

interface StoreImageLogo {
  __typename: 'StoreImageLogo';
  image: {
    url: string;
    altText: string;
  };
}

export type StoreLogo = StoreTextLogo | StoreImageLogo;

interface StoreLogoProps {
  logo: StoreLogo;
  storeName: string;
  isHomePage: boolean;
}

export const BaseStoreLogo: React.FC<Omit<StoreLogoProps, 'isHomePage'>> = ({
  logo,
  storeName,
}) => {
  if (logo.__typename === 'StoreTextLogo') {
    return <span className="text-2xl font-black">{logo.text}</span>;
  }

  return <Image alt={storeName} height={32} priority src={logo.image.url} width={155} />;
};

export const StoreLogo = ({ logo, storeName, isHomePage }: StoreLogoProps) => {
  if (isHomePage) {
    return (
      <h1>
        <BaseStoreLogo logo={logo} storeName={storeName} />
      </h1>
    );
  }

  return (
    <Link href="/">
      <BaseStoreLogo logo={logo} storeName={storeName} />
    </Link>
  );
};
