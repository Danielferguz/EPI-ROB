// EPI-ROB · interfaz: guía, proyecto, evaluación guiada, concordancia y consenso, figuras y exportación.
import { INSTRUMENTS, instOf, LV, ANS, defMeta, visibleItems } from './instruments.js?v=2026.10.23-1';
import { newProject, newStudy, hasData, finalKey, evalStudy, finalStudy, load, save, parseProject, agreement, kappaLabel, robvisCSV, fromRobvisRows } from './store.js?v=2026.10.23-1';
import { EXAMPLES } from './examples.js?v=2026.10.23-1';
import { trafficLight, summaryBar } from './rplots.js?v=2026.10.23-1';
import { figWrap, bindFigs } from './figs.js?v=2026.10.23-1';
import { readFile, download } from './io.js?v=2026.10.23-1';
import { HELP_HTML, GUIDE_HTML } from './help.js?v=2026.10.23-1';

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
$('#fig-width').addEventListener('change', () => ($('#fig-mm').disabled = $('#fig-width').value !== 'custom')); $('#fig-mm').disabled = true;

// ---------------------------------------------------------------- 1. guía
function renderGuide() {
  const saved = P.studies.length;
  $('#guide-out').innerHTML = GUIDE_HTML + `<div class="card"><h2>Elija un instrumento</h2><div class="examples">${INSTRUMENTS.map(i => `<div class="inst"><em>${esc(i.unit)}</em><b>${esc(i.name)}</b><small>${esc(i.design)}</small><p class="sub">${i.guide}</p><div class="row gap wrap"><button class="primary" data-start="${i.id}">Empezar proyecto</button><button class="ghost" data-example="${i.id}">Cargar ejemplo ficticio</button></div></div>`).join('')}</div>
    ${saved ? `<p class="mt sub">Proyecto actual: <b>${esc(inst().name)}</b>, ${saved} ${esc(saved > 1 ? plu(inst().unit) : inst().unit)} · <a href="#" data-go="proyecto">continuar →</a></p>` : ''}</div>`;
  $$('[data-start]').forEach(b => b.addEventListener('click', () => start(b.dataset.start, false))); $$('[data-example]').forEach(b => b.addEventListener('click', () => start(b.dataset.example, true)));
}
function start(id, example) {
  if (P.studies.length && !confirm('Se reemplazará el proyecto actual. ¿Continuar? (Guarde antes el JSON si lo necesita.)')) return;
  P = newProject(id); if (example) { P.studies = EXAMPLES[id]().studies; P.title = `Ejemplo didáctico · ${instOf(id).name}`; } ui.sid = P.studies[0]?.id || null; ui.who = 'A'; ui.dom = 'D1'; save(P); showTab(example ? 'evaluar' : 'proyecto');
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
    <details class="mt"><summary>Pegar una lista (una por línea)</summary><textarea id="s-paste" rows="5" placeholder="Pérez 2021&#10;Gómez 2019&#10;…"></textarea><button class="ghost" id="s-addmany">Añadir lista</button></details>
    <div class="tablewrap"><table class="data"><thead><tr><th>#</th><th>Nombre</th><th>Peso (figura resumen)</th><th>Progreso</th><th></th></tr></thead><tbody>${P.studies.map((s, i) => { const e = evalStudy(P, s, 'A'), pr = progress(I, e); return `<tr data-id="${s.id}"><td>${i + 1}</td><td><input data-k="name" value="${esc(s.name)}"></td><td><input data-k="weight" type="number" step="any" min="0" value="${s.weight}" style="width:90px"></td><td>${pr}</td><td><button class="ghost" data-open="${s.id}">Evaluar</button> <button class="ghost danger" data-del="${s.id}" aria-label="Eliminar ${esc(s.name)}">✕</button></td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">Aún no hay estudios.</td></tr>'}</tbody></table></div>
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
function progress(I, e) { if (I.kind === 'amstar') { const d = e.items.filter(x => x.j).length; return `<span class="pill">${d}/16 ítems</span> ${badge(e.overall.j)}`; } const d = e.doms.filter(x => x.j).length; return `<span class="pill">${d}/${e.doms.length} dominios</span> ${badge(e.overall.j)}`; }

// ---------------------------------------------------------------- 3. evaluar
const SHORT = { Y: 'Sí', PY: 'Prob. sí', PN: 'Prob. no', N: 'No', NI: 'Sin info.', NA: 'No aplica' };
const chips = (qid, opts, v) => `<div class="opts" role="radiogroup">${opts.map(c => `<button type="button" class="chip${v === c ? ' on' : ''}" role="radio" aria-checked="${v === c}" data-q="${qid}" data-v="${c}" title="${esc(ANS[c])}">${esc(SHORT[c])}</button>`).join('')}</div>`;
function metaHtml(s) {
  const I = inst(); return I.meta.filter(m => !m.show || m.show(s.meta)).map(m => m.type === 'choice' ? `<label>${esc(m.label)}<select data-meta="${m.id}">${m.opts.map(([v, l]) => opt(v, l, s.meta[m.id] === v)).join('')}</select></label>` : m.type === 'check' ? `<label class="inline"><input type="checkbox" data-meta="${m.id}"${s.meta[m.id] ? ' checked' : ''}> ${esc(m.label)}</label>` : `<label>${esc(m.label)}<input data-meta="${m.id}" value="${esc(s.meta[m.id] || '')}" placeholder="${esc(m.ph || '')}"></label>`).join('');
}
function renderEval() {
  const I = inst(), box = $('#eval-out'); if (!P.studies.length) { box.innerHTML = `<div class="card"><p class="muted">Primero añada estudios en el paso 2 (o cargue un ejemplo en el paso 1).</p><button class="primary" data-go="proyecto">Ir a Proyecto</button></div>`; return; }
  const s = cur(); ui.sid = s.id; const e = evalStudy(P, s, ui.who), tabs = I.kind === 'amstar' ? '' : [...e.doms.map(d => `<button class="dpill${ui.dom === d.id ? ' active' : ''}" data-dom="${d.id}">${dot(d.j)}${esc(d.short)}</button>`), `<button class="dpill${ui.dom === 'G' ? ' active' : ''}" data-dom="G">${dot(e.overall.j)}Global</button>`].join('');
  if (I.kind !== 'amstar' && ui.dom !== 'G' && !e.doms.some(d => d.id === ui.dom)) ui.dom = e.doms[0].id;
  box.innerHTML = `<div class="evalgrid"><aside class="card slist"><h3>${esc(cap(plu(I.unit)))}</h3>${P.studies.map(x => { const ex = evalStudy(P, x, ui.who); return `<button class="sitem${x.id === s.id ? ' active' : ''}" data-sid="${x.id}"><span>${esc(x.name || '(sin nombre)')}</span><span class="lights">${(I.kind === 'amstar' ? [] : ex.doms).map(d => dot(d.j)).join('')}${dot(ex.overall.j)}</span></button>`; }).join('')}</aside>
    <section class="evmain"><div class="card"><div class="row between wrap gap"><h2>${esc(s.name || 'Estudio')}</h2>${P.twoRev ? `<div class="who" role="tablist">${['A', 'B', 'C'].map(w => `<button class="${ui.who === w ? 'active' : ''}" data-who="${w}">${esc(P.names[w])}${hasData(s.asm[w]) ? '' : ' ○'}</button>`).join('')}</div>` : ''}</div>
      <div class="form meta"><label>Nombre<input data-name value="${esc(s.name)}"></label>${metaHtml(s)}</div>${P.twoRev && ui.who === 'C' ? '<p class="sub">Está editando el <b>consenso</b>: es el juicio que se usa en las figuras. Use el paso 4 para copiar desde cada revisor.</p>' : ''}${tabs ? `<div class="domnav" role="tablist">${tabs}</div>` : ''}</div>
    <div id="panel">${I.kind === 'amstar' ? amHtml(s, e) : ui.dom === 'G' ? globalHtml(s, e) : domHtml(s, e)}</div></section></div>`;
}
function domHtml(s, e) {
  const I = inst(), d = I.doms(s.meta).find(x => x.id === ui.dom), r = e.doms.find(x => x.id === ui.dom), a = asm().ans || {}, i = e.doms.findIndex(x => x.id === ui.dom);
  const items = visibleItems(d, a, s.meta).map(it => `<div class="q"><div class="qh"><b>${esc(it.id)}</b><span>${esc(it.q)}</span>${it.h ? `<button class="qi" data-help="${esc(it.id)}" aria-label="Orientación para ${esc(it.id)}" title="Orientación">ⓘ</button>` : ''}</div>${chips(it.id, it.opts, a[it.id])}${it.h ? `<p class="qhelp" id="h-${esc(it.id)}" hidden>${esc(it.h)}</p>` : ''}</div>`).join('');
  const ds = (asm().jud || {})[d.id] || {}, ov = !!r.sel && r.sel !== r.sug;
  return `<div class="card"><h3>${esc(d.id)} · ${esc(d.name)}</h3>${d.crit ? `<p class="sub">${esc(d.crit)}</p>` : ''}${items}
    <div class="algo ${r.sug ? '' : 'wait'}"><b>${I.hasAlgo ? 'Juicio propuesto por el algoritmo' : 'Juicio del evaluador'}</b> ${I.hasAlgo ? badge(r.sug) : ''}<p>${esc(r.why)}</p></div>
    <div class="form"><label>Su juicio${I.hasAlgo ? ' (vacío = usar la propuesta)' : ''}<select data-sel="${d.id}">${opt('', I.hasAlgo ? '— usar la propuesta —' : '— seleccione —', !ds.sel)}${I.levels.map(l => opt(l, LV[l].t, ds.sel === l)).join('')}</select></label>
    ${d.app ? `<label>Aplicabilidad (preocupación)<select data-app="${d.id}">${opt('', '— sin juzgar —', !ds.app)}${I.appLevels.map(l => opt(l, LV[l].t, ds.app === l)).join('')}</select></label>` : ''}
    ${['rob2', 'robins-i'].includes(I.id) ? `<label>Dirección probable del sesgo (opcional)<select data-dir="${d.id}">${['', 'Favorece al experimental', 'Favorece al comparador', 'Hacia la nulidad', 'Alejándose de la nulidad', 'Impredecible'].map(v => opt(v, v || '—', ds.dir === v)).join('')}</select></label>` : ''}
    <label class="wide">Sustento del juicio (cite el texto del estudio)${ov ? ' <b class="warnc">· su juicio difiere de la propuesta: justifíquelo</b>' : ''}<textarea data-note="${d.id}" rows="3" placeholder="p. ej., «La asignación se realizó por un sistema web centralizado» (p. 3)">${esc(ds.note || '')}</textarea></label></div>
    <div class="stepnav"><button class="ghost" data-nav="${i > 0 ? e.doms[i - 1].id : ''}"${i > 0 ? '' : ' disabled'}>← Anterior</button><button class="primary" data-nav="${i < e.doms.length - 1 ? e.doms[i + 1].id : 'G'}">${i < e.doms.length - 1 ? 'Siguiente →' : 'Juicio global →'}</button></div></div>`;
}
function globalHtml(s, e) {
  const I = inst(), o = e.overall, ov = asm().ov || {};
  return `<div class="card"><h3>Juicio global</h3><div class="tablewrap"><table class="data"><thead><tr><th>Dominio</th><th>Propuesta</th><th>Final</th><th>Respuestas</th></tr></thead><tbody>${e.doms.map(d => `<tr><td>${esc(d.id)} · ${esc(d.name)}</td><td>${badge(d.sug)}</td><td>${badge(d.j)}${d.sel && d.sel !== d.sug ? ' <span class="flag">modificado</span>' : ''}</td><td>${d.answered}/${d.total}</td></tr>`).join('')}</tbody></table></div>
    <div class="algo ${o.sug ? '' : 'wait'}"><b>Juicio global propuesto</b> ${badge(o.sug)}<p>${esc(o.why)}</p></div>
    <div class="form"><label>Su juicio global (vacío = usar la propuesta)<select data-ovsel>${opt('', '— usar la propuesta —', !ov.sel)}${I.levels.map(l => opt(l, LV[l].t, ov.sel === l)).join('')}</select></label><label class="wide">Sustento<textarea data-ovnote rows="3">${esc(ov.note || '')}</textarea></label></div>
    <div class="stepnav"><button class="ghost" data-nav="${e.doms.at(-1).id}">← Dominios</button><button class="primary" data-next="1">Siguiente estudio →</button></div></div>`;
}
function amHtml(s, e) {
  const I = inst(), a = asm(), ch = a.chk || {}, an = a.ans || {};
  const group = (key, sets, label) => `<fieldset class="crit"><legend>${esc(label)}</legend>${sets.map(st => `<div class="critset"><b>${st.lvl === 'py' ? 'Para «Sí parcial»' : 'Para «Sí»' + (sets.length > 1 ? ' (además de lo anterior)' : '')}</b>${st.c.map(([id, t]) => `<label class="inline"><input type="checkbox" data-chk="${key}" value="${id}"${(ch[key] || []).includes(id) ? ' checked' : ''}> ${esc(t)}</label>`).join('')}</div>`).join('')}</fieldset>`;
  const items = I.items.map((it, i) => { const r = e.items[i], na = r.j === 'na'; return `<div class="q am${it.crit ? ' critical' : ''}"><div class="qh"><b>${it.n}${it.crit ? '*' : ''}</b><span>${esc(it.q)}</span>${badge(r.j)}</div>${na ? `<p class="sub">${esc(r.why)}</p>` : it.yn ? chips(`i${it.n}`, ['Y', 'N'], (an[`i${it.n}`] || '').toUpperCase()) + (it.h ? `<p class="qhelp">${esc(it.h)}</p>` : '') : it.split ? [s.meta.st !== 'nrsi' && it.setsR ? group(`${it.n}r`, it.setsR, s.meta.st === 'both' ? 'Estudios aleatorizados' : 'Evaluación del riesgo de sesgo') : '', s.meta.st !== 'rct' ? group(`${it.n}n`, it.setsN, s.meta.st === 'both' ? 'Estudios no aleatorizados' : 'Evaluación del riesgo de sesgo') : ''].join('') + `<p class="sub">${esc(r.why)}</p>` : group(it.n, it.sets, 'Criterios cumplidos') + `<p class="sub">${esc(r.why)}</p>`}<label class="inline note"><input data-amnote="${it.n}" value="${esc((a.jud || {})[`i${it.n}`]?.note || '')}" placeholder="Comentario / cita"></label></div>`; }).join('');
  const o = e.overall;
  return `<div class="card"><h3>AMSTAR 2 · 16 ítems</h3><p class="sub">* Ítem crítico. Los ítems con criterios se califican a partir de las casillas; «Sí parcial» no cuenta como debilidad.</p>${items}<div class="algo ${o.j ? '' : 'wait'}"><b>Confianza global</b> ${badge(o.j)}<p>${esc(o.why)}</p></div><div class="form"><label class="wide">Comentarios globales<textarea data-ovnote rows="3">${esc((a.ov || {}).note || '')}</textarea></label></div><div class="stepnav"><span></span><button class="primary" data-next="1">Siguiente revisión →</button></div></div>`;
}
const evalBox = () => $('#eval-out');
evalBox().addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return; const s = cur(), a = asm();
  if (t.dataset.sid) { ui.sid = t.dataset.sid; renderEval(); } else if (t.dataset.who) { ui.who = t.dataset.who; renderEval(); } else if (t.dataset.dom) { ui.dom = t.dataset.dom; renderEval(); } else if (t.dataset.nav) { ui.dom = t.dataset.nav; renderEval(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.next) { const k = P.studies.findIndex(x => x.id === s.id); ui.sid = P.studies[(k + 1) % P.studies.length].id; ui.dom = inst().kind === 'amstar' ? 'G' : inst().doms(P.studies.find(x => x.id === ui.sid).meta)[0].id; renderEval(); window.scrollTo({ top: 0 }); }
  else if (t.dataset.help) { const h = $(`#h-${CSS.escape(t.dataset.help)}`); h.hidden = !h.hidden; }
  else if (t.dataset.q) { a.ans ||= {}; const k = t.dataset.q, v = /^i\d+$/.test(k) ? t.dataset.v.toLowerCase() : t.dataset.v; if (a.ans[k] === v) delete a.ans[k]; else a.ans[k] = v; commit(); const y = window.scrollY; renderEval(); window.scrollTo({ top: y }); }
});
evalBox().addEventListener('input', e => {
  const t = e.target, s = cur(), a = asm();
  if (t.dataset.name !== undefined) s.name = t.value; else if (t.dataset.note) { (a.jud ||= {})[t.dataset.note] ||= {}; a.jud[t.dataset.note].note = t.value; } else if (t.dataset.ovnote !== undefined) (a.ov ||= {}).note = t.value;
  else if (t.dataset.amnote) { (a.jud ||= {})[`i${t.dataset.amnote}`] = { note: t.value }; } else if (t.dataset.meta && t.type !== 'checkbox' && t.tagName !== 'SELECT') s.meta[t.dataset.meta] = t.value; else return; commit();
});
evalBox().addEventListener('change', e => {
  const t = e.target, s = cur(), a = asm(), jd = k => ((a.jud ||= {})[k] ||= {});
  if (t.dataset.sel !== undefined) { jd(t.dataset.sel).sel = t.value || null; } else if (t.dataset.app !== undefined) jd(t.dataset.app).app = t.value || null; else if (t.dataset.dir !== undefined) jd(t.dataset.dir).dir = t.value;
  else if (t.dataset.ovsel !== undefined) (a.ov ||= {}).sel = t.value || null; else if (t.dataset.meta) { s.meta[t.dataset.meta] = t.type === 'checkbox' ? t.checked : t.value; } else if (t.dataset.chk) { const c = (a.chk ||= {}); c[t.dataset.chk] = $$(`[data-chk="${t.dataset.chk}"]:checked`, evalBox()).map(x => x.value); } else return;
  commit(); const y = window.scrollY; renderEval(); window.scrollTo({ top: y });
});

