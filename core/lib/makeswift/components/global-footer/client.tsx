'use client';

import {
  SiFacebook,
  SiInstagram,
  SiPinterest,
  SiX,
  SiYoutube,
} from '@icons-pack/react-simple-icons';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useContext,
} from 'react';

import { Footer } from '@/vibes/soul/sections/footer';
import { AmazonIcon } from '~/components/footer/payment-icons/amazon';
import { AmericanExpressIcon } from '~/components/footer/payment-icons/american-express';
import { ApplePayIcon } from '~/components/footer/payment-icons/apple-pay';
import { MastercardIcon } from '~/components/footer/payment-icons/mastercard';
import { PayPalIcon } from '~/components/footer/payment-icons/paypal';
import { VisaIcon } from '~/components/footer/payment-icons/visa';

type FooterProps = ComponentPropsWithoutRef<typeof Footer>;

type ContextProps = Pick<
  FooterProps,
  'logo' | 'logoHref' | 'logoLabel' | 'logoWidth' | 'logoHeight'
>;

const PropsContext = createContext<ContextProps>({
  logo: null,
  logoHref: '/',
  logoLabel: 'Home',
  logoWidth: 200,
  logoHeight: 40,
});

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

type LinkValue = { href: string; target?: string } | null | undefined;

interface FooterLinkInput {
  label: string;
  link: LinkValue;
}

interface FooterSectionInput {
  title?: string;
  links: FooterLinkInput[];
}

interface SocialLinkInput {
  icon: 'facebook' | 'instagram' | 'pinterest' | 'x' | 'youtube';
  link: LinkValue;
}

interface PaymentIconInput {
  type: 'visa' | 'mastercard' | 'amex' | 'paypal' | 'applepay' | 'amazon';
}

interface LogoInput {
  show: boolean;
  src?: string;
  alt: string;
  width: number;
  height: number;
  link?: LinkValue;
}

export interface MakeswiftGlobalFooterProps {
  logo: LogoInput;
  sections: FooterSectionInput[];
  contactTitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  socialLinks?: SocialLinkInput[];
  paymentIcons?: PaymentIconInput[];
  copyright?: string;
}

const socialIconMap: Record<SocialLinkInput['icon'], ReactNode> = {
  facebook: <SiFacebook title="Facebook" />,
  instagram: <SiInstagram title="Instagram" />,
  pinterest: <SiPinterest title="Pinterest" />,
  x: <SiX title="X" />,
  youtube: <SiYoutube title="YouTube" />,
};

const paymentIconMap: Record<PaymentIconInput['type'], ReactNode> = {
  visa: <VisaIcon />,
  mastercard: <MastercardIcon />,
  amex: <AmericanExpressIcon />,
  paypal: <PayPalIcon />,
  applepay: <ApplePayIcon />,
  amazon: <AmazonIcon />,
};

const toHref = (link: LinkValue, fallback = '#') => link?.href ?? fallback;

export const MakeswiftGlobalFooter = ({
  logo,
  sections,
  contactTitle,
  contactAddress,
  contactPhone,
  socialLinks,
  paymentIcons,
  copyright,
}: MakeswiftGlobalFooterProps) => {
  const defaults = useContext(PropsContext);

  const logoImage = logo.src ? { src: logo.src, alt: logo.alt } : defaults.logo;
  const hasContact = Boolean(contactAddress || contactPhone);
  const resolvedSections = sections.map((section) => ({
    title: section.title,
    links: section.links
      .filter((link) => link.label && link.link?.href)
      .map((link) => ({
        label: link.label,
        href: toHref(link.link),
        target: link.link?.target,
      })),
  }));

  const resolvedSocialLinks: Array<{ href: string; icon: ReactNode }> = (socialLinks ?? [])
    .filter((link): link is SocialLinkInput & { link: { href: string } } =>
      Boolean(link.link?.href),
    )
    .map((link) => ({
      href: toHref(link.link),
      icon: socialIconMap[link.icon],
    }));

  const resolvedPaymentIcons: Array<{ type: PaymentIconInput['type']; element: ReactNode }> = (
    paymentIcons ?? []
  ).map((icon) => ({
    type: icon.type,
    element: paymentIconMap[icon.type],
  }));

  return (
    <Footer
      contactInformation={hasContact ? { address: contactAddress, phone: contactPhone } : undefined}
      contactTitle={contactTitle}
      copyright={copyright}
      logo={logo.show ? logoImage : null}
      logoHeight={logo.show ? logo.height : 0}
      logoHref={logo.link?.href ?? defaults.logoHref}
      logoLabel={defaults.logoLabel}
      logoWidth={logo.show ? logo.width : 0}
      paymentIcons={
        resolvedPaymentIcons.length > 0
          ? resolvedPaymentIcons.map(({ type, element }, index) =>
              element ? <span key={`${type}-${index}`}>{element}</span> : null,
            )
          : undefined
      }
      sections={resolvedSections}
      socialMediaLinks={resolvedSocialLinks.length > 0 ? resolvedSocialLinks : undefined}
    />
  );
};
