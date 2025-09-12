import { themeToCssVars } from './to-css';

export const colors = {
  primary: '96 100% 68%',
  accent: '96 100% 88%',
  background: '0 0% 100%',
  foreground: '0 0% 7%',
  success: '116 78% 65%',
  error: '0 100% 60%',
  warning: '40 100% 60%',
  info: '220 70% 45%',
  contrast: {
    100: '0 0% 93%',
    200: '0 0% 82%',
    300: '0 0% 70%',
    400: '0 0% 54%',
    500: '0 0% 34%',
  },
  primaryMix: {
    white: {
      75: '98.2 100% 93%',
    },
    black: {
      75: '97.24, 74.36%, 7.65%',
    },
  },
};

export const BaseColors = () => (
  <style data-makeswift="theme-base-colors">{`:root {
      ${themeToCssVars(colors).join('\n')}
    }
  `}</style>
);
