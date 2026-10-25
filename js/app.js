// EPI-ROB · interfaz: guía, proyecto, evaluación guiada, concordancia y consenso, figuras y exportación.
import { INSTRUMENTS, instOf, LV, ANS, defMeta, visibleItems } from './instruments.js?v=2026.10.25-6';
import { GUIDES } from './guides.js?v=2026.10.25-6';
import { newProject, newStudy, hasData, finalKey, evalStudy, finalStudy, load, save, parseProject, agreement, kappaLabel, robvisCSV, fromRobvisRows } from './store.js?v=2026.10.25-6';
import { EXAMPLES } from './examples.js?v=2026.10.25-6';
import { trafficLight, summaryBar } from './rplots.js?v=2026.10.25-6';
import { LVEN, domEN, colEN, UNIT, EX_TITLE } from './en.js?v=2026.10.25-6';
import { figWrap, bindFigs, figSettings } from './figs.js?v=2026.10.25-6';
import { readFile, download } from './io.js?v=2026.10.25-6';
import { HELP_HTML, GUIDE_HTML } from './help.js?v=2026.10.25-6';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const opt = (v, l, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(l ?? v)}</option>`;
const plu = u => (u === 'revisión' ? 'revisiones' : u + 's'), cap = t => t[0].toUpperCase() + t.slice(1);
const pct = x => (isFinite(x) ? (100 * x).toFixed(0) + ' %' : '–'), f2 = x => (isFinite(x) ? x.toFixed(2) : '–');
let P = load() || newProject('rob2'); P.names ||= { A: 'Revisor 1', B: 'Revisor 2', C: 'Consenso' };
const ui = { sid: null, who: 'A', dom: 'D1', view: 'final', weighted: false, app: false };
const inst = () => instOf(P.inst), studyOf = id => P.studies.find(s => s.id === id), cur = () => studyOf(ui.sid) || P.studies[0] || null;
let saveT = 0; const commit = () => { clearTimeout(saveT); saveT = setTimeout(() => save(P), 250); };
const badge = j => (j && LV[j] ? `<span class="lvl" style="--c:${LV[j].c}"><i>${esc(LV[j].s)}</i>${esc(LV[j].t)}</span>` : '<span class="lvl pend">Pendiente</span>');
const badgeEN = j => (j && LV[j] ? `<span class="lvl" style="--c:${LV[j].c}"><i>${esc(LV[j].s)}</i>${esc(LVEN[j] || LV[j].t)}</span>` : '<span class="lvl pend">Pending</span>');
const dot = j => `<i class="dot${j ? '' : ' empty'}" style="--c:${j && LV[j] ? LV[j].c : 'transparent'}" title="${j && LV[j] ? esc(LV[j].t) : 'Pendiente'}"></i>`;
const asm = (s = cur(), who = ui.who) => (s.asm[who] ||= {});

// ---------------------------------------------------------------- navegación
function showTab(t) {
  $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === t)); $$('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + t));
  ({ guia: renderGuide, proyecto: renderProject, evaluar: renderEval, consenso: renderConsensus, resultados: renderResults, reporte: renderReport })[t]?.(); window.scrollTo({ top: 0 });
}
$$('.tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) showTab(g.dataset.go); });
$('#help').innerHTML = HELP_HTML;
const figNote = () => { const st = figSettings(), svg = document.querySelector('#res-out svg.plot'), w = svg ? +svg.getAttribute('viewBox').split(/\s+/)[2] : 0, fs = svg ? +svg.dataset.fs : st.fs;
  $('#fig-note').textContent = w ? (st.auto ? `Letra final ${st.pt} pt; el semáforo medirá ≈ ${Math.round(st.pt * 0.3528 * w / fs)} mm de ancho.` : `Con ${st.mm} mm de ancho, la letra del semáforo mide ≈ ${(fs * st.mm / w / 0.3528).toFixed(1)} pt${fs * st.mm / w / 0.3528 > 12 ? ' (grande: reduzca el tamaño de letra o use un ancho mayor)' : ''}.`) : ''; };
['#fig-style', '#fig-fs', '#fig-heads'].forEach(id => $(id).addEventListener('change', () => { if (P?.studies?.length) renderResults(); figNote(); }));
['#fig-pt', '#fig-mm', '#fig-width'].forEach(id => $(id).addEventListener('change', () => { $('#fig-mm').disabled = $('#fig-width').value !== 'custom'; $('#fig-pt').disabled = $('#fig-width').value !== 'auto'; figNote(); }));
$('#fig-mm').disabled = true; $('#fig-pt').disabled = $('#fig-width').value !== 'auto';

// ---------------------------------------------------------------- 1. guía
const GK = { 'jbi-prev': 'jbi', 'nos-cohort': 'nos' };
// tabla «¿cuándo corresponde cada juicio?» de un dominio o ítem: filas {nivel, cuándo, ejemplo}
function guideRows(I, id) {
  const g = GUIDES[GK[I.id] || I.id]; const e = Array.isArray(g) ? g[+id - 1] : g?.[id]; if (!e) return '';
  return `<table class="data gtab"><thead><tr><th>Juicio</th><th>Cuándo corresponde</th><th>Ejemplo</th></tr></thead><tbody>${Object.entries(e).map(([lv, x]) => `<tr><td>${badge(lv in LV ? lv : ({ a: 'y', b: 'n', c: 'unclear', d: 'unclear' })[lv])}${lv.length === 1 && !(lv in LV) ? ` <b>${esc(lv)})</b>` : ''}</td><td>${esc(x.w)}</td><td><i>${esc(x.e)}</i></td></tr>`).join('')}</tbody></table>`;
}
function guideAll(I) {
  if (I.kind === 'amstar' || I.kind === 'checklist') return I.items.map(it => `<h4>Ítem ${it.n}: ${esc(it.q)}</h4>${guideRows(I, it.n)}`).join('');
  if (I.kind === 'nos') return I.items.map(it => `<h4>${esc(it.id)} · ${esc(it.q)}</h4>${guideRows(I, it.id)}`).join('');
  return I.doms(defMeta(I)).map(d => `<h4>${esc(d.id)} · ${esc(d.name)}</h4>${guideRows(I, d.id)}`).join('');
}
function renderGuide() {
  const saved = P.studies.length;
  $('#guide-out').innerHTML = GUIDE_HTML + `<div class="card"><h2>Elija un instrumento</h2><div class="examples">${INSTRUMENTS.map(i => `<div class="inst"><em>${esc(i.unit)}</em><b>${esc(i.name)}</b><small>${esc(i.design)}</small><p class="sub">${i.guide}</p><div class="row gap wrap"><button class="primary" data-start="${i.id}">Empezar proyecto</button></div>
    <details><summary>Ejemplos con estudios ficticios (${EXAMPLES[i.id].length})</summary>${EXAMPLES[i.id].map((x, k) => `<button class="ghost exbtn" data-example="${i.id}|${k}"><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></button>`).join('')}</details>
    <details><summary>Guía: ¿cuándo corresponde cada juicio?</summary>${guideAll(i)}</details></div>`).join('')}</div>
    ${saved ? `<p class="mt sub">Proyecto actual: <b>${esc(inst().name)}</b>, ${saved} ${esc(saved > 1 ? plu(inst().unit) : inst().unit)} · <a href="#" data-go="proyecto">continuar →</a></p>` : ''}</div>`;
  $$('[data-start]').forEach(b => b.addEventListener('click', () => start(b.dataset.start, null))); $$('[data-example]').forEach(b => b.addEventListener('click', () => { const [id, k] = b.dataset.example.split('|'); start(id, +k); }));
}
function start(id, example) {
  if (P.studies.length && !confirm('Se reemplazará el proyecto actual. ¿Continuar? (Guarde antes el JSON si lo necesita.)')) return;
  P = newProject(id); if (example != null) { const x = EXAMPLES[id][example]; P.studies = x.make().studies; P.title = `Teaching example · ${EX_TITLE[`${id}|${x.id}`] || EX_TITLE[x.id] || x.title}`; } ui.sid = P.studies[0]?.id || null; ui.who = 'A'; ui.dom = inst().kind ? 'G' : 'D1'; save(P); showTab(example != null ? 'evaluar' : 'proyecto');
}

// ---------------------------------------------------------------- 2. proyecto
function renderProject() {
  const I = inst(), box = $('#proj-out');
  box.innerHTML = `<div class="card"><h2>Proyecto</h2><div class="howto"><div><b>Qué se hace</b>Se define el instrumento y la lista de ${esc(plu(I.unit))} por evaluar; opcionalmente, dos revisores independientes y un consenso.</div><div><b>Para qué</b>La evaluación por duplicado y su concordancia (kappa) son la práctica recomendada en revisiones sistemáticas.</div><div><b>Datos</b>Todo se guarda en este navegador. Descargue el proyecto (JSON) para conservarlo o compartirlo.</div></div>
    <div class="form"><label>Título del proyecto<input id="p-title" value="${esc(P.title)}" placeholder="p. ej., Dexametasona en neumonía grave"></label><label>Instrumento<select id="p-inst">${INSTRUMENTS.map(i => opt(i.id, `${i.name} · ${i.design}`, i.id === P.inst)).join('')}</select></label>
    <label class="inline wide"><input type="checkbox" id="p-two"${P.twoRev ? ' checked' : ''}> Dos revisores independientes + consenso</label>
    <label>Revisor 1<input id="p-nA" value="${esc(P.names.A)}"></label><label class="two">Revisor 2<input id="p-nB" value="${esc(P.names.B)}"></label></div></div>
  <div class="card"><h2>${esc(cap(plu(I.unit)))} a evaluar</h2>
    <div class="row gap wrap"><input id="s-name" placeholder="Autor año (p. ej., Pérez 2021)" style="min-width:240px"><button class="primary" id="s-add">Añadir</button><span class="grow"></span><label class="ghost btn">Importar juicios (CSV robvis)<input type="file" id="f-robvis" accept=".csv,.txt,.xlsx" hidden></label><label class="ghost btn">Abrir proyecto (JSON)<input type="file" id="f-json" accept=".json" hidden></label></div>
    <datalist id="o-list">${[...new Set(P.studies.map(s => s.outcome).filter(Boolean))].map(o => `<option value="${esc(o)}">`).join('')}</datalist><p class="sub">¿Un dominio se valora por desenlace (p. ej., cegamiento de la evaluación)? Añada el mismo estudio una vez por desenlace y escriba el desenlace; en Resultados podrá mostrar esos dominios en columnas separadas.</p>
    <details class="mt"><summary>Pegar una lista (una por línea)</summary><textarea id="s-paste" rows="5" placeholder="Pérez 2021&#10;Gómez 2019&#10;…"></textarea><button class="ghost" id="s-addmany">Añadir lista</button></details>
    <div class="tablewrap"><table class="data"><thead><tr><th>#</th><th>Nombre</th><th>Desenlace (opcional)</th><th>Peso (figura resumen)</th><th>Progreso</th><th></th></tr></thead><tbody>${P.studies.map((s, i) => { const e = evalStudy(P, s, 'A'), pr = progress(I, e); return `<tr data-id="${s.id}"><td>${i + 1}</td><td><input data-k="name" value="${esc(s.name)}"></td><td><input data-k="outcome" value="${esc(s.outcome || '')}" placeholder="p. ej., Mortalidad" list="o-list"></td><td><input data-k="weight" type="number" step="any" min="0" value="${s.weight}" style="width:90px"></td><td>${pr}</td><td><button class="ghost" data-open="${s.id}">Evaluar</button> <button class="ghost danger" data-del="${s.id}" aria-label="Eliminar ${esc(s.name)}">✕</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Aún no hay estudios.</td></tr>'}</tbody></table></div>
    <div class="stepnav"><button class="ghost" data-go="guia">← Guía</button><button class="primary" data-go="evaluar">Siguiente: evaluar →</button></div></div>`;
  $('#p-title').addEventListener('input', e => { P.title = e.target.value; commit(); });
  $('#p-inst').addEventListener('change', e => { if (P.studies.length && !confirm('Cambiar de instrumento borrará las respuestas de los estudios actuales (se conservan los nombres). ¿Continuar?')) { e.target.value = P.inst; return; } P.inst = e.target.value; P.studies = P.studies.map(s => newStudy(P.inst, s.name)); commit(); renderProject(); });
  $('#p-two').addEventListener('change', e => { P.twoRev = e.target.checked; if (!P.twoRev) ui.who = 'A'; commit(); });
  $('#p-nA').addEventListener('input', e => { P.names.A = e.target.value; commit(); }); $('#p-nB').addEventListener('input', e => { P.names.B = e.target.value; commit(); });
  const add = names => { names.map(n => n.trim()).filter(Boolean).forEach(n => P.studies.push(newStudy(P.inst, n))); ui.sid ||= P.studies[0]?.id; commit(); renderProject(); };
  $('#s-add').addEventListener('click', () => add([$('#s-name').value])); $('#s-name').addEventListener('keydown', e => e.key === 'Enter' && add([e.target.value])); $('#s-addmany').addEventListener('click', () => add($('#s-paste').value.split(/\r?\n/)));
  $$('tbody [data-k]', box).forEach(el => el.addEventListener('input', () => { const s = studyOf(el.closest('tr').dataset.id); s[el.dataset.k] = el.dataset.k === 'weight' ? Math.max(0, parseFloat(el.value) || 0) : el.value; commit(); }));
  $$('[data-open]', box).forEach(b => b.addEventListener('click', () => { ui.sid = b.dataset.open; showTab('evaluar'); })); $$('[data-del]', box).forEach(b => b.addEventListener('click', () => { if (confirm('¿Eliminar este estudio y sus respuestas?')) { P.studies = P.studies.filter(s => s.id !== b.dataset.del); commit(); renderProject(); } }));
  $('#f-robvis').addEventListener('change', async e => { try { const f = e.target.files[0]; if (!f) return; const rows = Object.values((await readFile(f)).sheets)[0], r = fromRobvisRows(P, rows); if (!r.studies.length) throw new Error('No se encontró la columna «Study» ni filas.'); P.studies.push(...r.studies); commit(); renderProject(); if (r.bad.length) alert('Valores no reconocidos (ignorados):\n' + r.bad.slice(0, 15).join('\n')); } catch (err) { alert(err.message); } });
  $('#f-json').addEventListener('change', async e => { try { const f = e.target.files[0]; if (f) { P = parseProject(await f.text()); ui.sid = P.studies[0]?.id; commit(); renderProject(); } } catch (err) { alert(err.message); } });
}
// avance de una valoración: respuestas visibles contestadas y juicios resueltos
function progress(I, e) { if (e.cells) { const d = e.items.filter(x => x.j).length; return `<span class="pill">${d}/${e.items.length} ítems</span> ${badge(e.overall.j)}`; } const d = e.doms.filter(x => x.j).length; return `<span class="pill">${d}/${e.doms.length} dominios</span> ${badge(e.overall.j)}`; }

// ---------------------------------------------------------------- 3. evaluar
const SHORT = { Y: 'Sí', PY: 'Prob. sí', PN: 'Prob. no', N: 'No', NI: 'Sin info.', NA: 'No aplica', U: 'Poco claro', SY: 'Sí, fuerte', WY: 'Sí, débil', WN: 'No, débil', SN: 'No, fuerte' };
const chipsX = (qid, list, v) => `<div class="opts" role="radiogroup">${list.map(([c, l, t]) => `<button type="button" class="chip${v === c ? ' on' : ''}" role="radio" aria-checked="${v === c}" data-q="${esc(qid)}" data-v="${esc(c)}" title="${esc(t || l)}">${esc(l)}</button>`).join('')}</div>`;
const chips = (qid, opts, v) => chipsX(qid, opts.map(c => [c, SHORT[c] || c, ANS[c]]), v);
function metaHtml(s) {
  const I = inst(); return I.meta.filter(m => !m.show || m.show(s.meta)).map(m => m.type === 'choice' ? `<label>${esc(m.label)}<select data-meta="${m.id}">${m.opts.map(([v, l]) => opt(v, l, s.meta[m.id] === v)).join('')}</select></label>` : m.type === 'check' ? `<label class="inline"><input type="checkbox" data-meta="${m.id}"${s.meta[m.id] ? ' checked' : ''}> ${esc(m.label)}</label>` : m.type === 'number' ? `<label>${esc(m.label)}<input type="number" data-meta="${m.id}" value="${esc(s.meta[m.id] ?? m.def ?? '')}"></label>` : `<label>${esc(m.label)}<input data-meta="${m.id}" value="${esc(s.meta[m.id] || '')}" placeholder="${esc(m.ph || '')}"></label>`).join('');
}
const lights = (I, ex) => (ex.cells ? ex.cells.map(c => dot(c?.j || c)) : ex.doms.map(d => dot(d.j))).join('') + dot(ex.overall.j);
function renderEval() {
  const I = inst(), box = $('#eval-out'); if (!P.studies.length) { box.innerHTML = `<div class="card"><p class="muted">Primero añada estudios en el paso 2 (o cargue un ejemplo en el paso 1).</p><button class="primary" data-go="proyecto">Ir a Proyecto</button></div>`; return; }
  const s = cur(); ui.sid = s.id; const e = evalStudy(P, s, ui.who), std = !e.cells;
  const tabs = std ? [...e.doms.map(d => `<button class="dpill${ui.dom === d.id ? ' active' : ''}" data-dom="${d.id}">${dot(d.j)}${esc(d.short)}</button>`), `<button class="dpill${ui.dom === 'G' ? ' active' : ''}" data-dom="G">${dot(e.overall.j)}Global</button>`].join('') : '';
  if (std && ui.dom !== 'G' && !e.doms.some(d => d.id === ui.dom)) ui.dom = e.doms[0].id;
  const stop = I.stop?.(s.meta);
  box.innerHTML = `<div class="evalgrid"><aside class="card slist"><h3>${esc(cap(plu(I.unit)))}</h3>${P.studies.map(x => `<button class="sitem${x.id === s.id ? ' active' : ''}" data-sid="${x.id}"><span>${esc(x.name || '(sin nombre)')}</span><span class="lights">${lights(I, evalStudy(P, x, ui.who))}</span></button>`).join('')}</aside>
    <section class="evmain"><div class="card"><div class="row between wrap gap"><h2>${esc(s.name || 'Estudio')}</h2>${P.twoRev ? `<div class="who" role="tablist">${['A', 'B', 'C'].map(w => `<button class="${ui.who === w ? 'active' : ''}" data-who="${w}">${esc(P.names[w])}${hasData(s.asm[w]) ? '' : ' ○'}</button>`).join('')}</div>` : ''}</div>
      ${s.vignette ? `<details class="vign"><summary>Caso de ejemplo: qué dice cada dominio</summary><p>${esc(s.vignette)}</p></details>` : ''}
      <div class="form meta"><label>Nombre<input data-name value="${esc(s.name)}"></label>${metaHtml(s)}</div>${stop ? `<div class="warn">${esc(`La sección preliminar (${stop}) indica ${I.stopWord || 'riesgo muy alto'}: según el instrumento no se requiere seguir evaluando este resultado. Puede completar los dominios igualmente.`)}</div>` : ''}${P.twoRev && ui.who === 'C' ? '<p class="sub">Está editando el <b>consenso</b>: es el juicio que se usa en las figuras. Use el paso 4 para copiar desde cada revisor.</p>' : ''}${tabs ? `<div class="domnav" role="tablist">${tabs}</div>` : ''}</div>
    <div id="panel">${I.kind === 'amstar' ? amHtml(s, e) : I.kind === 'checklist' ? checkHtml(s, e) : I.kind === 'nos' ? nosHtml(s, e) : ui.dom === 'G' ? globalHtml(s, e) : domHtml(s, e)}</div></section></div>`;
}
const guideBox = (I, id) => { const t = guideRows(I, id); return t ? `<details class="gbox"><summary>¿Cuándo corresponde cada juicio? Casos de ejemplo</summary>${t}</details>` : ''; };
function levelSelect(I, levels, cur, attr) { return `<select ${attr}>${opt('', I.hasAlgo ? '— usar la propuesta —' : '— seleccione —', !cur)}${levels.map(l => opt(l, LV[l].t, cur === l)).join('')}</select>`; }
function domHtml(s, e) {
  const I = inst(), d = I.doms(s.meta).find(x => x.id === ui.dom), r = e.doms.find(x => x.id === ui.dom), a = asm().ans || {}, i = e.doms.findIndex(x => x.id === ui.dom);
  const items = visibleItems(d, a, s.meta).map(it => `<div class="q"><div class="qh"><b>${esc(it.n || it.id)}</b><span>${esc(it.q)}</span>${it.h ? `<button class="qi" data-help="${esc(it.id)}" aria-label="Orientación para ${esc(it.n || it.id)}" title="Orientación">ⓘ</button>` : ''}</div>${chips(it.id, it.opts, a[it.id])}${it.h ? `<p class="qhelp" id="h-${esc(it.id)}" hidden>${esc(it.h)}</p>` : ''}</div>`).join('');
  const ds = (asm().jud || {})[d.id] || {}, ov = I.hasAlgo && !!r.sel && r.sel !== r.sug, lv = d.levels || I.levels;
  return `<div class="card"><h3>${esc(d.id)} · ${esc(d.name)}</h3>${d.crit ? `<p class="sub">${esc(d.crit)}</p>` : ''}${guideBox(I, d.id)}${items}
    <div class="algo ${r.sug ? '' : 'wait'}"><b>${I.hasAlgo ? 'Juicio propuesto por el algoritmo' : 'Juicio del evaluador'}</b> ${I.hasAlgo ? badge(r.sug) : ''}<p>${esc(r.why)}</p></div>
    <div class="form"><label>Su juicio${I.hasAlgo ? ' (vacío = usar la propuesta)' : ''}${levelSelect(I, lv, ds.sel, `data-sel="${d.id}"`)}</label>
    ${d.app ? `<label>Aplicabilidad (preocupación)<select data-app="${d.id}">${opt('', '— sin juzgar —', !ds.app)}${I.appLevels.map(l => opt(l, LV[l].t, ds.app === l)).join('')}</select></label>` : ''}
    ${['rob2', 'robins-i', 'robins-i2', 'robins-e'].includes(I.id) ? `<label>Dirección probable del sesgo (opcional)<select data-dir="${d.id}">${['', 'Favorece al experimental', 'Favorece al comparador', 'Hacia la nulidad', 'Alejándose de la nulidad', 'Impredecible'].map(v => opt(v, v || '—', ds.dir === v)).join('')}</select></label>` : ''}
    <label class="wide">Sustento del juicio (cite el texto del estudio)${ov ? ' <b class="warnc">· su juicio difiere de la propuesta: justifíquelo</b>' : ''}<textarea data-note="${d.id}" rows="3" placeholder="p. ej., «La asignación se realizó por un sistema web centralizado» (p. 3)">${esc(ds.note || '')}</textarea></label></div>
    <div class="stepnav"><button class="ghost" data-nav="${i > 0 ? e.doms[i - 1].id : ''}"${i > 0 ? '' : ' disabled'}>← Anterior</button><button class="primary" data-nav="${i < e.doms.length - 1 ? e.doms[i + 1].id : 'G'}">${i < e.doms.length - 1 ? 'Siguiente →' : 'Juicio global →'}</button></div></div>`;
}
function globalHtml(s, e) {
  const I = inst(), o = e.overall, ov = asm().ov || {};
  return `<div class="card"><h3>Juicio global</h3><div class="tablewrap"><table class="data"><thead><tr><th>Dominio</th><th>Propuesta</th><th>Final</th><th>Respuestas</th></tr></thead><tbody>${e.doms.map(d => `<tr><td>${esc(d.id)} · ${esc(d.name)}</td><td>${badge(d.sug)}</td><td>${badge(d.j)}${d.sel && d.sel !== d.sug ? ' <span class="flag">modificado</span>' : ''}</td><td>${d.answered}/${d.total}</td></tr>`).join('')}</tbody></table></div>
    <div class="algo ${o.sug ? '' : 'wait'}"><b>Juicio global propuesto</b> ${badge(o.sug)}<p>${esc(o.why)}</p></div>
    <div class="form"><label>Su juicio global (vacío = usar la propuesta)${levelSelect(I, I.overallLevels || I.levels, ov.sel, 'data-ovsel')}</label><label class="wide">Sustento<textarea data-ovnote rows="3">${esc(ov.note || '')}</textarea></label></div>
    <div class="stepnav"><button class="ghost" data-nav="${e.doms.at(-1).id}">← Dominios</button><button class="primary" data-next="1">Siguiente estudio →</button></div></div>`;
}
const overallBox = (e, I, selAttr, levels) => `<div class="algo ${e.overall.j ? '' : 'wait'}"><b>${esc(e.title || 'Juicio global')}</b> ${badge(e.overall.j)}<p>${esc(e.overall.why)}</p></div><div class="form">${levels ? `<label>Su juicio (vacío = usar la propuesta)${levelSelect(I, levels, e.overall.sel, selAttr)}</label>` : ''}<label class="wide">Comentarios globales<textarea data-ovnote rows="3">${esc(e.overall.note || '')}</textarea></label></div><div class="stepnav"><span></span><button class="primary" data-next="1">Siguiente ${esc(I.unit)} →</button></div>`;
const noteBox = (key, a, ph = 'Comentario / cita') => `<label class="inline note"><input data-amnote="${esc(key)}" value="${esc((a.jud || {})[key]?.note || '')}" placeholder="${ph}"></label>`;
function amHtml(s, e) {
  const I = inst(), a = asm(), ch = a.chk || {}, an = a.ans || {};
  const group = (key, sets, label) => `<fieldset class="crit"><legend>${esc(label)}</legend>${sets.map(st => `<div class="critset"><b>${st.lvl === 'py' ? 'Para «Sí parcial»' : 'Para «Sí»' + (sets.length > 1 ? ' (además de lo anterior)' : '')}</b>${st.c.map(([id, t]) => `<label class="inline"><input type="checkbox" data-chk="${key}" value="${id}"${(ch[key] || []).includes(id) ? ' checked' : ''}> ${esc(t)}</label>`).join('')}</div>`).join('')}</fieldset>`;
  const items = I.items.map((it, i) => { const r = e.items[i], na = r.j === 'na'; return `<div class="q am${it.crit ? ' critical' : ''}"><div class="qh"><b>${it.n}${it.crit ? '*' : ''}</b><span>${esc(it.q)}</span>${badge(r.j)}</div>${guideBox(I, it.n)}${na ? `<p class="sub">${esc(r.why)}</p>` : it.yn ? chips(`i${it.n}`, ['Y', 'N'], (an[`i${it.n}`] || '').toUpperCase()) + (it.h ? `<p class="qhelp">${esc(it.h)}</p>` : '') : it.split ? [s.meta.st !== 'nrsi' && it.setsR ? group(`${it.n}r`, it.setsR, s.meta.st === 'both' ? 'Estudios aleatorizados' : 'Evaluación del riesgo de sesgo') : '', s.meta.st !== 'rct' ? group(`${it.n}n`, it.setsN, s.meta.st === 'both' ? 'Estudios no aleatorizados' : 'Evaluación del riesgo de sesgo') : ''].join('') + `<p class="sub">${esc(r.why)}</p>` : group(it.n, it.sets, 'Criterios cumplidos') + `<p class="sub">${esc(r.why)}</p>`}${noteBox(`i${it.n}`, a)}</div>`; }).join('');
  return `<div class="card"><h3>AMSTAR 2 · 16 ítems</h3><p class="sub">* Ítem crítico. Los ítems con criterios se califican a partir de las casillas; «Sí parcial» no cuenta como debilidad.</p>${items}${overallBox({ ...e, title: 'Confianza global' }, I)}</div>`;
}
function checkHtml(s, e) {
  const I = inst(), a = asm(), an = a.ans || {}, sm = e.summary;
  const items = I.items.map((it, i) => `<div class="q"><div class="qh"><b>${it.n}</b><span>${esc(it.q)}</span><button class="qi" data-help="c${it.n}" title="Orientación" aria-label="Orientación para el ítem ${it.n}">ⓘ</button></div>${chipsX(`i${it.n}`, [['Y', 'Sí'], ['N', 'No'], ['U', 'Poco claro'], ['NA', 'No aplica']], (an[`i${it.n}`] || '').toUpperCase())}<div class="qhelp" id="h-c${it.n}" hidden><p>${esc(it.h)}</p>${guideRows(I, it.n)}</div>${noteBox(`i${it.n}`, a)}</div>`).join('');
  return `<div class="card"><h3>Lista JBI · estudios de prevalencia (9 ítems)</h3><p class="sub">Responda cada ítem; use ⓘ para ver cuándo corresponde Sí, No o Poco claro con ejemplos. ${sm.applicable ? `Hasta ahora: ${sm.yes} de ${sm.applicable} aplicables en «Sí».` : ''}</p>${items}${overallBox({ ...e, title: 'Decisión sugerida' }, I, 'data-ovsel', I.levels)}</div>`;
}
function nosHtml(s, e) {
  const I = inst(), a = asm(), an = a.ans || {}; let cat = '';
  const items = I.items.map((it, i) => { const r = e.items[i], head = it.cat !== cat ? `<h4 class="nostitle">${esc(I.cats[(cat = it.cat)])} <span class="pill">${e.stars[it.cat]}★ de ${{ S: 4, C: 2, O: 3 }[it.cat]}</span></h4>` : ''; return `${head}<div class="q"><div class="qh"><b>${esc(it.id)}</b><span>${esc(it.q)}</span><span class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(Math.max(0, (it.opts.some(o => o[2]) ? 1 : 0) - r.stars))}</span><button class="qi" data-help="n${it.id}" title="Orientación" aria-label="Orientación para ${esc(it.id)}">ⓘ</button></div>${chipsX(it.id, it.opts.map(([k, t, st]) => [k, `${k}) ${t}${st ? ' ★' : ''}`, t]), an[it.id])}<div class="qhelp" id="h-n${it.id}" hidden>${guideRows(I, it.id)}</div>${noteBox(it.id, a)}</div>`; }).join('');
  return `<div class="card"><h3>Newcastle-Ottawa · cohortes</h3><p class="sub">Cada opción con ★ suma una estrella. Total ${e.stars.total}★ de 9. La conversión a buena, regular o pobre usa los umbrales AHRQ.</p>${items}${overallBox({ ...e, title: 'Calidad (AHRQ)' }, I, 'data-ovsel', I.levels)}</div>`;
}
const evalBox = () => $('#eval-out');
evalBox().addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const s = cur(), a = asm();
  if (t.dataset.sid) { ui.sid = t.dataset.sid; renderEval(); } else if (t.dataset.who) { ui.who = t.dataset.who; renderEval(); } else if (t.dataset.dom) { ui.dom = t.dataset.dom; renderEval(); } else if (t.dataset.nav) { ui.dom = t.dataset.nav; renderEval(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.next) { const k = P.studies.findIndex(x => x.id === s.id); ui.sid = P.studies[(k + 1) % P.studies.length].id; ui.dom = inst().kind ? 'G' : inst().doms(P.studies.find(x => x.id === ui.sid).meta)[0].id; renderEval(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.help) { const h = $(`#h-${CSS.escape(t.dataset.help)}`); h.hidden = !h.hidden; }
  else if (t.dataset.q) { a.ans ||= {}; const k = t.dataset.q, v = /^i\d+$/.test(k) ? t.dataset.v.toLowerCase() : t.dataset.v; if (a.ans[k] === v) delete a.ans[k]; else a.ans[k] = v; commit(); const y = window.scrollY; renderEval(); window.scrollTo({ top: y }); }
});
evalBox().addEventListener('input', e => {
  const t = e.target, s = cur(), a = asm();
  if (t.dataset.name !== undefined) s.name = t.value; else if (t.dataset.note) { (a.jud ||= {})[t.dataset.note] ||= {}; a.jud[t.dataset.note].note = t.value; } else if (t.dataset.ovnote !== undefined) (a.ov ||= {}).note = t.value;
  else if (t.dataset.amnote) { ((a.jud ||= {})[t.dataset.amnote] ||= {}).note = t.value; } else if (t.dataset.meta && t.type !== 'checkbox' && t.tagName !== 'SELECT') s.meta[t.dataset.meta] = t.type === 'number' ? t.value : t.value; else return; commit();
});
evalBox().addEventListener('change', e => {
  const t = e.target, s = cur(), a = asm(), jd = k => ((a.jud ||= {})[k] ||= {});
  if (t.dataset.sel !== undefined) { jd(t.dataset.sel).sel = t.value || null; } else if (t.dataset.app !== undefined) jd(t.dataset.app).app = t.value || null; else if (t.dataset.dir !== undefined) jd(t.dataset.dir).dir = t.value;
  else if (t.dataset.ovsel !== undefined) (a.ov ||= {}).sel = t.value || null; else if (t.dataset.meta) { s.meta[t.dataset.meta] = t.type === 'checkbox' ? t.checked : t.value; } else if (t.dataset.chk) { const c = (a.chk ||= {}); c[t.dataset.chk] = $$(`[data-chk="${t.dataset.chk}"]:checked`, evalBox()).map(x => x.value); } else return;
  commit(); const y = window.scrollY; renderEval(); window.scrollTo({ top: y });
});

