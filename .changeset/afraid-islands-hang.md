---
"@bigcommerce/catalyst-core": minor
---

Upgrade c15t to 1.8.2, migrate from custom mode to offline mode, refactor consent cookie handling to use c15t's compact format, add script location support for HEAD/BODY rendering, and add privacy policy link support to CookieBanner.

## What Changed

- Upgraded `@c15t/nextjs` to version `1.8.2`
- Changed consent manager mode from `custom` (with endpoint handlers) to `offline` mode
  - Removed custom `handlers.ts` implementation
- Added `enabled` prop to `C15TConsentManagerProvider` to control consent manager functionality
- Removed custom consent cookie encoder/decoder implementations (`decoder.ts`, `encoder.ts`)
- Added `parse-compact-format.ts` to handle c15t's compact cookie format
  - Compact format: `i.t:timestamp,c.necessary:1,c.functionality:1,etc...`
- Updated cookie parsing logic in both client and server to use the new compact format parser
- Scripts now support `location` field from BigCommerce API and can be rendered in `<head>` or `<body>` based on the `target` property
- `CookieBanner` now supports the `privacyPolicyUrl` field from BigCommerce API and will be rendered in the banner description if available.

## Migration Path

### Consent Manager Provider Changes

The `ConsentManagerProvider` now uses `offline` mode instead of `custom` mode with endpoint handlers. The provider configuration has been simplified:

**Before:**
```typescript
<C15TConsentManagerProvider
  options={{
    mode: 'custom',
    consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],
    endpointHandlers: {
      showConsentBanner: () => showConsentBanner(isCookieConsentEnabled),
      setConsent,
      verifyConsent,
    },
  }}
>
  <ClientSideOptionsProvider scripts={scripts}>
    {children}
  </ClientSideOptionsProvider>
</C15TConsentManagerProvider>
```

**After:**
```typescript
<C15TConsentManagerProvider
  options={{
    mode: 'offline',
    storageConfig: {
      storageKey: CONSENT_COOKIE_NAME,
      crossSubdomain: true,
    },
    consentCategories: ['necessary', 'functionality', 'marketing', 'measurement'],
    enabled: isCookieConsentEnabled,
  }}
>
  <ClientSideOptionsProvider scripts={scripts}>
    {children}
  </ClientSideOptionsProvider>
</C15TConsentManagerProvider>
```

**Key changes:**
- `mode` changed from `'custom'` to `'offline'`
- Removed `endpointHandlers` - no longer needed in offline mode
- Added `enabled` prop to control consent manager functionality
- Added `storageConfig` for cookie storage configuration

### Cookie Handling

If you have custom code that directly reads or writes consent cookies, you'll need to update it:

**Before:**
The previous implementation used custom encoding/decoding. If you were directly accessing consent cookie values, you would have needed to use the custom decoder.

**After:**
The consent cookie now uses c15t's compact format. The public API for reading cookies remains the same:

```typescript
import { getConsentCookie } from '~/lib/consent-manager/cookies/client'; // client-side
// or
import { getConsentCookie } from '~/lib/consent-manager/cookies/server'; // server-side

const consent = getConsentCookie();
```

The `getConsentCookie()` function now internally uses `parseCompactFormat()` to parse the compact format cookie string. If you were directly parsing cookie values, you should now use the `getConsentCookie()` helper instead.

`getConsentCookie` now returns a compact version of the consent values:

```typescript
{
  i.t: 123456789,
  c.necessary: true,
  c.functionality: true,
  c.marketing: false,
  c.measurment: false
}
```

Updated instances where `getConsentCookie` is used to reflect this new schema.

Removed `setConsentCookie` from server and client since this is now handled by the c15t library.

### Script Location Support

Scripts now support rendering in either `<head>` or `<body>` based on the `location` field from the BigCommerce API:

```typescript
// Scripts transformer now includes target based on location
target: script.location === 'HEAD' ? 'head' : 'body'
```

The `ScriptsFragment` GraphQL query now includes the `location` field, allowing scripts to be placed in the appropriate DOM location. `FOOTER` location is still not supported.

### Privacy Policy

The `RootLayoutMetadataQuery` GraphQL query now includes the `privacyPolicyUrl` field, which renders a provicy policy link in the `CookieBanner` description.

```typescript
<CookieBanner 
  privacyPolicyUrl="https://example.com/privacy-policy"
  // ... other props
/>
```

The privacy policy link:
- Opens in a new tab (`target="_blank"`)
- Only renders if `privacyPolicyUrl` is provided as a non-empty string

Add translatable `privacyPolicy` field to `Components.ConsentManager.CookieBanner` translation namespace for the privacy policy link text.