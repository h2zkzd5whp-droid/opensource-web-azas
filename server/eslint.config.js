const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['eslint.config.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
]
