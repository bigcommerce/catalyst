import { Fragment, ReactNode } from 'react';

import { Link as CustomLink } from '~/components/link';
import { cn } from '~/lib/utils';

import { Locale } from './locale';
import AgentFooter from '~/app/[locale]/(default)/sales-buddy/pages/footer';
import CookieConsent from '../cookie-consent/cookieConsent';

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

const cookieConsentUrl = process.env.COOKIE_CONSENT_URL;
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
  <footer className={cn('px-18  2xl:container 2xl:mx-auto !max-w-[100%] bg-[#002a37] text-white', className)} {...props}>
     <div className='absolute flex flex-col right-[200px] gap-[10px] mt-[370px]'>
      <AgentFooter />
    </div>
    <section className="section-footer flex flex-col gap-8 border-t border-gray-200 px-4 pt-10 pb-0 md:flex-row lg:gap-4 lg:px-12">
      <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col" id="nav-footer-section">
        {sections.map((section, index) => (
            <div key={`${section.title}-${index}`}>
              <h3 className="text-left text-[20px] mb-[10px] font-medium leading-[32px] tracking-[0.15px] text-white">
                {section.title}
              </h3>
              <ul className="footer-submenu flex flex-col">
                {section.links.map((link, index) => (
                  <li key={`${link.label}-${index}`} className='mb-[14px] pt-1 pb-1'>
                    {link.href != '#' ? <CustomLink className='!justify-start text-[14px] font-normal leading-[24px] tracking-[0.25px] text-left !text-white' href={link.href}>{link.label}</CustomLink> : link.label}
                  </li>
                ))}
              </ul>

            </div>
        ))}
      </nav>
      <div className="div-footer flex flex-col gap-2.5 md:order-first md:grow w-[35%]">
        {Boolean(logo) && (
          <h3 className="footer-customer-service text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
            Customer Service
          </h3>
        )}

        {Boolean(contactInformation?.phone) && (
          <CustomLink
            className="flex-col hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
            href={`tel:${contactInformation?.phone}`}
          >
            <p className="mb-4 text-left font-sans text-[14px] font-normal leading-[24px] tracking-[0.25px] text-white">
              Start a Return or Replacement
            </p>
            <p className="mb-4 text-left font-sans text-[14px] font-normal leading-[24px] tracking-[0.25px] text-white">
              View Order Status
            </p>
            <p className="mb-4 text-left font-sans text-[14px] font-normal leading-[24px] tracking-[0.25px] text-white">
              Visit our Helpdesk
            </p>

            <h3 className="footerheading footer-shopping-assistance mb-2.5 mt-5 pt-0.5 text-left text-[20px] font-medium leading-[32px] tracking-[0.15px] text-white">
              Shopping Assistance
            </h3>
            <p className="mb-1.5 text-left text-[14px] font-normal leading-[24px] tracking-[0.25px] text-white">
              PHONE HOURS
            </p>

            <p className="Footertxt mb-1.5 text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday-friday 6am -5pm PST
            </p>
            <p className="Footertxt mb-1.5 text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              (####) ###-###
            </p>
            <h3 className="footerheading mb-1.5 text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              {' '}
              CHAT HOURS{' '}
            </h3>
            <p className="Footertxt  mb-1.5 text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Monday-Friday 6am-4pm PST
            </p>
            <p className="Footertxt mb-1.5 text-left text-[14px] font-normal leading-[32px] tracking-[0.25px] text-white">
              Saturday & Sunday 6am-3pm PST
            </p>
          </CustomLink>
        )}
      </div>
    </section>

    <section className="copyright">
      <p className="text-white-400 text-[14px] flex justify-center font-normal leading-[24px] tracking-[0.25px] text-left sm:order-first">{copyright}</p>
      <div className="flex gap-8 justify-center py-[10px]" id="icon">
        <Locale />
        <div className="flex gap-[10px]">{paymentIcons}</div>
      </div>
    </section>
    <CookieConsent url={cookieConsentUrl} />
  </footer>
);

Footer.displayName = 'Footer';

export { Footer };
