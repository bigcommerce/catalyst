/* eslint-disable @typescript-eslint/consistent-type-definitions */
'use client';

import {
  type FontFamilyTokens,
  fontTokensToCssVars,
  type ThemeProps,
  themeToCssVars,
} from './to-css';

type TokensProps = {
  fontTokens: FontFamilyTokens;
};

export const SiteTheme = ({ fontTokens, ...theme }: TokensProps & ThemeProps) => (
  <style data-makeswift="theme">{`:root {
      ${fontTokensToCssVars(fontTokens).join('\n')}
      ${themeToCssVars(theme).join('\n')}
      --font-family-mono: var(--font-family-accent);
    }
  `}</style>
);

type Props = TokensProps & {
  components: ThemeProps & { header: ThemeProps };
};

export const MakeswiftSiteTheme = ({
  fontTokens,
  components: { header, ...components },
}: Props) => {
  return <SiteTheme {...{ fontTokens, ...header, ...components }} />;
};
