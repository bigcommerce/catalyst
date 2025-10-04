import { Font, Select } from '@makeswift/runtime/controls';

export const fontFamilyTokens = {
  heading: Font({
    label: 'Heading',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-inter)' },
  }),
  body: Font({
    label: 'Body',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-inter)' },
  }),
  accent: Font({
    label: 'Accent',
    variant: false,
    defaultValue: { fontFamily: 'var(--font-family-roboto-mono)' },
  }),
};

type FontFamilyToken = keyof typeof fontFamilyTokens;
export type FontFamilyCssVar = `var(--font-family-${FontFamilyToken})`;

const fontFamilyCssVar = (token: FontFamilyToken): FontFamilyCssVar =>
  `var(--font-family-${token})`;

const fontFamilyOption = (token: FontFamilyToken): { label: string; value: FontFamilyCssVar } => ({
  label: `${fontFamilyTokens[token].config.label}`,
  value: fontFamilyCssVar(token),
});

export const FontFamily = ({
  label,
  defaultValue,
}: {
  label: string;
  defaultValue: FontFamilyCssVar;
}) =>
  Select({
    label,
    options: [fontFamilyOption('heading'), fontFamilyOption('body'), fontFamilyOption('accent')],
    defaultValue,
  });

FontFamily.Heading = fontFamilyCssVar('heading');
FontFamily.Body = fontFamilyCssVar('body');
FontFamily.Accent = fontFamilyCssVar('accent');
