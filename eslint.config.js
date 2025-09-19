import globals from 'globals';
import js from '@eslint/js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'src/components/ui', 'src/lib/api/generated'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginQuery.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Enhanced TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error', // Stricter - no any allowed
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Type-aware rules - now enabled with project config
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn', // Enable as warning
      '@typescript-eslint/no-unnecessary-type-assertion': 'error', // Stricter
      '@typescript-eslint/no-floating-promises': 'error', // Stricter - handle all promises
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error', // Stricter
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-base-to-string': 'off', // Disabled: Some UI library components stringify objects for display
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-meaningless-void-operator': 'off', // Disabled: void operator used for ignoring promises in event handlers
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/only-throw-error': 'off', // Disabled: TanStack Router uses throw redirect() pattern
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
      '@typescript-eslint/no-unnecessary-template-expression': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-return-this-type': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'off', // Disabled: React event handlers return promises without async
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
        },
      ],

      // General code quality
      'no-console': 'off', // Allow console in admin tool
      'no-unused-vars': 'off',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unneeded-ternary': 'error',

      // Import ordering - basic built-in rule
      'sort-imports': [
        'warn',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true, // Don't sort the import statements themselves
          ignoreMemberSort: false, // Sort named imports within a statement
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],

      // Additional code quality rules
      'no-duplicate-imports': 'error',
      'no-unused-private-class-members': 'error',
      'no-useless-assignment': 'error',
      'no-array-constructor': 'error',
      'no-new-object': 'error',
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-promise-executor-return': 'error',
      'no-unreachable-loop': 'error',
      'no-use-before-define': 'off', // Let TypeScript handle this
      'default-case-last': 'error',

      // Auto-fixable rules
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      yoda: 'error',
      'prefer-arrow-callback': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'prefer-exponentiation-operator': 'error',
      'prefer-numeric-literals': 'error',

      // API import restrictions as warnings
      'no-restricted-imports': [
        'warn',
        {
          paths: [
            {
              name: '@/lib/api/generated',
              message: 'Consider importing from specific modules for better tree shaking.',
            },
          ],
        },
      ],
    },
  },
);
