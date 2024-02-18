import HomePage from '../page';

export default HomePage;

export const dynamic = 'force-static';
export const revalidate = 600;
export const runtime = process.env.NEXTJS_STATIC_RUNTIME
  ? process.env.NEXTJS_STATIC_RUNTIME
  : 'nodejs';
