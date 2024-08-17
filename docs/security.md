# Security

Since Catalyst is optimized for production ecommerce sites utilizing BigCommerce, it benefits from the security standards of BigCommerce's platform in addition to the implementation of strong best practices for the Next.js framework.

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

### Security vulnerability monitoring

Catalyst is a part of BigCommerce's bug bounty program and the security team actively monitors and responds to reports, in addition to automatically scanning and manually accessing this codebase internally. Learn more within SECURITY.md [here](https://github.com/bigcommerce/catalyst/blob/main/SECURITY.md).

## Best practices implemented

### Limited data access

By default, Catalyst is 100% powered by a GraphQL Storefront API that has zero access to admin functionality. It's scoped only to the storefront and either anonymous or authenticated shoppers.

### Content Security Policy (CSP)

Catalyst implements a default Content Security Policy (CSP), which can be extended to meet your organization’s specific security standards. This enables you to specify the sources of content that are allowed to be loaded on your site, which helps to prevent Cross-Site Scripting (XSS) and data injection attacks.

You can customize your CSP policy in the codebase [here](https://github.com/bigcommerce/catalyst/blob/main/core/lib/content-security-policy.js#L10).

## Framework benefits

### Next.js security record

The Next.js framework used by Catalyst has a solid track record of security, aided by hundreds of active contributors, including a consistently high [package health score](https://snyk.io/advisor/npm-package/next) as reported by Snyk.


### Industry adoption

You're in good company! Next.js is trusted by many companies handling millions of users and sensitive data across various sectors, including commerce, ticketing, and media. Explore some of these use cases [here](https://nextjs.org/showcase).
