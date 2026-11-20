// Leonida Legend — GTA VI trophy guide & tracker.
// All data comes from the local data/trophies.json (imported as a JSON module);
// the page fetches nothing over the network. Progress lives in localStorage,
// with JSON export/import. URL hash state (#view=roadmap&grade=silver&expand=28)
// restores a view, so any state of the app can be linked or screenshotted.
import data from './data/trophies.json' with { type: 'json' };

const EARNED_KEY = 'leonida-legend-earned-v1';
const SPOILER_KEY = 'leonida-legend-spoilers-v1';
const RING_CIRC = 2 * Math.PI * 52;
const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  story: 'Story', collectible: 'Collectible', activity: 'Activity',
  combat: 'Combat', exploration: 'Exploration', misc: 'Misc',
};

const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));
const missableTrophy = trophies.find((t) => t.missable);

// ----- state -----
let earned = loadEarned();
let spoilerOn = loadSpoiler();
let expanded = new Set();
let state = { view: 'checklist', kind: 'all', grade: 'all', earnedFilter: 'all', search: '' };

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    if (!Array.isArray(raw)) return new Set();
    const ids = new Set();
    for (const v of raw) {
      if (typeof v === 'number' && byId.has(v)) ids.add(v);
      else if (typeof v === 'string' && byName.has(v)) ids.add(byName.get(v).id);
    }
    return ids;
  } catch {
    return new Set();
  }
}

function loadSpoiler() {
  return localStorage.getItem(SPOILER_KEY) === 'on';
}

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function saveSpoiler() {
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
}

// ----- helpers -----
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isHidden(t) {
  return spoilerOn && t.spoiler && !earned.has(t.id);
}

function displayName(t) {
  return isHidden(t) ? 'Hidden story trophy' : t.name;
}

function displayDesc(t) {
  return isHidden(t)
    ? 'A story trophy — its name and description stay hidden until you earn it (or turn spoilers back on).'
    : t.description;
}

function setNote(text) {
  document.getElementById('saveNote').textContent = text;
}

// ----- hash state: views can be linked, e.g. #view=roadmap&grade=silver&expand=28 -----
function readHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const view = params.get('view');
  if (view === 'roadmap' || view === 'checklist') state.view = view;
  const kind = params.get('kind');
  if (kind && ['all', 'story', 'missable', 'collectible', 'activity', 'combat', 'exploration', 'misc'].includes(kind)) state.kind = kind;
  const grade = params.get('grade');
  if (grade && ['all', ...GRADES].includes(grade)) state.grade = grade;
  const ef = params.get('earned');
  if (ef === 'earned' || ef === 'unearned' || ef === 'all') state.earnedFilter = ef;
  const search = params.get('search');
  if (search) state.search = search;
  const spoiler = params.get('spoiler');
  if (spoiler === 'on') spoilerOn = true;
  if (spoiler === 'off') spoilerOn = false;
  const expand = params.get('expand');
  if (expand) {
    for (const part of expand.split(',')) {
      const id = Number(part);
      if (byId.has(id)) expanded.add(id);
    }
  }
}

function syncHash() {
  const params = new URLSearchParams();
  if (state.view !== 'checklist') params.set('view', state.view);
  if (state.kind !== 'all') params.set('kind', state.kind);
  if (state.grade !== 'all') params.set('grade', state.grade);
  if (state.earnedFilter !== 'all') params.set('earned', state.earnedFilter);
  if (state.search) params.set('search', state.search);
  if (spoilerOn) params.set('spoiler', 'on');
  if (expanded.size) params.set('expand', [...expanded].sort((a, b) => a - b).join(','));
  const hash = params.toString();
  history.replaceState(null, '', hash ? `#${hash}` : location.pathname);
}

