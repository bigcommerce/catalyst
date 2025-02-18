import { Fragment, ReactNode } from 'react';

import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { Locale } from './locale';
import AgentFooter from '~/app/[locale]/(default)/sales-buddy/pages/footer';
import CookieConsent from '../cookie-consent/cookieConsent';
import Link from 'next/link';
const flagSalesBuddy = Number(process.env.SALES_BUDDY_FLAG);

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

interface CustomerService {
  label?: string;
  href: string;
}

interface Props {
  className?: string;
  contactInformation?: ContactInformation;
  copyright?: string;
  logo?: string | Image;
  paymentIcons?: ReactNode[];
  sections: Section[];
  socialMediaLinks?: SocialMediaLink[];
  customerService: CustomerService[];
}

const cookieConsentUrl = process.env.COOKIE_CONSENT_URL;
const Footer = ({
  className,
  contactInformation,
  copyright,
  logo,
  paymentIcons,
  sections,
  socialMediaLinks,
  customerService,
  ...props
}: Props) => (
  <footer
    className={cn('px-18 !max-w-[100%] bg-[#002a37] p-[40px] text-white 2xl:container', className)}
    {...props}
  >
    <nav className="hidden gap-5 xl:grid xl:grid-cols-4 [&>*]:h-fit" id="nav-footer-section">
      <div className="hidden flex-col gap-5 xl:flex">
        <div className="flex flex-col gap-[10px]">
          {Boolean(logo) && (
            <h3 className="footer-customer-service text-left font-['Open_Sans'] text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              Customer Service
            </h3>
          )}
          {customerService.map((customer, index)=>(
            <Link
            key={index}
            href={customer.href}
            className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
          >
            {customer.label}
          </Link>
          ))}
        </div>
        {Boolean(contactInformation?.phone) && (
          <Link
            className="flex flex-col gap-[10px] hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            href={`tel:${contactInformation?.phone}`}
          >
            <h3 className="footerheading footer-shopping-assistance text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              Shopping Assistance
            </h3>
            <p className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              PHONE HOURS
            </p>

            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday - friday 6am - 5pm PST
            </p>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-[#80c5da]">
              (####) ###-###
            </p>
            <h3 className="footerheading text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              {' '}
              CHAT HOURS{' '}
            </h3>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday - Friday 6am - 4pm PST
            </p>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Saturday & Sunday 6am - 3pm PST
            </p>
          </Link>
        )}
      </div>
      {sections.map((section, index) => (
        <div key={`${section.title}-${index}`} className="flex h-fit flex-col gap-[10px]">
          <h3 className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
            {section.title}
          </h3>
          <ul className="footer-submenu flex flex-col gap-[10px] leading-[32px]">
            {section.links.map((link, index) => (
              <li key={`${link.label}-${index}`} className="">
                {link.href != '#' ? (
                  <Link
                    className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ) : (
                  link.label
                )}
              </li>
            ))}
            {Boolean(index == 2 && flagSalesBuddy) && <AgentFooter />}
          </ul>
        </div>
      ))}
    </nav>

    <nav
      className="grid grid-cols-1 gap-[30px] sm:grid-cols-2 xl:hidden [&>*]:h-fit"
      id="nav-footer-section"
    >
      <div className="flex flex-col gap-[30px] [&>*:first-child]:order-[0] [&>*:nth-child(2)]:order-[2] [&>*:nth-child(3)]:order-[1] [&>*:nth-child(4)]:hidden">
        <div className="flex flex-col gap-[10px]">
          {Boolean(logo) && (
            <h3 className="footer-customer-service text-left font-['Open_Sans'] text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              Customer Service
            </h3>
          )}
          <Link
            href="/returns"
            className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
          >
            Start a Return or Replacement
          </Link>
          <Link
            href="#"
            className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
          >
            View Order Status
          </Link>
          <Link
            href="/content/help-center"
            className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
          >
            Visit our Helpdesk
          </Link>
        </div>
        {sections.map((section, index) => (
          <div key={`${section.title}-${index}`} className="flex h-fit flex-col gap-[10px]">
            <h3 className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              {section.title}
            </h3>
            <ul className="footer-submenu flex flex-col gap-[10px] leading-[32px]">
              {section.links.map((link, index) => (
                <li key={`${link.label}-${index}`} className="">
                  {link.href != '#' ? (
                    <Link
                      className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    link.label
                  )}
                </li>
              ))}
              {Boolean(index == 2 && flagSalesBuddy) && <AgentFooter />}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[30px] [&>*:nth-child(2)]:hidden [&>*:nth-child(3)]:hidden">
        {Boolean(contactInformation?.phone) && (
          <Link
            className="flex flex-col gap-[10px] hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            href={`tel:${contactInformation?.phone}`}
          >
            <h3 className="footerheading footer-shopping-assistance text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              Shopping Assistance
            </h3>
            <p className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              PHONE HOURS
            </p>

            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday - friday 6am - 5pm PST
            </p>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-[#80c5da]">
              (####) ###-###
            </p>
            <h3 className="footerheading text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              {' '}
              CHAT HOURS{' '}
            </h3>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday - Friday 6am - 4pm PST
            </p>
            <p className="Footertxt text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Saturday & Sunday 6am - 3pm PST
            </p>
          </Link>
        )}
        {sections.map((section, index) => (
          <div key={`${section.title}-${index}`} className="flex h-fit flex-col gap-[10px]">
            <h3 className="text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              {section.title}
            </h3>
            <ul className="footer-submenu flex flex-col gap-[10px] leading-[32px]">
              {section.links.map((link, index) => (
                <li key={`${link.label}-${index}`} className="">
                  {link.href != '#' ? (
                    <Link
                      className="text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    link.label
                  )}
                </li>
              ))}
              {Boolean(index == 2 && flagSalesBuddy) && <AgentFooter />}
            </ul>
          </div>
        ))}
      </div>
    </nav>

    <section className="copyright mt-[10px]">
      <p className="text-white-400 flex justify-center text-left text-[14px] font-normal leading-[24px] tracking-[0.25px] sm:order-first">
        {copyright}
      </p>
      <div className="flex justify-center gap-8 pt-[10px]" id="icon">
        <Locale />
        <div className="flex gap-[10px] overflow-x-auto">{paymentIcons}</div>
      </div>
    </section>
    <CookieConsent url={cookieConsentUrl} />
  </footer>
);

Footer.displayName = 'Footer';

export { Footer };
