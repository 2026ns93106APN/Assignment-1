import js from '@eslint/js';
import securityPlugin from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  securityPlugin.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['src/validator.js'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off'
    }
  }
];
