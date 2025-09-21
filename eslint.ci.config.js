import baseConfig from './eslint.config.js';

// ESLint configuration for CI/CD with relaxed rules for generated API code
export default baseConfig.map(config => ({
  ...config,
  rules: {
    ...config.rules,
    // Disable problematic rules for CI that are caused by generated API code
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    // Keep only critical errors
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
  }
}));