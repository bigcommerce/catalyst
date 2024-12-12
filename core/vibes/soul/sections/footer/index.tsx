import { clsx } from 'clsx';
import { forwardRef, ReactNode, type Ref } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

interface Image {
  src: string;
  alt: string;
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
  logo?: Streamable<string | Image | null>;
  sections: Streamable<Section[]>;
  copyright?: Streamable<string | null>;
  contactInformation?: Streamable<ContactInformation | null>;
  paymentIcons?: Streamable<ReactNode[] | null>;
  socialMediaLinks?: Streamable<SocialMediaLink[] | null>;
  className?: string;
  logoHref?: string;
  logoLabel?: string;
}

export const Footer = forwardRef(function Footer(
  {
    logo: streamableLogo,
    sections: streamableSections,
    contactInformation: streamableContactInformation,
    paymentIcons: streamablePaymentIcons,
    socialMediaLinks: streamableSocialMediaLinks,
    copyright: streamableCopyright,
    className,
    logoHref = '#',
    logoLabel = 'Home',
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
            {/* Logo Information */}
            <Stream
              fallback={
                <div className="mb-2 flex h-10 animate-pulse items-center text-2xl">
                  <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                </div>
              }
              value={streamableLogo}
            >
              {(logo) => {
                if (logo != null && typeof logo === 'string') {
                  return (
                    <Link
                      aria-label={logoLabel}
                      className="relative mb-2 inline-block h-10 w-full max-w-56 rounded-lg ring-primary focus-visible:outline-0 focus-visible:ring-2"
                      href={logoHref}
                    >
                      <span className="whitespace-nowrap font-heading text-2xl font-semibold">
                        {logo}
                      </span>
                    </Link>
                  );
                }

                if (logo != null && typeof logo === 'object' && logo.src !== '') {
                  return (
                    <Link
                      aria-label={logoLabel}
                      className="relative mb-2 inline-block h-10 w-full max-w-56 rounded-lg ring-primary focus-visible:outline-0 focus-visible:ring-2"
                      href={logoHref}
                    >
                      <Image
                        alt={logo.alt}
                        className="object-contain object-left"
                        fill
                        sizes="400px"
                        src={logo.src}
                      />
                    </Link>
                  );
                }
              }}
            </Stream>

            {/* Contact Information */}
            <Stream
              fallback={
                <div className="animate-pulse text-lg @lg:text-xl">
                  <div className="flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                  </div>
                  <div className="flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[15ch] rounded bg-contrast-100" />
                  </div>
                  <div className="flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[12ch] rounded bg-contrast-100" />
                  </div>
                </div>
              }
              value={streamableContactInformation}
            >
              {(contactInformation) => {
                if (contactInformation?.address != null || contactInformation?.phone != null) {
                  return (
                    <div className="text-lg font-medium @lg:text-xl">
                      <h3 className="text-contrast-300">Contact Us</h3>
                      <div>
                        {contactInformation.address != null &&
                          contactInformation.address !== '' && <p>{contactInformation.address}</p>}
                        {contactInformation.phone != null && contactInformation.phone !== '' && (
                          <p>{contactInformation.phone}</p>
                        )}
                      </div>
                    </div>
                  );
                }
              }}
            </Stream>

            {/* Social Media Links */}
            <Stream
              fallback={
                <div className="flex animate-pulse items-center gap-3 pt-8 @3xl:pt-10">
                  <div className="h-8 w-8 rounded-full bg-contrast-100" />
                  <div className="h-8 w-8 rounded-full bg-contrast-100" />
                  <div className="h-8 w-8 rounded-full bg-contrast-100" />
                  <div className="h-8 w-8 rounded-full bg-contrast-100" />
                </div>
              }
              value={streamableSocialMediaLinks}
            >
              {(socialMediaLinks) => {
                if (socialMediaLinks != null) {
                  return (
                    <div className="flex flex-wrap items-center gap-3 pt-8 @3xl:pt-10">
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
                  );
                }
              }}
            </Stream>
          </div>

          {/* Footer Columns of Links */}
          <Stream
            fallback={
              <div className="grid w-full flex-1 animate-pulse gap-y-8 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] @xl:gap-y-10">
                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="h-[1ex] w-[10ch] rounded bg-contrast-100" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            }
            value={streamableSections}
          >
            {(sections) => {
              if (sections.length > 0) {
                return (
                  <div className="grid w-full flex-1 gap-y-8 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] @xl:gap-y-10">
                    {sections.map(({ title, links }, i) => (
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
                    ))}
                  </div>
                );
              }
            }}
          </Stream>
        </div>

        <div className="flex flex-col-reverse items-start gap-y-8 pt-16 @3xl:flex-row @3xl:items-center @3xl:pt-20">
          {/* Copyright */}
          <Stream
            fallback={
              <div className="flex h-[1lh] flex-1 animate-pulse items-center text-sm">
                <span className="h-[1ex] w-[40ch] rounded-sm bg-contrast-100" />
              </div>
            }
            value={streamableCopyright}
          >
            {(copyright) => {
              if (copyright != null) {
                return <p className="flex-1 text-sm text-contrast-400">{copyright}</p>;
              }
            }}
          </Stream>

          {/* Payment Icons */}
          <Stream
            fallback={
              <div className="flex animate-pulse flex-wrap gap-2">
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
                <div className="h-6 w-[2.1875rem] rounded bg-contrast-100" />
              </div>
            }
            value={streamablePaymentIcons}
          >
            {(paymentIcons) => {
              if (paymentIcons != null) {
                return <div className="flex flex-wrap gap-2">{paymentIcons}</div>;
              }
            }}
          </Stream>
        </div>
      </div>
    </footer>
  );
});
