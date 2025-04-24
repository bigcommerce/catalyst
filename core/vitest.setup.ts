import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw.server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
