import { describe, expect, it } from 'vitest';

import { isInteractiveRequest } from './is-interactive-request';

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const SAFARI_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1';
const FIREFOX_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0';

const HTML_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

const navigation = {
  accept: HTML_ACCEPT,
  'sec-fetch-mode': 'navigate',
  'sec-fetch-dest': 'document',
};

function request(headers: Record<string, string>) {
  return new Request('https://store.example.com/', { headers });
}

describe('isInteractiveRequest', () => {
  it.each([
    ['Chrome', CHROME_UA],
    ['Safari', SAFARI_UA],
    ['Firefox', FIREFOX_UA],
  ])('counts a %s page navigation', (_, userAgent) => {
    expect(isInteractiveRequest(request({ ...navigation, 'user-agent': userAgent }))).toBe(true);
  });

  it.each([
    ['Googlebot', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'],
    ['Bingbot', 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'],
    [
      'GPTBot',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
    ],
    [
      'HeadlessChrome',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36',
    ],
    ['curl', 'curl/8.7.1'],
    ['python-requests', 'python-requests/2.32.3'],
    ['Go', 'Go-http-client/1.1'],
    ['node', 'node'],
  ])('skips %s even with navigation headers', (_, userAgent) => {
    expect(isInteractiveRequest(request({ ...navigation, 'user-agent': userAgent }))).toBe(false);
  });

  it('skips a request without a User-Agent', () => {
    expect(isInteractiveRequest(request(navigation))).toBe(false);
    expect(isInteractiveRequest(request({ ...navigation, 'user-agent': '' }))).toBe(false);
  });

  it('skips fetch and XHR requests', () => {
    expect(
      isInteractiveRequest(
        request({
          accept: '*/*',
          'user-agent': CHROME_UA,
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
        }),
      ),
    ).toBe(false);
  });

  it('skips image requests', () => {
    expect(
      isInteractiveRequest(
        request({
          accept: 'image/avif,image/webp,*/*',
          'user-agent': CHROME_UA,
          'sec-fetch-mode': 'no-cors',
          'sec-fetch-dest': 'image',
        }),
      ),
    ).toBe(false);
  });

  it('skips iframe navigations', () => {
    expect(
      isInteractiveRequest(
        request({ ...navigation, 'user-agent': CHROME_UA, 'sec-fetch-dest': 'iframe' }),
      ),
    ).toBe(false);
  });

  it('decides on the fetch-metadata header that is present', () => {
    expect(
      isInteractiveRequest(
        request({ accept: '*/*', 'user-agent': CHROME_UA, 'sec-fetch-mode': 'navigate' }),
      ),
    ).toBe(true);
    expect(
      isInteractiveRequest(
        request({ accept: HTML_ACCEPT, 'user-agent': CHROME_UA, 'sec-fetch-mode': 'cors' }),
      ),
    ).toBe(false);
    expect(
      isInteractiveRequest(
        request({ accept: HTML_ACCEPT, 'user-agent': CHROME_UA, 'sec-fetch-dest': 'script' }),
      ),
    ).toBe(false);
  });

  it('counts a request without fetch metadata that accepts HTML', () => {
    expect(isInteractiveRequest(request({ accept: HTML_ACCEPT, 'user-agent': SAFARI_UA }))).toBe(
      true,
    );
  });

  it('skips a request without fetch metadata that does not accept HTML', () => {
    expect(isInteractiveRequest(request({ accept: '*/*', 'user-agent': SAFARI_UA }))).toBe(false);
    expect(isInteractiveRequest(request({ 'user-agent': SAFARI_UA }))).toBe(false);
  });
});
