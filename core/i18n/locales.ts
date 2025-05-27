import { buildConfig } from '~/build-config/reader';

const localeNodes = buildConfig.get('locales');

export const locales = localeNodes.map((locale) => locale.code);
export const defaultLocale = localeNodes.find((locale) => locale.isDefault)?.code ?? 'en';
