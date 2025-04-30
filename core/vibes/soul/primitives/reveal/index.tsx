'use client';

import { clsx } from 'clsx';
import { ReactNode, useEffect, useRef, useState } from 'react';

import { AnimatedUnderline } from '@/vibes/soul/primitives/animated-underline';
import { Button } from '@/vibes/soul/primitives/button';

export interface RevealProps {
  variant?: 'underline' | 'button';
  showLabel?: string;
  hideLabel?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  maxHeight?: string;
}

export function Reveal({
  variant = 'underline',
  showLabel = 'Show more',
  hideLabel = 'Show less',
  defaultOpen = false,
  maxHeight = '10rem',
  children,
}: RevealProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasOverflow, setHasOverflow] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  function convertToPixels(value: string): number {
    const num = parseFloat(value);

    if (value.endsWith('rem')) {
      return num * 16; // Convert rem to pixels (1rem = 16px)
    }

    if (value.endsWith('px')) {
      return num;
    }

    return num;
  }

  useEffect(() => {
    function checkHeight() {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const maxHeightPx = convertToPixels(maxHeight);

        setHasOverflow(contentHeight > maxHeightPx);
      }
    }

    checkHeight();

    const resizeObserver = new ResizeObserver(checkHeight);

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxHeight]);

  return (
    <div className="relative">
      <div
        className={clsx(
          hasOverflow &&
            !isOpen &&
            '[mask-image:linear-gradient(to_top,transparent,black_50px,black_calc(100%-50px))]',
          'overflow-hidden',
        )}
        ref={contentRef}
        style={{ maxHeight: isOpen ? 'none' : maxHeight }}
      >
        {children}
      </div>
      {hasOverflow && (
        <div className={clsx('flex w-full items-end pt-4')}>
          {variant === 'underline' && (
            <button
              className="group/underline text-sm focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              type="button"
            >
              <AnimatedUnderline>{isOpen ? hideLabel : showLabel}</AnimatedUnderline>
            </button>
          )}
          {variant === 'button' && (
            <Button
              onClick={() => setIsOpen(!isOpen)}
              size="x-small"
              type="button"
              variant="tertiary"
            >
              {isOpen ? hideLabel : showLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
