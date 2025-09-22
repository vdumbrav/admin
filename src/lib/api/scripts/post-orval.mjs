import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, '../../../..');
const GENERATED_DIR = resolve(PROJECT_ROOT, 'src/lib/api/generated');
const TS_SOURCE_PATH = resolve(SCRIPT_DIR, 'update-api-barrel.ts');
const DIST_PATH = resolve(SCRIPT_DIR, 'dist/update-api-barrel.js');

async function main() {
  process.chdir(PROJECT_ROOT);
  transpileScript();
  await runBarrelGenerator();
  runPrettier();
}

function transpileScript() {
  const source = readFileSync(TS_SOURCE_PATH, 'utf8');

  const { outputText, diagnostics } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      esModuleInterop: true,
      strict: true,
    },
    fileName: 'update-api-barrel.ts',
    reportDiagnostics: true,
  });

  if (diagnostics?.length) {
    const formatted = diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('\n');
    throw new Error(`Failed to transpile update-api-barrel.ts:\n${formatted}`);
  }

  mkdirSync(dirname(DIST_PATH), { recursive: true });
  writeFileSync(DIST_PATH, outputText, 'utf8');
}

async function runBarrelGenerator() {
  await import(pathToFileURL(DIST_PATH).href);
}

function runPrettier() {
  const prettierBin = resolve(
    PROJECT_ROOT,
    'node_modules',
    '.pnpm',
    'prettier@3.6.2',
    'node_modules',
    'prettier',
    'bin',
    'prettier.cjs',
  );
  const result = spawnSync(
    process.execPath,
    [prettierBin, '--loglevel', 'warn', '--write', GENERATED_DIR],
    {
      stdio: 'inherit',
    },
  );

  if (result.status !== 0) {
    throw new Error(`Prettier failed with exit code ${result.status ?? 1}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
