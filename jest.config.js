/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  watchman: false,
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {}],
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
  coverageDirectory: "coverage",
  passWithNoTests: true,
};
