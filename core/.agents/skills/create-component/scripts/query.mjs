#!/usr/bin/env node
// Runs one read-only GraphQL query against the store, as a guest, so an agent can check
// that the data a component needs exists. Rejects mutations and checks fields against
// bigcommerce.graphql before it sends anything. Loads .env.local itself and never prints it.
// Run from the storefront directory (the folder with next.config.ts).
//
//   node .agents/skills/create-component/scripts/query.mjs [--locale <code>] '<query>' ['<variables JSON>']

import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

import { buildSchema, parse, validate } from 'graphql';

const SCHEMA_FILE = 'bigcommerce.graphql';
const ENV_FILE = '.env.local';
const MAX_OUTPUT = 8000;
const REQUIRED_KEYS = ['BIGCOMMERCE_STORE_HASH', 'BIGCOMMERCE_STOREFRONT_TOKEN'];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const args = process.argv.slice(2);
const localeIndex = args.indexOf('--locale');
// The storefront sends the shopper's locale as Accept-Language, so localized content needs it too.
const locale = localeIndex === -1 ? undefined : args.splice(localeIndex, 2)[1];
const [source, variablesJson = '{}'] = args;

if (localeIndex !== -1 && !locale) fail('--locale needs a value, such as --locale fr.');

if (!source) {
  fail(
    "Usage: query.mjs [--locale <code>] '<query>' ['<variables JSON>']\n" +
      "Example: query.mjs '{ site { products(first: 3) { edges { node { name path } } } } }'",
  );
}

if (!existsSync(SCHEMA_FILE)) fail(`Missing ${SCHEMA_FILE}. Run \`pnpm generate\` first.`);
if (!existsSync(ENV_FILE)) fail(`Missing ${ENV_FILE}. Ask the user to create it.`);

let document;

try {
  document = parse(source);
} catch (error) {
  fail(`Query does not parse: ${error.message}`);
}

const operations = document.definitions.filter((node) => node.kind === 'OperationDefinition');

if (operations.length === 0 || operations.some((node) => node.operation !== 'query')) {
  fail('Only read queries are allowed. Mutations and subscriptions are rejected.');
}

// assumeValidSDL: the store schema uses custom directives such as @accessScope.
const schema = buildSchema(readFileSync(SCHEMA_FILE, 'utf8'), { assumeValidSDL: true });
const errors = validate(schema, document);

if (errors.length > 0) {
  fail(
    `Query does not match the schema:\n${errors.map(({ message }) => `- ${message}`).join('\n')}`,
  );
}

let variables;

try {
  variables = JSON.parse(variablesJson);
} catch {
  fail('Variables are not valid JSON.');
}

// Read the values from the file only. A shell variable could otherwise send the token to another host.
const env = parseEnv(readFileSync(ENV_FILE, 'utf8'));
const missing = REQUIRED_KEYS.filter((key) => !env[key]);

if (missing.length > 0) fail(`${ENV_FILE} has no value for: ${missing.join(', ')}`);

const domain = env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com';
const channelId = env.BIGCOMMERCE_CHANNEL_ID ?? '1';
const endpoint = `https://store-${env.BIGCOMMERCE_STORE_HASH}-${channelId}.${domain}/graphql`;

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    authorization: `Bearer ${env.BIGCOMMERCE_STOREFRONT_TOKEN}`,
    ...(locale ? { 'accept-language': locale } : {}),
  },
  body: JSON.stringify({ query: source, variables }),
});

const result = await response.json().catch(() => ({}));
const messages = (result.errors ?? []).map(({ message }) => `- ${message}`).join('\n');

if (!response.ok) {
  fail(`The store returned HTTP ${response.status}.${messages ? `\n${messages}` : ''}`);
}

if (messages) console.error(messages);

const output = JSON.stringify(result.data ?? null);

if (output.length > MAX_OUTPUT) {
  fail(
    `The result has ${output.length} characters (limit ${MAX_OUTPUT}). Select fewer fields or items.`,
  );
}

console.log(output);
