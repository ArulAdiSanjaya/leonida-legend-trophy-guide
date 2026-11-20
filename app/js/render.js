// render.js — turns trophy data and tracker state into DOM.
//
// Three views are rendered here: the checklist rows, the detail pane that
// shows one trophy's official description, our guide, its steps and its
// sources, and the platinum roadmap. Spoiler-safe mode is applied at render
// time: an unearned story trophy shows a masked name and description until
// it is ticked off, exactly as PlayStation hides hidden trophies.

export const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

export const KIND_LABELS = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
};

export const ROADMAP_STAGES = [
  {
    title: "Stage 1 — Story first, spoiler-safe",
    summary:
      "Play the campaign in order: Gone Fishing, Chapters 1 to 4, the named story missions (Breakfast Run, The Cartel Heist, Child's Play, Headliners, VCIA Takedown, Operation Savage Glory) and the final mission. That is 12 trophies, including the story gold.",
    trophyNames: [
      "Just Like Paradise",
      "Paradise Lost",
      "T**s Ass Drug Money",
      "Vice City, Baby!",
      "Top Of The World, Ma",
      "Trust",
      "Break the Bank",
      "Family Matters",
      "DWNFALL",
      "Hi-Jacked",
      "Snow Storm",
      "You Gotta Know When to Get Off",
    ],
  },
  {
    title: "Stage 2 — Missables before the point of no return",
    summary:
      "Five trophies can be left behind. Do the VCIA departure during the airport visit, the Ocean Beach cocktail while you are first there, the showroom smash on a showroom visit, and build the 500-choice counter and one deliberate fail-then-succeed retry as you play — all before the finale.",
    trophyNames: [
      "Catch Me If You Can",
      "In The Beginning…",
      "Capital Offense",
      "Actions Speak Louder",
      "Bad Luck, I Guess",
    ],
  },
  {
    title: "Stage 3 — Strangers and contacts",
    summary:
      "Close every contact strand: Andy, Kenton, Billy, Randy and Tyrone each end with a final-mission trophy, Bret adds his unique hunt, and eight finished strands together earn the Strangers & Freaks silver.",
    trophyNames: [
      "Road to Rehabilitation",
      "This Was No Boat Accident",
      "The Lone Rider",
      "Supply & Demand",
      "Spin On This!",
      "Fair Game",
      "Strangers & Freaks",
    ],
  },
  {
    title: "Stage 4 — Activities sweep",
    summary:
      "Sample all 9 activity types once, then clear the scored ones: 42 Shooting Range golds, drone-race wins at 14 locations, 20 different race wins, Cal's fishing challenge, one arcade game, 250 stunts, 50 challenges and a game at the Kolt & Associates bowling alley.",
    trophyNames: [
      "Master of None",
      "The Shootist",
      "Top Fun",
      "Earn Cash, Not Kudos",
      "Baited My Tackle",
      "Stick Fiddler",
      "Cunning Stunts",
      "One Last Thing",
      "Let’s Go Bowling",
    ],
  },
  {
    title: "Stage 5 — Collectibles and the full map",
    summary:
      "Sweep Leonida region by region: 18 meditation spots, 3 complete card sets, 100 WAiNK locations, all 52 areas explored, 100 vehicles discovered and 10 registered on the Scooter Bros app — and keep an eye out for something strange at night.",
    trophyNames: [
      "Positive Mental Attitude",
      "Don't Touch My Deck",
      "You WAiNKer!",
      "The Goodtime State",
      "Whip It Good",
      "On the Spot",
      "The Truth Is Out There",
    ],
  },
  {
    title: "Stage 6 — Free-roam feats and the money game",
    summary:
      "The partner and crime feats: a 4-star escape together, 3 shops back-to-back, 5 bank vaults, an armored truck, an undetected jewelry robbery, one illegal operation per gang (9), 5 takedowns in one Combat Focus, a melee drive-by, $250,000 laundered, $100,000 spent and all 8 garages bought.",
    trophyNames: [
      "Hot Together",
      "Retail Therapy",
      "Maximum Withdrawal",
      "A Classic Blitz Play",
      "Sneakthief",
      "Pest Control",
      "Gunslinger",
      "Ten Pin",
      "Challenging Tank",
      "Personal Best",
      "Dime on the Dollar",
      "Treat Yo Self",
      "Little Boxes",
    ],
  },
  {
    title: "Stage 7 — 100% and the platinum",
    summary:
      "When every stage above is ticked, the completion counter reaches 100% for the second gold — and the platinum, Vice Got a Price!, unlocks on its own as the 55th trophy.",
    trophyNames: ["A Long Road", "Vice Got a Price!"],
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function isMasked(trophy, progress) {
  return (
    progress.spoilerSafe === true &&
    trophy.kind === "story" &&
    progress.earned[trophy.name] !== true
  );
}

export function displayName(trophy, progress) {
  if (isMasked(trophy, progress)) return "Hidden story trophy";
  return trophy.name;
}

export function displayDescription(trophy, progress) {
  if (isMasked(trophy, progress)) {
    return "Spoiler-safe mode: this story trophy's name and description stay hidden until you mark it earned.";
  }
  return trophy.description;
}

export function gradeBadge(trophy) {
  const badge = el("span", `grade-badge grade-${trophy.grade}`, GRADE_LABELS[trophy.grade] || trophy.grade);
  return badge;
}

export function renderProgress(elements, progress, total) {
  const done = Object.keys(progress.earned).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  elements.text.textContent = `${done} of ${total} trophies earned · ${pct}%`;
  elements.bar.style.width = `${pct}%`;
  elements.bar.setAttribute("aria-valuenow", String(pct));
}

export function renderRow(trophy, progress, selectedName, onToggle, onSelect) {
  const masked = isMasked(trophy, progress);
  const row = el("li", "trophy-row");
  if (progress.earned[trophy.name] === true) row.classList.add("is-earned");
  if (trophy.name === selectedName) row.classList.add("is-selected");
  row.dataset.trophyName = trophy.name;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "earned-toggle";
  checkbox.checked = progress.earned[trophy.name] === true;
  checkbox.setAttribute("aria-label", `Mark ${trophy.name} as earned`);
  checkbox.addEventListener("change", () => onToggle(trophy, checkbox.checked));
  row.appendChild(checkbox);

  const main = el("button", "row-main");
  main.type = "button";
  const titleLine = el("span", "row-title");
  titleLine.appendChild(el("span", "row-name", displayName(trophy, progress)));
  if (trophy.missable) titleLine.appendChild(el("span", "missable-flag", "MISSABLE"));
  if (trophy.hidden && !masked) titleLine.appendChild(el("span", "hidden-flag", "Hidden on PSN"));
  main.appendChild(titleLine);
  main.appendChild(el("span", "row-desc", displayDescription(trophy, progress)));
  const metaLine = el("span", "row-meta");
  metaLine.appendChild(gradeBadge(trophy));
  metaLine.appendChild(el("span", "kind-tag", KIND_LABELS[trophy.kind] || trophy.kind));
  main.appendChild(metaLine);
  main.addEventListener("click", () => onSelect(trophy));
  row.appendChild(main);
  return row;
}

export function renderList(container, trophies, progress, selectedName, handlers) {
  container.textContent = "";
  if (trophies.length === 0) {
    container.appendChild(el("li", "empty-note", "No trophies match these filters."));
    return;
  }
  for (const trophy of trophies) {
    container.appendChild(renderRow(trophy, progress, selectedName, handlers.onToggle, handlers.onSelect));
  }
}

export function renderDetail(container, trophy, progress, onToggle, trophies) {
  container.textContent = "";
  if (!trophy) {
    container.appendChild(el("p", "detail-empty", "Select a trophy to read its guide."));
    const next = Array.isArray(trophies)
      ? trophies.find((candidate) => progress.earned[candidate.name] !== true)
      : null;
    if (next) {
      container.appendChild(
        el("p", "detail-next", `Next trophy still unearned: ${next.name} — open it from the checklist.`),
      );
    }
    return;
  }
  const masked = isMasked(trophy, progress);

  const head = el("div", "detail-head");
  head.appendChild(el("h2", "detail-name", displayName(trophy, progress)));
  head.appendChild(gradeBadge(trophy));
  container.appendChild(head);

  const flags = el("p", "detail-flags");
  flags.appendChild(el("span", "kind-tag", KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.missable) flags.appendChild(el("span", "missable-flag", "MISSABLE — can be left behind"));
  if (trophy.hidden) flags.appendChild(el("span", "hidden-flag", "Hidden on PlayStation until earned"));
  container.appendChild(flags);

  container.appendChild(el("h3", null, "Official description"));
  container.appendChild(el("p", "detail-desc", displayDescription(trophy, progress)));

  const toggleLabel = el("label", "detail-toggle");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = progress.earned[trophy.name] === true;
  checkbox.addEventListener("change", () => onToggle(trophy, checkbox.checked));
  toggleLabel.appendChild(checkbox);
  toggleLabel.appendChild(el("span", null, " I have earned this trophy"));
  container.appendChild(toggleLabel);

  if (masked) {
    container.appendChild(
      el("p", "detail-spoiler-note", "Guide hidden by spoiler-safe mode. Mark the trophy earned — or turn spoiler-safe mode off — to read it."),
    );
    return;
  }

  container.appendChild(el("h3", null, "Guide — in our own words"));
  container.appendChild(el("p", "detail-guide", trophy.guide));

  if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    container.appendChild(el("h3", null, "Steps"));
    const list = el("ol", "detail-steps");
    for (const step of trophy.steps) list.appendChild(el("li", null, step));
    container.appendChild(list);
  }

  container.appendChild(el("h3", null, "Sources"));
  container.appendChild(el("p", "detail-sources", trophy.sources || "Official list: Exophase; PSN count: PSNProfiles; guide text: our own."));
}

export function renderRoadmap(container, trophiesByName, progress) {
  container.textContent = "";
  for (const stage of ROADMAP_STAGES) {
    const section = el("section", "roadmap-stage");
    const stageDone = stage.trophyNames.filter((name) => progress.earned[name] === true).length;
    const heading = el("h3", null, stage.title);
    heading.appendChild(
      el("span", "stage-count", ` — ${stageDone}/${stage.trophyNames.length} earned`),
    );
    section.appendChild(heading);
    section.appendChild(el("p", "roadmap-summary", stage.summary));
    const chips = el("p", "roadmap-chips");
    for (const name of stage.trophyNames) {
      const trophy = trophiesByName.get(name);
      if (!trophy) continue;
      const chip = el("span", "roadmap-chip", displayName(trophy, progress));
      if (progress.earned[name] === true) chip.classList.add("is-earned");
      if (trophy.missable) chip.classList.add("is-missable");
      chips.appendChild(chip);
    }
    section.appendChild(chips);
    container.appendChild(section);
  }
}

export function renderMissableBanner(container, trophies, progress, onSelect) {
  container.textContent = "";
  const missables = trophies.filter((trophy) => trophy.missable === true);
  container.appendChild(el("h2", null, `Missable trophies — ${missables.length} to watch`));
  container.appendChild(
    el(
      "p",
      "missable-intro",
      "These five are flagged from their official descriptions: a one-off airport departure, an opening-area moment, a staged showroom escape, a 500-choice counter and a fail-first riddle. Open each one for its guide before the story's point of no return.",
    ),
  );
  const list = el("ul", "missable-list");
  for (const trophy of missables) {
    const item = el("li", "missable-item");
    const button = el("button", "missable-button", displayName(trophy, progress));
    button.type = "button";
    button.addEventListener("click", () => onSelect(trophy));
    item.appendChild(button);
    if (progress.earned[trophy.name] === true) item.appendChild(el("span", "earned-note", "Earned ✓"));
    list.appendChild(item);
  }
  container.appendChild(list);
}
