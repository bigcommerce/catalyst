'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { LocaleType } from '~/i18n';
import { useRouter } from '~/navigation';

import { Button } from '../button';
import { Select } from '../form';

type LanguagesByRegionMap = Record<
  string,
  {
    languages: string[];
    flag: string;
  }
>;

interface Locale {
  id: string;
  region: string;
  language: string;
  flag: string;
}

interface Props {
  activeLocale: string;
  locales: Locale[];
}

const LocaleSwitcher = ({ activeLocale, locales }: Props) => {
  const router = useRouter();

  const t = useTranslations('Header');

  const selectedLocale = locales.find((locale) => locale.id === activeLocale);

  const [regionSelected, setRegionSelected] = useState(selectedLocale?.region || '');
  const [languageSelected, setLanguageSelected] = useState(selectedLocale?.language || '');

  const languagesByRegionMap = useMemo(
    () =>
      locales.reduce<LanguagesByRegionMap>((acc, { region, language, flag }) => {
        if (!acc[region]) {
          acc[region] = { languages: [language], flag };
        }

        if (!acc[region].languages.includes(language)) {
          acc[region].languages.push(language);
        }

        return acc;
      }, {}),
    [locales],
  );

  if (!selectedLocale) {
    return null;
  }

  const regions = Object.keys(languagesByRegionMap);

  const handleOnOpenChange = () => {
    setRegionSelected(selectedLocale.region);
    setLanguageSelected(selectedLocale.language);
  };

  const handleRegionChange = (region: string) => {
    setRegionSelected(region);
    setLanguageSelected(languagesByRegionMap[region]?.languages[0] || '');
  };

  const handleLanguageChange = (language: string) => {
    if (language) {
      setLanguageSelected(language);
    }
  };

  const handleOnSubmit = () => {
    const newLocale = locales.find(
      (locale) => locale.language === languageSelected && locale.region === regionSelected,
    );

    if (newLocale) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      router.replace('/', { locale: newLocale.id as LocaleType });
    }
  };

  return (
    Object.keys(locales).length > 1 && (
      <PopoverPrimitive.Root onOpenChange={handleOnOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          <button className="flex h-12 items-center p-3 text-2xl">{selectedLocale.flag}</button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            className="z-50 bg-white p-4 text-base shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            sideOffset={4}
          >
            <form className="flex flex-col gap-4" onSubmit={handleOnSubmit}>
              <p>{t('chooseCountryAndLanguage')}</p>
              <Select
                onValueChange={handleRegionChange}
                options={regions.map((region) => ({
                  value: region,
                  label: `${languagesByRegionMap[region]?.flag} ${region}`,
                }))}
                value={regionSelected}
              />
              <Select
                onValueChange={handleLanguageChange}
                options={
                  languagesByRegionMap[regionSelected]?.languages.map((language) => ({
                    value: language,
                    label: language,
                  })) || []
                }
                value={languageSelected}
              />
              <Button className="w-auto" type="submit">
                {t('goToSite')}
              </Button>
            </form>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  );
};

export { LocaleSwitcher, type Locale };
