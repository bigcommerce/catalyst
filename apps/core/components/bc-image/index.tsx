'use client';

import Image from 'next/image';
import { ComponentPropsWithRef } from 'react';

import bcCdnImageLoader from '~/lib/cdn-image-loader';

type NextImageProps = Omit<ComponentPropsWithRef<typeof Image>, 'quality'>;

interface BcImageOptions {
  lossy?: boolean;
}

type Props = NextImageProps & BcImageOptions;

export const BcImage = ({ ...props }: Props) => {
  return <Image loader={bcCdnImageLoader} {...props} />;
};
