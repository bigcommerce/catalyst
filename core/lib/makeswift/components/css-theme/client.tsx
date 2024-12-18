'use client';

import { createContext, type PropsWithChildren, useContext } from 'react';

interface Colors {
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
}

interface Props {
  colors: Colors;
}

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

export const CssTheme = ({ colors }: Props) => {
  return (
    <style data-makeswift="theme">{`:root {
      ${colorsToCssVars(colors)}
    }
  `}</style>
  );
};

const PropsContext = createContext<Props>({ colors: {} });

export const PropsContextProvider = ({ value, children }: PropsWithChildren<{ value: Props }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

type ColorMap<K extends string> = {
  [key in K]?: string | ColorMap<K>;
};

function mergeColors<K extends string>(left: ColorMap<K>, right: ColorMap<K>): ColorMap<K> {
  const result = { ...left };
  for (const key in right) {
    const rightValue = right[key];
    if (rightValue != null) {
      result[key] =
        typeof rightValue === 'object' ? mergeColors(left[key] ?? {}, rightValue) : rightValue;
    }
  }
  return result;
}

export const MakeswiftCssTheme = ({ colors }: Props) => {
  const { colors: passedColors } = useContext(PropsContext);
  return <CssTheme colors={mergeColors(passedColors, colors)} />;
};
