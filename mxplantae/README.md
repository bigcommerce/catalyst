# Makeswift Next.js Starter

## Demo

https://makeswift-examples-basic-typescript.vercel.app/

## Getting Started

This template contains a simple Next.js app integrated with [Makeswift](https://www.makeswift.com) so you can visually edit your Next.js pages.

### Automatic Setup

Use the Makeswift CLI to clone this repo and set everything up with a single command:

```bash
npx makeswift@latest init --example=basic-typescript
```

### Manual Setup

Alternatively, you can set things up manually without using the CLI.

Once you've cloned the repository, install the dependencies:

```
yarn install
```

Then, find your Makeswift's site API key in our site's setting and add it to your `.env.local` file:

```
MAKESWIFT_SITE_API_KEY=<your_makeswift_site_api_key>
```

Next, start your Next.js development server:

```
yarn dev
```

Finally, update your Makeswift site's host URL in to your local development server (e.g., http://localhost:3000). Your site's host URL is found in your Makeswift site's settings.

## Learn More

To learn more about Next.js or Makeswift, take a look at the following resources:

- [Next.js](https://nextjs.org/) - Documentation and tutorials for Next.js
- [Makeswift Docs](https://www.makeswift.com/docs) - Technical documentation for integrating Makeswift
- [Makeswift Help Center](https://help.makeswift.com/) - Guides for using the Makeswift builder

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmakeswift%2Fmakeswift%2Ftree%2Fmain%2Fexamples%2Fbasic-typescript&project-name=makeswift-nextjs-starter&repository-name=makeswift-nextjs-starter&redirect-url=https%3A%2F%2Fapp.makeswift.com&integration-ids=oac_51ryd7Pob5ZsyTFzNzVvpsGq&external-id=spark)
