export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize Highlight for Node.js runtime  
    const { H } = await import('@highlight-run/next/server');
    
    await H.init({
      projectID: process.env.NEXT_PUBLIC_HIGHLIGHT_PROJECT_ID || 'ng2zj60g',
      serviceName: 'catalyst-storefront',
    });
  }
}