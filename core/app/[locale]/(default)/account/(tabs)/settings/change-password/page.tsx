import { getTranslations, setRequestLocale } from 'next-intl/server';

import { TabHeading } from '../../_components/tab-heading';

import { ChangePasswordForm } from './_components/change-password-form';
import { Breadcrumbs as ComponentsBreadcrumbs } from '~/components/ui/breadcrumbs';
import { Heading } from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('Account.Settings.ChangePassword');

  return {
    title: t('title'),
  };
}

const breadcrumbs: any = [
  {
    label: 'Change Password',
    href: '#',
  },
];

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ChangePassword({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <div className="mx-auto mb-8 lg:w-2/3">
        <ComponentsBreadcrumbs
          className="login-div login-breadcrumb mx-auto mb-[20px] flex justify-center px-[1px] lg:block xl:mb-[30px] xl:justify-start"
          breadcrumbs={breadcrumbs}
        />
        <h2 className="mb-[20px] text-center text-[24px] font-normal leading-[32px] text-[#353535] xl:mb-[30px] xl:text-left">
          {'Change Password'}
        </h2>
      </div>
      <div className="mx-auto px-5 lg:px-0 lg:w-2/3">
        <ChangePasswordForm />
      </div>
    </>
  );
}

export const runtime = 'edge';
