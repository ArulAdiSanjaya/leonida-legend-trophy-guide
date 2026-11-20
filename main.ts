// Leonida Legend — hand-in program for the gta6-trophy-guide-01 entry.
//
// What this program is: the guide itself is the static app/ folder beside
// this file (plain HTML, CSS, ES modules and one JSON data file — no build
// step, nothing fetched over the network). This program's only job is to
// hand that guide in the way make.fun expects: copy app/ and screenshots/
// into the output directory and write dossier.json there with the vendored
// buildDossier library, byte for byte as the scorer will rebuild it.
//
// Node 22, standard library only. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (Inside the grader the output directory is /output.)
//
// Authored for this entry: the summary count below is ours — before writing
// the dossier we count the trophies in app/data/trophies.json and refuse to
// hand in a guide whose data file does not hold the full official list of
// 55, so a truncated data file can never slip through as a valid entry.

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const EXPECTED_TROPHY_COUNT = 55;

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Our own pre-flight check: the guide is only complete with all 55 trophies.
const dataFile = join(here, 'app', 'data', 'trophies.json');
const parsed = JSON.parse(readFileSync(dataFile, 'utf8'));
const trophyList = Array.isArray(parsed) ? parsed : parsed.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== EXPECTED_TROPHY_COUNT) {
  throw new Error(
    `app/data/trophies.json must hold ${EXPECTED_TROPHY_COUNT} trophies; found ${
      Array.isArray(trophyList) ? trophyList.length : 'none'
    }. Refusing to hand in an incomplete guide.`,
  );
}
const withoutGuide = trophyList.filter(
  (trophy) => typeof trophy?.guide !== 'string' || trophy.guide.trim() === '',
);
if (withoutGuide.length > 0) {
  throw new Error(
    `Every trophy needs a guide; missing for: ${withoutGuide.map((t) => t?.name ?? '?').join(', ')}`,
  );
}
console.log(`Leonida Legend: ${trophyList.length} trophies, every one with a guide. Handing in…`);

// The hand-in itself: app/ and screenshots/ copied verbatim, then the dossier.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(`Dossier written to ${join(out, 'dossier.json')}`);
