/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Assertion<T = unknown>
    extends TestingLibraryMatchers<
      typeof expect.stringContaining,
      T
    > {
    // Add a placeholder member to avoid empty interface error
    _placeholder?: never;
  }
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<
      typeof expect.stringContaining,
      unknown
    > {
    // Add a placeholder member to avoid empty interface error
    _placeholder?: never;
  }
}