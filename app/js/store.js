// store.js — progress persistence for the Leonida Legend tracker.
//
// Everything the tracker remembers lives under one localStorage key as a
// small JSON document: which trophies are earned (by official name) and
// whether spoiler-safe mode is on. Nothing leaves the browser except when
// the reader explicitly exports a progress file or imports one back.

export const STORAGE_KEY = "leonida-legend-progress-v1";
export const EXPORT_FORMAT = "leonida-legend-progress";

export function emptyProgress() {
  return { earned: {}, spoilerSafe: false };
}

export function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    const earned = {};
    if (parsed.earned && typeof parsed.earned === "object") {
      for (const [name, flag] of Object.entries(parsed.earned)) {
        if (flag === true) earned[name] = true;
      }
    }
    return { earned, spoilerSafe: parsed.spoilerSafe === true };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode, quota). The tracker keeps
    // working in memory; the header simply will not persist between visits.
  }
}

export function isEarned(progress, trophyName) {
  return progress.earned[trophyName] === true;
}

export function setEarned(progress, trophyName, earned) {
  if (earned) {
    progress.earned[trophyName] = true;
  } else {
    delete progress.earned[trophyName];
  }
  saveProgress(progress);
  return progress;
}

export function earnedCount(progress) {
  return Object.keys(progress.earned).length;
}

export function buildExport(progress, totalTrophies) {
  return {
    format: EXPORT_FORMAT,
    version: 1,
    game: "Grand Theft Auto VI",
    platform: "PlayStation 5",
    totalTrophies,
    earnedCount: earnedCount(progress),
    exportedAt: new Date().toISOString(),
    spoilerSafe: progress.spoilerSafe === true,
    earned: Object.keys(progress.earned).sort(),
  };
}

export function downloadExport(progress, totalTrophies) {
  const payload = buildExport(progress, totalTrophies);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "leonida-legend-progress.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload;
}

export function parseImport(text, knownNames) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("That file is not a progress file.");
  }
  let names = [];
  if (Array.isArray(parsed.earned)) {
    names = parsed.earned;
  } else if (parsed.earned && typeof parsed.earned === "object") {
    names = Object.keys(parsed.earned).filter((name) => parsed.earned[name] === true);
  } else if (Array.isArray(parsed.trophies)) {
    names = parsed.trophies;
  } else {
    throw new Error("No earned-trophy list found in that file.");
  }
  const known = new Set(knownNames);
  const earned = {};
  let ignored = 0;
  for (const name of names) {
    if (typeof name === "string" && known.has(name)) {
      earned[name] = true;
    } else {
      ignored += 1;
    }
  }
  return {
    progress: { earned, spoilerSafe: parsed.spoilerSafe === true },
    imported: Object.keys(earned).length,
    ignored,
  };
}

export function readImportFile(file, knownNames) {
  return file.text().then((text) => parseImport(text, knownNames));
}
