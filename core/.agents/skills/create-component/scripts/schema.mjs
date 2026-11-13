#!/usr/bin/env node
// Reads the store's GraphQL schema (bigcommerce.graphql) so a query uses only real fields.
// `info` also checks the setup first and says what to fix.
// Run from the storefront directory (the folder with next.config.ts).
//
//   node .agents/skills/create-component/scripts/schema.mjs info
//   node .agents/skills/create-component/scripts/schema.mjs type <TypeName> [<TypeName> ...]
//   node .agents/skills/create-component/scripts/schema.mjs search <text>

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SCHEMA_FILE = 'bigcommerce.graphql';
const ENV_FILE = '.env.local';
const MAX_SEARCH_RESULTS = 40;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const [command, argument, ...moreArguments] = process.argv.slice(2);

// Report every setup problem at once, so they can all be fixed in one pass.
// The .env.local check only tests that the file exists. It never reads it.
const setupProblems = [
  !['next.config.ts', 'next.config.js', 'next.config.mjs'].some((file) => existsSync(file)) &&
    'Run this script from the storefront folder (the folder with next.config.ts).',
  !existsSync('node_modules') && 'Dependencies are missing. Run `pnpm install`.',
  command === 'info' &&
    !existsSync(ENV_FILE) &&
    `${ENV_FILE} is missing. Ask the user to create it (the setup-catalyst skill explains how). Do not copy one from another folder.`,
  !existsSync(SCHEMA_FILE) &&
    `${SCHEMA_FILE} is missing. Run \`pnpm generate\`, which needs ${ENV_FILE}. If that fails, use the setup-catalyst skill.`,
].filter(Boolean);

if (setupProblems.length > 0) {
  fail(`Setup is not ready:\n${setupProblems.map((problem) => `- ${problem}`).join('\n')}`);
}

const {
  buildSchema,
  getNamedType,
  isEnumType,
  isInputObjectType,
  isInterfaceType,
  isObjectType,
  isUnionType,
} = await import('graphql').catch(() =>
  fail('The `graphql` package is missing. Run `pnpm install`.'),
);

const path = resolve(process.cwd(), SCHEMA_FILE);

// assumeValidSDL: the store schema uses custom directives such as @accessScope.
const schema = buildSchema(readFileSync(path, 'utf8'), { assumeValidSDL: true });
const typeMap = schema.getTypeMap();

const describeField = (field) => {
  const args = field.args.map((arg) => `${arg.name}: ${arg.type}`).join(', ');
  const deprecated = field.deprecationReason ? `  [DEPRECATED: ${field.deprecationReason}]` : '';

  return `  ${field.name}${args ? `(${args})` : ''}: ${field.type}${deprecated}`;
};

const printType = (name) => {
  const type = typeMap[name];

  if (!type) {
    fail(`No type named "${name}". Try: search ${name}`);
  }

  console.log(`${type.constructor.name.replace('GraphQL', '')} ${type.name}`);

  if (type.description) {
    console.log(`  ${type.description.split('\n')[0]}`);
  }

  if (isObjectType(type) || isInterfaceType(type)) {
    Object.values(type.getFields()).forEach((field) => console.log(describeField(field)));
  } else if (isInputObjectType(type)) {
    Object.values(type.getFields()).forEach((field) =>
      console.log(`  ${field.name}: ${field.type}`),
    );
  } else if (isEnumType(type)) {
    type.getValues().forEach((value) => console.log(`  ${value.name}`));
  } else if (isUnionType(type)) {
    type.getTypes().forEach((member) => console.log(`  ${member.name}`));
  }
};

const search = (text) => {
  const needle = text.toLowerCase();
  const hits = [];

  for (const type of Object.values(typeMap)) {
    if (type.name.startsWith('__')) continue;

    if (type.name.toLowerCase().includes(needle)) {
      hits.push(`type ${type.name}`);
    }

    if (isObjectType(type) || isInterfaceType(type)) {
      for (const field of Object.values(type.getFields())) {
        if (field.name.toLowerCase().includes(needle)) {
          hits.push(`${type.name}.${field.name}: ${field.type}`);
        }
      }
    }
  }

  hits.slice(0, MAX_SEARCH_RESULTS).forEach((hit) => console.log(hit));

  if (hits.length > MAX_SEARCH_RESULTS) {
    console.log(`... ${hits.length - MAX_SEARCH_RESULTS} more. Use a longer search text.`);
  } else if (hits.length === 0) {
    console.log(`No match for "${text}".`);
  }
};

if (command === 'info') {
  const rootFields = schema.getQueryType()?.getFields() ?? {};
  const site = rootFields.site;
  const otherRoots = Object.keys(rootFields).filter((name) => name !== 'site');

  console.log(`Setup: ok (${ENV_FILE} exists, not read; dependencies installed)`);
  console.log(`Schema: ${path}`);
  console.log(`Types: ${Object.keys(typeMap).filter((name) => !name.startsWith('__')).length}`);
  console.log(`Other root fields (see: type Query): ${otherRoots.join(', ')}`);
  console.log('Start here: type Site (the root for most store data)');

  if (site) {
    printType(getNamedType(site.type).name);
  }
} else if (command === 'type' && argument) {
  [argument, ...moreArguments].forEach((name, index) => {
    if (index > 0) console.log('');
    printType(name);
  });
} else if (command === 'search' && argument) {
  search(argument);
} else {
  fail('Usage: schema.mjs info | type <TypeName> [<TypeName> ...] | search <text>');
}
