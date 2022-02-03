module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/build/', '/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!../build/**', '!../node_modules/**'],
  coverageReporters: ['json', 'lcov', 'text', 'html'],
};
