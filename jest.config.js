module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts}', '!src/examples/**', '!**/node_modules/**', '!**/vendor/**'],
  coverageReporters: ['text-summary'],
};
