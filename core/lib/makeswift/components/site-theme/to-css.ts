/* eslint-disable @typescript-eslint/consistent-type-definitions */

export type ThemeProps = {
  [key in string]?: string | number | ThemeProps;
};

function toKebab(str: string) {
  let result = '';

  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);

    if (char >= 'A' && char <= 'Z') {
      result += `-${char.toLowerCase()}`;
    } else {
      result += char;
    }
  }

  return result;
}

const valueToCssVar = (name: string, color: string) => `--${toKebab(name)}: ${color};`;
const pixelsToCssVar = (name: string, px: number) => `--${toKebab(name)}: ${px}px;`;

type Options = {
  valueTransform?: (value: string) => string;
};

function propToCssVars(
  key: string,
  prop: string | number | ThemeProps,
  options: Options,
): string | string[] {
  if (typeof prop === 'string') {
    const { valueTransform } = options;

    return valueToCssVar(key, valueTransform ? valueTransform(prop) : prop);
  }

  if (typeof prop === 'number') {
    return pixelsToCssVar(key, prop);
  }

  return Object.entries(prop)
    .flatMap(([subKey, subProp]) =>
      subProp != null ? propToCssVars(`${key}-${subKey}`, subProp, options) : null,
    )
    .filter((v) => v != null);
}

export const themeToCssVars = (theme: ThemeProps, options: Options = {}): string[] =>
  Object.entries(theme)
    .flatMap(([key, prop]) => (prop != null ? propToCssVars(key, prop, options) : null))
    .filter((v) => v != null);

type Font = {
  fontFamily: string;
};

export type FontFamilyTokens = Record<string, Font>;

export const fontTokensToCssVars = (tokens: FontFamilyTokens): string[] =>
  Object.entries(tokens).map(([name, { fontFamily }]) => `--font-family-${name}: ${fontFamily};`);
