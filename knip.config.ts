import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['src/components/**', 'src/routeTree.gen.ts', 'src/types/**', 'src/lib/queryClient.ts'],
  ignoreDependencies: [
    'tailwindcss',
    'tw-animate-css',
    '@radix-ui/react-tabs',
    'oidc-client-ts',
    'react-dropzone',
    'react-oidc-context',
    'recharts',
    '@faker-js/faker',
  ],
};

export default config;