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
      link: { href: string };
    };
    links?: Array<{
      label: string;
      link: { href: string };
    }>;
  }) => {
    return (
      <div
        className={clsx(
          'bg-deepblue relative w-full overflow-hidden bg-[var(--banner-background,hsl(var(--primary)))] transition-all duration-300 ease-in @container',
          !show ? 'max-h-0' : 'max-h-32',
          className,
        )}
        id="announcement-bar"
      >
        <div className="flex h-full w-full flex-row items-center justify-between gap-2 px-4 py-2 @xl:px-12">
          {/* Left: Links (hidden on small screens) */}
          <div className="hidden flex-row gap-4 text-sm text-white md:flex">
            {links?.map((item, idx) => (
              <>
                <a
                  key={idx}
                  href={item.link.href}
                  className="text-white/80 transition-colors duration-200 hover:text-white hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.label}
                </a>
                {idx < links.length - 1 && <span className="mx-2 text-white/40">|</span>}
              </>
            ))}
          </div>

          {/* Center: Center Text (always visible) */}
          <div className="flex flex-1 justify-center">
            {centerText && (
              <span className="truncate text-center text-sm font-medium text-white md:text-base">
                {centerText}
              </span>
            )}
          </div>

          {/* Right: Right Text (hidden on small screens) */}
          <div className="hidden flex-row items-center gap-2 text-sm text-white md:flex">
            {rightText?.text && rightText?.link?.href && (
              <a
                href={rightText.link.href}
                className="font-semibold text-white/80 transition-colors duration-200 hover:text-white hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {rightText.text}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Banner.displayName = 'Banner';
