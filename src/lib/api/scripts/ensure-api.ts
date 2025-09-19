#!/usr/bin/env tsx
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { updateApi } from './update-api.js';

const PROJECT_ROOT = resolve(process.cwd());
const GENERATED_DIR = resolve(PROJECT_ROOT, 'src/lib/api/generated');
const INDEX_FILE = resolve(GENERATED_DIR, 'index.ts');

async function main() {
  // Check if generated API files exist
  if (!existsSync(INDEX_FILE)) {
    try {
      await updateApi();
    } catch (_error) {
      // Suppress logging in build scripts

      // Create a minimal fallback to prevent build errors
      await createFallbackApi();
    }
  } else {
    // Files exist, but let's check if they're valid
    try {
      const content = await import('node:fs').then((fs) => fs.readFileSync(INDEX_FILE, 'utf8'));
      if (content.includes('FALLBACK API')) {
        try {
          await updateApi();
        } catch (_error) {
          // Still using fallback API
        }
      }
    } catch (_error) {
      try {
        await updateApi();
      } catch (_genError) {
        await createFallbackApi();
      }
    }
  }
}

async function createFallbackApi() {
  const { mkdirSync, writeFileSync } = await import('node:fs');

  // Ensure directories exist
  mkdirSync(resolve(GENERATED_DIR, 'model'), { recursive: true });
  mkdirSync(resolve(GENERATED_DIR, 'waitlist'), { recursive: true });

  // Create minimal fallback types
  const fallbackModel = `/* eslint-disable */
// --- FALLBACK API TYPES ---
export interface WaitlistTasksResponseDto {
  id: number;
  title: string;
  description: string;
  status?: string;
  reward: number;
  level: number;
  group: string;
  order_by: number;
  child: WaitlistTasksResponseDto[];
}`;

  const fallbackWaitlist = `/* eslint-disable */
// --- FALLBACK API CLIENT ---
import { useQuery } from '@tanstack/react-query';
import type { WaitlistTasksResponseDto } from '../model';

export function useWaitlistControllerGetWaitlistTasks() {
  return useQuery({
    queryKey: ['waitlist', 'tasks'],
    queryFn: (): WaitlistTasksResponseDto[] => {
      console.warn('Using fallback API - real API not generated');
      return [];
    },
  });
}`;

  const fallbackIndex = `/* eslint-disable */
// --- FALLBACK API INDEX ---
export * from "./model";
export * from "./waitlist/waitlist";`;

  // Write fallback files
  writeFileSync(resolve(GENERATED_DIR, 'model', 'index.ts'), fallbackModel);
  writeFileSync(resolve(GENERATED_DIR, 'waitlist', 'waitlist.ts'), fallbackWaitlist);
  writeFileSync(resolve(GENERATED_DIR, 'index.ts'), fallbackIndex);
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((_error) => {
    process.exit(1);
  });
}

export { main as ensureApi };
