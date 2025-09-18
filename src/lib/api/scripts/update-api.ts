#!/usr/bin/env tsx

import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(process.cwd());
const GENERATED_DIR = resolve(PROJECT_ROOT, "src/lib/api/generated");

async function main() {
  console.log("🚀 Updating API client from Swagger...");

  try {
    // Check if environment variables are set
    const swaggerUrl = process.env.VITE_SWAGGER_URL;
    if (!swaggerUrl) {
      const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI;

      if (isCI) {
        console.log("⚠️  CI detected: VITE_SWAGGER_URL not set, this is expected in CI");
      } else {
        console.log("⚠️  VITE_SWAGGER_URL not set, skipping API generation");
        console.log("   Set VITE_SWAGGER_URL to enable automatic API updates");
      }

      throw new Error("VITE_SWAGGER_URL not configured");
    }

    console.log(`📡 Fetching from: ${swaggerUrl}`);

    // Ensure generated directory exists
    if (!existsSync(GENERATED_DIR)) {
      console.log("📁 Creating generated directory...");
      mkdirSync(GENERATED_DIR, { recursive: true });
    }

    // Test connectivity to Swagger endpoint
    try {
      console.log("🔍 Testing Swagger endpoint connectivity...");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(swaggerUrl, {
        method: "HEAD",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Swagger endpoint returned ${response.status}`);
      }
    } catch (error) {
      const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI;

      if (isCI) {
        console.log("⚠️  CI detected: Cannot reach Swagger endpoint, this is expected in CI");
      } else {
        console.log("⚠️  Cannot reach Swagger endpoint, skipping API generation");
        console.log("   This is normal in CI/CD environments or when the API is not accessible");
        console.log(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      }

      throw error;
    }

    // Generate API client
    console.log("⚙️  Generating API client...");
    execSync("npm run generate:api", {
      stdio: "inherit",
      cwd: PROJECT_ROOT,
      env: { ...process.env }
    });

    console.log("✅ API client updated successfully!");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.GITLAB_CI;

    if (isCI) {
      console.log("⚠️  CI detected: API generation failed (expected)");
      console.log("   Fallback API will be used");
    } else {
      console.error("❌ Failed to update API client:");
      console.error(errorMessage);

      if (process.env.NODE_ENV === "development") {
        console.log("   This error is shown because NODE_ENV=development");
      }
    }

    // Always throw to trigger fallback
    throw error;
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
}

export { main as updateApi };