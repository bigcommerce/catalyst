import { cache } from 'react';

export const getCorrelationId = cache(() => crypto.randomUUID());
