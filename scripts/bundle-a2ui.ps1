# PowerShell equivalent of scripts/bundle-a2ui.sh

$rootDir = Get-Location
$hashFile = Join-Path $rootDir "src/canvas-host/a2ui/.bundle.hash"
$outputFile = Join-Path $rootDir "src/canvas-host/a2ui/a2ui.bundle.js"
$a2uiRendererDir = Join-Path $rootDir "vendor/a2ui/renderers/lit"
$a2uiAppDir = Join-Path $rootDir "apps/shared/OpenClawKit/Tools/CanvasA2UI"

if (-not (Test-Path $a2uiRendererDir) -or -not (Test-Path $a2uiAppDir)) {
    if (Test-Path $outputFile) {
        Write-Host "A2UI sources missing; keeping prebuilt bundle."
        exit 0
    }
    Write-Error "A2UI sources missing and no prebuilt bundle found at: $outputFile"
    exit 1
}

$inputPaths = @(
    (Join-Path $rootDir "package.json"),
    (Join-Path $rootDir "pnpm-lock.yaml"),
    $a2uiRendererDir,
    $a2uiAppDir
)

# Compute hash
$inputsArgs = $inputPaths | ForEach-Object { "$_" }
$nodeScript = @"
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.env.ROOT_DIR ?? process.cwd();
const inputs = process.argv.slice(2);
const files = [];

async function walk(entryPath) {
  const st = await fs.stat(entryPath);
  if (st.isDirectory()) {
    const entries = await fs.readdir(entryPath);
    for (const entry of entries) {
      await walk(path.join(entryPath, entry));
    }
    return;
  }
  files.push(entryPath);
}

for (const input of inputs) {
  await walk(input);
}

function normalize(p) {
  return p.split(path.sep).join("/");
}

files.sort((a, b) => normalize(a).localeCompare(normalize(b)));

const hash = createHash("sha256");
for (const filePath of files) {
  const rel = normalize(path.relative(rootDir, filePath));
  hash.update(rel);
  hash.update("\0");
  hash.update(await fs.readFile(filePath));
  hash.update("\0");
}

process.stdout.write(hash.digest("hex"));
"@

$env:ROOT_DIR = $rootDir
$currentHash = $nodeScript | node --input-type=module - $inputsArgs

if (Test-Path $hashFile) {
    $previousHash = Get-Content $hashFile -Raw
    if ($previousHash -eq $currentHash -and (Test-Path $outputFile)) {
        Write-Host "A2UI bundle up to date; skipping."
        exit 0
    }
}

pnpm -s exec tsc -p (Join-Path $a2uiRendererDir "tsconfig.json")

# Try local rolldown, fallback to dlx rolldown
$rolldownPath = npx which rolldown 2>$null
if ($null -ne $rolldownPath) {
    pnpm exec rolldown -c (Join-Path $a2uiAppDir "rolldown.config.mjs")
} else {
    pnpm -s dlx rolldown -c (Join-Path $a2uiAppDir "rolldown.config.mjs")
}

$currentHash | Out-File -FilePath $hashFile -NoNewline -Encoding utf8
Write-Host "A2UI bundled successfully."
