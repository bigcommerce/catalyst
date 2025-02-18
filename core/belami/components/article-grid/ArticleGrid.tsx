import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

type Article = {
  title: string;
  description: string;
  image: string;
  imageLink: { href: string; target?: '_self' | '_blank' };
  readMoreLink: { href: string; target?: '_self' | '_blank' };
};

type Props = {
  className?: string;
  articles: Article[];
};

export function ArticleGrid({ className, articles }: Props) {
  return (
    <div className={clsx('', className)}>
      <div className="grid auto-rows-fr grid-cols-1 gap-[10px_20px] sm:grid-cols-2 xl:grid-cols-4 xl:gap-[10px]">
        {articles.map((article, index) => (
          <div key={index} className="flex h-full flex-col">
            <div className="relative mb-[10px] cursor-pointer">
              {article.imageLink?.href !== '/' ? (
                <a
                  href={article.imageLink.href}
                  target={article.imageLink.target || '_self'}
                  rel="noopener noreferrer"
                >
                  <Image
                    src={article.image}
                    alt={article.title}
                    width={350}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <Image
                  src={article.image}
                  alt={article.title}
                  width={350}
                  height={400}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col justify-between gap-[10px] sm:flex-grow">
              <div className="sm:flex-shrink-0">
                <div className="truncate text-xl font-medium leading-8 tracking-[0.15px]">
                  {article.title}
                </div>
              </div>

              <div className="sm:flex-grow">
                <div className="text-base leading-8 tracking-[0.5px] text-gray-600">
                  {article.description}
                </div>
              </div>

              <div className="sm:flex-shrink-0">
                {article.readMoreLink?.href !== '/' ? (
                  <a
                    href={article.readMoreLink.href}
                    target={article.readMoreLink.target || '_self'}
                    rel="noopener noreferrer"
                    className="text-sm font-medium uppercase leading-8 tracking-[1.25px] text-gray-800 hover:text-gray-600"
                  >
                    Read More
                  </a>
                ) : (
                  <div className="text-sm font-medium uppercase leading-8 tracking-[1.25px] text-gray-800 hover:text-gray-600">
                    Read More
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
