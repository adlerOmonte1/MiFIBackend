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
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  passWithNoTests: true,
  // RNF-18 (docs/RequerimientosNoFuncionales.md): >=70% en la lógica de
  // dominio/casos de uso. src/index.ts queda fuera (solo bootstrap del
  // servidor, se verifica con /health, no con pruebas unitarias).
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
