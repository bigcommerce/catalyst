'use client';

import React, { ReactNode, useRef, useEffect, useState } from 'react';

interface StickyScrollProps {
  children: ReactNode;
  className?: string;
  containerHeight?: string;
}

const StickyScroll = ({
  children,
  className = '',
  containerHeight = 'xl:h-[752px]',
}: StickyScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrollComplete, setIsScrollComplete] = useState(false);
  const isScrolling = useRef(false);
  const lastScrollY = useRef(0);
  const lastContainerScrollTop = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;

    const scrollToTop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      const step = () => {
        const currentScroll = container.scrollTop;
        if (currentScroll <= 0) {
          container.scrollTop = 0;
          isScrolling.current = false;
          return;
        }
        const delta = Math.max(15, currentScroll * 0.1);
        container.scrollTop = currentScroll - delta;
        animationFrameId = requestAnimationFrame(step);
      };

      animationFrameId = requestAnimationFrame(step);
    };

    const handleScroll = () => {
      if (window.innerWidth < 1200 || isScrolling.current) return;

      const scrollY = window.scrollY;
      const containerMaxScroll = container.scrollHeight - container.clientHeight;
      const isScrollingDown = scrollY > lastScrollY.current;
      const currentContainerScroll = container.scrollTop;

      // Detect scrollbar usage by checking container scroll position change
      const isUsingScrollbar =
        Math.abs(currentContainerScroll - lastContainerScrollTop.current) > 0;
      lastContainerScrollTop.current = currentContainerScroll;

      if (isUsingScrollbar) {
        if (!isScrollingDown && currentContainerScroll < lastContainerScrollTop.current) {
          // User is scrolling up using scrollbar
          scrollToTop();
        }
        return;
      }

      if (!isScrollComplete) {
        isScrolling.current = true;

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        // Reset page scroll position
        window.scrollTo(0, 0);

        // Scroll container
        const step = () => {
          const currentScroll = container.scrollTop;
          if (isScrollingDown) {
            const newScroll = Math.min(containerMaxScroll, currentScroll + 15);
            if (newScroll >= containerMaxScroll) {
              container.scrollTop = containerMaxScroll;
              setIsScrollComplete(true);
              isScrolling.current = false;
              return;
            }
            container.scrollTop = newScroll;
          } else {
            scrollToTop();
            return;
          }
          animationFrameId = requestAnimationFrame(step);
        };

        animationFrameId = requestAnimationFrame(step);
      } else if (scrollY === 0) {
        setIsScrollComplete(false);
        scrollToTop();
      }

      lastScrollY.current = scrollY;
    };

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 1200) return;

      const containerMaxScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;
      const isScrollingUp = e.deltaY < 0;

      if (!isScrollComplete) {
        e.preventDefault();

        if (isScrollingUp) {
          scrollToTop();
        } else {
          const newPosition = currentScroll + e.deltaY;
          if (newPosition >= 0 && newPosition <= containerMaxScroll) {
            container.scrollTop = newPosition;
          } else if (newPosition > containerMaxScroll) {
            container.scrollTop = containerMaxScroll;
            setIsScrollComplete(true);
          }
        }
      } else if (window.scrollY === 0 && isScrollingUp) {
        e.preventDefault();
        setIsScrollComplete(false);
        scrollToTop();
      }
    };

    // Add scroll event listener to container
    const handleContainerScroll = () => {
      const currentScroll = container.scrollTop;
      if (currentScroll < lastContainerScrollTop.current) {
        // Scrolling up using scrollbar
        scrollToTop();
      }
      lastContainerScrollTop.current = currentScroll;
    };

    container.addEventListener('scroll', handleContainerScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScrollComplete]);

  return (
    <div
      ref={containerRef}
      className={`relative h-[752px] w-full overflow-y-auto overflow-x-hidden will-change-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      style={{
        scrollBehavior: 'auto',
      }}
    >
      {children}
    </div>
  );
};

export const DetailsWrapper = ({ children }: { children: ReactNode }) => (
  <div className="relative">
    <StickyScroll className="sticky top-8">{children}</StickyScroll>
  </div>
);

export default DetailsWrapper;
