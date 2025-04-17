export const FORCE_REFRESH_COOKIE = 'force-refresh';

interface ClientCookieOptions {
  expires: Date;
  path: string;
  domain: string;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
  maxAge: number;
}

const cookiePropertyMap: Record<string, string> = {
  expires: 'Expires',
  path: 'Path',
  domain: 'Domain',
  secure: 'Secure',
  sameSite: 'SameSite',
  maxAge: 'Max-Age',
};

export function getCookieValue(name: string): string | null {
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((c) => c.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const cookieValue = cookie.split('=')[1];

  return cookieValue ?? null;
}

export function setCookie(
  name: string,
  value: string,
  options?: Partial<ClientCookieOptions>,
): void {
  const opts = options ?? {};
  const cookieOptions = Object.entries(opts)
    .reduce<string[]>((acc, [key, optValue]) => {
      const propKey = cookiePropertyMap[key];

      if (!propKey) {
        return acc;
      }

      if (propKey === 'Secure' && optValue === true) {
        return [...acc, propKey];
      }

      return [...acc, `${propKey}=${optValue.toString()}`];
    }, [])
    .join('; ');

  document.cookie = `${name}=${value}; ${cookieOptions};`;
}
