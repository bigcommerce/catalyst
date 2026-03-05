import { cache } from 'react';

export const correlationId = cache(() => crypto.randomUUID());
