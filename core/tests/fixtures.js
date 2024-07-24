import { test as testBase } from '@playwright/test';
// eslint-disable-next-line import/no-extraneous-dependencies
import { addCoverageReport } from 'monocart-reporter';

const test = testBase.extend({
    autoTestFixture: [
        async ({ page }, use) => {
            const isChromium = test.info().project.name === 'tests-chromium';

            if (isChromium && !process.env.CI) {
                await Promise.all([
                    page.coverage.startJSCoverage({
                        resetOnNavigation: false,
                    }),
                ]);
            }

            await use('autoTestFixture');

            if (isChromium && !process.env.CI) {
                const [jstCoverage] = await Promise.all([page.coverage.stopJSCoverage()]);

                await addCoverageReport(jstCoverage, test.info());
            }
        },
        {
            scope: 'test',
            auto: true,
        },
    ],
});

export { test };