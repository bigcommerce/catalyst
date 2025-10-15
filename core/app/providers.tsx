/* eslint-disable no-console */

'use client';

import { ConsentManagerProvider } from '@c15t/nextjs';
import { ConsentManagerCallbacks } from '@c15t/nextjs/client';
import { PropsWithChildren } from 'react';
import { z } from 'zod';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { ConsentManagerDialog, CookieBanner } from '~/components/consent-manager';
import { setC15tConsentCookie } from '~/lib/c15t-consent';
import { SearchProvider } from '~/lib/search';

/**
 * Zod schema for consent cookie data structure
 * Based on the SetC15tConsentCookie interface from c15t-consent.ts
 */
const ConsentCookieSchema = z.object({
  preferences: z.record(z.string(), z.boolean()),
  timestamp: z.union([z.string(), z.number(), z.date()]).transform((val) => {
    if (val instanceof Date) {
      return val;
    }

    return new Date(val);
  }),
});

/**
 * Type derived from the Zod schema
 */
type ConsentCookieData = z.infer<typeof ConsentCookieSchema>;

/**
 * Helper function to get consent cookie value from document.cookie
 * @internal
 * @returns {string | null} The cookie value or null if not found
 */
function getConsentCookieValue(): string | null {
  console.log('[getConsentCookieValue] Starting to read consent cookie');

  if (typeof document === 'undefined') {
    console.log('[getConsentCookieValue] Document is undefined (SSR), returning null');

    return null;
  }

  const cookies = document.cookie.split('; ');

  console.log('cookies', cookies);

  console.log('[getConsentCookieValue] Found cookies:', cookies);

  const cookie = cookies.find((c) => c.startsWith('c15t-consent='));

  console.log('[getConsentCookieValue] Found c15t-consent cookie:', cookie ? 'Yes' : 'No');

  if (!cookie) {
    console.log('[getConsentCookieValue] No c15t-consent cookie found, returning null');

    return null;
  }

  const cookieValue = cookie.split('=')[1] ?? null;

  console.log('[getConsentCookieValue] Extracted cookie value:', cookieValue ? 'Present' : 'Empty');

  return cookieValue;
}

/**
 * Helper function to parse consent cookie data using Zod schema validation
 * @internal
 * @returns {ConsentCookieData | null} Parsed and validated cookie data or null if invalid
 */
function parseConsentCookie(): ConsentCookieData | null {
  console.log('[parseConsentCookie] Starting to parse consent cookie');

  const cookieValue = getConsentCookieValue();

  if (!cookieValue) {
    console.log('[parseConsentCookie] No cookie value found, returning null');

    return null;
  }

  try {
    console.log('[parseConsentCookie] Attempting to parse JSON from cookie value');

    const parsed: unknown = JSON.parse(decodeURIComponent(cookieValue));

    console.log('[parseConsentCookie] Parsed JSON:', parsed);

    const result = ConsentCookieSchema.safeParse(parsed);

    console.log(
      '[parseConsentCookie] Zod validation result:',
      result.success ? 'Success' : 'Failed',
    );

    if (result.success) {
      console.log('[parseConsentCookie] Successfully parsed consent data:', result.data);

      return result.data;
    }

    console.log('[parseConsentCookie] Zod validation failed:', result.error);

    return null;
  } catch (error) {
    console.log('[parseConsentCookie] JSON parsing failed:', error);

    return null;
  }
}

/**
 * Creates custom endpoint handlers for cookie-based consent management
 *
 * @returns {object} Object containing handlers for showConsentBanner, setConsent, and verifyConsent
 */
