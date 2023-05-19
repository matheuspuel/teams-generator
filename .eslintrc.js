/* eslint-env node */

// eslint-disable-next-line functional/no-expression-statements, functional/immutable-data
module.exports = {
  root: true,
  ignorePatterns: ['/dist/**'],
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:functional/external-typescript-recommended',
    'plugin:functional/recommended',
    'plugin:functional/stylistic',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'functional', 'prettier'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'prettier/prettier': ['warn'],
    'react/prop-types': ['off'],
    'react/jsx-key': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-invalid-void-type': ['off'],
    '@typescript-eslint/no-unnecessary-condition': ['off'],
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/array-type': [
      'warn',
      { default: 'generic', readonly: 'generic' },
    ],
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    'functional/no-promise-reject': 'error',
    'functional/prefer-immutable-types': 'off',
    'functional/functional-parameters': [
      'error',
      { enforceParameterCount: false },
    ],
    'functional/no-mixed-types': 'off',
    'functional/no-return-void': ['off'],
  },
}
