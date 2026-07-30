import { createConsola } from 'consola';

export const consola = createConsola({
  level: process.env.CONSOLA_LEVEL ? parseInt(process.env.CONSOLA_LEVEL, 10) : 3,
  // Drop the per-line timestamp. It adds noise for a short-lived CLI and, on
  // long lines, consola can't right-align it so it falls back to an inline
  // `[time]` prefix that breaks copy-pasteable command suggestions.
  formatOptions: { date: false },
});
