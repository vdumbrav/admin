import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/main.tsx',
    'src/routes/**/*.{ts,tsx}',
    'src/features/**/*.{ts,tsx}',
  ],
  project: ['src/**/*.{ts,tsx}'],
  typescript: {
    config: ['tsconfig.app.json', 'tsconfig.node.json'],
  },
  ignore: [
    'src/components/ui/**', // Generated UI components
    'src/routeTree.gen.ts', // Generated router
    'src/lib/api/generated/**', // Generated API
    'src/vite-env.d.ts', // Vite env declarations
    '**/*.test.{ts,tsx}', // Test files
    '**/*.spec.{ts,tsx}', // Spec files
  ],
  ignoreDependencies: [
    'tailwindcss',
    'tw-animate-css',
  ],
  rules: {
    exports: 'off', // Allow unused exports in feature modules
    types: 'off', // Allow unused types
    enumMembers: 'warn', // Warn for unused enum members
    duplicates: 'error', // Error on duplicate exports
  },
};

export default config;