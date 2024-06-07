export async function register() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && process.env.NEXT_RUNTIME === 'nodejs') {
    const { server } = await import('~/client/mocks/server');
    server.listen();
  }
}
