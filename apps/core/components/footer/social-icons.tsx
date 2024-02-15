import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';

import { getStoreSettings } from '~/client/queries/get-store-settings';
import { Link } from '~/components/link';

const socialIconNames = [
  'Facebook',
  'Twitter',
  'X',
  'Pinterest',
  'Instagram',
  'LinkedIn',
  'YouTube',
];

const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case 'Facebook':
      return <SiFacebook title="Facebook" />;

    case 'Twitter':
    case 'X':
      return <SiX title="X" />;

    case 'Pinterest':
      return <SiPinterest title="Pinterest" />;

    case 'Instagram':
      return <SiInstagram title="Instagram" />;

    case 'LinkedIn':
      return <SiLinkedin title="LinkedIn" />;

    case 'YouTube':
      return <SiYoutube title="YouTube" />;

    default:
      return null;
  }
};

export const SocialIcons = async () => {
  const settings = await getStoreSettings();

  const socialMediaLinks = settings?.socialMediaLinks;

  if (!socialMediaLinks || socialMediaLinks.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Social media links" className="block">
      <ul className="flex gap-6">
        {socialMediaLinks.map((link) => {
          if (!socialIconNames.includes(link.name)) {
            return null;
          }

          return (
            <Link className="inline-block" href={link.url} key={link.name}>
              <SocialIcon name={link.name} />
            </Link>
          );
        })}
      </ul>
    </nav>
  );
};
