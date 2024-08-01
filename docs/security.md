# Security

Since Catalyst is optimized for production commerce sites utilizing BigCommerce, it benefits from the security standards of BigCommerce's platform in addition to the implementation of strong best practices for the Next.js framework.

## BigCommerce certifications

All commerce operations and checkout functionality by default utilize BigCommerce's GraphQL APIs and hosted checkout experience, which are backed by a robust set of data privacy and security certifications:

- **CCPA**
- **CSA STAR**
- **EU-US DPF**
- **FIPS 140-2**
- **GDPR**
- **ISO 22301**
- **ISO 27001 SoA**
- **ISO 27001:2022**
- **ISO 27017**
- **ISO 27018**
- **ISO 27701**
- **PCI DSS**
- **Privacy Shield**
- **RH-ISAC**
- **SOC 1, SOC 2, SOC 3**
- **TX-RAMP**
- **Visa Service Provider**

You can learn more about these certifications and request a security review at [security.bigcommerce.com](https://security.bigcommerce.com).

## Best practices implemented

### Limited Data Access

Out-of-the-box, Catalyst is 100% powered by a GraphQL Storefront API that has zero access to admin functionality. It's scoped only to the storefront and either anonymous or authenticated shoppers.

### Content Security Policy (CSP)

Catalyst implements a default Content Security Policy (CSP), which can be extended to meet your organization’s specific security standards. This enables you to specify the sources of content that are allowed to be loaded on your site, which helps to prevent Cross-Site Scripting (XSS) and data injection attacks.

More details on customizing your CSP policy can be found here:
[Configuring Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)

## Framework benefits

### Next.js Security Record

The Next.js framework used by Catalyst has a rock solid track record of security, aided by hundreds of active contributors, and shares the same health rating as React from Snyk:
[Next.js Security Rating by Snyk](https://snyk.io/advisor/npm-package/next)

### Industry Adoption

You're in good company! Next.js is trusted by many companies handling millions of users and sensitive data across various sectors, including commerce, ticketing, and media. Explore some of these use cases here:
[Next.js Showcase](https://nextjs.org/showcase)
