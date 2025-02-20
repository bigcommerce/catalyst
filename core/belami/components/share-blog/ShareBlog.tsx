// ShareBlog.tsx
import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import blogChevron from '~/public/home/blogChevron.svg';
import blogShare from '~/public/home/blogShare.svg';
import Image from 'next/image';
import Link from 'next/link';


type SocialLink = {
  name: string;
  url: { href: string; target?: '_self' | '_blank' };
  iconUrl: any;
};

type ShareBlogProps = {
  className?: string;
  socialLinks: SocialLink[];
};

const ShareBlog = ({ className, socialLinks }: ShareBlogProps) => {
  return (
    <div className={className}>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Image className='cursor-pointer w-fit' src={blogShare} width={16} height={22} alt='Share Button' />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="center"
            side='top'
            sideOffset={5}
            collisionPadding={10}
            className="bg-white  rounded-[5px] shadow-lg flex flex-row  outline-none items-center"
          >
            {socialLinks.map(({ name, url, iconUrl }) => (
               <Link
               key={name}
               href={url.href}
               target={url.target || '_self'}
               rel="noopener noreferrer"
               className='outline-none py-2 px-3  transition-all duration-300 ease-in-out hover:bg-brand-50'
             >
                <Image src={iconUrl || blogChevron} alt={name} width={24} height={24} className='aspect-square min-w-[24px] min-h-[24px] object-contain' />
                </Link>
            ))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};

export default ShareBlog;