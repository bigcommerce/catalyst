'use client';

import { SiFacebook, SiLinkedin, SiPinterest, SiX } from '@icons-pack/react-simple-icons';
import { Mail, Printer } from 'lucide-react';

interface SharingLinksProps {
  blogPostId: string;
  blogPostImageUrl?: string;
  blogPostTitle?: string;
  vanityUrl?: string;
}

export const SharingLinks = ({
  blogPostId,
  /* TODO: use default image */
  blogPostImageUrl = '',
  blogPostTitle = '',
  vanityUrl = '',
}: SharingLinksProps) => {
  const encodedTitle = encodeURIComponent(blogPostTitle);
  const encodedUrl = encodeURIComponent(`${vanityUrl}/blog/${blogPostId}/`);

  return (
    <div className="mb-10 flex items-center [&>*:not(:last-child)]:mr-2.5">
      <h3 className="text-h5">Share</h3>
      <a
        href={`https://facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiFacebook size={24} title="Facebook" />
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_self"
      >
        <Mail size={24}>
          <title>Email</title>
        </Mail>
      </a>
      <button
        onClick={() => {
          window.print();

          return false;
        }}
        type="button"
      >
        <Printer size={24}>
          <title>Print</title>
        </Printer>
      </button>
      <a
        href={`https://twitter.com/intent/tweet/?text=${encodedTitle}&url=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiX size={24} title="X" />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedTitle}&source=${encodedUrl}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiLinkedin size={24} title="LinkedIn" />
      </a>
      <a
        href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${blogPostImageUrl}&description=${encodedTitle}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <SiPinterest height={24} title="Pinterest" width={24} />
      </a>
    </div>
  );
};
