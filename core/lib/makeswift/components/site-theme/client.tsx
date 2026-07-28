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
      /* Variable aliases for backward compatibility */
      --font-family-mono: var(--font-family-accent);
      --button-primary-text: var(--button-primary-foreground);
      --button-secondary-text: var(--button-secondary-foreground);
      --button-tertiary-text: var(--button-tertiary-foreground);
      --button-ghost-text: var(--button-ghost-foreground);
      --button-danger-text: var(--button-danger-foreground);
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
