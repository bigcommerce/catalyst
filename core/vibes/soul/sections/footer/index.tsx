import { clsx } from 'clsx';
import { forwardRef, ReactNode, type Ref } from 'react';

import { Stream, Streamable } from '@/vibes/soul/lib/streamable';
import { Logo } from '@/vibes/soul/primitives/logo';
import { Link } from '~/components/link';
import { type FooterData } from '~/ui/footer';

interface Image {
  src: string;
  alt: string;
}

interface SocialMediaLink {
  href: string;
  icon: ReactNode;
}

interface ContactInformation {
  address?: string;
  phone?: string;
}

interface Props extends FooterData {
  logo?: Streamable<string | Image | null>;
  copyright?: Streamable<string | null>;
  contactInformation?: Streamable<ContactInformation | null>;
  paymentIcons?: Streamable<ReactNode[] | null>;
  socialMediaLinks?: Streamable<SocialMediaLink[] | null>;
  contactTitle?: string;
  className?: string;
  logoHref?: string;
  logoLabel?: string;
  logoWidth?: number;
  logoHeight?: number;
}

/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --footer-focus: hsl(var(--primary));
 *   --footer-background: hsl(var(--background));
 *   --footer-border-top: hsl(var(--contrast-100));
 *   --footer-border-bottom: hsl(var(--primary));
 *   --footer-contact-title: hsl(var(--contrast-300));
 *   --footer-contact-text: hsl(var(--foreground));
 *   --footer-social-icon: hsl(var(--contrast-400));
 *   --footer-social-icon-hover: hsl(var(--foreground));
 *   --footer-section-title: hsl(var(--foreground));
 *   --footer-link: hsl(var(--contrast-400));
 *   --footer-link-hover: hsl(var(--foreground));
 *   --footer-copyright: hsl(var(--contrast-400));
 * }
 * ```
 */
export const Footer = forwardRef(function Footer(
  {
    logo,
    sections: streamableSections,
    contactTitle = 'Contact Us',
    contactInformation: streamableContactInformation,
    paymentIcons: streamablePaymentIcons,
    socialMediaLinks: streamableSocialMediaLinks,
    copyright: streamableCopyright,
    className,
    logoHref = '#',
    logoLabel = 'Home',
    logoWidth = 200,
    logoHeight = 40,
  }: Props,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <footer
      className={clsx(
        '@container border-t border-b-4 border-t-[var(--footer-border-top,hsl(var(--contrast-100)))] border-b-[var(--footer-border-bottom,hsl(var(--primary)))] bg-[var(--footer-background,hsl(var(--background)))]',
        className,
      )}
      ref={ref}
    >
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-6 @xl:px-6 @xl:py-10 @4xl:px-8 @4xl:py-12">
        <div className="flex flex-col justify-between gap-x-8 gap-y-12 @3xl:flex-row">
          <div className="flex flex-col gap-4 @3xl:w-1/3 @3xl:gap-6">
            {/* Logo Information */}
            <Logo
              height={logoHeight}
              href={logoHref}
              label={logoLabel}
              logo={logo}
              width={logoWidth}
            />

            {/* Contact Information */}
            <Stream
              fallback={
                <div className="mb-4 animate-pulse text-lg @lg:text-xl">
                  <div className="flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-sm" />
                  </div>
                  <div className="flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[15ch] rounded-sm" />
                  </div>
                  <div className="flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[12ch] rounded-sm" />
                  </div>
                </div>
              }
              value={streamableContactInformation}
            >
              {(contactInformation) => {
                if (contactInformation?.address != null || contactInformation?.phone != null) {
                  return (
                    <div className="mb-4 text-lg font-medium @lg:text-xl">
                      <h3 className="text-[var(--footer-contact-title,hsl(var(--contrast-300)))]">
                        {contactTitle}
                      </h3>
                      <div className="text-[var(--footer-contact-text,hsl(var(--foreground)))]">
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
                <div className="flex animate-pulse items-center gap-3">
                  <div className="bg-contrast-100 h-8 w-8 rounded-full" />
                  <div className="bg-contrast-100 h-8 w-8 rounded-full" />
                  <div className="bg-contrast-100 h-8 w-8 rounded-full" />
                  <div className="bg-contrast-100 h-8 w-8 rounded-full" />
                </div>
              }
              value={streamableSocialMediaLinks}
            >
              {(socialMediaLinks) => {
                if (socialMediaLinks != null) {
                  return (
                    <div className="flex items-center gap-3">
                      {socialMediaLinks.map(({ href, icon }, i) => {
                        return (
                          <Link
                            className="flex items-center justify-center rounded-lg fill-[var(--footer-social-icon,hsl(var(--contrast-400)))] p-1 ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 ease-out hover:fill-[var(--footer-social-icon-hover,hsl(var(--foreground)))] focus-visible:ring-2 focus-visible:outline-0"
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
              <div className="grid w-full flex-1 animate-pulse [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] gap-y-8 @xl:gap-y-10">
                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-sm" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-sm" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-sm" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pr-8">
                  <div className="mb-3 flex h-[1lh] items-center">
                    <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-sm" />
                  </div>

                  <ul>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
                      </div>
                    </li>
                    <li className="py-2 text-sm">
                      <div className="flex h-[1lh] items-center text-sm">
                        <span className="bg-contrast-100 h-[1ex] w-[10ch] rounded-xs" />
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
                  <div className="grid w-full flex-1 [grid-template-columns:_repeat(auto-fill,_minmax(200px,_1fr))] gap-y-8 @xl:gap-y-10">
                    {sections.map(({ title, links }, i) => (
                      <div className="pr-8" key={i}>
                        {title != null && (
                          <span className="mb-3 block font-semibold text-[var(--footer-section-title,hsl(var(--foreground)))]">
                            {title}
                          </span>
                        )}

                        <ul>
                          {links.map((link, idx) => {
                            return (
                              <li key={idx}>
                                <Link
                                  className="block rounded-lg py-2 text-sm font-medium text-[var(--footer-link,hsl(var(--contrast-400)))] ring-[var(--footer-focus,hsl(var(--primary)))] transition-colors duration-300 hover:text-[var(--footer-link-hover,hsl(var(--foreground)))] focus-visible:ring-2 focus-visible:outline-0"
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
                <span className="bg-contrast-100 h-[1ex] w-[40ch] rounded-xs" />
              </div>
            }
            value={streamableCopyright}
          >
            {(copyright) => {
              if (copyright != null) {
                return (
                  <p className="flex-1 text-sm text-[var(--footer-copyright,hsl(var(--contrast-400)))]">
                    {copyright}
                  </p>
                );
              }
            }}
          </Stream>

          {/* Payment Icons */}
          <Stream
            fallback={
              <div className="flex animate-pulse flex-wrap gap-2">
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
                <div className="bg-contrast-100 h-6 w-[2.1875rem] rounded-sm" />
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
