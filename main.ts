// Leonida Legend — hand-in for the gta6-trophy-guide-01 bounty (Node 22+, stdlib only).
//
// The entry itself is the static app/ folder beside this file: index.html, app.js,
// style.css and data/trophies.json — plain files a browser opens, no build step, nothing
// fetched over the network. This program only delivers it: it copies app/ and
// screenshots/ into the output directory and writes dossier.json there, using the
// vendored make.fun library (vendor/makefun-frontend.ts, untouched — the scorer
// requires dossier.json to be byte for byte what its own copy of that file writes).
//
// Local run (outside the grader, where the output directory is /output):
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// To look at the guide instead of handing it in: `node serve.ts`, then
// http://localhost:8080 in desktop Chrome.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so stale files from an earlier run can
// never ride along with the entry.
if (existsSync(outputDir)) rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shots = join(repoRoot, 'screenshots');
if (existsSync(shots)) cpSync(shots, join(outputDir, 'screenshots'), { recursive: true });

// The scorer's caps for this bounty: the text budget shapes the dossier bytes;
// the others refuse an entry the scorer would refuse — at most 4 screenshots,
// each at most 256 KiB; app/ at most 993 files and directories and 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`handed in to ${outputDir} (dossier.json: ${dossier.length} bytes)`);
