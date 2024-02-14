import { getPackageManager } from './pm';

describe('getPackageManager', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should return 'yarn' when npm_config_user_agent contains 'yarn'", () => {
    process.env.npm_config_user_agent = 'yarn/2.0.0';

    const packageManager = getPackageManager();

    expect(packageManager).toBe('yarn');
  });

  it("should return 'pnpm' when npm_config_user_agent contains 'pnpm'", () => {
    process.env.npm_config_user_agent = 'pnpm/6.0.0';

    const packageManager = getPackageManager();

    expect(packageManager).toBe('pnpm');
  });

  it("should return 'npm' when npm_config_user_agent does not contain 'pnpm' or 'yarn'", () => {
    process.env.npm_config_user_agent = 'npm/7.0.0';

    const packageManager = getPackageManager();

    expect(packageManager).toBe('npm');
  });
});
