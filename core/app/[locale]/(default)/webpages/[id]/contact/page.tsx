import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { DynamicForm } from '@/vibes/soul/form/dynamic-form';
import type { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { Streamable } from '@/vibes/soul/lib/streamable';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { Breadcrumb } from '@/vibes/soul/sections/breadcrumbs';
import {
  breadcrumbsTransformer,
  truncateBreadcrumbs,
} from '~/data-transformers/breadcrumbs-transformer';

import { WebPage, WebPageContent } from '../_components/web-page';

import { submitContactForm } from './_actions/submit-contact-form';
import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ success?: string }>;
}

interface ContactPage extends WebPage {
  entityId: number;
  path: string;
  contactFields: string[];
  reCaptchaSettings: {
    isEnabledOnStorefront: boolean;
    siteKey: string;
  } | null;
}

const fieldMapping = {
  fullname: 'fullName',
  companyname: 'companyName',
  phone: 'phone',
  orderno: 'orderNo',
  rma: 'rma',
} as const;

type ContactField = keyof typeof fieldMapping;

const getWebPage = cache(async (id: string): Promise<ContactPage> => {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const reCaptchaSettings = data.site.settings?.reCaptcha ?? null;
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

  if (!webpage) {
    return notFound();
  }

  const breadcrumbs = breadcrumbsTransformer(webpage.breadcrumbs);

  return {
    entityId: webpage.entityId,
    title: webpage.name,
    path: webpage.path,
    breadcrumbs,
    content: webpage.htmlBody,
    contactFields: webpage.contactFields,
    seo: webpage.seo,
    reCaptchaSettings,
  };
});

async function getWebPageBreadcrumbs(id: string): Promise<Breadcrumb[]> {
  const webpage = await getWebPage(id);
  const [, ...rest] = webpage.breadcrumbs.reverse();
  const breadcrumbs = [
    {
      label: 'Home',
      href: '/',
    },
    ...rest.reverse(),
    {
      label: webpage.title,
      href: '#',
    },
  ];

  return truncateBreadcrumbs(breadcrumbs, 5);
}

async function getWebPageWithSuccessContent(id: string, message: string) {
  const webpage = await getWebPage(id);

  return {
    ...webpage,
    content: message,
  };
}

async function getContactFields(id: string) {
  const t = await getTranslations('WebPages.ContactUs.Form');
  const { entityId, path, contactFields } = await getWebPage(id);
  const toGroupsOfTwo = (fields: Field[]) =>
    fields.reduce<Array<FieldGroup<Field>>>((acc, _, i) => {
      if (i % 2 === 0) {
        acc.push(fields.slice(i, i + 2));
      }

      return acc;
    }, []);

  const pageIdField: Field = {
    id: 'pageId',
    name: 'pageId',
    type: 'hidden',
    defaultValue: String(entityId),
  };

  // Used for redirect to self with query params
  const pagePathField: Field = {
    id: 'pagePath',
    name: 'pagePath',
    type: 'hidden',
    defaultValue: path,
  };

  const emailField: Field = {
    id: 'email',
    name: 'email',
    label: `${t('email')} *`,
    type: 'email',
    required: true,
  };

  const commentsField: Field = {
    id: 'comments',
    name: 'comments',
    label: `${t('comments')} *`,
    type: 'textarea',
    required: true,
  };

  const optionalFields = contactFields
    .filter((field): field is ContactField => Object.hasOwn(fieldMapping, field))
    .map<Field>((field) => ({
      id: field,
      name: field,
      label: t(fieldMapping[field]),
      type: 'text',
      required: false,
    }));

  return [
    ...toGroupsOfTwo([emailField, ...optionalFields]),
    commentsField,
    pageIdField,
    pagePathField,
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const webpage = await getWebPage(id);
  const { pageTitle, metaDescription, metaKeywords } = webpage.seo;

  return {
    title: pageTitle || webpage.title,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { id, locale } = await params;
  const { success } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations('WebPages.ContactUs.Form');

  // TODO: Use reCaptcha
  // const recaptchaSettings = await bypassReCaptcha(data.site.settings?.reCaptcha);

  if (success === 'true') {
    return (
      <WebPageContent
        breadcrumbs={Streamable.from(() => getWebPageBreadcrumbs(id))}
        webPage={Streamable.from(() => getWebPageWithSuccessContent(id, t('success')))}
      >
        <ButtonLink
          className="mt-8 @2xl:mt-12 @4xl:mt-16"
          href="/"
          size="large"
          type="submit"
          variant="primary"
        >
          {t('successCta')}
        </ButtonLink>
      </WebPageContent>
    );
  }

  return (
    <WebPageContent
      breadcrumbs={Streamable.from(() => getWebPageBreadcrumbs(id))}
      webPage={Streamable.from(() => getWebPage(id))}
    >
      <div className="mt-8 @2xl:mt-12 @4xl:mt-16">
        <DynamicForm
          action={submitContactForm}
          fields={await getContactFields(id)}
          submitLabel={t('cta')}
        />
      </div>
    </WebPageContent>
  );
}
