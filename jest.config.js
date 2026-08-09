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
  // El cliente generado de Prisma usa moduleResolution "nodenext", que exige
  // extensión .js en imports relativos que en disco son .ts (ej.
  // "./internal/class.js" -> class.ts). Jest resuelve contra el archivo
  // literal y falla; esto reescribe la extensión antes de resolver.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/test-utils/**",
    "!src/generated/**",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/src/generated/"],
  coverageDirectory: "coverage",
  passWithNoTests: true,
  // RNF-18 (docs/RequerimientosNoFuncionales.md) exige >=70% puntualmente
  // en "Casos de Uso y Servicios de dominio" — no en adaptadores de
  // infraestructura (Prisma, bcrypt, JWT) ni en controllers, que se
  // validan con pruebas de integración/E2E cuando haya una base real
  // conectada (Fase 2.2, actualmente pospuesta).
  coverageThreshold: {
    "./src/dominio/**": { branches: 70, functions: 70, lines: 70, statements: 70 },
    "./src/aplicacion/**": { branches: 70, functions: 70, lines: 70, statements: 70 },
  },
};
