module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/build/', '/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: ['main/*.ts', 'main/*.js', '!../build/**', '!../node_modules/**'],
  coverageReporters: ['json', 'lcov', 'text', 'html'],
};
