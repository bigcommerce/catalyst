// Default runtime to use for most pages. Setting this globally helps with making the
// codebase compatible with certain hosting providers at the flip of a switch.
export const envRuntime = process.env.NEXTJS_RUNTIME ? process.env.NEXTJS_RUNTIME : 'edge';

// Default runtime to use for static pages. Static generation only works with nodejs
// runtime, but using `edge` runtime for these pages is sometimes needed for compatibility.
export const envStaticRuntime = process.env.NEXTJS_STATIC_RUNTIME
  ? process.env.NEXTJS_STATIC_RUNTIME
  : 'nodejs';
