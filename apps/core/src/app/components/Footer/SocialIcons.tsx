import { getStoreSettings } from '@bigcommerce/catalyst-client';
import { FooterContactInformationSocials } from '@bigcommerce/reactant/Footer';
import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';

import { FacebookIcon } from '../SocialIcons/Facebook';
import { InstagramIcon } from '../SocialIcons/Instagram';
import { LinkedInIcon } from '../SocialIcons/LinkedIn';
import { PinterestIcon } from '../SocialIcons/Pinterest';
import { TwitterIcon } from '../SocialIcons/Twitter';
import { YouTubeIcon } from '../SocialIcons/YouTube';

const ICON_MAP: Record<string, React.FC<ComponentPropsWithoutRef<'svg'>>> = {
  Facebook: FacebookIcon,
  Twitter: TwitterIcon,
  Pinterest: PinterestIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedInIcon,
  YouTube: YouTubeIcon,
};

export const SocialIcons = async () => {
  const settings = await getStoreSettings();

  const socialMediaLinks = settings?.socialMediaLinks;

  if (!socialMediaLinks || socialMediaLinks.length === 0) {
    return null;
  }

  return (
    <FooterContactInformationSocials>
      {socialMediaLinks.map((link) => {
        const Icon = ICON_MAP[link.name];

        if (!Icon) {
          return null;
        }

        return (
          <Link href={link.url} key={link.name}>
            <Icon />
          </Link>
        );
      })}
    </FooterContactInformationSocials>
  );
};
