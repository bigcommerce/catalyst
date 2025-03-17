// import '@testing-library/jest-dom';
// import 'whatwg-fetch';
// import { server } from './tests/helpers/server';

// // Start MSW before tests
// beforeAll(() => server.listen());

// // Reset handlers after each test
// afterEach(() => server.resetHandlers());

// // Stop MSW after all tests
// afterAll(() => server.close());


import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch'; // Or 'cross-fetch/polyfill'
import { server } from './tests/helpers/server';

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
