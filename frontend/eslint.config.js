import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import vitest from 'eslint-plugin-vitest'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...vitest.environments.env.globals,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      import: importPlugin,
      vitest
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './src'],
            ['@components', './src/components'],
            ['@pages', './src/pages'],
            ['@hooks', './src/hooks'],
            ['@services', './src/services'],
            ['@api', './src/api'],
            ['@assets', './src/assets'],
            ['@constants', './src/constants'],
            ['@context', './src/context'],
            ['@utils', './src/utils'],
            ['@store', './src/store']
          ],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'off',
      'import/no-unresolved': 'error',
    },
  },

  {
    files: ['**/*.test.{js,jsx}', '**/__tests__/**'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
])
