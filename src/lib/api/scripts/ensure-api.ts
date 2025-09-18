#!/usr/bin/env tsx

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { updateApi } from "./update-api.js";

const PROJECT_ROOT = resolve(process.cwd());
const GENERATED_DIR = resolve(PROJECT_ROOT, "src/lib/api/generated");
const INDEX_FILE = resolve(GENERATED_DIR, "index.ts");

async function main() {
  console.log("🔍 Checking API files...");

  // Check if generated API files exist
  if (!existsSync(INDEX_FILE)) {
    console.log("🔄 Generated API files not found, generating...");

    // Check if we're in CI environment
    const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI;

    try {
      await updateApi();
      console.log("✅ API files generated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (isCI) {
        console.log("⚠️  CI detected: Failed to generate API files, using fallback");
        console.log("   This is normal in CI environments where API may not be accessible");
      } else {
        console.log("⚠️  Failed to generate API files, using fallback");
        console.log("   Make sure VITE_SWAGGER_URL is set and API is accessible");
        console.log(`   Error: ${errorMessage}`);
      }

      // Create a minimal fallback to prevent build errors
      await createFallbackApi();
    }
  } else {
    // Files exist, but let's check if they're valid
    try {
      const content = await import("node:fs").then(fs => fs.readFileSync(INDEX_FILE, "utf8"));
      if (content.includes("FALLBACK API")) {
        console.log("⚠️  Found fallback API files, attempting to regenerate...");
        try {
          await updateApi();
          console.log("✅ API files updated from fallback");
        } catch (error) {
          console.log("⚠️  Still using fallback API (original generation failed)");
        }
      } else {
        console.log("✅ Generated API files found and valid");
      }
    } catch (error) {
      console.log("⚠️  Could not validate API files, regenerating...");
      try {
        await updateApi();
      } catch (genError) {
        await createFallbackApi();
      }
    }
  }
}

async function createFallbackApi() {
  const { mkdirSync, writeFileSync } = await import("node:fs");

  console.log("📝 Creating fallback API files...");

  // Ensure directories exist
  mkdirSync(resolve(GENERATED_DIR, "model"), { recursive: true });
  mkdirSync(resolve(GENERATED_DIR, "waitlist"), { recursive: true });

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
  writeFileSync(resolve(GENERATED_DIR, "model", "index.ts"), fallbackModel);
  writeFileSync(resolve(GENERATED_DIR, "waitlist", "waitlist.ts"), fallbackWaitlist);
  writeFileSync(resolve(GENERATED_DIR, "index.ts"), fallbackIndex);

  console.log("✅ Fallback API files created");
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
}

export { main as ensureApi };