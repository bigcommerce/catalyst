'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';

type TextBox = {
  text: string;
  link?: { href: string; target?: '_self' | '_blank' };
  size?: number;
  underline?: boolean;
  color?: string;
  customColor?: string;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
};

type Props = {
  className?: string;
  buttons: TextBox[];
};

export function FlexTextBoxGroup({ className, buttons }: Props) {

  return (
    <div className={clsx(className, 'flex flex-col items-center text-center sm:inline')}>
      {buttons.map((button, i) => (
        <div
          key={i}
          className={clsx(
            'inline text-[16px] font-normal leading-[32px] tracking-[0.5px] first:font-bold last:font-bold [@media_(width<640px)]:!m-0',
          )}
          style={{
            backgroundColor: button.color || 'transparent',
            margin: `${button.margin?.top || 0}px ${button.margin?.right || 0}px ${button.margin?.bottom || 0}px ${button.margin?.left || 0}px`,
          }}
        >
          {button.link ? (
            <a
              href={button.link.href}
              target={button.link.target || '_self'}
              rel="noopener noreferrer"
              className={clsx('hover:text-blue-700', { underline: button.underline })}
              style={{ color: button.customColor || '#E7F5F8', fontSize: `${button.size || 16}px` }}
            >
              {button.text}
            </a>
          ) : (
            <span
              style={{ color: button.customColor || '#000', fontSize: `${button.size || 16}px` }}
            >
              {button.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
