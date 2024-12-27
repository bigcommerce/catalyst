// Mock fs-extra/esm
jest.mock('fs-extra/esm', () => ({
  pathExistsSync: jest.fn().mockReturnValue(true),
}));

// Mock @inquirer/prompts
jest.mock('@inquirer/prompts', () => ({
  input: jest.fn().mockResolvedValue('test-project'),
  select: jest.fn().mockResolvedValue(true),
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));
