import localFont from 'next/font/local';

export const inter = localFont({
  src: [
    { path: '../public/fonts/Inter-Regular.woff2', weight: '400' },
    // Add more weights if available, e.g.:
    // { path: '../public/fonts/Inter-Bold.woff2', weight: '700' },
  ],
  variable: '--font-family-inter',
  display: 'swap',
});

export const dmSerifText = localFont({
  src: '../public/fonts/DMSerifText-Regular.woff2',
  variable: '--font-family-dm-serif-text',
  display: 'swap',
});

export const robotoMono = localFont({
  src: '../public/fonts/RobotoMono-Regular.woff2',
  variable: '--font-family-roboto-mono',
  display: 'swap',
});

export const fonts = [inter, dmSerifText, robotoMono];
