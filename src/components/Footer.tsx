import React, { Fragment } from 'react';

import { Link } from '../../reactant/components/Link';
import { FacebookIcon } from '../../reactant/icons/Facebook';
import { PinterestIcon } from '../../reactant/icons/Pinterest';
import { TwitterIcon } from '../../reactant/icons/Twitter';
import { FooterMenu } from '../components/FooterMenu';
import { BaseStoreLogo, StoreLogo } from '../components/Logo';
import { Brands, CategoryTree, Contact, SocialMediaLink } from '../pages';

interface FooterProps {
  brands: Brands;
  categoryTree: CategoryTree[];
  contact: Contact;
  logo: StoreLogo;
  storeName: string;
  socialMediaLinks: SocialMediaLink[];
}

export const Footer = ({
  brands,
  categoryTree,
  contact,
  logo,
  storeName,
  socialMediaLinks,
}: FooterProps) => {
  return (
    <footer>
      <div className="border-t border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-6 gap-8 my-12 mx-6 sm:mx-10 md:container md:mx-auto">
          <div>
            <FooterMenu items={categoryTree} title="Categories" />
          </div>
          <div>
            <FooterMenu items={brands.edges.map(({ node }) => ({ ...node }))} title="Brands" />
          </div>
          <div>
            <FooterMenu
              items={[
                { name: 'Contact us', path: '/' },
                { name: 'About brand', path: '/' },
                { name: 'Blog', path: '/' },
              ]}
              title="About us"
            />
          </div>
          <div>
            <FooterMenu
              items={[
                { name: 'Shipping & returns', path: '/' },
                { name: 'Privacy policy', path: '/' },
                { name: 'Terms & conditions', path: '/' },
                { name: 'FAQ', path: '/' },
              ]}
              title="Help"
            />
          </div>
          <div className="sm:col-span-2 md:order-first">
            <h4 className="mb-4">
              <BaseStoreLogo logo={logo} storeName={storeName} />
            </h4>
            <address className="mb-2 not-italic">
              {contact.address.split('\n').map((line) => (
                <Fragment key={line}>
                  {line}
                  <br />
                </Fragment>
              ))}
            </address>
            {contact.phone ? <p>{contact.phone}</p> : null}
            {socialMediaLinks.length > 0 ? (
              <ul className="flex flex-wrap gap-4 mt-8">
                {socialMediaLinks.map((link) => (
                  <li key={link.name}>
                    <Link className={Link.iconOnly.className}>
                      {link.name === 'Facebook' && <FacebookIcon className={Link.Icon.className} />}
                      {link.name === 'Twitter' && <TwitterIcon className={Link.Icon.className} />}
                      {link.name === 'Pinterest' && (
                        <PinterestIcon className={Link.Icon.className} />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-8 md:my-6 mx-6 sm:mx-10 md:container md:mx-auto">
        <div className="md:text-right">Payment methods</div>
        <div className="md:order-first">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {storeName} – Powered by BigCommerce
          </p>
        </div>
      </div>
    </footer>
  );
};
