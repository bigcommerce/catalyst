// @ts-check
const makeswiftEnabled = !!process.env.MAKESWIFT_SITE_API_KEY;

const makeswiftBaseUrl = process.env.MAKESWIFT_BASE_URL || 'https://app.makeswift.com';

const frameAncestors = makeswiftEnabled ? makeswiftBaseUrl : 'none';

const builder = require('content-security-policy-builder');

// customize the directives as needed
const cspHeader = builder({
  directives: {
    baseUri: ['self'],
    frameAncestors: [frameAncestors],
    // formAction: ['self'],
    // defaultSrc: ['self'],
    // scriptSrc: ['self'],
    // styleSrc: ['self'],
    // imgSrc: ['self'],
    // connectSrc: ['self'],
    // fontSrc: ['self'],
    // objectSrc: ['none'],
    // mediaSrc: ['self'],
    // frameSrc: ['self'],
    // childSrc: ['self'],
    // manifestSrc: ['self'],
    // workerSrc: ['self'],
    // prefetchSrc: ['self'],
    // navigateTo: ['self'],
    // reportUri: ['none'],
  },
});

module.exports = {
  cspHeader,
};
