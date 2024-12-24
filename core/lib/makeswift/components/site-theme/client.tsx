/* eslint-disable @typescript-eslint/consistent-type-definitions */
'use client';

type Font = {
  fontFamily: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type ThemeProps = {
  [key in string]?: string | number | Font | ThemeProps;
};

function isFont(value: unknown): value is Font {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const keys = Object.keys(value);

  return keys.length === 1 && 'fontFamily' in value && typeof value.fontFamily === 'string';
}

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

const colorToCssVar = (name: string, color: string) => `--${toKebab(name)}: ${color};`;
const pixelsToCssVar = (name: string, px: number) => `--${toKebab(name)}: ${px}px;`;
const fontToCssVar = (name: string, { fontFamily }: Font) =>
  `--${toKebab(name)}-family: ${fontFamily};`;

type Options = {
  colorTransform?: (color: string) => string;
};

function propToCssVars(
  key: string,
  prop: string | number | Font | ThemeProps,
  options: Options,
): string | string[] {
  if (typeof prop === 'string') {
    const { colorTransform } = options;

    return colorToCssVar(key, colorTransform ? colorTransform(prop) : prop);
  }

  if (typeof prop === 'number') {
    return pixelsToCssVar(key, prop);
  }

  if (isFont(prop)) {
    return fontToCssVar(key, prop);
  }

  return Object.entries(prop)
    .flatMap(([subKey, subProp]) =>
      subProp != null ? propToCssVars(`${key}-${subKey}`, subProp, options) : null,
    )
    .filter((v) => v != null);
}

const baseFontsToCssVars = (baseFonts: BaseFonts): string[] =>
  Object.entries(baseFonts).map(
    ([name, { fontFamily }]) => `--font-family-${name}: ${fontFamily};`,
  );

const themeToCssVars = (theme: ThemeProps, options: Options = {}): string[] =>
  Object.entries(theme)
    .flatMap(([key, prop]) => (prop != null ? propToCssVars(key, prop, options) : null))
    .filter((v) => v != null);

type BaseFonts = {
  heading: Font;
  body: Font;
  mono: Font;
};

type BaseProps = {
  baseFonts: BaseFonts;
  baseColors: ThemeProps;
};

const colorToHslValue = (color: string) =>
  color.startsWith('rgb') ? `from ${color} h s l` : color;

export const SiteTheme = ({ baseFonts, baseColors, ...theme }: BaseProps & ThemeProps) => (
  <style data-makeswift="theme">{`:root {
      ${baseFontsToCssVars(baseFonts).join('\n')}
      ${themeToCssVars(baseColors, { colorTransform: colorToHslValue }).join('\n')}
      ${themeToCssVars(theme).join('\n')}
    }
  `}</style>
);

type Props = BaseProps & {
  components: ThemeProps;
  layouts: ThemeProps;
  sections: ThemeProps;
};

export const MakeswiftSiteTheme = ({
  baseFonts,
  baseColors,
  components,
  layouts,
  sections,
}: Props) => {
  return <SiteTheme {...{ baseFonts, baseColors, ...components, ...layouts, ...sections }} />;
};
