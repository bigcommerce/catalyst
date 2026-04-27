module.exports = {
  transformIgnorePatterns: [],
  transform: {
    '^.+\\.(t|j)s?$': '@swc/jest',
  },
  moduleNameMapper: {
    '^fs-extra/esm$': 'fs-extra',
  },
};
