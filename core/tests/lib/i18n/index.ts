import deepmerge from 'deepmerge';
import { createTranslator, Messages, NamespaceKeys, NestedKeyOf } from 'next-intl';

import { testEnv } from '~/tests/environment';

const { TESTS_LOCALE: locale, TESTS_FALLBACK_LOCALE: fallbackLocale } = testEnv;

async function loadMessages(): Promise<Messages> {
  const importJson = (path: string) => import(path, { with: { type: 'json' } });
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
  const messages = (await importJson(`~/messages/${locale}.json`)).default as Messages;

  if (locale === fallbackLocale) {
    return messages;
  }

  return deepmerge(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
    (await importJson(`~/messages/${fallbackLocale}.json`)).default as Messages,
    messages,
  );
}

export async function getTranslations<
  NestedKey extends NamespaceKeys<Messages, NestedKeyOf<Messages>> = never,
>(namespace?: NestedKey): Promise<ReturnType<typeof createTranslator<Messages, NestedKey>>> {
  return createTranslator<Messages, NestedKey>({
    namespace,
    messages: await loadMessages(),
    locale,
  });
}
