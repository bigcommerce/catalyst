'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Link } from '~/components/link';
import { LocaleType } from '~/i18n/routing';

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
  id: LocaleType;
  region: string;
  language: string;
  flag: string;
}

interface Props {
  activeLocale: string;
  locales: Locale[];
}

const LocaleSwitcher = ({ activeLocale, locales }: Props) => {
  const t = useTranslations('Components.Header.LocaleSwitcher');

  const selectedLocale = locales.find((locale) => locale.id === activeLocale);

  const [regionSelected, setRegionSelected] = useState(selectedLocale?.region || '');
  const [languageSelected, setLanguageSelected] = useState(selectedLocale?.language || '');

  const languagesByRegionMap = useMemo(
    () =>
      locales.reduce<LanguagesByRegionMap>((acc, { region, language, flag }) => {
        if (!acc[region]) {
          acc[region] = { languages: [language], flag };
        } else if (!acc[region].languages.includes(language)) {
          acc[region].languages.push(language);
        }

        return acc;
      }, {}),
    [locales],
  );

  const newLocale = useMemo(
    () =>
      locales.find(
        (locale) => locale.language === languageSelected && locale.region === regionSelected,
      ),
    [languageSelected, locales, regionSelected],
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
    setLanguageSelected(language);
  };

  return (
    locales.length > 1 && (
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
            <div className="flex flex-col gap-4">
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
              <Button asChild>
                <Link className="hover:text-white" href="/" locale={newLocale?.id}>
                  {t('goToSite')}
                </Link>
              </Button>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  );
};

export { LocaleSwitcher, type Locale };
