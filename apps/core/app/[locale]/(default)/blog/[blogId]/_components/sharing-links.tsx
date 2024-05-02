import { SiFacebook, SiLinkedin, SiPinterest, SiX } from '@icons-pack/react-simple-icons';
import { Mail } from 'lucide-react';

import { FragmentOf, graphql } from '~/client/graphql';

import { PrintButton } from './print-button';

export const SharingLinksFragment = graphql(`
  fragment SharingLinksFragment on BlogPost {
    entityId
    thumbnailImage {
      url: urlTemplate
    }
    seo {
      pageTitle
    }
  }
`);

interface Props {
  blogPost: FragmentOf<typeof SharingLinksFragment>;
  vanityUrl?: string;
}

export const SharingLinks = ({ blogPost, vanityUrl = '' }: Props) => {
  const encodedTitle = encodeURIComponent(blogPost.seo.pageTitle);
  const encodedUrl = encodeURIComponent(`${vanityUrl}/blog/${blogPost.entityId}/`);

  return (
    <div className="mb-10 flex items-center [&>*:not(:last-child)]:me-2.5">
      <h3 className="text-xl font-bold lg:text-2xl">Share</h3>
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
          <title>Email</title>
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
