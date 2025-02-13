import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-family-mono',
});

export const fonts = [robotoMono];
