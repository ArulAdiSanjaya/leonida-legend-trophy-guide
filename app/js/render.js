// Leonida Legend — rendering for the checklist, detail pane, roadmap, missables and about views.
import { KIND_LABELS, STAGES, displayTrophy } from "./filters.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeBadge(grade) {
  return el("span", `badge grade-${grade}`, grade);
}

function kindBadge(trophy) {
  const label = trophy.missable ? `${KIND_LABELS[trophy.kind]} · Missable` : KIND_LABELS[trophy.kind];
  return el("span", `badge kind${trophy.missable ? " missable-badge" : ""}`, label);
}

export function renderHeader(state, total) {
  const count = state.earned.length;
  document.getElementById("earned-count").textContent = String(count);
  const pct = total ? Math.round((count / total) * 100) : 0;
  document.getElementById("progress-bar").style.width = `${pct}%`;
  document.getElementById("progress-pct").textContent = `${pct}%`;
  document.getElementById("progress-bar-wrap").setAttribute("aria-valuenow", String(count));
}

export function renderList(container, trophies, state, { onToggle, onSelect }) {
  const earnedSet = new Set(state.earned);
  container.textContent = "";
  if (!trophies.length) {
    container.appendChild(el("p", "empty", "No trophies match these filters."));
    return;
  }
  for (const raw of trophies) {
    const t = displayTrophy(raw, earnedSet, state.spoiler);
    const row = el("div", `trophy-row${state.selected === raw.id ? " selected" : ""}${earnedSet.has(raw.id) ? " earned" : ""}`);

    const check = el("input", "earned-check");
    check.type = "checkbox";
    check.checked = earnedSet.has(raw.id);
    check.setAttribute("aria-label", `Mark ${raw.name} as earned`);
    check.addEventListener("change", () => onToggle(raw.id));

    const main = el("button", "row-main");
    main.type = "button";
    const name = el("span", "row-name", t.masked ? t.displayName : raw.name);
    const desc = el("span", "row-desc", t.masked ? t.displayDescription : raw.description);
    main.append(name, desc);
    main.addEventListener("click", () => onSelect(raw.id));

    const badges = el("span", "row-badges");
    badges.append(gradeBadge(raw.grade), kindBadge(raw));
    row.append(check, main, badges);
    container.appendChild(row);
  }
}

export function renderOnlineEmpty(container) {
  container.textContent = "";
  const box = el("div", "online-empty");
  box.append(
    el("h3", "", "No online trophies in the launch list"),
    el("p", "", "Honest answer: none of the 55 official launch trophies is an online trophy. Every trophy in this guide can be earned in the single-player game as published, so there is nothing to show under the Online filter — and nothing here requires GTA Online."),
  );
  container.appendChild(box);
}

export function renderDetail(pane, trophy, state, { onToggle }) {
  const earnedSet = new Set(state.earned);
  pane.textContent = "";
  if (!trophy) {
    pane.appendChild(el("p", "detail-hint", "Select a trophy to read its guide."));
    return;
  }
  const t = displayTrophy(trophy, earnedSet, state.spoiler);
  const earned = earnedSet.has(trophy.id);

  pane.appendChild(el("p", "detail-kicker", `Trophy #${trophy.id} · Stage ${trophy.stage} — ${STAGES[trophy.stage - 1].title}`));
  pane.appendChild(el("h3", "detail-name", t.masked ? t.displayName : trophy.name));
  pane.appendChild(el("p", "detail-desc", t.masked ? t.displayDescription : trophy.description));

  const badges = el("p", "detail-badges");
  badges.append(gradeBadge(trophy.grade), kindBadge(trophy));
  if (trophy.missable) badges.append(el("span", "badge warn", "Missable — see Missables tab"));
  pane.appendChild(badges);

  const btn = el("button", "btn toggle-earned", earned ? "✓ Earned — tap to undo" : "Mark as earned");
  btn.type = "button";
  btn.addEventListener("click", () => onToggle(trophy.id));
  pane.appendChild(btn);

  pane.appendChild(el("h4", "", "Guide"));
  if (t.masked) {
    pane.appendChild(el("p", "guide masked-note", "Guide hidden by spoiler protection. Earn this story trophy — or turn spoiler protection off in the controls — to read it."));
  } else {
    pane.appendChild(el("p", "guide", trophy.guide));
  }

  pane.appendChild(el("h4", "", "Sources"));
  const srcNote = el("p", "sources-note", "Facts (name, description, grade) come from the sources below. The guide text above is our own, reasoned from the official description.");
  pane.appendChild(srcNote);
  const ul = el("ul", "sources");
  for (const s of trophy.sources || []) {
    const li = el("li");
    const a = el("a", "", s.label);
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    li.appendChild(a);
    ul.appendChild(li);
  }
  pane.appendChild(ul);
}

