const { Blob } = require('buffer');
const fs = require('fs');
const mime = require('mime-types'); // Require the mime-types package
const path = require('path');

require('dotenv/config');

const ROOT_DIR = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, '.open-next/assets');
const WORKERS_DIR = path.join(ROOT_DIR, '.bigcommerce/dist');

function appendDirectoryToFormData(formData, directoryPath, key, rootDir, excludedDirs = []) {
  const files = fs.readdirSync(directoryPath, { withFileTypes: true });

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = path.join(directoryPath, file.name);

    // Check if the current directory is in the excludedDirs list
    if (file.isDirectory() && excludedDirs.includes(filePath)) {
      // Skip this directory
      // eslint-disable-next-line no-continue
      continue;
    }

    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const fileBuffer = fs.readFileSync(filePath);
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';
      const blob = new Blob([fileBuffer], { type: mimeType });
      const relativePath = path.relative(rootDir, filePath);

      formData.append(key, blob, relativePath); // Append Blob with relative path as filename
    }

    if (stat.isDirectory()) {
      appendDirectoryToFormData(formData, filePath, key, rootDir, excludedDirs);
    }
  }
}

const upload = async () => {
  try {
    const body = new FormData();

    const storeHash = process.env.BIGCOMMERCE_STORE_HASH ?? '';
    const accessToken = process.env.BIGCOMMERCE_ACCESS_TOKEN ?? '';
    const baseUrl = process.env.WORKER_UPLOAD_URL ?? '';

    appendDirectoryToFormData(body, ASSETS_DIR, 'assets[]', ASSETS_DIR);
    appendDirectoryToFormData(body, WORKERS_DIR, 'workers[]', WORKERS_DIR);

    await fetch(`${baseUrl}/stores/${storeHash}/v3/ignition/deploy`, {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
      },
      body,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
};

upload();
