// Whether an unrequested question can be asked. A TTY alone isn't enough: some
// CI setups allocate a pseudo-terminal (`docker run -t`, `script`), and a
// prompt there waits for input nobody will give, hanging the job. CI systems
// set `CI`, so honour it too.
export function canPrompt(): boolean {
  return Boolean(process.stdin.isTTY) && !process.env.CI;
}
