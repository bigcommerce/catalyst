import { z } from 'zod';

import { ConsentCookieSchema } from './schema';

type ConsentCookie = z.infer<typeof ConsentCookieSchema>;

export const encode = (c: ConsentCookie) => encodeURIComponent(JSON.stringify(c));
