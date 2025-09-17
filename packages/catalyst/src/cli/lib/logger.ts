import { createConsola } from 'consola';

export const consola = createConsola({
  level: process.env.CONSOLA_LEVEL ? parseInt(process.env.CONSOLA_LEVEL, 10) : 3,
});
