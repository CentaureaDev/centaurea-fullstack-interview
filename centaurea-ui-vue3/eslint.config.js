import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'coverage/**'],
  },
  js.configs.recommended,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'vue/multi-word-component-names': ['error', {
        ignores: [
          'Card',
          'Modal',
          'Pagination',
        ],
      }],
    },
  },
  eslintConfigPrettier,
];
