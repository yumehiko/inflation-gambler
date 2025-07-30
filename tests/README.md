# Test Utilities Directory

This directory contains test utilities and integration test files.

## Contents

- `setup.ts` - Vitest global setup file that configures testing environment
  - Imports `@testing-library/jest-dom` matchers for DOM assertions
  - Used by all tests via `vitest.config.ts`

## Usage

Per our architecture guidelines:
- **Unit tests** should be colocated with the code they test (e.g., `counter.view.test.tsx` next to `counter.view.tsx`)
- **Integration tests** that test multiple domains/components together should be placed in this directory
- **Test utilities** like setup files, custom test helpers, and mock data should be placed here

## Note

Do not place unit tests in this directory. Follow the colocation principle defined in CLAUDE.md.