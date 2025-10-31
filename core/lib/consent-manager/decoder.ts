import { ConsentCookieSchema } from './schema';

export const decode = (raw: string) => {
  try {
    const json: unknown = JSON.parse(decodeURIComponent(raw));

    return ConsentCookieSchema.parse(json);
  } catch {
    return null;
  }
};
