import { clsx } from 'clsx';
import Image from 'next/image';
import { forwardRef, ReactNode, type Ref } from 'react';

import { Link } from '~/components/link';

type Image = {
  src: string;
  alt: string;
};

type Link = {
  href: string;
  label: string;
};

export type Section = {
  title?: string;
  links: Link[];
};

type SocialMediaLink = {
  href: string;
  icon: ReactNode;
};

type ContactInformation = {
  address?: string;
  phone?: string;
};

type Props = {
  logo?: string | Image;
  sections: Section[];
  copyright?: string;
  contactInformation?: ContactInformation;
  paymentIcons?: ReactNode[];
  socialMediaLinks?: SocialMediaLink[];
  className?: string;
};

export const Footer = forwardRef(function Footer(
  {
    logo,
    sections,
    contactInformation,
    paymentIcons,
    socialMediaLinks,
    copyright,
    className = '',
  }: Props,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <footer
      className={clsx(
        'border-b-4 border-t border-b-primary border-t-contrast-100 bg-background text-foreground @container',
        className,
      )}
      ref={ref}
    >
      <div className="mx-auto max-w-screen-2xl px-4 py-6 @xl:px-6 @xl:py-10 @4xl:px-8 @4xl:py-12">
        <div className="flex flex-col justify-between gap-x-8 gap-y-12 @3xl:flex-row">
          <div className="@3xl:w-1/3">
            {/* Contact Information */}
            {contactInformation?.address != null || contactInformation?.phone != null ? (
              <div className="text-xl font-medium @lg:text-2xl">
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
                      alt={logo.alt}
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
              <div className="flex items-center gap-3 pt-8 @3xl:pt-10">
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
          <div className="grid w-full flex-1 gap-y-8 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] @xl:gap-y-10">
            {sections.length > 0 &&
              sections.map(({ title, links }, i) => {
                return (
                  <div className="pr-8" key={i}>
                    {title != null && <span className="mb-3 block font-semibold">{title}</span>}

                    <ul>
                      {links.map((link, idx) => {
                        return (
                          <li key={idx}>
                            <Link
                              className="block rounded-lg py-2 text-sm font-medium opacity-50 ring-primary transition-opacity duration-300 hover:opacity-100 focus-visible:outline-0 focus-visible:ring-2"
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

        <div className="flex flex-col-reverse items-start gap-y-8 pt-16 @3xl:flex-row @3xl:items-center @3xl:pt-20">
          {copyright != null && copyright !== '' && (
            <p className="flex-1 text-sm text-contrast-400">{copyright}</p>
          )}

          {paymentIcons != null && <div className="flex flex-wrap gap-2">{paymentIcons}</div>}
        </div>
      </div>
    </footer>
  );
});
