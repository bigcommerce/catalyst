export const storyUrl = process.env.PLAYWRIGHT_TEST_BASE_URL
  ? `${process.env.PLAYWRIGHT_TEST_BASE_URL}/?path=/story`
  : 'https://catalyst-storybook.vercel.app/?path=/story';
export const storyBookFrame = '#storybook-preview-iframe';
export const storyBook = '#storybook-root';
