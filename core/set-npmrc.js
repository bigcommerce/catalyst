/* eslint-disable no-console */
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.resolve(__dirname, '../.env.local'))
  ? '../.env.local'
  : '../.env';

dotenv.config({ path: path.resolve(__dirname, envPath) });

const npmrcPath = path.resolve(__dirname, '../.npmrc');

if (!process.env.AVIOS_NPM_AUTH_TOKEN) {
  console.error('❌ Missing AVIOS_NPM_AUTH_TOKEN in .env.local or .env file');
  process.exit(1);
}

const npmrcContent = `
@channel:registry=https://iagl.jfrog.io/artifactory/api/npm/chlpla-npm-virtual/
//iagl.jfrog.io/artifactory/api/npm/chlpla-npm-virtual/:always-auth=true
//iagl.jfrog.io/artifactory/api/npm/chlpla-npm-virtual/:_authToken=${process.env.AVIOS_NPM_AUTH_TOKEN}
`;

fs.writeFileSync(npmrcPath, npmrcContent);

console.log('✅ .npmrc file updated with the authentication token!');
