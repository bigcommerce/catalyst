export const eraseCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

export function getCookie(name: string) {
  const cookies = document.cookie.split(';').reduce<Record<string, string>>((acc, cookieString) => {
    const [key, value] = cookieString.split('=').map((s) => s.trim());

    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }

    return acc;
  }, {});

  return cookies[name] || null;
}

export const setCookie = (name: string, value: string, days: number) => {
  let expires = '';

  if (days) {
    const date = new Date();

    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${value || ''}${expires}; path=/`;
};
