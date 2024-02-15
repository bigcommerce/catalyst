import { Footer, FooterSection } from '@bigcommerce/components/footer';
import { Meta, StoryObj } from '@storybook/react';
import { FacebookIcon, InstagramIcon, TwitterIcon } from 'lucide-react';

import {
  AmazonIcon,
  AmericanExpressIcon,
  ApplePayIcon,
  MastercardIcon,
  PayPalIcon,
  VisaIcon,
} from '../components/payment-icons';

const meta: Meta<typeof Footer> = {
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Example: Story = {
  render: () => (
    <Footer>
      <FooterSection className="flex flex-col gap-8 py-10 md:flex-row lg:gap-4">
        <nav className="grid flex-auto auto-cols-fr gap-8 sm:grid-flow-col">
          <div>
            <h3 className="mb-4 font-bold">Categories</h3>
            <ul className="flex flex-col gap-4">
              <a href="/categories/on-sale">On Sale</a>
              <a href="/categories/new-arrivals">New arrivals</a>
              <a href="/categories/men">Men</a>
              <a href="/categories/woman">Women</a>
              <a href="/categories/accessories">Accessories</a>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Top Brands</h3>
            <ul className="flex flex-col gap-4">
              <a href="/brands/arcminute">Arcminute</a>
              <a href="/brands/base-london">Base London</a>
              <a href="/brands/birkenstock">Birkenstock</a>
              <a href="brands/good-for-nothing">Good for Nothing</a>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold">About Us</h3>
            <ul className="flex flex-col gap-4">
              <a href="/contact-us">Contact Us</a>
              <a href="/about">About brand</a>
              <a href="/blog">Blog</a>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-bold">Help</h3>
            <ul className="flex flex-col gap-4">
              <a href="/shipping-and-returns">Shipping & returns</a>
              <a href="/privacy-policy">Privacy policy</a>
              <a href="/terms-and-conditions">Terms & conditions</a>
              <a href="/faq">FAQ</a>
            </ul>
          </div>
        </nav>
        <div className="flex shrink-0 grow flex-col gap-4 md:order-first">
          <span className="text-2xl font-black">Catalyst Store</span>
          <address className="not-italic">
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </address>
          <a href="tel:5555551234">(555) 555-1234</a>
          <nav aria-label="Social media links" className="block">
            <ul className="flex gap-6">
              <a aria-label="Facebook" href="facebook.com/catalyst-store">
                <FacebookIcon />
              </a>
              <a aria-label="Instagram" href="instagram.com/catalyst-store">
                <InstagramIcon />
              </a>
              <a aria-label="Twitter" href="twitter.com/catalyst-store">
                <TwitterIcon />
              </a>
            </ul>
          </nav>
        </div>
      </FooterSection>
      <FooterSection className="flex flex-col justify-between gap-10 sm:flex-row sm:gap-8 sm:py-6">
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
