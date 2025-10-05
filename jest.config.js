const nextJest = require("next/jest");

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Module path aliases (should match tsconfig.json)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/node_modules/**",
  ],

  // Coverage thresholds - lowered for initial development phase
  // TODO: Gradually increase these as test coverage improves
  coverageThreshold: {
    global: {
      branches: 4,
      functions: 4,
      lines: 4,
      statements: 4,
    },
  },

  // Test match patterns
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)",
    "**/*.(test|spec).(ts|tsx|js|jsx)",
  ],

  // Ignore patterns - Skip API route tests in CI until Next.js server runtime is properly mocked
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    process.env.CI ? "<rootDir>/__tests__/api/" : "",
  ].filter(Boolean),

  // Transform configuration
  transform: {
    "^.+\\.(ts|tsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
