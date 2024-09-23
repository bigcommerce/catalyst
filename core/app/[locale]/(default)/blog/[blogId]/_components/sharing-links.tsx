import { SiFacebook, SiLinkedin, SiPinterest, SiX } from '@icons-pack/react-simple-icons';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';

import { PrintButton } from './print-button';

export const SharingLinksFragment = graphql(`
  fragment SharingLinksFragment on Site {
    content {
      blog {
        post(entityId: $entityId) {
          entityId
          thumbnailImage {
            url: urlTemplate(lossy: true)
          }
          seo {
            pageTitle
          }
        }
      }
    }
    settings {
      url {
        vanityUrl
      }
    }
  }
`);

interface Props {
  data: FragmentOf<typeof SharingLinksFragment>;
}

export const SharingLinks = ({ data }: Props) => {
  const t = useTranslations('Blog.SharingLinks');

  const blogPost = data.content.blog?.post;

  if (!blogPost) {
    return null;
  }

  const encodedTitle = encodeURIComponent(blogPost.seo.pageTitle);
  const encodedUrl = encodeURIComponent(
    `${data.settings?.url.vanityUrl || ''}/blog/${blogPost.entityId}/`,
  );

  return (
    <div className="mb-10 flex items-center [&>*:not(:last-child)]:me-2.5">
      <h3 className="text-xl font-bold lg:text-2xl">{t('share')}</h3>
      <a
        className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        href={`https://facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiFacebook size={24} title="Facebook" />
      </a>
      <a
        className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_self"
      >
        <Mail size={24}>
          <title>{t('email')}</title>
        </Mail>
      </a>
      <PrintButton />

      <a
        className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        href={`https://twitter.com/intent/tweet/?text=${encodedTitle}&url=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiX size={24} title="X" />
      </a>
      <a
        className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedTitle}&source=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiLinkedin size={24} title="LinkedIn" />
      </a>
      <a
        className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${blogPost.thumbnailImage?.url || ''}&description=${encodedTitle}`} // TODO: use default image if thumbnailImage is not available
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiPinterest height={24} title="Pinterest" width={24} />
      </a>
    </div>
  );
};
