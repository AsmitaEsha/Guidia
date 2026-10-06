import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'backend', 'ml', 'ml-service', 'extension']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Legacy simulator files still `import React` for JSX.
      'no-unused-vars': ['error', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' }],
    },
  },
  {
    // Context modules export a provider plus its hook; data modules export
    // JSX fixtures. Neither is hot-reload-sensitive UI.
    files: ['src/context/**', 'src/data/**', 'src/components/ui/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Playwright config and browser tests run in Node.
    files: ['playwright.config.js', 'e2e/**'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: { 'react-hooks/rules-of-hooks': 'off', 'react-refresh/only-export-components': 'off' },
  },
  globalIgnores(['test-results', 'playwright-report']),
])
