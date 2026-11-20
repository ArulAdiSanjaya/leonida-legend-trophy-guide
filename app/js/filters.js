// filters.js — pure filtering and counting for the trophy checklist.
//
// The filter bar offers kinds (story, missable, collectibles, activities,
// online), grades, an earned/unearned switch and free-text search. The
// official PS5 list contains no online trophies — the partner trophies are
// story-mode co-op — so the online filter honestly matches nothing and the
// UI says so instead of inventing entries.

export const KIND_FILTERS = [
  { id: "all", label: "All 55" },
  { id: "story", label: "Story" },
  { id: "missable", label: "Missable" },
  { id: "collectibles", label: "Collectibles" },
  { id: "activities", label: "Activities" },
  { id: "online", label: "Online" },
];

export const GRADE_FILTERS = ["all", "platinum", "gold", "silver", "bronze"];

export function matchesKind(trophy, kind) {
  if (!kind || kind === "all") return true;
  if (kind === "missable") return trophy.missable === true;
  if (kind === "online") return trophy.kind === "online";
  return trophy.kind === kind;
}

export function matchesGrade(trophy, grade) {
  if (!grade || grade === "all") return true;
  return trophy.grade === grade;
}

export function matchesSearch(trophy, query) {
  const needle = (query || "").trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function matchesEarnedState(trophy, earnedOnly, isEarnedFn) {
  if (!earnedOnly) return true;
  return isEarnedFn(trophy.name);
}

export function filterTrophies(trophies, criteria, isEarnedFn) {
  return trophies.filter(
    (trophy) =>
      matchesKind(trophy, criteria.kind) &&
      matchesGrade(trophy, criteria.grade) &&
      matchesSearch(trophy, criteria.query) &&
      matchesEarnedState(trophy, criteria.earnedOnly, isEarnedFn),
  );
}

export function countByKind(trophies) {
  const counts = { all: trophies.length, story: 0, missable: 0, collectibles: 0, activities: 0, online: 0 };
  for (const trophy of trophies) {
    if (trophy.kind === "story") counts.story += 1;
    if (trophy.kind === "collectibles") counts.collectibles += 1;
    if (trophy.kind === "activities") counts.activities += 1;
    if (trophy.kind === "online") counts.online += 1;
    if (trophy.missable === true) counts.missable += 1;
  }
  return counts;
}

export function countByGrade(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (Object.prototype.hasOwnProperty.call(counts, trophy.grade)) counts[trophy.grade] += 1;
  }
  return counts;
}

export function missableTrophies(trophies) {
  return trophies.filter((trophy) => trophy.missable === true);
}

export function isStoryTrophy(trophy) {
  return trophy.kind === "story";
}
