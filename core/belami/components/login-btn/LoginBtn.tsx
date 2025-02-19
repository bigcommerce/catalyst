import React from 'react';
import clsx from 'clsx';
import Link from 'next/link';

type TextBoxItem = {
  text: string;
  link: { href: string; target?: '_self' | '_blank' };
};

type Props = {
  className?: string;
  items: TextBoxItem[];
};

export function LoginBtn({ className, items }: Props) {
  return (
    <button
      className={clsx(
        'flex justify-center items-center p-[0px_10px] gap-[5px] h-[42px] box-border bg-white border border-[#B4DDE9] rounded-[3px] transition-all duration-300 ease-in-out hover:bg-brand-50 hover:shadow-md hover:border-brand-300',
        className
      )}
    >
      {items.map((item, index) => (
        <div key={index} className='h-full flex'>
          <Link
            href={item.link.href}
            target={item.link.target || '_self'}
            rel="noopener noreferrer"
            className="font-['Open_Sans'] font-medium text-[14px] leading-[32px] tracking-[1.25px] text-brand-700 py-[5px] h-full"
          >
            {item.text}
          </Link>
        </div>
      ))}
    </button>
  );
}
