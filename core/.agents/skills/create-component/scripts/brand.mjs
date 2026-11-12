#!/usr/bin/env node
// Prints the facts an agent needs to match a storefront's design: theme tokens, fonts,
// shape and shadow habits, and the existing components to reuse.
// Run from the storefront directory (the folder with next.config.ts).
//
//   node .agents/skills/create-component/scripts/brand.mjs

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const CSS_CANDIDATES = ['globals.css', 'app/globals.css', 'src/app/globals.css'];
const FONT_CANDIDATES = ['app/fonts.ts', 'src/app/fonts.ts'];
const SOURCE_DIRS = ['vibes', 'components', 'app'];
const COMPONENT_DIRS = ['vibes/soul/primitives', 'vibes/soul/sections', 'components'];
const SOURCE_EXTENSIONS = new Set(['.tsx', '.ts']);
// Classes that show a storefront's shape and depth. Counts show which one the design prefers.
const HABIT_PATTERNS = {
  corners: /\brounded(?:-[\w[\].%/]+)?\b/g,
  shadows: /\bshadow(?:-[\w[\].%/]+)?\b/g,
  borders: /\bborder(?:-[a-z]+)?-contrast-\d+\b/g,
};
const TOP_HABITS = 4;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const firstExisting = (paths) => paths.find((path) => existsSync(path));

const listSourceFiles = (dir) => {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name)))
    .filter((entry) => !entry.parentPath.includes('node_modules'))
    .map((entry) => join(entry.parentPath, entry.name));
};

if (
  !existsSync('next.config.ts') &&
  !existsSync('next.config.js') &&
  !existsSync('next.config.mjs')
) {
  fail('Run this script from the storefront directory (the folder with next.config.ts).');
}

const cssPath = firstExisting(CSS_CANDIDATES);

console.log('## Theme tokens');

if (cssPath) {
  console.log(`File: ${cssPath}`);

  const css = readFileSync(cssPath, 'utf8');
  const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*--[\w-]+\s*:[^{}]*)\}/g)];

  for (const [, selector, body] of blocks) {
    console.log(`${selector.split(';').pop().trim()} {`);
    body
      .split(';')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('--'))
      .forEach((line) => console.log(`  ${line};`));
    console.log('}');
  }
} else {
  console.log('No globals.css found. Read the Tailwind config instead.');
}

console.log('\n## Fonts');

const fontsPath = firstExisting(FONT_CANDIDATES);

if (fontsPath) {
  const fonts = readFileSync(fontsPath, 'utf8');
  const names = [...fonts.matchAll(/=\s*([A-Z][A-Za-z_]+)\(\{/g)].map((match) => match[1]);
  const variables = [...fonts.matchAll(/variable:\s*'([^']+)'/g)].map((match) => match[1]);

  names.forEach((name, index) => console.log(`${name} -> ${variables[index] ?? '(no variable)'}`));
} else {
  console.log('No app/fonts.ts found. Search the project for next/font.');
}

console.log('\n## Design habits (class usage count)');

const sources = SOURCE_DIRS.flatMap(listSourceFiles).map((file) => readFileSync(file, 'utf8'));

for (const [label, pattern] of Object.entries(HABIT_PATTERNS)) {
  const counts = new Map();

  for (const source of sources) {
    for (const match of source.match(pattern) ?? []) {
      counts.set(match, (counts.get(match) ?? 0) + 1);
    }
  }

  const top = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_HABITS)
    .map(([name, count]) => `${name} (${count})`);

  console.log(`${label}: ${top.join(', ') || 'none found'}`);
}

console.log('\n## Existing components to reuse');

for (const dir of COMPONENT_DIRS) {
  if (!existsSync(dir)) continue;

  const names = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  console.log(`${dir}: ${names.join(', ')}`);
}
