#!/usr/bin/env node
// Finds common mistakes in new component code that typecheck and eslint do not catch: values
// outside the theme, shopper data in a shared cache, storage without consent, unsafe HTML or
// links, outside code, and leftover sample data. Each finding says why it matters.
// These are simple text checks. No finding does not prove that the code is safe.
// Run from the storefront directory (the folder with next.config.ts).
//
//   node .agents/skills/create-component/scripts/check.mjs <file> [<file> ...]

import { existsSync, readFileSync } from 'node:fs';

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('Usage: check.mjs <file> [<file> ...]  (the files you created or changed)');
  process.exit(1);
}

// Each rule looks at one line, or at the whole file when `file` is set.
const RULES = [
  {
    id: 'color-value',
    level: 'error',
    line: /(?:^|[\s"'`[(:,-])#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsl\((?!var\()/,
    why: 'Use a theme token (for example `bg-primary`), so the merchant can restyle the store in one place.',
  },
  {
    id: 'outside-font',
    level: 'error',
    line: /fonts\.(googleapis|gstatic)\.com|from ['"]next\/font/,
    why: 'Fonts come from `app/fonts.ts`. A font added in a component loads twice and skips the theme.',
  },
  {
    id: 'outside-code',
    level: 'error',
    line: /<iframe\b|<script\b/,
    why: "Outside code runs with the shopper's session and can track them. Reuse a tracked component (for example `LiteYouTube`) or ask the user.",
  },
  {
    id: 'unsafe-link',
    level: 'error',
    line: /(href|src)=\{?\s*['"`](javascript:|http:\/\/)/,
    why: 'Use a relative path or an `https:` URL. Other schemes can run script or leak data.',
  },
  {
    id: 'sample-data',
    level: 'error',
    line: /SAMPLE-DATA/,
    why: 'Remove sample data before you finish, so shoppers never see it.',
  },
  {
    id: 'public-env',
    level: 'warning',
    line: /NEXT_PUBLIC_/,
    why: 'A `NEXT_PUBLIC_` value is sent to every browser. Never put a secret in one.',
  },
  {
    id: 'env-in-client',
    level: 'error',
    file: (text) => text.includes("'use client'") && /process\.env\./.test(text),
    why: 'A client file ships to the browser, so any `process.env` value in it becomes public.',
  },
  {
    id: 'shopper-cache',
    level: 'error',
    file: (text) =>
      /customerAccessToken/.test(text) &&
      /client\.fetch/.test(text) &&
      /revalidate/.test(text) &&
      !/no-store/.test(text),
    why: "A signed-in result in the shared cache can be served to another shopper. Use `{ cache: 'no-store' }` when there is a `customerAccessToken`.",
  },
  {
    id: 'customer-cache',
    level: 'error',
    file: (text) =>
      /\bcustomer\s*\{/.test(text) && /revalidate/.test(text) && !/no-store/.test(text),
    why: "The `customer` field is signed-in data only. Fetch it with `{ cache: 'no-store' }`.",
  },
  {
    id: 'storage-without-consent',
    level: 'error',
    file: (text) =>
      /localStorage\.setItem|sessionStorage\.setItem|document\.cookie\s*=|(cookies\(\)|cookieStore)\.set\(/.test(
        text,
      ) && !/consent|persist/i.test(text),
    why: 'Storing data for the shopper needs `functionality` consent. Check it with `hasConsentFor` (server) or `useConsentManager` (client), or take a boolean prop from a caller that does.',
  },
  {
    id: 'html-not-rewritten',
    level: 'warning',
    file: (text) => /dangerouslySetInnerHTML/.test(text) && !/rewriteWysiwygContentUrls/.test(text),
    why: 'Merchant HTML needs `rewriteWysiwygContentUrls` (here or in its data file) so its images load. Never use `dangerouslySetInnerHTML` for shopper text.',
  },
];

let errors = 0;
let warnings = 0;

const report = (level, location, id, why) => {
  if (level === 'error') errors += 1;
  else warnings += 1;
  console.log(`${level.padEnd(7)} ${location}  ${id}: ${why}`);
};

files.forEach((path) => {
  if (!existsSync(path)) {
    report(
      'error',
      path,
      'missing-file',
      'The file does not exist. Pass paths from the storefront folder.',
    );
    return;
  }

  const text = readFileSync(path, 'utf8');
  const lines = text.split('\n');

  RULES.forEach((rule) => {
    if (rule.file) {
      if (rule.file(text)) report(rule.level, path, rule.id, rule.why);
      return;
    }

    lines.forEach((content, index) => {
      const trimmed = content.trim();
      const isComment = trimmed.startsWith('//') || trimmed.startsWith('*');

      if (!isComment && rule.line.test(content)) {
        report(rule.level, `${path}:${index + 1}`, rule.id, rule.why);
      }
    });
  });
});

console.log(`\n${errors} error(s), ${warnings} warning(s) in ${files.length} file(s).`);
process.exit(errors > 0 ? 1 : 0);
