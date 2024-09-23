import { clsx } from 'clsx';
import Image from 'next/image';
import { ReactNode } from 'react';

import { Link } from '~/components/link';

interface Image {
  src: string;
  altText: string;
}

interface Link {
  href: string;
  label: string;
}

export interface Section {
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
  logo?: string | Image;
  sections: Section[];
  copyright?: string;
  contactInformation?: ContactInformation;
  paymentIcons?: ReactNode[];
  socialMediaLinks?: SocialMediaLink[];
  className?: string;
}

export const Footer = function Footer({
  logo,
  sections,
  contactInformation,
  paymentIcons,
  socialMediaLinks,
  copyright,
  className = '',
}: Props) {
  return (
    <footer
      className={clsx(
        'border-b-[4px] border-b-primary bg-background text-foreground @container',
        className,
      )}
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="mx-3 flex flex-col justify-between gap-10 border-t border-t-contrast-100 pt-16 @xl:mx-6 @xl:py-20 @2xl:flex-row @5xl:mx-20">
          <div className="flex flex-col @2xl:w-1/3">
            {/* Contact Information */}
            {contactInformation?.address != null || contactInformation?.phone != null ? (
              <div className="text-[20px] font-medium @lg:text-2xl">
                <h3 className="text-contrast-300">Contact Us</h3>
                <div>
                  {contactInformation.address != null && contactInformation.address !== '' && (
                    <p>{contactInformation.address}</p>
                  )}
                  {contactInformation.phone != null && contactInformation.phone !== '' && (
                    <p>{contactInformation.phone}</p>
                  )}
                </div>
              </div>
            ) : (
              // Logo
              <Link
                className="relative inline-block h-10 w-full max-w-56 rounded-lg ring-primary focus-visible:outline-0 focus-visible:ring-2"
                href="#"
              >
                {typeof logo === 'string' ? (
                  <span className="whitespace-nowrap font-heading text-2xl font-semibold">
                    {logo}
                  </span>
                ) : (
                  logo?.src != null &&
                  logo.src !== '' && (
                    <Image
                      alt={logo.altText}
                      className="object-contain object-left"
                      fill
                      sizes="400px"
                      src={logo.src}
                    />
                  )
                )}
              </Link>
            )}

            {/* Social Media Links */}
            {socialMediaLinks != null && (
              <div className="mt-auto flex items-center gap-4 pb-2 pt-8">
                {socialMediaLinks.map(({ href, icon }, i) => {
                  return (
                    <Link
                      className="flex items-center justify-center rounded-lg fill-contrast-400 p-1 ring-primary transition-colors duration-300 ease-out hover:fill-foreground focus-visible:outline-0 focus-visible:ring-2"
                      href={href}
                      key={i}
                    >
                      {icon}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Columns of Links */}
          <div className="flex w-full flex-1 flex-grow flex-wrap gap-y-8 @lg:gap-y-10 @xl:justify-end">
            {sections.length > 0 &&
              sections.map(({ title, links }, i) => {
                return (
                  <div
                    className="flex-1 basis-full pr-10 text-[15px] last:pr-0 @sm:basis-1/3 @2xl:pr-10 @4xl:max-w-[170px] @4xl:basis-auto"
                    key={i}
                  >
                    {title != null && <span className="mb-8 block font-medium">{title}</span>}

                    <ul>
                      {links.map((link, idx) => {
                        return (
                          <li key={idx}>
                            <Link
                              className="block rounded-lg py-2 font-medium opacity-50 ring-primary transition-opacity duration-300 hover:opacity-100 focus-visible:outline-0 focus-visible:ring-2"
                              href={link.href}
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex flex-wrap-reverse justify-between gap-y-10 px-3 py-10 pb-20 @xl:px-6 @5xl:px-20">
          {/* Copyright */}
          {copyright != null && copyright !== '' && (
            <span className="block text-contrast-400">{copyright}</span>
          )}

          {/* Payement Icons */}
          {paymentIcons != null && <div className="ml-auto flex gap-2">{paymentIcons}</div>}
        </div>
      </div>
    </footer>
  );
};
