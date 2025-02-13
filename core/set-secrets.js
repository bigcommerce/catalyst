const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Extract flags from npm's forwarded arguments
const args = process.argv.slice(2);

// Detect if "--set-secrets" is present
const shouldSetSecrets = args.includes('--set-secrets') || process.env.npm_config_set_secrets;

if (!shouldSetSecrets) {
  console.log('Skipping secret generation (run with --set-secrets to enable).');
  process.exit(0);
}

// Determine the STAGE dynamically from the current Git branch
const STAGE = execSync('git rev-parse --abbrev-ref HEAD | sed -E "s/^feature\\///"', {
  encoding: 'utf8',
}).trim();

if (!STAGE) {
  console.error('Error: Could not determine STAGE from Git branch.');
  process.exit(1);
}

console.log(`Setting SST secrets for stage: ${STAGE}`);

// Set the STAGE secret explicitly
try {
  execSync(`sst secret set STAGE ${STAGE} --stage ${STAGE}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to set STAGE secret', error.message);
}

// Define the path to the .env.local file
const envFilePath = path.resolve(__dirname, '.env.local');

if (!fs.existsSync(envFilePath)) {
  console.error('Error: .env.local file not found.');
  process.exit(1);
}

// Read the .env.local file
const envData = fs.readFileSync(envFilePath, 'utf8');

// Parse the file and set secrets for the specific stage
envData.split('\n').forEach((line) => {
  // Ignore empty lines and comments
  if (!line.trim() || line.startsWith('#')) return;

  const [key, ...valueParts] = line.split('=');

  if (!key || valueParts.length === 0) return;

  const value = valueParts.join('=').trim().replace(/^"|"$/g, ''); // Handle quoted values

  try {
    console.log(`Setting SST secret: ${key} for stage ${STAGE}`);
    execSync(`sst secret set ${key} ${value} --stage ${STAGE}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to set secret: ${key}`, error.message);
  }
});

console.log(`All SST secrets set successfully for stage: ${STAGE}`);
