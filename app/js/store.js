// Leonida Legend — progress store.
// Progress lives only in this browser, in localStorage under one key.
// Shape: { "earned": [trophyId, ...], "spoiler": true|false, "selected": trophyId|null }

export const STORAGE_KEY = "leonida-legend-progress-v1";

const DEFAULT_STATE = { earned: [], spoiler: true, selected: null };

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [],
      spoiler: typeof parsed.spoiler === "boolean" ? parsed.spoiler : true,
      selected: Number.isInteger(parsed.selected) ? parsed.selected : null,
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, file quotas). The guide still works for the session.
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  state.earned = isEarned(state, id)
    ? state.earned.filter((n) => n !== id)
    : [...state.earned, id].sort((a, b) => a - b);
  saveState(state);
  return state;
}

export function setSpoiler(state, on) {
  state.spoiler = Boolean(on);
  saveState(state);
  return state;
}

export function setSelected(state, id) {
  state.selected = id;
  saveState(state);
  return state;
}

// Export: download the current progress as a small JSON file the user keeps.
export function exportProgress(state) {
  const payload = {
    app: "leonida-legend",
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-legend-progress.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload;
}

// Import: parse a previously exported file. Returns a clean earned-id list,
// or throws with a human-readable reason.
export function parseImport(text, validIds) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error("That file does not contain an earned list.");
  const clean = list.filter((n) => Number.isInteger(n) && validIds.has(n));
  return [...new Set(clean)].sort((a, b) => a - b);
}
