import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import boundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  { ignores: ['dist', '.storybook', 'storybook-static'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'boundaries': boundaries,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'boundaries/elements': [
        {
          type: 'views',
          pattern: '**/*.view.tsx',
          mode: 'file',
        },
        {
          type: 'hooks',
          pattern: '**/*.hook.ts',
          mode: 'file',
        },
        {
          type: 'components',
          pattern: 'packages/ui/**',
          mode: 'folder',
        },
        {
          type: 'utils',
          pattern: '**/*.utils.ts',
          mode: 'file',
        },
        {
          type: 'types',
          pattern: '**/*.types.ts',
          mode: 'file',
        },
        {
          type: 'services',
          pattern: '**/*.service.ts',
          mode: 'file',
        },
        {
          type: 'stores',
          pattern: '**/*.store.ts',
          mode: 'file',
        },
        {
          type: 'tests',
          pattern: '**/*.test.{ts,tsx}',
          mode: 'file',
        },
        {
          type: 'styles',
          pattern: '**/*.module.css',
          mode: 'file',
        },
        {
          type: 'main',
          pattern: '**/main.tsx',
          mode: 'file',
        },
        {
          type: 'app',
          pattern: '**/App.tsx',
          mode: 'file',
        },
        {
          type: 'env',
          pattern: '**/*.d.ts',
          mode: 'file',
        },
      ],
      'boundaries/include': ['src/**/*', 'packages/**/*'],
    },
  },
  {
    files: ['**/*.view.tsx'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'views',
              allow: ['hooks', 'components', 'styles'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.utils.ts'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'utils',
              allow: ['types'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.types.ts'],
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'types',
              allow: [],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/main.tsx', '**/App.tsx'],
    rules: {
      'boundaries/element-types': 'off',
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
)