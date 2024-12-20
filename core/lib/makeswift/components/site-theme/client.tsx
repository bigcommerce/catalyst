/* eslint-disable @typescript-eslint/consistent-type-definitions */
'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

import * as Theme from './theme';

type Colors = {
  primary?: string;
  accent?: string;
  success?: string;
  error?: string;
  warning?: string;
  info?: string;
  background?: string;
  foreground?: string;
  contrast?: {
    100?: string;
    200?: string;
    300?: string;
    400?: string;
    500?: string;
  };
};

type Font = {
  fontFamily: string;
};

type Fonts = {
  heading: Font;
  body: Font;
  mono: Font;
};

type Props = {
  colors: Colors;
  fonts?: Fonts;
};

const colorToHslValue = (color: string) =>
  color.startsWith('rgb') ? `from ${color} h s l` : color;

const colorToCssVar = (name: string, color: string) => `--${name}: ${colorToHslValue(color)};`;

function colorsToCssVars(colors: Colors) {
  const { contrast, ...rest } = colors;

  const mainColors = Object.entries(rest).map(([key, color]) =>
    color ? colorToCssVar(key, color) : null,
  );

  const contrastColors = Object.entries(contrast ?? {}).map(([value, color]) =>
    color ? colorToCssVar(`contrast-${value}`, color) : null,
  );

  return [...mainColors, ...contrastColors].filter(Boolean).join('\n');
}

const fontToCssVar = (name: string, { fontFamily }: Font) =>
  `--font-family-${name}: ${fontFamily};`;

function fontsToCssVars(fonts: Fonts) {
  const vars = Object.entries(fonts).map(([key, font]) => fontToCssVar(key, font));

  return vars.join('\n');
}

export const SiteTheme = ({ colors, fonts }: Props) => {
  return (
    <style data-makeswift="theme">{`:root {
      ${colorsToCssVars(colors)}
      ${fonts ? fontsToCssVars(fonts) : ''}
    }
  `}</style>
  );
};

const PropsContext = createContext<Props>({ colors: {}, fonts: Theme.fonts });

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
type ColorMap<K extends string> = {
  [key in K]?: string | ColorMap<K>;
};

function mergeColors<K extends string>(left: ColorMap<K>, right: ColorMap<K>): ColorMap<K> {
  const result = { ...left };

  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const key in right) {
    const rightValue = right[key];

    if (rightValue != null) {
      result[key] =
        typeof rightValue === 'object' ? mergeColors(left[key] ?? {}, rightValue) : rightValue;
    }
  }

  return result;
}

export const MakeswiftSiteTheme = ({ colors, fonts }: Props) => {
  const { colors: passedColors } = useContext(PropsContext);

  return <SiteTheme colors={mergeColors(passedColors, colors)} fonts={fonts} />;
};
