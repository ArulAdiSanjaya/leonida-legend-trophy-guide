// main.js — Leonida Legend tracker bootstrap and event wiring.
//
// Loads the trophy data from data/trophies.json (a file inside app/, so the
// guide works fully offline), restores progress from localStorage, and keeps
// the checklist, detail pane, roadmap and missable banner in sync. It also
// reads a few deep-link parameters (?kind=, ?grade=, ?spoiler=1, ?open=)
// so a view of the guide can be shared as a link.

import {
  loadProgress,
  saveProgress,
  setEarned,
  isEarned,
  downloadExport,
  readImportFile,
  emptyProgress,
} from "./store.js";
import { KIND_FILTERS, filterTrophies, countByKind, countByGrade } from "./filters.js";
import {
  renderProgress,
  renderList,
  renderDetail,
  renderRoadmap,
  renderMissableBanner,
} from "./render.js";

const elements = {
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  gradeBreakdown: document.getElementById("gradeBreakdown"),
  kindChips: document.getElementById("kindChips"),
  gradeFilter: document.getElementById("gradeFilter"),
  searchInput: document.getElementById("searchInput"),
  earnedOnlyToggle: document.getElementById("earnedOnlyToggle"),
  spoilerToggle: document.getElementById("spoilerToggle"),
  exportButton: document.getElementById("exportButton"),
  importButton: document.getElementById("importButton"),
  importInput: document.getElementById("importInput"),
  resetButton: document.getElementById("resetButton"),
  statusLine: document.getElementById("statusLine"),
  resultCount: document.getElementById("resultCount"),
  onlineNote: document.getElementById("onlineNote"),
  trophyList: document.getElementById("trophyList"),
  detailPane: document.getElementById("detailPane"),
  roadmapBox: document.getElementById("roadmapBox"),
  missableBox: document.getElementById("missableBox"),
};

const state = {
  trophies: [],
  byName: new Map(),
  progress: loadProgress(),
  criteria: { kind: "all", grade: "all", query: "", earnedOnly: false },
  selectedName: null,
};

function setStatus(message) {
  elements.statusLine.textContent = message;
}

function applyDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get("kind");
  if (kind && KIND_FILTERS.some((filter) => filter.id === kind)) state.criteria.kind = kind;
  const grade = params.get("grade");
  if (grade && ["platinum", "gold", "silver", "bronze"].includes(grade)) state.criteria.grade = grade;
  if (params.get("spoiler") === "1") state.progress.spoilerSafe = true;
  const open = params.get("open");
  if (open && state.byName.has(open)) state.selectedName = open;
}

function buildKindChips() {
  const counts = countByKind(state.trophies);
  elements.kindChips.textContent = "";
  for (const filter of KIND_FILTERS) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "kind-chip";
    if (state.criteria.kind === filter.id) chip.classList.add("is-active");
    chip.textContent = `${filter.label} (${counts[filter.id] ?? 0})`;
    chip.dataset.kind = filter.id;
    chip.addEventListener("click", () => {
      state.criteria.kind = filter.id;
      renderAll();
    });
    elements.kindChips.appendChild(chip);
  }
}

function renderGradeBreakdown() {
  const counts = countByGrade(state.trophies);
  elements.gradeBreakdown.textContent =
    `Official list: 1 platinum · ${counts.gold} gold · ${counts.silver} silver · ${counts.bronze} bronze · 28 hidden on PSN`;
}

function selectedTrophy() {
  if (!state.selectedName) return null;
  return state.byName.get(state.selectedName) || null;
}

function handleToggle(trophy, earned) {
  setEarned(state.progress, trophy.name, earned);
  renderAll();
}

function handleSelect(trophy) {
  state.selectedName = trophy.name;
  renderAll();
  elements.detailPane.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function renderAll() {
  renderProgress(
    { text: elements.progressText, bar: elements.progressBar },
    state.progress,
    state.trophies.length,
  );
  buildKindChips();
  elements.gradeFilter.value = state.criteria.grade;
  elements.spoilerToggle.checked = state.progress.spoilerSafe === true;
  elements.earnedOnlyToggle.checked = state.criteria.earnedOnly;

  const visible = filterTrophies(state.trophies, state.criteria, (name) =>
    isEarned(state.progress, name),
  );
  elements.resultCount.textContent = `Showing ${visible.length} of ${state.trophies.length} trophies`;
  elements.onlineNote.hidden = state.criteria.kind !== "online";
  renderList(elements.trophyList, visible, state.progress, state.selectedName, {
    onToggle: handleToggle,
    onSelect: handleSelect,
  });
  renderDetail(elements.detailPane, selectedTrophy(), state.progress, handleToggle, state.trophies);
  renderRoadmap(elements.roadmapBox, state.byName, state.progress);
  renderMissableBanner(elements.missableBox, state.trophies, state.progress, handleSelect);
}

function wireControls() {
  elements.gradeFilter.addEventListener("change", () => {
    state.criteria.grade = elements.gradeFilter.value;
    renderAll();
  });
  elements.searchInput.addEventListener("input", () => {
    state.criteria.query = elements.searchInput.value;
    renderAll();
  });
  elements.earnedOnlyToggle.addEventListener("change", () => {
    state.criteria.earnedOnly = elements.earnedOnlyToggle.checked;
    renderAll();
  });
  elements.spoilerToggle.addEventListener("change", () => {
    state.progress.spoilerSafe = elements.spoilerToggle.checked;
    saveProgress(state.progress);
    setStatus(
      state.progress.spoilerSafe
        ? "Spoiler-safe mode on: unearned story trophies are masked."
        : "Spoiler-safe mode off: all names and descriptions are visible.",
    );
    renderAll();
  });
  elements.exportButton.addEventListener("click", () => {
    downloadExport(state.progress, state.trophies.length);
    setStatus("Progress exported as leonida-legend-progress.json — keep it to restore or move your checklist.");
  });
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", () => {
    const file = elements.importInput.files && elements.importInput.files[0];
    if (!file) return;
    readImportFile(file, state.trophies.map((trophy) => trophy.name))
      .then((result) => {
        state.progress = result.progress;
        saveProgress(state.progress);
        setStatus(
          `Imported ${result.imported} earned trophies` +
            (result.ignored > 0 ? ` (${result.ignored} unknown names ignored).` : "."),
        );
        renderAll();
      })
      .catch((error) => {
        setStatus(`Import failed: ${error.message}`);
      })
      .finally(() => {
        elements.importInput.value = "";
      });
  });
  elements.resetButton.addEventListener("click", () => {
    state.progress = emptyProgress();
    saveProgress(state.progress);
    setStatus("Progress cleared. Every trophy is unearned again.");
    renderAll();
  });
}

async function start() {
  try {
    const response = await fetch("data/trophies.json");
    if (!response.ok) throw new Error(`trophy data failed to load (${response.status})`);
    const data = await response.json();
    state.trophies = Array.isArray(data) ? data : data.trophies;
    state.byName = new Map(state.trophies.map((trophy) => [trophy.name, trophy]));
  } catch (error) {
    setStatus(`Could not load the trophy list: ${error.message}`);
    return;
  }
  applyDeepLink();
  if (!state.selectedName && state.trophies.length > 0) {
    state.selectedName = "The Shootist";
  }
  renderGradeBreakdown();
  wireControls();
  renderAll();
}

start();
