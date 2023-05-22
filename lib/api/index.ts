// In order avoid leaking server-side secrets to the browser, we need to have two separate entrypoints for
// separate clients. If we export both client functions in one entrypoint, the server code will make it to
// the client. Eventually, this should be enforced by an eslint rule and/or tsconfig paths.

// eslint-disable-next-line @typescript-eslint/no-empty-function, import/no-anonymous-default-export
export default () => {};
