module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  overrides: [
    {
      files: ['**/*.test.js'],
      env: { jest: true }
    },
    {
      files: ['**/*.mjs'],
      parserOptions: { sourceType: 'module' }
    }
  ],
  rules: {
    'no-console': 'off',
    // Request validators intentionally reject ASCII control characters.
    'no-control-regex': 'off',
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }]
  }
};
