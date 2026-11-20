// Leonida Legend — filtering and the spoiler rule.

export const KIND_LABELS = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  completion: "Completion",
  online: "Online",
};

export const STAGES = [
  { n: 1, title: "Touchdown in Leonida", blurb: "The opening, Chapter 1, and the cheap early bankables: sample every activity type, finish an arcade game, and take that Ocean Beach cocktail." },
  { n: 2, title: "The Story: Chapters 2–4", blurb: "Play Chapters 2, 3 and 4 plus the named story missions — Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown and Operation Savage Glory." },
  { n: 3, title: "Strangers of Leonida", blurb: "Close out the stranger strands: the finals for Andy, Kenton, Billy, Randy and Tyrone, and eight completed strands in total for the silver." },
  { n: 4, title: "Before the Finale", blurb: "Bank the four missable trophies first — the VCIA departure, the showroom escape, the choices, and the second-chance moment — then complete the final mission." },
  { n: 5, title: "See All of Leonida", blurb: "The collectibles sweep: meditation spots, card sets, WAiNK locations, 100 vehicles, every area explored, all garages bought, and 10 Scooter Bros registrations." },
  { n: 6, title: "Master the Grind", blurb: "The long activities: 250 stunts, shooting-range golds, drone races, 20 race wins, 50 challenges, 5 bank vaults, the money trophies, and everything left over." },
  { n: 7, title: "100% and the Platinum", blurb: "Attain 100% completion, and the platinum — Vice Got a Price! — follows automatically once all 54 other trophies are earned." },
];

// The kind filter includes two pseudo-kinds:
// - "missable": trophies flagged missable, whatever their real kind.
// - "online": the launch list contains no online trophies, so this honestly matches nothing.
export function matchesKind(trophy, kindFilter) {
  if (kindFilter === "all") return true;
  if (kindFilter === "missable") return trophy.missable === true;
  if (kindFilter === "online") return trophy.kind === "online";
  return trophy.kind === kindFilter;
}

export function filterTrophies(trophies, { search = "", kind = "all", grade = "all" } = {}) {
  const q = search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!matchesKind(t, kind)) return false;
    if (grade !== "all" && t.grade !== grade) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

// Spoiler rule: with protection ON, an unearned story trophy is masked —
// no real name, no description, no guide — until it is earned.
export function isMasked(trophy, earnedSet, spoilerOn) {
  return Boolean(spoilerOn && trophy.kind === "story" && !earnedSet.has(trophy.id));
}

export function displayTrophy(trophy, earnedSet, spoilerOn) {
  if (!isMasked(trophy, earnedSet, spoilerOn)) return { ...trophy, masked: false };
  return {
    ...trophy,
    masked: true,
    displayName: "Hidden story trophy — earn it to reveal",
    displayDescription: "Hidden story trophy — earn it to reveal",
    displayGuide: null,
  };
}