// ----- filtering -----
function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable') { if (!t.missable) return false; }
    else if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedFilter === 'earned' && !earned.has(t.id)) return false;
    if (state.earnedFilter === 'unearned' && earned.has(t.id)) return false;
    if (q) {
      // Search only what is visible: a hidden trophy must not leak through search.
      const hay = `${displayName(t)} ${displayDesc(t)} ${t.kind} ${t.grade}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// ----- rendering -----
function gradeBadge(t) {
  return `<span class="badge ${t.grade}">${GRADE_LABEL[t.grade]}</span>`;
}

function detailHtml(t) {
  if (isHidden(t)) {
    return `<div class="detail"><p class="spoiler-note">The guide for this story trophy is hidden while spoilers are off. Earn the trophy, or turn spoilers back on, to read it.</p></div>`;
  }
  const warn = t.missable
    ? `<p class="warn"><strong>Missable — read this first.</strong> ${esc(t.missable_note)}</p>`
    : '';
  const steps = t.steps.length
    ? `<div><div class="steps-title">How to do it</div><ol class="steps">${t.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`
    : `<p class="no-steps">No step-by-step route is documented yet — the guide above is the honest state of what is known. Check the sources for the latest.</p>`;
  const sources = t.sources.length
    ? `<div><div class="sources-title">Sources</div><ul class="sources">${t.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}</a></li>`).join('')}</ul></div>`
    : '';
  return `<div class="detail"><p>${esc(t.guide)}</p>${warn}${steps}${sources}</div>`;
}

function cardHtml(t) {
  const hidden = isHidden(t);
  const isEarned = earned.has(t.id);
  const open = expanded.has(t.id);
  const classes = ['card'];
  if (isEarned) classes.push('earned');
  if (hidden) classes.push('hidden-spoiler');
  return `<article class="${classes.join(' ')}" data-id="${t.id}">
    <div class="card-top">
      ${gradeBadge(t)}
      <span class="kind-tag">${KIND_LABEL[t.kind] ?? t.kind}</span>
      ${t.missable ? '<span class="missable-tag">⚠ Missable</span>' : ''}
      <label class="earned-check"><input type="checkbox" data-earned="${t.id}" ${isEarned ? 'checked' : ''}> Earned</label>
    </div>
    <h3 class="trophy-name${hidden ? ' hidden-name' : ''}">${esc(displayName(t))}</h3>
    <p class="trophy-desc">${esc(displayDesc(t))}</p>
    <button type="button" class="guide-toggle" data-toggle="${t.id}" aria-expanded="${open}">${open ? 'Hide guide ▲' : 'Read the guide ▼'}</button>
    ${open ? detailHtml(t) : ''}
  </article>`;
}

function renderCards() {
  const grid = document.getElementById('cardGrid');
  const list = visibleTrophies();
  grid.innerHTML = list.map(cardHtml).join('');
  document.getElementById('emptyNote').hidden = list.length > 0;
  document.getElementById('showingCount').textContent =
    state.view === 'checklist' ? `Showing ${list.length} of ${trophies.length}` : '';
  const banner = document.getElementById('missableBanner');
  if (state.kind === 'missable' && missableTrophy) {
    banner.hidden = false;
    banner.innerHTML = `<strong>Only one trophy on the whole list is missable.</strong> “${esc(missableTrophy.name)}” — ${esc(missableTrophy.description)} ${esc(missableTrophy.missable_note)}`;
  } else {
    banner.hidden = true;
  }
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmapStages');
  wrap.innerHTML = data.roadmap.map((stage) => {
    const stageTrophies = stage.trophy_ids.map((id) => byId.get(id)).filter(Boolean);
    const got = stageTrophies.filter((t) => earned.has(t.id)).length;
    const pct = stageTrophies.length ? Math.round((got / stageTrophies.length) * 100) : 0;
    const rows = stageTrophies.map((t) => {
      const isEarned = earned.has(t.id);
      return `<li class="stage-trophy${isEarned ? ' earned' : ''}">
        <input type="checkbox" data-earned="${t.id}" ${isEarned ? 'checked' : ''} aria-label="Mark ${esc(displayName(t))} earned">
        <span class="grade-dot ${t.grade}" aria-hidden="true"></span>
        <button type="button" data-jump="${t.id}">${esc(displayName(t))}</button>
        ${t.missable ? '<span class="t-miss">⚠ Missable</span>' : ''}
        <span class="t-kind">${KIND_LABEL[t.kind] ?? t.kind}</span>
      </li>`;
    }).join('');
    return `<section class="stage">
      <div class="stage-head"><span class="stage-num">${stage.stage}</span><h2>${esc(stage.title)}</h2><span class="stage-count">${got} / ${stageTrophies.length} earned</span></div>
      <div class="stage-bar"><div class="stage-bar-fill" style="width:${pct}%"></div></div>
      <p class="stage-summary">${esc(stage.summary)}</p>
      <ul class="stage-trophies">${rows}</ul>
    </section>`;
  }).join('');
}

function renderProgress() {
  const total = trophies.length;
  const got = earned.size;
  const pct = Math.round((got / total) * 100);
  document.getElementById('ringPct').textContent = `${pct}%`;
  document.getElementById('ringCount').textContent = `${got} / ${total}`;
  document.getElementById('ringFill').style.strokeDashoffset = String(RING_CIRC * (1 - got / total));
  document.getElementById('gradeCounts').innerHTML = GRADES.map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const gotGrade = inGrade.filter((t) => earned.has(t.id)).length;
    return `<span class="grade-stat"><span class="grade-dot ${g}" aria-hidden="true"></span>${GRADE_LABEL[g]} ${gotGrade}/${inGrade.length}</span>`;
  }).join('');
  const toward = trophies.filter((t) => t.grade !== 'platinum' && earned.has(t.id)).length;
  const nonPlat = trophies.filter((t) => t.grade !== 'platinum').length;
  document.getElementById('platProgress').textContent =
    earned.has(byName.get('Vice Got a Price!')?.id ?? -1)
      ? 'Platinum earned — Leonida Legend!'
      : `${toward} of ${nonPlat} trophies toward the Platinum`;
}

