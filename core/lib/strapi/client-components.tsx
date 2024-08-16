'use client';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { Link } from '~/components/link';

export function StrapiBlocksClientRenderer({ content }: { content: any }) {
  return (
    <BlocksRenderer
      content={content}
      blocks={{
        code: ({ children }) => (
          <code className="bg-black p-4 text-sm text-white">{children}</code>
        ),
        image: ({ image }) => (
          <img src={image.url} alt={image.alternativeText || undefined} />
        ),
        link: ({ children, url }) => <Link href={url}>{children}</Link>,
        list: ({ children, format }) =>
          format === 'ordered' ? (
            <ol className="relative left-4 list-decimal">{children}</ol>
          ) : (
            <ul className="relative left-4 list-disc">{children}</ul>
          ),
        heading: ({ children, level }) => {
          switch (level) {
            case 1:
              return <h1 className="text-4xl lg:text-5xl">{children}</h1>;
            case 2:
              return <h2 className="text-3xl lg:text-4xl">{children}</h2>;
            case 3:
              return <h3 className="text-2xl lg:text-3xl">{children}</h3>;
            case 4:
              return <h4 className="text-xl lg:text-2xl">{children}</h4>;
            case 5:
              return <h5 className="text-lg lg:text-xl">{children}</h5>;
            case 6:
              return <h6 className="text-md lg:text-lg">{children}</h6>;
            default:
              return <h1 className="lg:text-md text-sm">{children}</h1>;
          }
        },
        quote: ({ children }) => (
          <blockquote className="border-color-black border-l-2 p-2 pl-4 italic">
            {children}
          </blockquote>
        ),
        paragraph: ({ children }) => <p>{children}</p>,
      }}
    />
  );
}