// ---------------------------------------------------------------- 4. concordancia y consenso
const domIds = () => (inst().kind === 'amstar' ? inst().items.map(i => `i${i.n}`) : inst().doms(P.studies[0]?.meta || defMeta(inst())).map(d => d.id));
function copyDomain(s, d, from) {
  const I = inst(), src = s.asm[from] || {}, dst = (s.asm.C ||= {}); dst.ans ||= {}; dst.jud ||= {}; dst.chk ||= {};
  if (I.kind === 'amstar') { const n = +d.slice(1); [`i${n}`].forEach(k => { if (src.ans?.[k]) dst.ans[k] = src.ans[k]; else delete dst.ans[k]; }); [n, `${n}r`, `${n}n`].forEach(k => { if (src.chk?.[k]) dst.chk[k] = [...src.chk[k]]; else delete dst.chk[k]; }); dst.jud[d] = { ...(src.jud?.[d] || {}) }; return; }
  const dom = I.doms(s.meta).find(x => x.id === d); dom.items.forEach(it => { if (src.ans?.[it.id]) dst.ans[it.id] = src.ans[it.id]; else delete dst.ans[it.id]; }); dst.jud[d] = { ...(src.jud?.[d] || {}) };
}
function renderConsensus() {
  const I = inst(), box = $('#cons-out');
  if (!P.twoRev) { box.innerHTML = `<div class="card"><h2>Concordancia y consenso</h2><p>Esta sección compara a dos revisores independientes. Actívela en el paso 2.</p><button class="primary" id="c-on">Activar dos revisores</button></div>`; $('#c-on').addEventListener('click', () => { P.twoRev = true; commit(); renderConsensus(); }); return; }
  const both = P.studies.filter(s => hasData(s.asm.A) && hasData(s.asm.B)), ag = agreement({ ...P, studies: both });
  const cols = I.kind === 'amstar' ? I.items.map((it, i) => ({ id: `i${it.n}`, name: `Ítem ${it.n}`, get: e => e.items[i].j })) : I.doms(P.studies[0]?.meta || defMeta(I)).map((d, i) => ({ id: d.id, name: d.id, get: e => e.doms[i].j }));
  const diffs = []; both.forEach(s => { const a = evalStudy(P, s, 'A'), b = evalStudy(P, s, 'B'); cols.forEach(c => { const x = c.get(a), y = c.get(b); if (x !== y) diffs.push({ s, c, x, y }); }); });
  box.innerHTML = `<div class="card"><h2>Concordancia entre revisores</h2><div class="howto"><div><b>Qué se ve</b>Acuerdo observado y kappa de Cohen por dominio (y kappa ponderado lineal en escalas ordinales) sobre los juicios finales de ${esc(P.names.A)} y ${esc(P.names.B)}.</div><div><b>Para qué</b>Informar la fiabilidad de la evaluación y detectar dominios que requieren criterios comunes.</div><div><b>Cómo interpretar</b>Landis y Koch: &lt; 0,21 leve; 0,21–0,40 regular; 0,41–0,60 moderada; 0,61–0,80 sustancial; &gt; 0,80 casi perfecta. Con pocos estudios el kappa es muy inestable.</div></div>
    <p class="sub">${both.length} de ${P.studies.length} estudios tienen valoración de ambos revisores.</p>
    <div class="tablewrap"><table class="data"><thead><tr><th>Dominio</th><th>n</th><th>Acuerdo</th><th>Kappa</th><th>Interpretación</th><th>Kappa ponderado</th></tr></thead><tbody>${ag.map(r => `<tr><td>${esc(r.id)} ${esc(r.name || '')}</td><td>${r.n}</td><td>${pct(r.po)}</td><td>${f2(r.kappa)}</td><td>${kappaLabel(r.kappa)}</td><td>${r.wkappa == null ? '' : f2(r.wkappa)}</td></tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h2>Resolver discrepancias</h2><div class="row gap wrap"><button class="ghost" id="c-agree">Prellenar consenso con los acuerdos</button><span class="sub">Copia los dominios en que ambos coinciden; después resuelva el resto.</span></div>
    <div class="tablewrap"><table class="data"><thead><tr><th>Estudio</th><th>${I.kind === 'amstar' ? 'Ítem' : 'Dominio'}</th><th>${esc(P.names.A)}</th><th>${esc(P.names.B)}</th><th>Consenso</th><th></th></tr></thead><tbody>${diffs.map(d => { const c = evalStudy(P, d.s, 'C'), cj = d.c.get(c); return `<tr data-sid="${d.s.id}" data-d="${d.c.id}"><td>${esc(d.s.name)}</td><td>${esc(d.c.name)}</td><td>${badge(d.x)}</td><td>${badge(d.y)}</td><td>${cj ? badge(cj) : '—'}</td><td><button class="ghost" data-take="A">Usar ${esc(P.names.A)}</button> <button class="ghost" data-take="B">Usar ${esc(P.names.B)}</button> <button class="ghost" data-edit="1">Editar</button></td></tr>`; }).join('') || '<tr><td colspan="6" class="muted">Sin discrepancias.</td></tr>'}</tbody></table></div>
    <div class="stepnav"><button class="ghost" data-go="evaluar">← Evaluar</button><button class="primary" data-go="resultados">Siguiente: resultados →</button></div></div>`;
  $('#c-agree').addEventListener('click', () => { both.forEach(s => { const a = evalStudy(P, s, 'A'), b = evalStudy(P, s, 'B'); cols.forEach(c => { if (c.get(a) === c.get(b)) copyDomain(s, c.id, 'A'); }); }); commit(); renderConsensus(); });
  $$('[data-take]', box).forEach(b => b.addEventListener('click', () => { const tr = b.closest('tr'); copyDomain(studyOf(tr.dataset.sid), tr.dataset.d, b.dataset.take); commit(); renderConsensus(); }));
  $$('[data-edit]', box).forEach(b => b.addEventListener('click', () => { const tr = b.closest('tr'); ui.sid = tr.dataset.sid; ui.who = 'C'; ui.dom = I.kind === 'amstar' ? 'G' : tr.dataset.d; showTab('evaluar'); }));
}

// ---------------------------------------------------------------- 5. resultados
function resultsData() {
  const I = inst(), key = ui.view, rows = P.studies.map(s => { const k = key === 'final' ? finalKey(P, s) : key; return { s, k, f: finalStudy(P, s, k) }; });
  return { I, rows };
}
function renderResults() {
  const box = $('#res-out'), I = inst(); if (!P.studies.length) { box.innerHTML = '<div class="card"><p class="muted">No hay estudios. Añádalos en el paso 2.</p></div>'; return; }
  const { rows } = resultsData(), am = I.kind === 'amstar', title = P.title || '';
  let cols, trows, levels, legend, legendOverall = null, counts = {}, sumCols;
  if (am) { cols = I.items.map(it => ({ id: String(it.n), short: it.crit ? `${it.n}*` : String(it.n), crit: it.crit })); trows = rows.map(r => ({ name: r.s.name, js: r.f.items, overall: r.f.overall })); legend = ['y', 'py', 'n', 'na']; legendOverall = ['chigh', 'cmod', 'clow', 'ccrit']; levels = legend; sumCols = [...cols.map(c => ({ id: c.id, name: `Ítem ${c.id}${c.crit ? ' (crítico)' : ''}` })), { id: 'Global', name: 'Confianza global' }]; }
  else { const first = P.studies[0].meta; cols = I.doms(first).map(d => ({ id: d.id, short: d.short })); trows = rows.map(r => ({ name: r.s.name, js: r.f.doms, overall: r.f.overall })); levels = I.levels; legend = levels; sumCols = [...cols.map((c, i) => ({ id: c.id, name: I.doms(first)[i].name })), { id: 'Global', name: 'Global' }]; }
  rows.forEach(r => { const w = ui.weighted ? r.s.weight : 1; (am ? r.f.items : r.f.doms).forEach((j, i) => { if (!j) return; const c = sumCols[i].id; (counts[c] ||= {})[j] = (counts[c][j] || 0) + w; }); if (r.f.overall) { (counts.Global ||= {})[r.f.overall] = (counts.Global[r.f.overall] || 0) + w; } });
  const lv = am ? { items: levels, overall: ['chigh', 'cmod', 'clow', 'ccrit'] } : null;
  const tl = trafficLight(trows, cols, { title, legend, legendOverall }), sbItems = summaryBar(sumCols.filter(c => c.id !== 'Global'), counts, levels, { title: title ? `${title} · resumen` : 'Resumen', weighted: ui.weighted }), sbGlobal = am ? summaryBar([{ id: 'Global', name: 'Confianza global' }], counts, lv.overall, { weighted: false }) : null;
  const nA = rows.length, g = rows.map(r => r.f.overall).filter(Boolean), gc = {}; g.forEach(j => (gc[j] = (gc[j] || 0) + 1));
  box.innerHTML = `<div class="card"><h2>Resultados y figuras</h2><div class="howto"><div><b>Qué se ve</b>El juicio final de cada ${esc(I.unit)} por dominio (semáforo) y la proporción de cada nivel por dominio (barras).</div><div><b>Para qué</b>Cumplir los requisitos de informe (PRISMA 2020 ítem 18; Cochrane) y decidir si un análisis de sensibilidad excluye estudios de alto riesgo.</div><div><b>Cómo interpretar</b>El semáforo describe, no puntúa: no sume dominios ni promedie. Los estudios con alto riesgo en un dominio crítico son los candidatos a un análisis de sensibilidad.</div></div>
    <div class="row gap wrap"><label class="inline">Juicios de <select id="r-view">${opt('final', P.twoRev ? 'Final (consenso si existe)' : 'Final', ui.view === 'final')}${P.twoRev ? ['A', 'B', 'C'].map(w => opt(w, P.names[w], ui.view === w)).join('') : ''}</select></label>${am ? '' : `<label class="inline"><input type="checkbox" id="r-w"${ui.weighted ? ' checked' : ''}> Ponderar barras por el peso del estudio</label>`}</div>
    <p class="sub">${nA} ${esc(nA > 1 ? plu(I.unit) : I.unit)} · ${Object.entries(gc).map(([j, n]) => `${LV[j].t}: ${n} (${pct(n / g.length)})`).join(' · ')}</p>
    <div class="plots single">${figWrap(tl, 'semaforo_riesgo_sesgo')}${figWrap(sbItems, 'resumen_riesgo_sesgo')}${sbGlobal ? figWrap(sbGlobal, 'resumen_confianza_global') : ''}</div>
    <h3>Tabla</h3><div class="tablewrap"><table class="data"><thead><tr><th>${esc(cap(I.unit))}</th>${cols.map(c => `<th title="${esc(c.id)}">${esc(c.short)}</th>`).join('')}<th>Global</th></tr></thead><tbody>${trows.map(r => `<tr><td>${esc(r.name)}</td>${[...r.js, r.overall].map(j => `<td>${badge(j)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="stepnav"><button class="ghost" data-go="consenso">← Concordancia</button><button class="primary" data-go="reporte">Siguiente: exportar →</button></div></div>`;
  $('#r-view')?.addEventListener('change', e => { ui.view = e.target.value; renderResults(); }); $('#r-w')?.addEventListener('change', e => { ui.weighted = e.target.checked; renderResults(); }); bindFigs(box);
}

// ---------------------------------------------------------------- 6. exportar y reporte
const UNIT_EN = { resultado: 'result', estudio: 'study', modelo: 'model', 'revisión': 'review' };
function methodsText(lang) {
  const I = inst(), es = lang === 'es', n = P.studies.length, two = P.twoRev, an = I.kind === 'amstar';
  const alg = I.hasAlgo && !an ? (es ? 'Los juicios de cada dominio se propusieron mediante los algoritmos publicados a partir de las preguntas señalizadoras y fueron revisados por el evaluador; los juicios distintos de la propuesta se justificaron por escrito.' : 'Domain-level judgements were suggested by the published algorithms from the signalling questions and reviewed by the assessor; any judgement that differed from the suggestion was justified in writing.') : an ? (es ? 'Cada ítem se calificó como sí, sí parcial o no con los criterios del instrumento; la confianza global se asignó según el número de fallos críticos y debilidades no críticas.' : 'Each item was rated yes, partial yes or no using the instrument criteria; overall confidence was assigned from the number of critical flaws and non-critical weaknesses.') : (es ? 'Los juicios de cada dominio los emitió el evaluador a partir de las preguntas señalizadoras, ya que el instrumento no define un algoritmo.' : 'Domain-level judgements were made by the assessor guided by the signalling questions, as the instrument does not define an algorithm.');
  const rev = two ? (es ? `${esc(P.names.A)} y ${esc(P.names.B)} evaluaron cada ${I.unit} de forma independiente; las discrepancias se resolvieron por consenso. La concordancia se calculó con el kappa de Cohen.` : `${P.names.A} and ${P.names.B} independently assessed each ${UNIT_EN[I.unit]}; disagreements were resolved by consensus. Agreement was quantified with Cohen's kappa.`) : (es ? 'Un revisor evaluó cada ' + I.unit + '.' : `One reviewer assessed each ${UNIT_EN[I.unit]}.`);
  const { rows } = resultsData(), g = rows.map(r => r.f.overall).filter(Boolean), c = {}; g.forEach(j => (c[j] = (c[j] || 0) + 1));
  const resS = Object.entries(c).map(([j, k]) => `${k} (${pct(k / g.length)}) ${LV[j].t.toLowerCase()}`).join(', ');
  return es
    ? `Evaluación del riesgo de sesgo.\nSe evaluó el riesgo de sesgo de ${n} ${n > 1 ? plu(I.unit) : I.unit} con ${I.name} (${I.full}; ${I.ref.split(/\.\s/)[0]}). ${rev} ${alg} Las figuras se elaboraron con EPI-ROB (EPI-LAB; Fernández-Guzmán D., https://github.com/Danielferguz/EPI-ROB).\n\nResultados.\nDe ${g.length} ${g.length > 1 ? plu(I.unit) : I.unit} con juicio global: ${resS || 'sin juicios globales aún'}.\n\nReferencia del instrumento: ${I.ref}`
    : `Risk of bias assessment.\nRisk of bias of ${n} ${UNIT_EN[I.unit]}${n > 1 ? 's' : ''} was assessed with ${I.name} (${I.full}). ${rev} ${alg} Figures were produced with EPI-ROB (EPI-LAB; Fernández-Guzmán D., https://github.com/Danielferguz/EPI-ROB).\n\nResults.\nOf ${g.length} ${UNIT_EN[I.unit]}${g.length > 1 ? 's' : ''} with an overall judgement: ${Object.entries(c).map(([j, k]) => `${k} (${pct(k / g.length)}) ${LV[j].t.toLowerCase()}`).join(', ') || 'none yet'}.\n\nInstrument reference: ${I.ref}`;
}
function answersTable() {
  const I = inst(); if (I.kind === 'amstar') return { head: ['Revisión', ...I.items.map(i => `Ítem ${i.n}`), 'Confianza'], rows: P.studies.map(s => { const f = finalStudy(P, s); return [s.name, ...f.items.map(j => LV[j]?.t || ''), LV[f.overall]?.t || '']; }), colors: P.studies.map(s => { const f = finalStudy(P, s); return [null, ...f.items.map(j => LV[j]?.c), LV[f.overall]?.c]; }) };
  const first = P.studies[0]?.meta || defMeta(I), ds = I.doms(first);
  return { head: ['Estudio', ...ds.map(d => `${d.id} ${d.name}`), 'Global', 'Peso'], rows: P.studies.map(s => { const f = finalStudy(P, s); return [s.name, ...f.doms.map(j => LV[j]?.t || ''), LV[f.overall]?.t || '', s.weight]; }), colors: P.studies.map(s => { const f = finalStudy(P, s); return [null, ...f.doms.map(j => LV[j]?.c), LV[f.overall]?.c, null]; }) };
}
const xls = () => { const t = answersTable(), d = P.studies.map(s => { const e = evalStudy(P, s); return { s, e }; }); const I = inst();
  const detail = I.kind === 'amstar' ? '' : `<br><table border="1"><tr><th>Estudio</th><th>Dominio</th><th>Propuesta</th><th>Final</th><th>Sustento</th></tr>${d.flatMap(({ s, e }) => e.doms.map(x => `<tr><td>${esc(s.name)}</td><td>${esc(x.id)}</td><td>${esc(LV[x.sug]?.t || '')}</td><td>${esc(LV[x.j]?.t || '')}</td><td>${esc(x.note)}</td></tr>`)).join('')}</table>`;
  return `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><tr>${t.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr>${t.rows.map((r, i) => `<tr>${r.map((v, k) => `<td${t.colors[i][k] ? ` style="background:${t.colors[i][k]};font-weight:bold"` : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</table>${detail}</body></html>`; };
function renderReport() {
  const box = $('#rep-out'), I = inst(); if (!P.studies.length) { box.innerHTML = '<div class="card"><p class="muted">No hay estudios.</p></div>'; return; }
  const t = answersTable();
  box.innerHTML = `<div class="card"><h2>Texto de métodos y resultados</h2><div class="row gap"><button class="ghost" data-lang="es">Español</button><button class="ghost" data-lang="en">English</button><span class="grow"></span><button class="ghost" id="m-copy">Copiar</button></div><textarea id="m-text" rows="12"></textarea></div>
  <div class="card"><h2>Archivos</h2><div class="row gap wrap"><button class="ghost" id="x-json">Proyecto (JSON)</button>${I.kind === 'amstar' ? '' : '<button class="ghost" id="x-robvis">CSV compatible con robvis</button>'}<button class="ghost" id="x-xls">Tabla en color (Excel)</button><button class="ghost" id="x-print">Imprimir / PDF</button><button class="ghost danger" id="x-clear">Borrar proyecto</button></div>
  <p class="sub">El CSV robvis se puede usar con <code>robvis::rob_traffic_light()</code> y <code>rob_summary()</code> en R, o cargarse de nuevo aquí con «Importar juicios».</p></div>`;
  let lang = 'es'; const set = () => ($('#m-text').value = methodsText(lang)); set(); $$('[data-lang]', box).forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; set(); }));
  $('#m-copy').addEventListener('click', () => navigator.clipboard?.writeText($('#m-text').value));
  const nm = (P.title || 'epi-rob').replace(/[^\w\-]+/g, '_').slice(0, 40);
  $('#x-json').addEventListener('click', () => download(`${nm}.json`, JSON.stringify(P, null, 1), 'application/json')); $('#x-robvis')?.addEventListener('click', () => { try { download(`${nm}_robvis.csv`, robvisCSV(P), 'text/csv'); } catch (e) { alert(e.message); } });
  $('#x-xls').addEventListener('click', () => download(`${nm}.xls`, xls(), 'application/vnd.ms-excel')); $('#x-print').addEventListener('click', () => { showTab('resultados'); setTimeout(() => window.print(), 300); });
  $('#x-clear').addEventListener('click', () => { if (confirm('Se borrarán todos los estudios y respuestas guardados en este navegador. ¿Continuar?')) { P = newProject(P.inst); ui.sid = null; save(P); showTab('guia'); } });
}
window.addEventListener('beforeunload', () => save(P));
showTab('guia'); window.__rob = { get P() { return P; }, ui };