function renderView() {
  const checklist = state.view === 'checklist';
  document.getElementById('view-checklist').hidden = !checklist;
  document.getElementById('view-roadmap').hidden = checklist;
  document.getElementById('filterBar').style.display = checklist ? '' : 'none';
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
}

function renderAll() {
  renderProgress();
  renderCards();
  renderRoadmap();
  renderView();
  syncHash();
}

// ----- events (delegated, so re-renders keep working) -----
document.addEventListener('change', (e) => {
  const box = e.target.closest('input[data-earned]');
  if (box) {
    const id = Number(box.dataset.earned);
    if (box.checked) earned.add(id); else earned.delete(id);
    saveEarned();
    setNote('Progress saved.');
    renderAll();
  }
});

document.addEventListener('click', (e) => {
  const toggle = e.target.closest('button[data-toggle]');
  if (toggle) {
    const id = Number(toggle.dataset.toggle);
    if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
    renderAll();
    return;
  }
  const jump = e.target.closest('button[data-jump]');
  if (jump) {
    const id = Number(jump.dataset.jump);
    state.view = 'checklist';
    state.kind = 'all';
    state.grade = 'all';
    state.earnedFilter = 'all';
    state.search = '';
    document.getElementById('searchBox').value = '';
    document.getElementById('gradeFilter').value = 'all';
    document.getElementById('earnedFilter').value = 'all';
    document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === 'all'));
    expanded.add(id);
    renderAll();
    document.querySelector(`.card[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const chip = e.target.closest('#kindChips .chip');
  if (chip) {
    state.kind = chip.dataset.kind;
    document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderAll();
  }
  const tab = e.target.closest('.tab');
  if (tab) {
    state.view = tab.dataset.view;
    renderAll();
  }
});

document.getElementById('searchBox').addEventListener('input', (e) => {
  state.search = e.target.value;
  renderCards();
  syncHash();
});

document.getElementById('gradeFilter').addEventListener('change', (e) => {
  state.grade = e.target.value;
  renderAll();
});

document.getElementById('earnedFilter').addEventListener('change', (e) => {
  state.earnedFilter = e.target.value;
  renderAll();
});

document.getElementById('spoilerToggle').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  saveSpoiler();
  renderAll();
});

// ----- export / import / reset -----
document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    app: 'leonida-legend-gta6-trophy-guide',
    version: 1,
    exported_at: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  setNote(`Exported ${earned.size} earned trophies.`);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const list = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(list)) throw new Error('no earned list');
    const next = new Set();
    for (const v of list) {
      if (typeof v === 'number' && byId.has(v)) next.add(v);
      else if (typeof v === 'string' && byName.has(v)) next.add(byName.get(v).id);
    }
    earned = next;
    saveEarned();
    setNote(`Imported ${earned.size} earned trophies.`);
    renderAll();
  } catch {
    setNote('That file is not a valid progress export — nothing changed.');
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!earned.size) return;
  if (confirm('Clear all earned trophies? This cannot be undone (export first if you want a backup).')) {
    earned = new Set();
    saveEarned();
    setNote('Progress cleared.');
    renderAll();
  }
});

// ----- init -----
readHash();
document.getElementById('spoilerToggle').checked = spoilerOn;
document.getElementById('searchBox').value = state.search;
document.getElementById('gradeFilter').value = state.grade;
document.getElementById('earnedFilter').value = state.earnedFilter;
document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === state.kind));
renderAll();
