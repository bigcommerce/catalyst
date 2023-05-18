import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';

import { bcFetch } from '../../../lib/fetcher';
import { FacebookIcon } from '../../icons/Facebook';
import { InstagramIcon } from '../../icons/Instagram';
import { LinkedInIcon } from '../../icons/LinkedIn';
import { PinterestIcon } from '../../icons/Pinterest';
import { TwitterIcon } from '../../icons/Twitter';
import { YouTubeIcon } from '../../icons/YouTube';

import { getSocialIconsQuery } from './query';

const ICON_MAP: Record<string, React.FC<ComponentPropsWithoutRef<'svg'>>> = {
  Facebook: FacebookIcon,
  Twitter: TwitterIcon,
  Pinterest: PinterestIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  YouTube: YouTubeIcon,
};

export const SocialIcons = async () => {
  const { data } = await bcFetch({
    query: getSocialIconsQuery,
  });

  if (!data.site.settings || data.site.settings.socialMediaLinks.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-4 mt-8">
      {data.site.settings.socialMediaLinks.map((link) => {
        const Icon = ICON_MAP[link.name];

        if (!Icon) {
          return null;
        }

        return (
          <li key={link.name}>
            <Link href={link.url}>
              <Icon />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