// ---------------------------------------------------------------- 4. concordancia y consenso
// claves de respuesta que pertenecen a una columna (ítem o dominio) para copiarla al consenso
const keysOf = (I, d, s) => (I.kind === 'amstar' ? { ans: [`i${d}`], chk: [d, `${d}r`, `${d}n`], jud: [`i${d}`] } : I.kind === 'checklist' ? { ans: [`i${d}`], chk: [], jud: [`i${d}`] } : I.kind === 'nos' ? { ans: [d], chk: [], jud: [d] } : { ans: I.doms(s.meta).find(x => x.id === d).items.map(x => x.id), chk: [], jud: [d] });
function copyDomain(s, d, from) {
  const I = inst(), src = s.asm[from] || {}, dst = (s.asm.C ||= {}), k = keysOf(I, d, s); dst.ans ||= {}; dst.jud ||= {}; dst.chk ||= {};
  k.ans.forEach(x => { if (src.ans?.[x]) dst.ans[x] = src.ans[x]; else delete dst.ans[x]; }); k.chk.forEach(x => { if (src.chk?.[x]) dst.chk[x] = [...src.chk[x]]; else delete dst.chk[x]; }); k.jud.forEach(x => { dst.jud[x] = { ...(src.jud?.[x] || {}) }; });
}
function renderConsensus() {
  const I = inst(), box = $('#cons-out');
  if (!P.twoRev) { box.innerHTML = `<div class="card"><h2>Concordancia y consenso</h2><p>Esta sección compara a dos revisores independientes. Actívela en el paso 2.</p><button class="primary" id="c-on">Activar dos revisores</button></div>`; $('#c-on').addEventListener('click', () => { P.twoRev = true; commit(); renderConsensus(); }); return; }
  const both = P.studies.filter(s => hasData(s.asm.A) && hasData(s.asm.B)), ag = agreement({ ...P, studies: both }), e0 = P.studies[0] ? evalStudy(P, P.studies[0], 'A') : null;
  const cols = e0?.cells ? e0.items.map((x, i) => ({ id: String(x.n), name: `Ítem ${x.n}`, get: e => e.items[i].j })) : I.doms(P.studies[0]?.meta || defMeta(I)).map((d, i) => ({ id: d.id, name: d.id, get: e => e.doms[i].j }));
  const diffs = []; both.forEach(s => { const a = evalStudy(P, s, 'A'), b = evalStudy(P, s, 'B'); cols.forEach(c => { const x = c.get(a), y = c.get(b); if (x !== y) diffs.push({ s, c, x, y }); }); });
  const bd = j => (j && LV[j] ? badge(j) : j ? `<span class="pill">${esc(j)}</span>` : badge(null));
  box.innerHTML = `<div class="card"><h2>Concordancia entre revisores</h2><div class="howto"><div><b>Qué se ve</b>Acuerdo observado y kappa de Cohen por dominio (y kappa ponderado lineal en escalas ordinales) sobre los juicios finales de ${esc(P.names.A)} y ${esc(P.names.B)}.</div><div><b>Para qué</b>Informar la fiabilidad de la evaluación y detectar dominios que requieren criterios comunes.</div><div><b>Cómo interpretar</b>Landis y Koch: &lt; 0,21 leve; 0,21–0,40 regular; 0,41–0,60 moderada; 0,61–0,80 sustancial; &gt; 0,80 casi perfecta. Con pocos estudios el kappa es muy inestable.</div></div>
    <p class="sub">${both.length} de ${P.studies.length} estudios tienen valoración de ambos revisores.</p>
    <div class="tablewrap"><table class="data"><thead><tr><th>Dominio</th><th>n</th><th>Acuerdo</th><th>Kappa</th><th>Interpretación</th><th>Kappa ponderado</th></tr></thead><tbody>${ag.map(r => `<tr><td>${esc(r.id)} ${esc(r.name || '')}</td><td>${r.n}</td><td>${pct(r.po)}</td><td>${f2(r.kappa)}</td><td>${kappaLabel(r.kappa)}</td><td>${r.wkappa == null ? '' : f2(r.wkappa)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Resolver discrepancias</h2><div class="row gap wrap"><button class="ghost" id="c-agree">Prellenar consenso con los acuerdos</button><span class="sub">Copia los dominios en que ambos coinciden; después resuelva el resto.</span></div>
    <div class="tablewrap"><table class="data"><thead><tr><th>Estudio</th><th>${e0?.cells ? 'Ítem' : 'Dominio'}</th><th>${esc(P.names.A)}</th><th>${esc(P.names.B)}</th><th>Consenso</th><th></th></tr></thead><tbody>${diffs.map(d => { const c = evalStudy(P, d.s, 'C'), cj = d.c.get(c); return `<tr data-sid="${d.s.id}" data-d="${esc(d.c.id)}"><td>${esc(d.s.name)}</td><td>${esc(d.c.name)}</td><td>${bd(d.x)}</td><td>${bd(d.y)}</td><td>${cj ? bd(cj) : '—'}</td><td><button class="ghost" data-take="A">Usar ${esc(P.names.A)}</button> <button class="ghost" data-take="B">Usar ${esc(P.names.B)}</button> <button class="ghost" data-edit="1">Editar</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Sin discrepancias.</td></tr>'}</tbody></table></div>
    <div class="stepnav"><button class="ghost" data-go="evaluar">← Evaluar</button><button class="primary" data-go="resultados">Siguiente: resultados →</button></div></div>`;
  $('#c-agree').addEventListener('click', () => { both.forEach(s => { const a = evalStudy(P, s, 'A'), b = evalStudy(P, s, 'B'); cols.forEach(c => { if (c.get(a) === c.get(b)) copyDomain(s, c.id, 'A'); }); }); commit(); renderConsensus(); });
  $$('[data-take]', box).forEach(b => b.addEventListener('click', () => { const tr = b.closest('tr'); copyDomain(studyOf(tr.dataset.sid), tr.dataset.d, b.dataset.take); commit(); renderConsensus(); }));
  $$('[data-edit]', box).forEach(b => b.addEventListener('click', () => { const tr = b.closest('tr'); ui.sid = tr.dataset.sid; ui.who = 'C'; ui.dom = I.kind ? 'G' : tr.dataset.d; showTab('evaluar'); }));
}

// ---------------------------------------------------------------- 5. resultados
function resultsData() {
  const key = ui.view, rows = P.studies.map(s => { const k = key === 'final' ? finalKey(P, s) : key; return { s, k, f: finalStudy(P, s, k), e: evalStudy(P, s, k) }; });
  return { I: inst(), rows };
}
const cj = c => (c && typeof c === 'object' ? c.j : c);
function renderResults() {
  const box = $('#res-out'), I = inst(); if (!P.studies.length) { box.innerHTML = '<div class="card"><p class="muted">No hay estudios. Añádalos en el paso 2.</p></div>'; return; }
  const { rows } = resultsData(), e0 = rows[0].e, custom = !!e0.cells, title = P.title || '';
  let cols, legend, legendOverall = null, sumCols, levelsAll;
  if (custom) { cols = e0.cols.map(c => ({ ...c, short: colEN(c.short ?? c.id), name: colEN(c.name) })); legend = e0.legend; legendOverall = e0.legendOverall; sumCols = [...cols.map(c => ({ id: c.id, name: c.name })), { id: 'Global', name: 'Overall' }]; levelsAll = legend; }
  else { const first = P.studies[0].meta, ds = I.doms(first); cols = ds.map(d => ({ id: d.id, short: d.short, name: domEN(I.id, d.id, d.name) })); legend = I.legend || I.levels; levelsAll = legend; sumCols = [...ds.map(d => ({ id: d.id, name: domEN(I.id, d.id, d.name) })), { id: 'Global', name: 'Overall' }]; }
  const counts = {}; rows.forEach(r => { const w = ui.weighted ? r.s.weight : 1; (custom ? r.f.items : r.f.doms).forEach((c, i) => { const j = cj(c); if (!j) return; const id = sumCols[i].id; (counts[id] ||= {})[j] = (counts[id][j] || 0) + w; }); if (r.f.overall) (counts.Global ||= {})[r.f.overall] = (counts.Global[r.f.overall] || 0) + w; });
  let trows = rows.map(r => ({ name: r.s.name, js: custom ? r.f.items : r.f.doms, overall: r.f.overall })), tcols = cols, tsum = sumCols, tcounts = counts, tOver = true;
  // dominios valorados por desenlace: una columna por desenlace (los demás dominios quedan como «All outcomes»)
  const po = new Set(P.perOut || []), outs = [...new Set(rows.map(r => (r.s.outcome || '').trim()).filter(Boolean))], pivot = !custom && po.size > 0 && outs.length > 0, oc = r => (r.s.outcome || '').trim();
  if (pivot) {
    tcols = []; cols.forEach((c, i) => { if (po.has(c.id)) outs.forEach(o => tcols.push({ ...c, id: `${c.id}@${o}`, name: `${c.name}: ${o}`, i, o })); else tcols.push({ ...c, name: `${c.name}: All outcomes`, i, o: null }); });
    tcounts = {}; tOver = false; tsum = tcols.map(c => ({ id: c.id, name: c.name }));
    trows = [...new Set(rows.map(r => r.s.name))].map(n => { const rs = rows.filter(r => r.s.name === n); return { name: n, overall: null, js: tcols.map(c => { const r = c.o == null ? rs[0] : rs.find(q => oc(q) === c.o), j = r ? cj(r.f.doms[c.i]) : null; if (j) { const w = ui.weighted ? r.s.weight : 1; (tcounts[c.id] ||= {})[j] = (tcounts[c.id][j] || 0) + w; } return r ? r.f.doms[c.i] : null; }) }; });
  }
  const fg = figSettings(), tl = trafficLight(trows, tcols, { title, legend, legendOverall, fs: fg.fs, st: fg.st, heads: fg.heads, overall: tOver });
  const sbItems = summaryBar(tsum.filter(c => c.id !== 'Global'), tcounts, levelsAll, { title: title ? `${title} · summary` : 'Summary', weighted: ui.weighted, fs: fg.fs, st: fg.st }), glob = custom ? legendOverall : levelsAll;
  const sbGlobal = custom ? summaryBar([{ id: 'Global', name: 'Overall judgement' }], counts, glob, { weighted: false, fs: fg.fs, st: fg.st }) : null;
  const nA = rows.length, g = rows.map(r => r.f.overall).filter(Boolean), gc = {}; g.forEach(j => (gc[j] = (gc[j] || 0) + 1));
  box.innerHTML = `<div class="card"><h2>Resultados y figuras</h2><div class="howto"><div><b>Qué se ve</b>El juicio final de cada ${esc(I.unit)} por ${custom ? 'ítem o categoría' : 'dominio'} (semáforo) y la proporción de cada nivel (barras).</div><div><b>Para qué</b>Cumplir los requisitos de informe (PRISMA 2020 ítem 18; Cochrane) y decidir si un análisis de sensibilidad excluye estudios de alto riesgo.</div><div><b>Cómo interpretar</b>El semáforo describe, no puntúa: no sume dominios ni promedie. Los estudios con alto riesgo en un dominio crítico son los candidatos a un análisis de sensibilidad.</div></div>
    <div class="row gap wrap"><label class="inline">Juicios de <select id="r-view">${opt('final', P.twoRev ? 'Final (consenso si existe)' : 'Final', ui.view === 'final')}${P.twoRev ? ['A', 'B', 'C'].map(w => opt(w, P.names[w], ui.view === w)).join('') : ''}</select></label>${custom && I.kind !== 'nos' ? '' : `<label class="inline"><input type="checkbox" id="r-w"${ui.weighted ? ' checked' : ''}> Ponderar barras por el peso del estudio</label>`}</div>
    ${custom ? '' : `<details class="mt"${(P.perOut || []).length ? ' open' : ''}><summary>Dominios valorados por desenlace (columnas separadas)</summary><p class="sub">Marque los dominios que se valoraron por separado para cada desenlace. Requiere que los estudios tengan escrito el «Desenlace» en el paso 2 (un estudio por desenlace con el mismo nombre). La figura tendrá una columna por desenlace en esos dominios.</p><div class="row gap wrap">${I.doms(P.studies[0].meta).map(d => `<label class="inline"><input type="checkbox" data-po="${esc(d.id)}"${(P.perOut || []).includes(d.id) ? ' checked' : ''}> ${esc(d.id)} ${esc(domEN(I.id, d.id, d.name))}</label>`).join('')}</div>${(P.perOut || []).length && !outs.length ? '<p class="warn">No hay desenlaces escritos: la figura no cambia hasta que añada «Desenlace» a los estudios.</p>' : ''}</details>`}
    <p class="sub">${nA} ${esc(nA > 1 ? plu(I.unit) : I.unit)} · ${Object.entries(gc).map(([j, n]) => `${LV[j].t}: ${n} (${pct(n / g.length)})`).join(' · ')}</p>
    <div class="plots single">${figWrap(tl, 'semaforo_riesgo_sesgo')}${figWrap(sbItems, 'resumen_riesgo_sesgo')}${sbGlobal ? figWrap(sbGlobal, 'resumen_global') : ''}</div>
    <h3>Table</h3><div class="tablewrap"><table class="data"><thead><tr><th>${esc(UNIT[I.unit] || cap(I.unit))}</th>${cols.map(c => `<th title="${esc(c.name || c.id)}">${esc(c.short ?? c.id)}</th>`).join('')}<th>Overall</th></tr></thead><tbody>${trows.map(r => `<tr><td>${esc(r.name)}</td>${[...r.js, r.overall].map(j => `<td>${j && typeof j === 'object' ? `${badgeEN(j.j)} <small>${esc(j.t || '')}</small>` : badgeEN(j)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="stepnav"><button class="ghost" data-go="consenso">← Concordancia</button><button class="primary" data-go="reporte">Siguiente: exportar →</button></div></div>`;
  $$('[data-po]', box).forEach(c => c.addEventListener('change', () => { P.perOut = $$('[data-po]', box).filter(x => x.checked).map(x => x.dataset.po); commit(); renderResults(); }));
  $('#r-view')?.addEventListener('change', e => { ui.view = e.target.value; renderResults(); }); $('#r-w')?.addEventListener('change', e => { ui.weighted = e.target.checked; renderResults(); }); bindFigs(box); figNote();
}

// ---------------------------------------------------------------- 6. exportar y reporte
const UNIT_EN = { resultado: 'result', estudio: 'study', modelo: 'model', 'revisión': 'review' };
function methodsText(lang) {
  const I = inst(), n = P.studies.length, two = P.twoRev, es = lang === 'es';
  const alg = I.kind === 'amstar' ? (es ? 'Cada ítem se calificó como sí, sí parcial o no con los criterios del instrumento; la confianza global se asignó según el número de fallos críticos y debilidades no críticas.' : 'Each item was rated yes, partial yes or no using the instrument criteria; overall confidence was assigned from the number of critical flaws and non-critical weaknesses.')
    : I.kind === 'checklist' ? (es ? 'Cada ítem se respondió como sí, no, poco claro o no aplica; la decisión de incluir, buscar más información o excluir se tomó según el porcentaje de ítems «sí» y los umbrales fijados por el equipo.' : 'Each item was answered yes, no, unclear or not applicable; the decision to include, seek further information or exclude followed the percentage of "yes" items and the thresholds set by the team.')
    : I.kind === 'nos' ? (es ? 'Se asignaron estrellas en selección, comparabilidad y desenlace y se convirtieron a calidad buena, regular o pobre con los umbrales de la AHRQ.' : 'Stars were awarded for selection, comparability and outcome and converted to good, fair or poor quality using AHRQ thresholds.')
    : I.hasAlgo ? (es ? 'Los juicios de cada dominio se propusieron mediante los algoritmos publicados a partir de las preguntas señalizadoras y fueron revisados por el evaluador; los juicios distintos de la propuesta se justificaron por escrito.' : 'Domain-level judgements were suggested by the published algorithms from the signalling questions and reviewed by the assessor; any judgement that differed from the suggestion was justified in writing.')
    : (es ? 'Los juicios de cada dominio los emitió el evaluador a partir de los criterios del instrumento, ya que no define un algoritmo.' : 'Domain-level judgements were made by the assessor using the instrument criteria, as it does not define an algorithm.');
  const rev = two ? (es ? `${P.names.A} y ${P.names.B} evaluaron cada ${I.unit} de forma independiente; las discrepancias se resolvieron por consenso. La concordancia se calculó con el kappa de Cohen.` : `${P.names.A} and ${P.names.B} independently assessed each ${UNIT_EN[I.unit]}; disagreements were resolved by consensus. Agreement was quantified with Cohen's kappa.`) : (es ? `Un revisor evaluó cada ${I.unit}.` : `One reviewer assessed each ${UNIT_EN[I.unit]}.`);
  const { rows } = resultsData(), g = rows.map(r => r.f.overall).filter(Boolean), c = {}; g.forEach(j => (c[j] = (c[j] || 0) + 1));
  const resS = Object.entries(c).map(([j, k]) => `${k} (${pct(k / g.length)}) ${LV[j].t.toLowerCase()}`).join(', ');
  return es
    ? `Evaluación del riesgo de sesgo.\nSe evaluó el riesgo de sesgo de ${n} ${n > 1 ? plu(I.unit) : I.unit} con ${I.name} (${I.full}; ${I.ref.split(/\.\s/)[0]}). ${rev} ${alg} Las figuras se elaboraron con EPI-ROB (EPI-LAB; Fernández-Guzmán D., https://github.com/Danielferguz/EPI-ROB).\n\nResultados.\nDe ${g.length} ${g.length > 1 ? plu(I.unit) : I.unit} con juicio global: ${resS || 'sin juicios globales aún'}.\n\nReferencia del instrumento: ${I.ref}`
    : `Risk of bias assessment.\nRisk of bias of ${n} ${UNIT_EN[I.unit]}${n > 1 ? 's' : ''} was assessed with ${I.name} (${I.full}). ${rev} ${alg} Figures were produced with EPI-ROB (EPI-LAB; Fernández-Guzmán D., https://github.com/Danielferguz/EPI-ROB).\n\nResults.\nOf ${g.length} ${UNIT_EN[I.unit]}${g.length > 1 ? 's' : ''} with an overall judgement: ${resS || 'none yet'}.\n\nInstrument reference: ${I.ref}`;
}
function answersTable() {
  const I = inst(), { rows } = resultsData(), e0 = rows[0].e, T = j => LVEN[j] || LV[j]?.t || '', tx = j => (j && typeof j === 'object' ? `${T(j.j)} ${j.t || ''}`.trim() : T(j)), cl = j => (j && typeof j === 'object' ? LV[j.j]?.c : LV[j]?.c);
  const custom = !!e0.cells, head = custom ? [UNIT[I.unit] || cap(I.unit), ...e0.cols.map(c => colEN(c.name)), 'Overall'] : [UNIT[I.unit] || cap(I.unit), ...I.doms(P.studies[0]?.meta || defMeta(I)).map(d => `${d.id} ${domEN(I.id, d.id, d.name)}`), 'Overall', 'Weight'];
  return { head, rows: rows.map(r => [r.s.name, ...(custom ? r.f.items : r.f.doms).map(tx), T(r.f.overall), ...(custom ? [] : [r.s.weight])]), colors: rows.map(r => [null, ...(custom ? r.f.items : r.f.doms).map(cl), LV[r.f.overall]?.c, ...(custom ? [] : [null])]) };
}
const xls = () => { const t = answersTable(), I = inst();
  const detail = I.kind || P.studies.length === 0 ? '' : `<br><table border="1"><tr><th>Study</th><th>Domain</th><th>Suggested</th><th>Final</th><th>Rationale</th></tr>${P.studies.flatMap(s => evalStudy(P, s).doms.map(x => `<tr><td>${esc(s.name)}</td><td>${esc(x.id)}</td><td>${esc(LVEN[x.sug] || '')}</td><td>${esc(LVEN[x.j] || '')}</td><td>${esc(x.note)}</td></tr>`)).join('')}</table>`;
  return `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map((r, i) => `<tr>${r.map((v, k) => `<td${t.colors[i][k] ? ` style="background:${t.colors[i][k]};font-weight:bold"` : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</table>${detail}</body></html>`; };
function renderReport() {
  const box = $('#rep-out'), I = inst(); if (!P.studies.length) { box.innerHTML = '<div class="card"><p class="muted">No hay estudios.</p></div>'; return; }
  box.innerHTML = `<div class="card"><h2>Texto de métodos y resultados</h2><div class="row gap"><button class="ghost" data-lang="es">Español</button><button class="ghost" data-lang="en">English</button><span class="grow"></span><button class="ghost" id="m-copy">Copiar</button></div><textarea id="m-text" rows="12"></textarea></div>
  <div class="card"><h2>Archivos</h2><div class="row gap wrap"><button class="ghost" id="x-json">Proyecto (JSON)</button>${I.robvis ? '<button class="ghost" id="x-robvis">CSV compatible con robvis</button>' : ''}<button class="ghost" id="x-xls">Colour table (Excel)</button><button class="ghost" id="x-print">Imprimir / PDF</button><button class="ghost danger" id="x-clear">Borrar proyecto</button></div>
  <p class="sub">El CSV robvis se puede usar con <code>robvis::rob_traffic_light()</code> y <code>rob_summary()</code> en R, o cargarse de nuevo aquí con «Importar juicios». En ROBINS-E, «Bajo (salvo confusión)» se exporta como «Low».</p></div>`;
  let lang = 'en'; const set = () => ($('#m-text').value = methodsText(lang)); set(); $$('[data-lang]', box).forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; set(); }));
  $('#m-copy').addEventListener('click', () => navigator.clipboard?.writeText($('#m-text').value));
  const nm = (P.title || 'epi-rob').replace(/[^\w\-]+/g, '_').slice(0, 40);
  $('#x-json').addEventListener('click', () => download(`${nm}.json`, JSON.stringify(P, null, 1), 'application/json')); $('#x-robvis')?.addEventListener('click', () => { try { download(`${nm}_robvis.csv`, robvisCSV(P), 'text/csv'); } catch (e) { alert(e.message); } });
  $('#x-xls').addEventListener('click', () => download(`${nm}.xls`, xls(), 'application/vnd.ms-excel')); $('#x-print').addEventListener('click', () => { showTab('resultados'); setTimeout(() => window.print(), 300); });
  $('#x-clear').addEventListener('click', () => { if (confirm('Se borrarán todos los estudios y respuestas guardados en este navegador. ¿Continuar?')) { P = newProject(P.inst); ui.sid = null; save(P); showTab('guia'); } });
}
window.addEventListener('beforeunload', () => save(P));
showTab('guia'); window.__rob = { get P() { return P; }, ui };
