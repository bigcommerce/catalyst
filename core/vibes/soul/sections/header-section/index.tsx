'use client';

import { forwardRef, useEffect, useState } from 'react';
import Headroom from 'react-headroom';

import { Banner } from '@/vibes/soul/primitives/banner';
import { Navigation } from '@/vibes/soul/primitives/navigation';
import { Box, Link, Icon, Heading, Paragraph, Section } from '@alto-avios/alto-ui';

interface Props {
  navigation: React.ComponentPropsWithoutRef<typeof Navigation>;
  banner?: React.ComponentPropsWithoutRef<typeof Banner>;
}

export const HeaderSection = forwardRef<React.ComponentRef<'div'>, Props>(
  ({ navigation, banner }, ref) => {
    const [bannerElement, setBannerElement] = useState<HTMLElement | null>(null);
    const [bannerHeight, setBannerHeight] = useState(0);
    const [isFloating, setIsFloating] = useState(false);

    console.log('HeaderSection', bannerElement);

    useEffect(() => {
      if (!bannerElement) return;

      const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          setBannerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(bannerElement);

      return () => {
        resizeObserver.disconnect();
      };
    }, [bannerElement]);

    return (
      <div ref={ref}>
        <Section backgroundColour="accentDeep">
          <div className="flex items-center justify-end gap-4 p-2">
            {/* Login/Register Section */}
            <div className="flex items-center gap-2">
              <Icon iconName="user" className="text-foreground-white-primary" />
              <Paragraph size="md" fgColor="accentOnVibrant">
                Login/register
              </Paragraph>
              <Icon iconName="angle-down" className="text-foreground-white-primary" />
            </div>

            {/* Separator */}
            <Paragraph fgColor="accentOnVibrant">|</Paragraph>

            {/* Get the most of Avios (NO ARROW) */}
            <Link href="#" className="text-foreground-white-primary underline">
              Get the most of Avios
            </Link>
          </div>
        </Section>
        {banner && <Banner ref={setBannerElement} {...banner} />}
        <Headroom
          onUnfix={() => setIsFloating(false)}
          onUnpin={() => setIsFloating(true)}
          pinStart={bannerHeight}
        >
          <div className="p-2">
            <Navigation {...navigation} isFloating={isFloating} />
          </div>
        </Headroom>
      </div>
    );
  },
);

HeaderSection.displayName = 'HeaderSection';