export function renderRoadmap(container, trophies, state) {
  const earnedSet = new Set(state.earned);
  container.textContent = "";
  for (const stage of STAGES) {
    const items = trophies.filter((t) => t.stage === stage.n);
    const done = items.filter((t) => earnedSet.has(t.id)).length;
    const card = el("article", "stage-card");
    const head = el("div", "stage-head");
    head.append(
      el("h3", "", `Stage ${stage.n} — ${stage.title}`),
      el("span", "stage-progress", `${done} of ${items.length}`),
    );
    card.appendChild(head);
    const bar = el("div", "bar small");
    const fill = el("div", "bar-fill");
    fill.style.width = items.length ? `${Math.round((done / items.length) * 100)}%` : "0%";
    bar.appendChild(fill);
    card.appendChild(bar);
    card.appendChild(el("p", "stage-blurb", stage.blurb));
    const ul = el("ul", "stage-list");
    for (const t of items) {
      const li = el("li", earnedSet.has(t.id) ? "done" : "");
      li.textContent = `${earnedSet.has(t.id) ? "✓ " : ""}${t.name} (${t.grade})${t.missable ? " — MISSABLE" : ""}`;
      ul.appendChild(li);
    }
    card.appendChild(ul);
    container.appendChild(card);
  }
}

const MISSABLE_REASONS = {
  37: "The description ties an unscheduled departure to VCIA — the airport-style story location from the VCIA Takedown beat. A departure like that is a story moment, not free-roam furniture: miss the window and it may not come back.",
  45: "Smashing out of a vehicle showroom 'in classic style' describes a set-piece escape, not an everyday free-roam action. When the scene happens, take the dramatic exit — a normal exit likely closes the chance for good.",
  48: "'Choices made (for better or worse)' only makes sense if choices are real and lasting. Decisions you walk past or rush through cannot be re-decided later, so engage with choice moments deliberately as they appear.",
  49: "'Second time's the charm' implies a first attempt exists that can be failed. If that first attempt is a one-off moment and the second chance is missed too, there may be no third — save before unique first attempts.",
};

export function renderMissables(container, trophies, state) {
  const earnedSet = new Set(state.earned);
  container.textContent = "";
  for (const t of trophies.filter((x) => x.missable)) {
    const card = el("article", "missable-card");
    card.append(
      el("h3", "", `${earnedSet.has(t.id) ? "✓ " : ""}${t.name} (${t.grade})`),
      el("p", "missable-desc", `“${t.description}”`),
      el("p", "missable-reason", MISSABLE_REASONS[t.id] || ""),
      el("p", "guide", t.guide),
    );
    container.appendChild(card);
  }
}

export function renderAbout(container, data) {
  container.textContent = "";
  const sections = [
    ["What this is", "Leonida Legend is a complete, offline trophy guide and tracker for the 55 official Grand Theft Auto VI PlayStation 5 trophies. It runs entirely from static files — open it, track progress, and take it anywhere. Progress is stored only in your browser (localStorage) and can be exported to a JSON file and imported back on another device."],
    ["Where the data comes from", "Trophy names, descriptions and grades are the official PS5 trophy list, as published (see each trophy's Sources in the detail pane: the official list via Exophase, and the PSNProfiles trophy page for grades and PSN targets). The guide text for every trophy is original to this guide, written from the official description alone. Where a description does not pin down a location, count detail or exact step, the guide says so plainly instead of inventing one."],
    ["The missable standard", "A trophy is flagged missable here only when its own official description implies a one-chance moment. By that strict standard exactly four qualify: Catch Me If You Can (37), Capital Offense (45), Actions Speak Louder (48) and Bad Luck, I Guess (49). Story trophies are not flagged missable — but mission replay for trophies is not confirmed, so every story guide still advises earning mission-specific actions on the first pass."],
    ["About online trophies", "There are no online trophies in the launch list of 55. The Online filter is included so you can verify that for yourself: it honestly returns an empty result with an explanation, rather than hiding the question. If a future title update adds online trophies, they are not part of this list."],
    ["Spoiler protection", "With spoiler protection on (the default), story trophies you have not earned yet are masked — name, description and guide stay hidden until you earn them. Turn it off in the Checklist controls if you prefer to read everything up front."],
  ];
  for (const [title, body] of sections) {
    const s = el("section", "about-section");
    s.append(el("h3", "", title), el("p", "", body));
    container.appendChild(s);
  }
  const meta = el("p", "about-meta", `${data.game} · ${data.platform} · ${data.list}. ${data.sourcesNote || ""}`);
  container.appendChild(meta);
}
