// Whether an unrequested question can be asked. Also checks `CI`: some CI
// setups allocate a pseudo-terminal, where a prompt would hang the job.
export function canPrompt(): boolean {
  return Boolean(process.stdin.isTTY) && !process.env.CI;
}
