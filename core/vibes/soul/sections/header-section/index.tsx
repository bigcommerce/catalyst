'use client';

import { forwardRef, useEffect, useState } from 'react';
import Headroom from 'react-headroom';

import { Banner } from '@/vibes/soul/primitives/banner';
import { Navigation } from '@/vibes/soul/primitives/navigation';

type Props = {
  navigation: Omit<React.ComponentPropsWithoutRef<typeof Navigation>, 'onDismiss'>;
  banner?: React.ComponentPropsWithoutRef<typeof Banner>;
};

export const HeaderSection = forwardRef<React.ComponentRef<'div'>, Props>(
  ({ navigation, banner }, ref) => {
    const [bannerElement, setBannerElement] = useState<HTMLElement | null>(null);
    const [bannerHeight, setBannerHeight] = useState(0);

    useEffect(() => {
      if (bannerElement) {
        setBannerHeight(bannerElement.getBoundingClientRect().height);
      }
    }, [bannerElement]);

    return (
      <div ref={ref}>
        {banner && (
          <Banner ref={setBannerElement} {...banner} onDismiss={() => setBannerHeight(0)} />
        )}
        <Headroom pinStart={bannerHeight}>
          <div className="p-2">
            <Navigation {...navigation} />
          </div>
        </Headroom>
      </div>
    );
  },
);

HeaderSection.displayName = 'HeaderSection';
