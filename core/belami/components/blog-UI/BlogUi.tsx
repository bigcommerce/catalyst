import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import blogChevron from '~/public/home/blogChevron.svg';
import Link from 'next/link';

type Article = {
  title: string;
  image: string;
  imageLink: { href: string; target?: '_self' | '_blank' };
  readMoreLink: { href: string; target?: '_self' | '_blank' };
};

type Props = {
  className?: string;
  articles: Article[];
};

export function BlogUi({ className, articles }: Props) {
  return (
    <div className={clsx('', className)}>
      <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-3">
        {articles.map((article, index) => (
          <div key={index} className="flex h-full flex-col gap-[10px]">
            <div className="relative flex-1 cursor-pointer">
              <Link
                href={article.imageLink.href}
                target={article.imageLink.target || '_self'}
                rel="noopener noreferrer"
              >
                <Image
                  src={article.image}
                  alt={article.title}
                  width={353}
                  height={350}
                  className="aspect-[16/8.5] h-full w-full"
                />
              </Link>
            </div>
            <div className="flex flex-col justify-between gap-[5px]">
              <div className="truncate text-[18px] font-medium leading-[32px] tracking-[0.15px] text-[#353535] sm:text-[20px]">
                {article.title}
              </div>
              <Link
                href={article.readMoreLink.href}
                target={article.readMoreLink.target || '_self'}
                rel="noopener noreferrer"
              >
                <div className="flex flex-row items-center justify-start gap-[10px]">
                  <span className="text-[16px] font-normal leading-[32px] tracking-[0.15px] text-brand-400">
                    Read Now
                  </span>
                  <Image src={blogChevron} width={7} height={12} alt="chevron right" />
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
