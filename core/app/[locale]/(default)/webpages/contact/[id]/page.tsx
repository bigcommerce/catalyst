import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { Breadcrumb } from '@/vibes/soul/primitives/breadcrumbs';
import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { DynamicForm } from '@/vibes/soul/primitives/dynamic-form';
import type { Field, FieldGroup } from '@/vibes/soul/primitives/dynamic-form/schema';

import { WebPage, WebPageContent } from '../../_components/web-page';

import { submitContactForm } from './_actions/submit-contact-form';
import { getWebpageData } from './page-data';

interface Props {
  params: Promise<{ id: string }>;
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
  fullname: 'fullNameLabel',
  companyname: 'companyNameLabel',
  phone: 'phoneLabel',
  orderno: 'orderNoLabel',
  rma: 'rmaLabel',
} as const;

type ContactField = keyof typeof fieldMapping;

async function getWebPage(id: string): Promise<ContactPage> {
  const data = await getWebpageData({ id: decodeURIComponent(id) });
  const reCaptchaSettings = data.site.settings?.reCaptcha ?? null;
  const webpage = data.node?.__typename === 'ContactPage' ? data.node : null;

  if (!webpage) {
    return notFound();
  }

  return {
    entityId: webpage.entityId,
    title: webpage.name,
    path: webpage.path,
    content: webpage.htmlBody,
    contactFields: webpage.contactFields,
    seo: webpage.seo,
    reCaptchaSettings,
  };
}

async function getWebPageBreadcrumbs(id: string): Promise<Breadcrumb[]> {
  const webpage = await getWebPage(id);

  return [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: webpage.title,
      href: '#',
    },
  ];
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
    label: `${t('emailLabel')} *`,
    type: 'email',
    required: true,
  };

  const commentsField: Field = {
    id: 'comments',
    name: 'comments',
    label: `${t('commentsLabel')} *`,
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
  const { id } = await params;
  const { success } = await searchParams;
  const t = await getTranslations('WebPages.ContactUs.Form');

  // TODO: Use reCaptcha
  // const recaptchaSettings = await bypassReCaptcha(data.site.settings?.reCaptcha);

  if (success === 'true') {
    return (
      <WebPageContent
        breadcrumbs={getWebPageBreadcrumbs(id)}
        webPage={getWebPageWithSuccessContent(id, t('success'))}
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
    <WebPageContent breadcrumbs={getWebPageBreadcrumbs(id)} webPage={getWebPage(id)}>
      <div className="mt-8 @2xl:mt-12 @4xl:mt-16">
        <DynamicForm
          action={submitContactForm}
          fields={await getContactFields(id)}
          submitLabel={t('submitFormText')}
        />
      </div>
    </WebPageContent>
  );
}
