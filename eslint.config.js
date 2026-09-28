// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/', '.astro/', '.wrangler/', 'node_modules/', 'studio/node_modules/', 'studio/dist/', 'playwright-report/', 'test-results/', 'shot.tmp.mjs'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['error', { allow: ['warn', 'error', 'log'] }],
      // Every dynamic key in this codebase is a TypeScript literal union (Locale, IconName, …) checked at
      // compile time; this rule cannot see types and only produces false positives here.
      'security/detect-object-injection': 'off',
    },
  },
);
