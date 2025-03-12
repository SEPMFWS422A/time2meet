import type { Config } from 'jest'
import nextJest from 'next/jest.js'
import dotenv from "dotenv";

// Lade `.env.test` für Jest
dotenv.config({ path: ".env.local" });
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

const componentTestConfig: Config = {
  displayName: "component",
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["<rootDir>/src/tests/components/**/*.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};

const apiTestConfig: Config = {
  displayName: "api",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/tests/api/**/*.[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  coverageProvider: 'v8',
};

// Add any custom config to be passed to Jest
const config: Config = {
  displayName: "api",
  coverageProvider: 'v8',
  testEnvironment: 'node',
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  //testMatch: ["<rootDir>/src/tests/api/**/*.[jt]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
}

//createJestConfig(componentTestConfig)(),
///** @type {import('jest').Config} */
//const config = {
//  projects: [createJestConfig(apiTestConfig)()]
//};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
//export default config;



//export default createJestConfig(config);

export default createJestConfig(componentTestConfig);
