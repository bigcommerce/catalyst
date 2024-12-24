import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

import { logout } from '~/components/header/_actions/logout';
import { Link } from '~/components/link';

import { AccountNotification } from './(tabs)/_components/account-notification';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';

import Image from 'next/image';

import ordersIcon from "~/public/accountIcons/orders.svg"
import AddressesIcon from "~/public/accountIcons/addresses.svg"
import paymentsIcon from "~/public/accountIcons/payments.svg"
import requiestQuoteIcon from "~/public/accountIcons/requestQuote.svg"
import detailsIcon from "~/public/accountIcons/details.svg"
import favouriteIcon from "~/public/accountIcons/favourite.svg"
import emailPrefIcon from "~/public/accountIcons/emailPref.svg"

interface AccountItem {
  children: ReactNode;
  description?: string;
  href: string;
  title: string;
}

const AccountItem = ({ children, title, description, href }: AccountItem) => {
  return (
    <Link className="flex items-center gap-[23px] bg-[#f3f4f5] rounded-[3px] p-[10px]" href={href}>
      {children}
      <div>
        <h3 className="font-medium text-[20px] leading-[32px] tracking-[0.15px]">{title}</h3>
        {description && <p className='font-normal text-[16px] leading-[32px] tracking-[0.5px]'>{description}</p>}
      </div>
    </Link>
  );
};

export async function generateMetadata() {
  const t = await getTranslations('Account.Home');

  return {
    title: t('title'),
  };
}

export default function Account() {
  const t = useTranslations('Account.Home');
  const ts = useTranslations('Account.SalesHours');

  const breadcrumbs: any = [
    {
      label: 'Account Center',
      href: '',
    },
  ];

  return (
    <div className="my-account-page m-auto mx-auto mt-[24px] mb-[40px] w-[70%] font-['Open_Sans'] text-[#353535]">
      <AccountNotification message={t('successMessage')} />
      <div className="flex flex-col gap-[40px]">
        <div>
          <ComponentsBreadcrumbs className="" breadcrumbs={breadcrumbs} />
          <h1 className="mt-1 text-[24px] font-normal leading-[32px]">
            <span>{t('welcomeMessage')},</span>
            <span className="text-[#008BB7]">{' '}username/email!</span>
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <AccountItem href="/account/orders" title={t('orders')} description={t('ordersMsg')}>
            <Image src={ordersIcon} alt={t('orders')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/addresses" title={t('addresses')} description={t('addressesMsg')}>
          <Image src={AddressesIcon} alt={t('addresses')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/wishlists" title={t('payments')} description={t('paymentsMsg')}>
            <Image src={paymentsIcon} alt={t('payments')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/wishlists" title={t('requestAQuote')} description={t('requestAQuoteMsg')}>
            <Image src={requiestQuoteIcon} alt={t('requestAQuote')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/settings" title={t('accountDetails')} description={t('accountMsg')}>
            <Image src={detailsIcon} alt={t('accountDetails')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/wishlists" title={t('favoritesAndLists')} description={t('favListMsg')}>
            <Image src={favouriteIcon} alt={t('favoritesAndLists')}  width={70} height={70}/>
          </AccountItem>
          <AccountItem href="/account/settings" title={t('emailPreferences')} description={t('emailPreferencesMsg')}>
            <Image src={emailPrefIcon} alt={t('emailPreferences')}  width={70} height={70}/>
          </AccountItem>
          <form action={logout}>
            <button>Logout</button>
          </form>
        </div>
        <div className="flex w-max flex-col gap-[10px]">
          <div className="text-[20px] font-[500] leading-[32px] tracking-[0.15px]">
            {ts('salesHours')}
          </div>
          <div className="text-[16px] font-normal leading-[32px] tracking-[0.5px]">
            <div>{ts('phoneHours')}</div>
            <div>{ts('phoneMondayToFriday')}</div>
            <div>{ts('phoneMobNo')}</div>
          </div>
          <div className="text-[16px] font-normal leading-[32px] tracking-[0.5px]">
            <div>{ts('chatHours')}</div>
            <div>{ts('chatMondayToFriday')}</div>
            <div>{ts('chatSatToSun')}</div>
          </div>
          <div className="w-[53%] bg-[#fbf4e9] px-[10px] text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#2a2010]">
            {ts('currentEstimated')}
          </div>
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
