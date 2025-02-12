import { useTranslations } from "next-intl";
import { getTranslations } from 'next-intl/server';
import { getSessionUserDetails } from "~/auth";
import { KlaviyoIdentifyUser } from '~/belami/components/klaviyo/klaviyo-identify-user';

export async function WelcomeMessage() {
  const t = await getTranslations('Account.Home');
  //const t = await useTranslations('Account.Home');
  const sessionUser = await getSessionUserDetails();

  return (
    <>
    <h1 className="mt-1 text-[24px] font-normal leading-[32px] flex flex-col items-center gap-1 xl:block">
      <span>{t('welcomeMessage')},</span>
      <span className="text-[#008BB7]">{' '}{sessionUser?.user?.name || 'Guest'}!</span>
    </h1>
    <KlaviyoIdentifyUser user={sessionUser && sessionUser.user && sessionUser.user?.email ? {email: sessionUser.user.email, first_name: sessionUser.user?.firstName, last_name: sessionUser.user?.lastName} as any : null} />
    </>
  )
}