function createCustomHandlers() {
  console.log('[createCustomHandlers] Creating custom endpoint handlers');

  return {
    /**
     * Handler for the showConsentBanner endpoint
     * Returns true if no consent cookie exists, false if consent has been given
     * @returns {Promise<object>} Response with banner configuration
     */
    showConsentBanner() {
      console.log('[showConsentBanner] Handler invoked');

      const consentData = parseConsentCookie();

      console.log('[showConsentBanner] Consent data:', consentData);

      const showBanner = !consentData;

      console.log('[showConsentBanner] Should show banner:', showBanner);

      return {
        data: {
          showConsentBanner: showBanner,
          jurisdiction: {
            code: 'GDPR',
            message: 'General Data Protection Regulation',
          },
          location: {
            countryCode: null,
            regionCode: null,
          },
          translations: {
            language: 'en',
            translations: {
              common: {
                acceptAll: 'Accept All',
                rejectAll: 'Reject All',
                customize: 'Customize',
                save: 'Save',
              },
              cookieBanner: {
                title: 'Cookie Consent',
                description: 'We use cookies to enhance your experience.',
              },
              consentManagerDialog: {
                title: 'Cookie Preferences',
                description: 'Manage your cookie preferences.',
              },
              consentTypes: {
                experience: {
                  title: 'Experience',
                  description: 'Personalized content and features',
                },
                functionality: {
                  title: 'Functionality',
                  description: 'Essential website functions',
                },
                marketing: {
                  title: 'Marketing',
                  description: 'Advertising and marketing content',
                },
                measurement: {
                  title: 'Measurement',
                  description: 'Analytics and performance data',
                },
                necessary: {
                  title: 'Necessary',
                  description: 'Required for basic website operation',
                },
              },
              frame: {
                title: 'Cookie Settings',
                actionButton: 'Save Preferences',
              },
            },
          },
          branding: 'light' as const,
        },
        error: null,
        ok: true,
        response: new Response(
          JSON.stringify({
            showConsentBanner: showBanner,
            jurisdiction: {
              code: 'GDPR',
              message: 'General Data Protection Regulation',
            },
            location: {
              countryCode: null,
              regionCode: null,
            },
            translations: {
              language: 'en',
              translations: {
                common: {
                  acceptAll: 'Accept All',
                  rejectAll: 'Reject All',
                  customize: 'Customize',
                  save: 'Save',
                },
                cookieBanner: {
                  title: 'Cookie Consent',
                  description: 'We use cookies to enhance your experience.',
                },
                consentManagerDialog: {
                  title: 'Cookie Preferences',
                  description: 'Manage your cookie preferences.',
                },
                consentTypes: {
                  experience: {
                    title: 'Experience',
                    description: 'Personalized content and features',
                  },
                  functionality: {
                    title: 'Functionality',
                    description: 'Essential website functions',
                  },
                  marketing: {
                    title: 'Marketing',
                    description: 'Advertising and marketing content',
                  },
                  measurement: {
                    title: 'Measurement',
                    description: 'Analytics and performance data',
                  },
                  necessary: {
                    title: 'Necessary',
                    description: 'Required for basic website operation',
                  },
                },
                frame: {
                  title: 'Cookie Settings',
                  actionButton: 'Save Preferences',
                },
              },
            },
            branding: 'light',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      };
    },

    /**
     * Handler for the setConsent endpoint
     * Sets consent preferences using the cookie-based approach
     * @param {object} options - Request options containing body with consent data
     * @returns {Promise<object>} Response context with consent set result
     */
    async setConsent(options?: {
      body?: { preferences?: Record<string, boolean>; type?: string; domain?: string };
    }) {
      console.log('[setConsent] Handler invoked with options:', options);

      if (!options?.body) {
        console.log('[setConsent] No request body provided, returning error');

        return {
          data: null,
          error: {
            message: 'Request body is required',
            status: 400,
            code: 'MISSING_BODY',
          },
          ok: false,
          response: new Response(
            JSON.stringify({
              error: 'Request body is required',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }

      const { preferences, type, domain } = options.body;

      console.log(
        '[setConsent] Extracted data - preferences:',
        preferences,
        'type:',
        type,
        'domain:',
        domain,
      );

      if (type !== 'cookie_banner') {
        console.log('[setConsent] Invalid consent type, expected cookie_banner but got:', type);

        return {
          data: null,
          error: {
            message: 'Only cookie_banner type is supported in cookie-based implementation',
            status: 400,
            code: 'UNSUPPORTED_TYPE',
          },
          ok: false,
          response: new Response(
            JSON.stringify({
              error: 'Only cookie_banner type is supported',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }

      // Set the consent cookie using the existing function
      try {
        console.log(
          '[setConsent] Attempting to set consent cookie with preferences:',
          preferences || {},
        );

        await setC15tConsentCookie({
          preferences: preferences || {},
          timestamp: new Date(),
        });

        console.log('[setConsent] Successfully set consent cookie');

        // Return a mock response that matches the expected interface
        const mockResponse = {
          id: `consent_${Date.now()}`,
          subjectId: undefined,
          externalSubjectId: undefined,
          domainId: `domain_${domain}`,
          domain,
          type: 'cookie_banner' as const,
          status: 'active',
          recordId: `record_${Date.now()}`,
          metadata: {},
          givenAt: new Date(),
        };

        console.log('[setConsent] Returning success response:', mockResponse);

        return {
          data: mockResponse,
          error: null,
          ok: true,
          response: new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }),
        };
      } catch (error: unknown) {
        console.log('[setConsent] Error setting consent cookie:', error);

        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : 'Failed to set consent',
            status: 500,
            code: 'CONSENT_SET_FAILED',
            cause: error,
          },
          ok: false,
          response: new Response(
            JSON.stringify({
              error: 'Failed to set consent',
            }),
            {
              status: 500,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }
    },

    /**
     * Handler for the verifyConsent endpoint
     * Verifies consent by checking the cookie data
     * @param {object} options - Request options containing body with verification data
     * @returns {Promise<object>} Response context with verification result
     */
    verifyConsent(options?: { body?: { type?: string; preferences?: string[] } }) {
      console.log('[verifyConsent] Handler invoked with options:', options);

      if (!options?.body) {
        console.log('[verifyConsent] No request body provided, returning error');

        return {
          data: null,
          error: {
            message: 'Request body is required',
            status: 400,
            code: 'MISSING_BODY',
          },
          ok: false,
          response: new Response(
            JSON.stringify({
              error: 'Request body is required',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }

      const { type, preferences } = options.body;

      console.log('[verifyConsent] Extracted data - type:', type, 'preferences:', preferences);

      const consentData = parseConsentCookie();

      console.log('[verifyConsent] Parsed consent data:', consentData);

      if (!consentData) {
        console.log('[verifyConsent] No consent data found, returning invalid result');

        return {
          data: {
            isValid: false,
            reasons: ['No consent cookie found'],
            consent: undefined,
          },
          error: null,
          ok: true,
          response: new Response(
            JSON.stringify({
              isValid: false,
              reasons: ['No consent cookie found'],
              consent: undefined,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }

      // Check if the consent type matches
      if (type !== 'cookie_banner') {
        console.log('[verifyConsent] Consent type mismatch, expected cookie_banner but got:', type);

        return {
          data: {
            isValid: false,
            reasons: ['Consent type mismatch'],
            consent: undefined,
          },
          error: null,
          ok: true,
          response: new Response(
            JSON.stringify({
              isValid: false,
              reasons: ['Consent type mismatch'],
              consent: undefined,
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
            },
          ),
        };
      }

      // Check if all requested preferences are granted
      const requestedPreferences = preferences || [];

      console.log(
        '[verifyConsent] Checking preferences - requested:',
        requestedPreferences,
        'stored:',
        consentData.preferences,
      );

      const isValid = requestedPreferences.every(
        (pref: string) => consentData.preferences[pref] === true,
      );

      console.log('[verifyConsent] Validation result - isValid:', isValid);

      const reasons: string[] = [];

      if (!isValid) {
        const missingPreferences = requestedPreferences.filter(
          (pref: string) => consentData.preferences[pref] !== true,
        );

        console.log('[verifyConsent] Missing preferences:', missingPreferences);

        reasons.push(`Missing consent for: ${missingPreferences.join(', ')}`);
      }

      const responseData = {
        isValid,
        reasons: reasons.length > 0 ? reasons : undefined,
        consent: isValid
          ? {
              id: `consent_${consentData.timestamp.getTime()}`,
              purposeIds: Object.keys(consentData.preferences).filter(
                (key) => consentData.preferences[key] === true,
              ),
            }
          : undefined,
      };

      console.log('[verifyConsent] Returning verification result:', responseData);

      return {
        data: responseData,
        error: null,
        ok: true,
        response: new Response(
          JSON.stringify({
            isValid,
            reasons: reasons.length > 0 ? reasons : undefined,
            consent: isValid
              ? {
                  id: `consent_${consentData.timestamp.getTime()}`,
                  purposeIds: Object.keys(consentData.preferences).filter(
                    (key) => consentData.preferences[key] === true,
                  ),
                }
              : undefined,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      };
    },
  };
}

export function Providers({ children }: PropsWithChildren) {
  console.log('[Providers] Rendering Providers component');

  const customHandlers = createCustomHandlers();

  console.log('[Providers] Created custom handlers:', Object.keys(customHandlers));

  return (
    <SearchProvider>
      <Toaster position="top-right" />
      <ConsentManagerProvider
        options={{
          mode: 'custom',
          // consentCategories: ['necessary', 'marketing'],
          // @ts-expect-error @todo fix types
          endpointHandlers: customHandlers,
        }}
      >
        <ConsentManagerCallbacks
          callbacks={
            {
              // async onConsentSet(response) {
              //   const res = await setC15tConsentCookie({
              //     preferences: response.preferences,
              //     timestamp: new Date(),
              //   });
              //   if (!res.ok) {
              //     throw new Error('Failed to set consent');
              //   }
              // },
            }
          }
        />
        <CookieBanner />
        <ConsentManagerDialog />
        {children}
      </ConsentManagerProvider>
    </SearchProvider>
  );
}
