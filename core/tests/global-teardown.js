import fs from 'fs';
import { CDPClient } from 'monocart-coverage-reports';
import { addCoverageReport } from 'monocart-reporter';
import path from 'path';
import { fileURLToPath } from 'url';

const globalTeardown = async (config) => {
    if (!process.env.CI) {
        const client = await CDPClient({
            port: 9230,
        });

        console.log('..... global teardown .....');

        const dir = await client.writeCoverage();

        await client.stopCoverage();

        if (!fs.existsSync(dir)) {
            console.log('not found coverage dir');

            return;
        }

        const files = fs.readdirSync(dir);

        // eslint-disable-next-line no-restricted-syntax
        for (const filename of files) {
            const content = fs.readFileSync(path.resolve(dir, filename)).toString('utf-8');
            const json = JSON.parse(content);
            let coverageList = json.result;

            coverageList = coverageList.filter((entry) => entry.url && entry.url.startsWith('file:'));
            coverageList = coverageList.filter((entry) => entry.url.includes('next/server/app'));
            coverageList = coverageList.filter((entry) => !entry.url.includes('manifest.js'));

            coverageList.forEach((entry) => {
                const filePath = fileURLToPath(entry.url);

                if (fs.existsSync(filePath)) {
                    entry.source = fs.readFileSync(filePath).toString('utf8');
                } else {
                    console.log('not found file', filePath);
                }
            });

            // there is no test info on teardown, just mock one with required config
            const mockTestInfo = {
                config,
            };

            // eslint-disable-next-line no-await-in-loop
            await addCoverageReport(coverageList, mockTestInfo);
        }
    }  else {
        console.log('global teardown...');
    }
};

export default globalTeardown;