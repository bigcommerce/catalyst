'use client';

import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { forwardRef, ReactNode, useCallback, useEffect, useState } from 'react';

type Props = {
  children: ReactNode;
  hideDismiss?: boolean;
  onDismiss?: () => void;
  className?: string;
};

export const Banner = forwardRef<React.ComponentRef<'div'>, Props>(
  ({ children, hideDismiss, className, onDismiss }, ref) => {
    const [banner, setBanner] = useState({ dismissed: false, initialized: false });

    useEffect(() => {
      const hidden = localStorage.getItem('hidden-banner') === 'true';

      setBanner({ dismissed: hidden, initialized: true });
    }, []);

    const hideBanner = useCallback(() => {
      setBanner((prev) => ({ ...prev, dismissed: true }));
      localStorage.setItem('hidden-banner', 'true');
      onDismiss?.();
    }, [onDismiss]);

    if (!banner.initialized) return null;

    return (
      <div
        className={clsx(
          'relative w-full overflow-hidden bg-primary transition-all duration-300 ease-in @container',
          banner.dismissed ? 'pointer-events-none max-h-0' : 'max-h-32',
          className,
        )}
        id="announcement-bar"
        ref={ref}
      >
        <p className="p-3 pr-12 text-sm text-foreground @xl:px-12 @xl:text-center @xl:text-base">
          {children}
        </p>

        {!hideDismiss && (
          <button
            aria-label="Dismiss banner"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-content-center rounded-full text-foreground/50 transition-colors duration-300 hover:bg-background/40 hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              hideBanner();
            }}
          >
            <X absoluteStrokeWidth size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    );
  },
);
