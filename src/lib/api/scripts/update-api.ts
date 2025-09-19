#!/usr/bin/env tsx
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());
const GENERATED_DIR = resolve(PROJECT_ROOT, 'src/lib/api/generated');

async function main() {
  // Check if environment variables are set
  const swaggerUrl = process.env.VITE_SWAGGER_URL;
  if (!swaggerUrl) {
    // VITE_SWAGGER_URL not configured
    throw new Error('VITE_SWAGGER_URL not configured');
  }

  // Fetching from Swagger URL

  // Ensure generated directory exists
  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR, { recursive: true });
  }

  // Test connectivity to Swagger endpoint
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const response = await fetch(swaggerUrl, {
    method: 'HEAD',
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Swagger endpoint returned ${response.status}`);
  }

  // Generate API client
  execSync('npm run generate:api', {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
    env: { ...process.env },
  });

  // API client updated successfully
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((_error) => {
    process.exit(1);
  });
}

export { main as updateApi };
