const ERROR_MESSAGES: Record<number, string> = {
  10: 'Something went wrong on our end. Please try again. If the issue persists, contact support.',
  20: "We couldn't retrieve your bundle. This is usually a temporary issue — please try deploying again. If the problem continues, contact support.",
  30: 'Your bundle could not be extracted. This may mean your build output is too large (max 64 MB compressed / 512 MB uncompressed) or the archive is corrupted. Try reducing your build size or rebuilding your project and deploying again.',
  40: `There's a problem with your build output. This could be caused by:
- A worker.js file larger than 40 MB
- An individual asset file larger than 25 MB
- More than 1,000 total files in the bundle`,
  50: 'Deployment failed. This is usually a temporary issue — please try again. If the problem persists, contact support.',
  60: "Your code was deployed, but we couldn't determine your deployment URL. Please try deploying again. If the issue persists, contact support.",
};

export function getDeploymentErrorMessage(code: number): string {
  return (
    ERROR_MESSAGES[code] ??
    `Deployment failed with an unexpected error (code: ${code}). Please try again. If the issue persists, contact support.`
  );
}
