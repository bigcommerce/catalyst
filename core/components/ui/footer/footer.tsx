import { Fragment, ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { Locale } from './locale';

interface Image {
  altText: string;
  src: string;
}

interface Link {
  href: string;
  label: string;
}

interface Section {
  title?: string;
  links: Link[];
}

interface SocialMediaLink {
  href: string;
  icon: ReactNode;
}

interface ContactInformation {
  address?: string;
  phone?: string;
}

interface Props {
  className?: string;
  contactInformation?: ContactInformation;
  copyright?: string;
  logo?: string | Image;
  paymentIcons?: ReactNode[];
  sections: Section[];
  socialMediaLinks?: SocialMediaLink[];
}

const Footer = ({
  className,
  contactInformation,
  copyright,
  logo,
  paymentIcons,
  sections,
  socialMediaLinks,
  ...props
}: Props) => (
  <footer className={cn('2xl:container 2xl:mx-auto', className)} {...props}>
    <section className="flex flex-col gap-8 border-t border-gray-200 px-4 py-10 sm:px-10 md:flex-row lg:gap-4 lg:px-12 2xl:px-0">
      <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-4 text-lg font-bold">{section.title}</h3>
            <ul className="flex flex-col gap-4">
              {section.links.map((link) => (
                <li key={link.href}>
                  <CustomLink href={link.href}>{link.label}</CustomLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-4 md:order-first md:grow">
        {Boolean(logo) && (
          <h3>
            {typeof logo === 'object' ? (
              <BcImage
                alt={logo.altText}
                className="max-h-16 object-contain"
                height={32}
                priority
                src={logo.src}
                width={155}
              />
            ) : (
              <span className="truncate text-2xl font-black">{logo}</span>
            )}
          </h3>
        )}
        {Boolean(contactInformation) && (
          <>
            <address className="not-italic">
              {contactInformation?.address?.split('\n').map((line) => (
                <Fragment key={line}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </address>
            {Boolean(contactInformation?.phone) && (
              <a
                className="hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                href={`tel:${contactInformation?.phone}`}
              >
                <p>{contactInformation?.phone}</p>
              </a>
            )}
          </>
        )}
        {Boolean(socialMediaLinks) && (
          <nav aria-label="Social media links" className="block">
            <ul className="flex gap-6">
              {socialMediaLinks?.map((link) => (
                <li key={link.href}>
                  <CustomLink className="inline-block" href={link.href} target="_blank">
                    {link.icon}
                  </CustomLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
    <section className="flex flex-col gap-10 border-t border-gray-200 px-4 py-8 sm:gap-8 sm:px-10 sm:py-6 lg:hidden lg:px-12 2xl:px-0">
      <Locale />

      <div className="flex w-full flex-col justify-between gap-10 sm:flex-row sm:gap-8">
        <div className="flex gap-6">{paymentIcons}</div>
        <p className="text-gray-500 sm:order-first">{copyright}</p>
      </div>
    </section>

    <section className="hidden justify-between gap-8 border-t border-gray-200 px-4 py-6 sm:px-10 lg:flex lg:px-12 2xl:px-0">
      <p className="text-gray-500 sm:order-first">{copyright}</p>
      <div className="flex gap-8">
        <Locale />
        <div className="flex gap-6">{paymentIcons}</div>
      </div>
    </section>
  </footer>
);

Footer.displayName = 'Footer';

export { Footer };
