import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';
import { server } from './tests/helpers/server';
import '@testing-library/jest-dom';
// Polyfill TextEncoder/TextDecoder for MSW internals
if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder;
}

// MSW lifecycle hooks
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
