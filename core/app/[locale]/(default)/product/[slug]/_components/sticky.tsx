import React, { ReactNode, useRef, useEffect } from 'react';

interface ScrollContainerProps {
  children: ReactNode;
  height?: string;
  className?: string;
}

const ScrollContainer = ({
  children,
  height = 'xl:h-[752px]',
  className = '',
}: ScrollContainerProps) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const lastScrollDirectionRef = useRef<'up' | 'down'>('down');

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (window.innerWidth < 1200) return;

      const container = scrollableRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const isOverContainer =
        mouseX >= containerRect.left &&
        mouseX <= containerRect.right &&
        mouseY >= containerRect.top &&
        mouseY <= containerRect.bottom;

      const containerMaxScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;
      const scrollAmount = e.deltaY * 2;

      const isScrollingUp = e.deltaY < 0;
      if (
        isOverContainer ||
        (!isOverContainer && (currentScroll < containerMaxScroll || isScrollingUp))
      ) {
        if (
          isScrollingUp &&
          lastScrollDirectionRef.current === 'down' &&
          currentScroll > containerMaxScroll / 2
        ) {
          container.scrollTo({ top: 0, behavior: 'auto' });
          return;
        }

        lastScrollDirectionRef.current = isScrollingUp ? 'up' : 'down';
        container.scrollTo({
          top: Math.max(0, Math.min(containerMaxScroll, currentScroll + scrollAmount)),
          behavior: 'auto',
        });
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, []);

  return (
    <div
      ref={scrollableRef}
      className={`w-full xl:overflow-y-scroll ${height} ${className} [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      {children}
    </div>
  );
};

export default ScrollContainer;
