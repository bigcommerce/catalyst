import { ComponentPropsWithoutRef, Fragment, ReactNode } from 'react';

import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

interface Item {
  title: string;
  links: Array<{
    path: string;
    name: string;
  }>;
}

interface Props extends ComponentPropsWithoutRef<'footer'> {
  items: Item[];
  logo?: ReactNode;
  contactInformation?: {
    address: string;
    phone?: string;
  } | null;
  socialMediaLinks?: Array<{
    name: string;
    url: string;
    icon: ReactNode;
  }>;
}

const Footer = ({
  children,
  className,
  contactInformation,
  items,
  logo,
  socialMediaLinks,
  ...props
}: Props) => (
  <footer className={cn('2xl:container 2xl:mx-auto', className)} {...props}>
    <section className="flex flex-col gap-8 border-t border-gray-200 px-4 py-10 sm:px-10 md:flex-row lg:gap-4 lg:px-12 2xl:px-0">
      <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col">
        {items.map((item) => (
          <div key={item.title}>
            <h3 className="mb-4 text-lg font-bold">{item.title}</h3>
            <ul className="flex flex-col gap-4">
              {item.links.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-4 md:order-first md:grow">
        {Boolean(logo) && <h3>{logo}</h3>}
        {Boolean(contactInformation) && (
          <>
            <address className="not-italic">
              {contactInformation?.address.split('\n').map((line) => (
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
                <li key={link.name}>
                  <Link className="inline-block" href={link.url}>
                    {link.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
    {children}
  </footer>
);

Footer.displayName = 'Footer';

export { Footer };
