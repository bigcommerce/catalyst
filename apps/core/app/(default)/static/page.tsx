import { envStaticRuntime } from '~/runtime';

import HomePage from '../page';

export default HomePage;

export const dynamic = 'force-static';
export const revalidate = 600;
export const runtime = `${envStaticRuntime}`;
