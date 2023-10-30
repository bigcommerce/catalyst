// @ts-check

/**
 * @typedef {Object} Summary
 * @prop {number} performance
 * @prop {number} accessibility
 * @prop {number} best-practices
 * @prop {number} seo
 * @prop {number} pwa
 */

/**
 * @typedef {Object} Manifest
 * @prop {string} url
 * @prop {boolean} isRepresentativeRun
 * @prop {string} htmlPath
 * @prop {string} jsonPath
 * @prop {Summary} summary
 */

/**
 * @typedef {Object} LighthouseOutputs
 * @prop {Record<string, string>} links
 * @prop {Manifest[]} manifest
 */

const formatScore = (/** @type { number } */ score) => Math.round(score * 100);
const emojiScore = (/** @type { number } */ score) =>
    score >= 0.9 ? '🟢' : score >= 0.5 ? '🟠' : '🔴';

const scoreRow = (
    /** @type { string } */ label,
    /** @type { number } */ score
) => `| ${emojiScore(score)} ${label} | ${formatScore(score)} |`;

/**
 * @param {LighthouseOutputs} lighthouseOutputs
 */
function makeComment(lighthouseOutputs) {
    const { summary } = lighthouseOutputs.manifest[0];
    const [[testedUrl, reportUrl]] = Object.entries(lighthouseOutputs.links);

    const comment = `## ⚡️🏠 Lighthouse report

We ran Lighthouse against the changes and produced this [report](${reportUrl}). Here's the summary:

| Category | Score |
| -------- | ----- |
${scoreRow('Performance', summary.performance)}
${scoreRow('Accessibility', summary.accessibility)}
${scoreRow('Best practices', summary['best-practices'])}
${scoreRow('SEO', summary.seo)}

*Lighthouse ran against [${testedUrl}](${testedUrl})*
`;

    return comment;
}

module.exports = ({ lighthouseOutputs }) => {
    return makeComment(lighthouseOutputs);
};
