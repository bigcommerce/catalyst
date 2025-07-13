'use client';

import { clsx } from 'clsx';
import { ForwardedRef, forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --banner-focus: hsl(var(--foreground));
 *   --banner-background: hsl(var(--primary));
 *   --banner-text: hdl(var(--foreground));
 *   --banner-close-icon: hsl(var(--foreground)/50%);
 *   --banner-close-icon-hover: hdl(var(--foreground));
 *   --banner-close-background: transparent;
 *   --banner-close-background-hover: hsl(var(--background)/40%);
 * }
 * ```
 */
export const Banner = forwardRef(
  ({
    className,
    centerText,
    rightText,
    links,
    show,
  }: {
    show?: boolean;
    className?: string;
    centerText?: string;
    rightText?: {
      text: string;
      link: { href: string; target?: string };
    };
    links?: Array<{
      label: string;
      link: { href: string; target?: string };
    }>;
  }) => {
    return (
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-[#0a2656] transition-all duration-300 ease-in @container',
          !show ? 'max-h-0' : 'max-h-16',
          className,
        )}
        id="announcement-bar"
      >
        <div className="mx-auto max-w-screen-2xl">
          <div className="flex w-full flex-row items-center justify-between gap-2 px-6 py-3">
            {/* Left: Links (hidden on xl and below, visible on 2xl+) */}
            <div className="hidden flex-row gap-4 text-base font-bold text-white @2xl:flex">
              {links?.map((item, idx) => (
                <>
                  <a
                    key={idx}
                    href={item.link.href}
                    className="text-base font-bold text-white transition-colors duration-200 hover:underline"
                    target={item.link.target || '_blank'}
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </a>
                  {idx < links.length - 1 && (
                    <span className="mx-2 text-base font-bold text-white">|</span>
                  )}
                </>
              ))}
            </div>

            {/* Center: Center Text (always visible) */}
            <div className="flex flex-1 justify-center">
              {centerText && (
                <span className="truncate text-center text-base font-bold text-white">
                  {centerText}
                </span>
              )}
            </div>

            {/* Right: Right Text (hidden on xl and below, visible on 2xl+) */}
            <div className="hidden flex-row items-center gap-2 text-base font-bold text-white @2xl:flex">
              {rightText?.text && rightText?.link?.href && (
                <a
                  href={rightText.link.href}
                  className="text-base font-bold text-white transition-colors duration-200 hover:underline"
                  target={rightText.link.target || '_blank'}
                  rel="noopener noreferrer"
                >
                  {rightText.text}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Banner.displayName = 'Banner';
