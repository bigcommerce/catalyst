import {
  Footer,
  FooterNav,
  FooterNavGroupList,
  FooterNavLink,
  FooterSection,
} from '@bigcommerce/components/Footer';
import { Meta, StoryObj } from '@storybook/react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';

import {
  AmazonIcon,
  AmericanExpressIcon,
  ApplePayIcon,
  MastercardIcon,
  PayPalIcon,
  VisaIcon,
} from '../components/PaymentIcons';

const meta: Meta<typeof Footer> = {
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const BasicExample: Story = {
  render: () => (
    <Footer>
      <FooterSection>
        <FooterNav>
          <div>
            <h3 className="mb-4 font-bold">Categories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/categories/on-sale">On Sale</FooterNavLink>
              <FooterNavLink href="/categories/new-arrivals">New arrivals</FooterNavLink>
              <FooterNavLink href="/categories/men">Men</FooterNavLink>
              <FooterNavLink href="/categories/woman">Women</FooterNavLink>
              <FooterNavLink href="/categories/accessories">Accessories</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Top Brands</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/brands/arcminute">Arcminute</FooterNavLink>
              <FooterNavLink href="/brands/base-london">Base London</FooterNavLink>
              <FooterNavLink href="/brands/birkenstock">Birkenstock</FooterNavLink>
              <FooterNavLink href="brands/good-for-nothing">Good for Nothing</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">About Us</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/contact-us">Contact Us</FooterNavLink>
              <FooterNavLink href="/about">About brand</FooterNavLink>
              <FooterNavLink href="/blog">Blog</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Help</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/shipping-and-returns">Shipping & returns</FooterNavLink>
              <FooterNavLink href="/privacy-policy">Privacy policy</FooterNavLink>
              <FooterNavLink href="/terms-and-conditions">Terms & conditions</FooterNavLink>
              <FooterNavLink href="/faq">FAQ</FooterNavLink>
            </FooterNavGroupList>
          </div>
        </FooterNav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          <span className="text-h4 font-black">Catalyst Store</span>
          <address className="not-italic">
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </address>
          <a href="tel:5555551234">(555) 555-1234</a>
          <FooterNav aria-label="Social media links" className="block">
            <FooterNavGroupList className="flex items-center space-x-4 space-y-0">
              <FooterNavLink aria-label="Facebook" href="facebook.com/catalyst-store">
                <FacebookIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Instagram" href="instagram.com/catalyst-store">
                <InstagramIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Twitter" href="twitter.com/catalyst-store">
                <TwitterIcon />
              </FooterNavLink>
            </FooterNavGroupList>
          </FooterNav>
        </div>
      </FooterSection>
      <FooterSection className="justify-between gap-10 border-t border-gray-200 sm:gap-8 sm:py-6">
        <div className="flex gap-6">
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </div>
        <p className="text-gray-500 sm:order-first">
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </p>
      </FooterSection>
    </Footer>
  ),
};

export const MultiRowFooterNav: Story = {
  render: () => (
    <Footer>
      <FooterSection>
        <FooterNav className="sm:grid-flow-row sm:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold">Categories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/categories/on-sale">On Sale</FooterNavLink>
              <FooterNavLink href="/categories/new-arrivals">New arrivals</FooterNavLink>
              <FooterNavLink href="/categories/men">Men</FooterNavLink>
              <FooterNavLink href="/categories/woman">Women</FooterNavLink>
              <FooterNavLink href="/categories/accessories">Accessories</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Top Brands</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/brands/arcminute">Arcminute</FooterNavLink>
              <FooterNavLink href="/brands/base-london">Base London</FooterNavLink>
              <FooterNavLink href="/brands/birkenstock">Birkenstock</FooterNavLink>
              <FooterNavLink href="brands/good-for-nothing">Good for Nothing</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Men</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/men/shirts">Shirts</FooterNavLink>
              <FooterNavLink href="/men/pants">Pants</FooterNavLink>
              <FooterNavLink href="/men/sweaters">Sweaters</FooterNavLink>
              <FooterNavLink href="/men/underwear">Underwear</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Women</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/women/shirts">Shirts</FooterNavLink>
              <FooterNavLink href="/women/pants">Pants</FooterNavLink>
              <FooterNavLink href="/women/sweaters">Sweaters</FooterNavLink>
              <FooterNavLink href="/women/underwear">Underwear</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Accessories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/jewelry">Jewelry</FooterNavLink>
              <FooterNavLink href="/hats">Hats</FooterNavLink>
              <FooterNavLink href="/shoes">Shoes</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">About Us</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/contact-us">Contact Us</FooterNavLink>
              <FooterNavLink href="/about">About brand</FooterNavLink>
              <FooterNavLink href="/blog">Blog</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Help</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/shipping-and-returns">Shipping & returns</FooterNavLink>
              <FooterNavLink href="/privacy-policy">Privacy policy</FooterNavLink>
              <FooterNavLink href="/terms-and-conditions">Terms & conditions</FooterNavLink>
              <FooterNavLink href="/faq">FAQ</FooterNavLink>
            </FooterNavGroupList>
          </div>
        </FooterNav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          <span className="text-h4 font-black">Catalyst Store</span>
          <address className="not-italic">
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </address>
          <a href="tel:5555551234">(555) 555-1234</a>
          <FooterNav aria-label="Social media links" className="block">
            <FooterNavGroupList className="flex items-center space-x-4 space-y-0">
              <FooterNavLink aria-label="Facebook" href="facebook.com/catalyst-store">
                <FacebookIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Instagram" href="instagram.com/catalyst-store">
                <InstagramIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Twitter" href="twitter.com/catalyst-store">
                <TwitterIcon />
              </FooterNavLink>
            </FooterNavGroupList>
          </FooterNav>
        </div>
      </FooterSection>
      <FooterSection className="justify-between gap-10 border-t border-gray-200 sm:gap-8 sm:py-6">
        <div className="flex gap-6">
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </div>
        <p className="text-gray-500 sm:order-first">
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </p>
      </FooterSection>
    </Footer>
  ),
};

export const FooterNavOnly: Story = {
  render: () => (
    <Footer>
      <FooterSection>
        <FooterNav className="sm:grid-flow-row sm:grid-cols-4">
          <div>
            <h3 className="mb-4 font-bold">Categories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/categories/on-sale">On Sale</FooterNavLink>
              <FooterNavLink href="/categories/new-arrivals">New arrivals</FooterNavLink>
              <FooterNavLink href="/categories/men">Men</FooterNavLink>
              <FooterNavLink href="/categories/woman">Women</FooterNavLink>
              <FooterNavLink href="/categories/accessories">Accessories</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Top Brands</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/brands/arcminute">Arcminute</FooterNavLink>
              <FooterNavLink href="/brands/base-london">Base London</FooterNavLink>
              <FooterNavLink href="/brands/birkenstock">Birkenstock</FooterNavLink>
              <FooterNavLink href="brands/good-for-nothing">Good for Nothing</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Men</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/men/shirts">Shirts</FooterNavLink>
              <FooterNavLink href="/men/pants">Pants</FooterNavLink>
              <FooterNavLink href="/men/sweaters">Sweaters</FooterNavLink>
              <FooterNavLink href="/men/underwear">Underwear</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Women</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/women/shirts">Shirts</FooterNavLink>
              <FooterNavLink href="/women/pants">Pants</FooterNavLink>
              <FooterNavLink href="/women/sweaters">Sweaters</FooterNavLink>
              <FooterNavLink href="/women/underwear">Underwear</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Accessories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/jewelry">Jewelry</FooterNavLink>
              <FooterNavLink href="/hats">Hats</FooterNavLink>
              <FooterNavLink href="/shoes">Shoes</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">About Us</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/contact-us">Contact Us</FooterNavLink>
              <FooterNavLink href="/about">About brand</FooterNavLink>
              <FooterNavLink href="/blog">Blog</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Help</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/shipping-and-returns">Shipping & returns</FooterNavLink>
              <FooterNavLink href="/privacy-policy">Privacy policy</FooterNavLink>
              <FooterNavLink href="/terms-and-conditions">Terms & conditions</FooterNavLink>
              <FooterNavLink href="/faq">FAQ</FooterNavLink>
            </FooterNavGroupList>
          </div>
        </FooterNav>
      </FooterSection>
      <FooterSection className="justify-between gap-10 border-t border-gray-200 py-8 sm:gap-8 sm:py-6">
        <div className="flex gap-6">
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </div>
        <p className="text-gray-500 sm:order-first">
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </p>
      </FooterSection>
    </Footer>
  ),
};

export const NoAddendum: Story = {
  render: () => (
    <Footer>
      <FooterSection>
        <FooterNav>
          <div>
            <h3 className="mb-4 font-bold">Categories</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/categories/on-sale">On Sale</FooterNavLink>
              <FooterNavLink href="/categories/new-arrivals">New arrivals</FooterNavLink>
              <FooterNavLink href="/categories/men">Men</FooterNavLink>
              <FooterNavLink href="/categories/woman">Women</FooterNavLink>
              <FooterNavLink href="/categories/accessories">Accessories</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Top Brands</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/brands/arcminute">Arcminute</FooterNavLink>
              <FooterNavLink href="/brands/base-london">Base London</FooterNavLink>
              <FooterNavLink href="/brands/birkenstock">Birkenstock</FooterNavLink>
              <FooterNavLink href="brands/good-for-nothing">Good for Nothing</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">About Us</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/contact-us">Contact Us</FooterNavLink>
              <FooterNavLink href="/about">About brand</FooterNavLink>
              <FooterNavLink href="/blog">Blog</FooterNavLink>
            </FooterNavGroupList>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Help</h3>
            <FooterNavGroupList>
              <FooterNavLink href="/shipping-and-returns">Shipping & returns</FooterNavLink>
              <FooterNavLink href="/privacy-policy">Privacy policy</FooterNavLink>
              <FooterNavLink href="/terms-and-conditions">Terms & conditions</FooterNavLink>
              <FooterNavLink href="/faq">FAQ</FooterNavLink>
            </FooterNavGroupList>
          </div>
        </FooterNav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          <span className="text-h4 font-black">Catalyst Store</span>
          <address className="not-italic">
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </address>
          <a href="tel:5555551234">(555) 555-1234</a>
          <FooterNav aria-label="Social media links" className="block">
            <FooterNavGroupList className="flex items-center space-x-4 space-y-0">
              <FooterNavLink aria-label="Facebook" href="facebook.com/catalyst-store">
                <FacebookIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Instagram" href="instagram.com/catalyst-store">
                <InstagramIcon />
              </FooterNavLink>
              <FooterNavLink aria-label="Twitter" href="twitter.com/catalyst-store">
                <TwitterIcon />
              </FooterNavLink>
            </FooterNavGroupList>
          </FooterNav>
        </div>
      </FooterSection>
    </Footer>
  ),
};
