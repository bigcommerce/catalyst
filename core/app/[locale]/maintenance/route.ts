import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';

const MaintenancePageQuery = graphql(
  `
    query MaintenancePageQuery {
      site {
        settings {
          contact {
            phone
            email
          }
          statusMessage
          ...StoreLogoFragment
        }
      }
    }
  `,
  [StoreLogoFragment],
);

export async function GET(request: NextRequest) {
  const locale = request.headers.get('x-bc-locale') ?? '';

  const t = await getTranslations({ locale, namespace: 'Maintenance' });

  const { data } = await client.fetch({
    document: MaintenancePageQuery,
  });

  const storeSettings = data.site.settings;

  let logoHtml = '';
  let contactInfo = '';
  let statusMessageHtml = '';

  if (storeSettings) {
    const { contact, statusMessage } = storeSettings;
    const logo = data.site.settings ? logoTransformer(data.site.settings) : '';

    if (logo) {
      if (typeof logo === 'string') {
        logoHtml = `<span style="font-family: var(--font-family-heading); font-size: 1.125rem; font-weight: 600; line-height: 1; color: hsl(var(--foreground)); margin-bottom: 80px; display: block;">${logo}</span>`;
      } else {
        logoHtml = `<img src="${logo.src}" style="height: 40px; width: 200px; margin-bottom: 80px;" />`;
      }
    }

    if (contact?.email) {
      contactInfo += `
        <div>
          <a href="mailto:${contact.email}" style="display: inline-flex; align-items: center; font-weight: 500; color: hsl(var(--contrast-400)); text-decoration: none; transition: color 0.3s; margin: 8px 0;">
            <svg style="width: 16px; height: 16px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>${contact.email}</span>
          </a>
        </div>
      `;
    }

    if (contact?.phone) {
      contactInfo += `
        <div>
          <a href="tel:${contact.phone}" style="display: inline-flex; align-items: center; font-weight: 500; color: hsl(var(--contrast-400)); text-decoration: none; transition: color 0.3s; margin: 8px 0;">
            <svg style="width: 16px; height: 16px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            <span>${contact.phone}</span>
          </a>
        </div>
      `;
    }

    if (statusMessage) {
      statusMessageHtml = `<p style="font-size: 1rem; color: hsl(var(--contrast-500)); line-height: 1.5;">${statusMessage}</p>`;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="${locale}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${t('title')}</title>
        <style>
          :root {
            --foreground: 222.2 84% 4.9%;
            --background: 0 0% 100%;
            --primary: 222.2 47.4% 11.2%;
            --primary-foreground: 210 40% 98%;
            --contrast-100: 210 40% 98%;
            --contrast-200: 214.3 31.8% 91.4%;
            --contrast-300: 213.1 27.3% 84.3%;
            --contrast-400: 215.4 16.3% 46.9%;
            --contrast-500: 215.3 25% 26.7%;
            --contrast-600: 215.3 25% 26.7%;
            --contrast-700: 215.3 25% 26.7%;
            --contrast-800: 217.2 32.6% 17.5%;
            --contrast-900: 222.2 84% 4.9%;
            --font-family-heading: ui-sans-serif, system-ui, sans-serif;
            --font-family-body: ui-sans-serif, system-ui, sans-serif;
          }
          
          body {
            font-family: var(--font-family-body);
            margin: 0;
            padding: 0;
            background-color: var(--background);
            color: var(--foreground);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .maintenance-container {
            max-width: 48rem;
            padding: 1rem;
            text-align: center;
          }
          
          .maintenance-content {
            margin: 0 auto;
            max-width: 48rem;
            padding: 1rem;
          }
          
          .maintenance-title {
            font-family: var(--font-family-heading);
            font-size: 1.875rem;
            font-weight: 500;
            line-height: 1;
            margin-bottom: 0.75rem;
            color: var(--foreground);
          }
          
          .maintenance-message {
            font-size: 1rem;
            color: hsl(var(--contrast-500));
            line-height: 1.5;
            margin-bottom: 5rem;
          }
          
          .contact-section {
            margin-top: 5rem;
          }
          
          .contact-title {
            font-family: var(--font-family-heading);
            font-size: 1.25rem;
            font-weight: 500;
            margin-bottom: 1rem;
            color: var(--foreground);
          }
          
          .contact-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            align-items: center;
          }
          
          .contact-link {
            display: inline-flex;
            align-items: center;
            font-weight: 500;
            color: hsl(var(--contrast-400));
            text-decoration: none;
            transition: color 0.3s;
            margin: 8px 0;
            font-size: 1rem;
          }
          
          .contact-link:hover {
            color: var(--foreground);
          }
          
          .contact-link svg {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
          
          @media (min-width: 56rem) {
            .maintenance-title {
              font-size: 2.25rem;
            }
            .maintenance-message {
              font-size: 1.125rem;
            }
            .contact-link {
              font-size: 1.125rem;
            }
          }
          
          @media (min-width: 90rem) {
            .maintenance-title {
              font-size: 3rem;
            }
            .maintenance-message {
              font-size: 1.25rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="maintenance-container">
          <div class="maintenance-content">
            ${logoHtml}
            <h1 class="maintenance-title">${t('message')}</h1>
            ${statusMessageHtml}
            ${
              contactInfo
                ? `
              <div class="contact-section">
                <div class="contact-title">${t('contactUs')}</div>
                <div class="contact-links">
                  ${contactInfo}
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600', // Suggest retry after 1 hour
    },
  });
}
