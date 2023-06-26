import {
  Footer,
  FooterAddendum,
  FooterAddendumCopyright,
  FooterAddendumPaymentOptions,
  FooterContactInformation,
  FooterContactInformationAddress,
  FooterContactInformationSocials,
  FooterContent,
  FooterSiteMap,
  FooterSiteMapCategory,
  FooterSiteMapCategoryItem,
  FooterSiteMapCategoryList,
  FooterSiteMapCategoryTitle,
} from '@bigcommerce/reactant/Footer';
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
      <FooterContent>
        <FooterSiteMap>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Categories</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/categories/on-sale">On Sale</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/new-arrivals">New arrivals</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/men">Men</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/woman">Women</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/accessories">Accessories</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Top Brands</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/brands/arcminute">Arcminute</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/base-london">Base London</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/birkenstock">Birkenstock</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="brands/good-for-nothing">Good for Nothing</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>About Us</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/contact-us">Contact Us</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/about">About brand</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/blog">Blog</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Help</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/shipping-and-returns">Shipping & returns</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/privacy-policy">Privacy policy</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/terms-and-conditions">Terms & conditions</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/faq">FAQ</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
        </FooterSiteMap>
        <FooterContactInformation>
          <span className="text-h4 font-black">Catalyst Store</span>
          <FooterContactInformationAddress>
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </FooterContactInformationAddress>
          <a href="tel:5555551234">(555) 555-1234</a>
          <FooterContactInformationSocials>
            <a href="facebook.com/catalyst-store">
              <FacebookIcon />
            </a>
            <a href="instagram.com/catalyst-store">
              <InstagramIcon />
            </a>
            <a href="twitter.com/catalyst-store">
              <TwitterIcon />
            </a>
          </FooterContactInformationSocials>
        </FooterContactInformation>
      </FooterContent>
      <FooterAddendum>
        <FooterAddendumPaymentOptions>
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </FooterAddendumPaymentOptions>
        <FooterAddendumCopyright>
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </FooterAddendumCopyright>
      </FooterAddendum>
    </Footer>
  ),
};

export const CustomColumns: Story = {
  render: () => (
    <Footer>
      <FooterContent>
        <FooterSiteMap className="sm:grid-cols-3">
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Categories</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/categories/on-sale">On Sale</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/new-arrivals">New arrivals</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/men">Men</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/woman">Women</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/accessories">Accessories</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Top Brands</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/brands/arcminute">Arcminute</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/base-london">Base London</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/birkenstock">Birkenstock</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="brands/good-for-nothing">Good for Nothing</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>About Us</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/contact-us">Contact Us</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/about">About brand</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/blog">Blog</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
        </FooterSiteMap>
        <FooterContactInformation>
          <span className="text-h4 font-black">Catalyst Store</span>
          <FooterContactInformationAddress>
            24 Wisteria Lane, Fairview, Eagle <br />
            01234 United States
          </FooterContactInformationAddress>
          <a href="tel:5555551234">(555) 555-1234</a>
          <FooterContactInformationSocials>
            <a href="facebook.com/catalyst-store">
              <FacebookIcon />
            </a>
            <a href="instagram.com/catalyst-store">
              <InstagramIcon />
            </a>
            <a href="twitter.com/catalyst-store">
              <TwitterIcon />
            </a>
          </FooterContactInformationSocials>
        </FooterContactInformation>
      </FooterContent>
      <FooterAddendum>
        <FooterAddendumPaymentOptions>
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </FooterAddendumPaymentOptions>
        <FooterAddendumCopyright>
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </FooterAddendumCopyright>
      </FooterAddendum>
    </Footer>
  ),
};

export const SitemapOnly: Story = {
  render: () => (
    <Footer>
      <FooterContent>
        <FooterSiteMap className="sm:col-span-3">
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Categories</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/categories/on-sale">On Sale</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/new-arrivals">New arrivals</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/men">Men</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/woman">Women</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/categories/accessories">Accessories</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Top Brands</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/brands/arcminute">Arcminute</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/base-london">Base London</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/brands/birkenstock">Birkenstock</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="brands/good-for-nothing">Good for Nothing</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>About Us</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/contact-us">Contact Us</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/about">About brand</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/blog">Blog</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
          <FooterSiteMapCategory>
            <FooterSiteMapCategoryTitle>Help</FooterSiteMapCategoryTitle>
            <FooterSiteMapCategoryList>
              <FooterSiteMapCategoryItem>
                <a href="/shipping-and-returns">Shipping & returns</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/privacy-policy">Privacy policy</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/terms-and-conditions">Terms & conditions</a>
              </FooterSiteMapCategoryItem>
              <FooterSiteMapCategoryItem>
                <a href="/faq">FAQ</a>
              </FooterSiteMapCategoryItem>
            </FooterSiteMapCategoryList>
          </FooterSiteMapCategory>
        </FooterSiteMap>
      </FooterContent>
      <FooterAddendum>
        <FooterAddendumPaymentOptions>
          <AmazonIcon />
          <AmericanExpressIcon />
          <ApplePayIcon />
          <MastercardIcon />
          <PayPalIcon />
          <VisaIcon />
        </FooterAddendumPaymentOptions>
        <FooterAddendumCopyright>
          © {new Date().getFullYear()} Catalyst Store – Powered by BigCommerce
        </FooterAddendumCopyright>
      </FooterAddendum>
    </Footer>
  ),
};
