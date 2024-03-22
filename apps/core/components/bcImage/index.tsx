'use client';

import Image from 'next/image';
import bcCdnImageLoader from '~/lib/cdn-image-loader';


export const BcImage = ({ ...props }) => {
  return <Image loader={bcCdnImageLoader} {...props} />;
};
