import { MailIcon, PhoneIcon } from 'lucide-react';

import { Logo } from '@/ui/primitives/logo';
import { SectionLayout } from '@/ui/sections/section-layout';
import { Link } from '~/components/link';

interface Image {
  src: string;
  alt: string;
}

interface Props {
  className?: string;
  logo?: string | Image | null;
  title?: string;
  statusMessage?: string;
  contactText?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export function Maintenance({
  className = '',
  logo,
  title = 'We are down for maintenance',
  statusMessage = "Sorry for the inconvenience, we're currently working on improving our store.",
  contactText = 'Contact us',
  contactPhone,
  contactEmail,
}: Props) {
  return (
    <SectionLayout className={className}>
      <div className="mx-auto my-auto max-w-3xl px-4 @xl:px-6 @4xl:px-8">
        {Boolean(logo) && (
          <div className="mb-20">
            <Logo height={40} href="/" logo={logo} width={200} />
          </div>
        )}

        <h1 className="font-heading mb-3 text-3xl leading-none font-medium @xl:text-4xl @4xl:text-5xl">
          {title}
        </h1>
        <p className="text-md text-contrast-500 @xl:text-lg @4xl:text-xl">{statusMessage}</p>

        {(Boolean(contactPhone) || Boolean(contactEmail)) && (
          <div className="mt-20">
            <div className="mb-6 text-lg leading-none font-medium @xl:text-xl @4xl:text-2xl">
              {contactText}
            </div>
            {Boolean(contactEmail) && (
              <div>
                <Link
                  className="text-md my-2 inline-flex flex-row items-center font-medium text-[var(--footer-link,hsl(var(--contrast-400)))] ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 hover:text-[var(--footer-link-hover,hsl(var(--foreground)))] focus-visible:ring-2 focus-visible:outline-0 @xl:text-lg"
                  href={`mailto:${contactEmail}`}
                >
                  <span>
                    <MailIcon />
                  </span>
                  <span className="ml-2 flex-1">{contactEmail}</span>
                </Link>
              </div>
            )}
            {Boolean(contactPhone) && (
              <div>
                <Link
                  className="text-md my-2 inline-flex flex-row items-center font-medium text-[var(--footer-link,hsl(var(--contrast-400)))] ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 hover:text-[var(--footer-link-hover,hsl(var(--foreground)))] focus-visible:ring-2 focus-visible:outline-0 @xl:text-lg"
                  href={`tel:${contactPhone}`}
                >
                  <span>
                    <PhoneIcon />
                  </span>
                  <span className="ml-2 flex-1">{contactPhone}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
