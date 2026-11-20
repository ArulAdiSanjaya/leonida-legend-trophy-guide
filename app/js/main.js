// Leonida Legend — boot, tabs and wiring.
import { loadState, saveState, toggleEarned, setSpoiler, setSelected, exportProgress, parseImport } from "./store.js";
import { filterTrophies } from "./filters.js";
import { renderHeader, renderList, renderOnlineEmpty, renderDetail, renderRoadmap, renderMissables, renderAbout } from "./render.js";

const state = loadState();
let data = null;
let trophies = [];
let activeTab = "checklist";

const $ = (id) => document.getElementById(id);

function currentFilters() {
  return {
    search: $("search").value,
    kind: $("kind-filter").value,
    grade: $("grade-filter").value,
  };
}

function selectedTrophy() {
  return trophies.find((t) => t.id === state.selected) || trophies[0] || null;
}

function refresh() {
  renderHeader(state, trophies.length);
  const f = currentFilters();
  const filtered = filterTrophies(trophies, f);
  const listBox = $("trophy-list");
  if (f.kind === "online" && filtered.length === 0 && f.grade === "all" && !f.search.trim()) {
    renderOnlineEmpty(listBox);
    $("list-status").textContent = "Online filter: 0 trophies — the launch list has no online trophies.";
  } else {
    renderList(listBox, filtered, state, { onToggle, onSelect });
    $("list-status").textContent = `Showing ${filtered.length} of ${trophies.length} trophies · ${state.earned.length} earned`;
  }
  renderDetail($("detail-pane"), selectedTrophy(), state, { onToggle });
  renderRoadmap($("roadmap-list"), trophies, state);
  renderMissables($("missables-list"), trophies, state);
}

function onToggle(id) {
  toggleEarned(state, id);
  if (state.selected === null) setSelected(state, id);
  refresh();
}

function onSelect(id) {
  setSelected(state, id);
  refresh();
}

function switchTab(name) {
  activeTab = name;
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  for (const view of ["checklist", "roadmap", "missables", "about"]) {
    $(`view-${view}`).hidden = view !== name;
  }
}

async function boot() {
  const res = await fetch("data/trophies.json");
  data = await res.json();
  trophies = data.trophies;
  if (!state.selected && trophies.length) state.selected = trophies[0].id;

  $("spoiler-toggle").checked = state.spoiler;
  $("spoiler-toggle").addEventListener("change", (e) => { setSpoiler(state, e.target.checked); refresh(); });
  $("search").addEventListener("input", refresh);
  $("kind-filter").addEventListener("change", refresh);
  $("grade-filter").addEventListener("change", refresh);
  $("export-btn").addEventListener("click", () => exportProgress(state));
  $("import-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const earned = parseImport(await file.text(), new Set(trophies.map((t) => t.id)));
      state.earned = earned;
      saveState(state);
      $("list-status").textContent = `Imported progress: ${earned.length} trophies earned.`;
      refresh();
    } catch (err) {
      $("list-status").textContent = `Import failed: ${err.message}`;
    }
    e.target.value = "";
  });
  document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));

  renderAbout($("about-content"), data);
  refresh();
}

boot().catch((err) => {
  document.getElementById("list-status").textContent = `Could not load trophy data: ${err.message}`;
});
