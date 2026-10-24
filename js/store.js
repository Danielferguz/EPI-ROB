// Proyecto de evaluación: estudios, valoraciones de uno o dos revisores y consenso; persistencia, concordancia y formatos de intercambio.
import { instOf, defMeta, evalAssessment, finalOf, LV } from './instruments.js?v=2026.10.24-2';

const KEY = 'epi-rob-v1';
export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
export const ASSESSORS = ['A', 'B', 'C'];
export const newProject = (inst = 'rob2') => ({ v: 1, title: '', inst, twoRev: false, names: { A: 'Revisor 1', B: 'Revisor 2', C: 'Consenso' }, studies: [] });
export const newStudy = (inst, name = '', meta = {}) => ({ id: uid(), name, weight: 1, meta: { ...defMeta(typeof inst === 'string' ? instOf(inst) : inst), ...meta }, asm: { A: {}, B: {}, C: {} } });
export const hasData = a => !!a && (Object.keys(a.ans || {}).length > 0 || Object.keys(a.chk || {}).length > 0 || Object.values(a.jud || {}).some(o => o.sel) || !!(a.ov && a.ov.sel));
// valoración que se usa en figuras y tablas: consenso si existe; si no, revisor 1
export const finalKey = (p, s) => (p.twoRev && hasData(s.asm.C) ? 'C' : 'A');
export const evalStudy = (p, s, k = finalKey(p, s)) => evalAssessment(instOf(p.inst), s.meta, s.asm[k] || {});
export const finalStudy = (p, s, k = finalKey(p, s)) => finalOf(instOf(p.inst), s.meta, s.asm[k] || {});

export function load() { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch { return null; } }
export function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; } }
export function parseProject(text) {
  const p = JSON.parse(text); if (!p || p.v !== 1 || !instOf(p.inst) || !Array.isArray(p.studies)) throw new Error('El archivo no es un proyecto de EPI-ROB válido.');
  p.names = { A: 'Revisor 1', B: 'Revisor 2', C: 'Consenso', ...(p.names || {}) }; p.studies.forEach(s => { s.asm = { A: {}, B: {}, C: {}, ...(s.asm || {}) }; s.meta ||= {}; s.weight = Number.isFinite(+s.weight) ? +s.weight : 1; s.id ||= uid(); });
  return p;
}

// ---------------------------------------------------------------- concordancia entre dos revisores
export function kappa(pairs, levels, weighted = false) {
  const n = pairs.length, k = levels.length; if (!n) return { n: 0, po: NaN, kappa: NaN };
  const m = Array.from({ length: k }, () => new Array(k).fill(0)); let agree = 0;
  for (const [a, b] of pairs) { const i = levels.indexOf(a), j = levels.indexOf(b); if (i < 0 || j < 0) continue; m[i][j]++; if (i === j) agree++; }
  const N = m.flat().reduce((s, v) => s + v, 0); if (!N) return { n: 0, po: NaN, kappa: NaN };
  const r = m.map(row => row.reduce((s, v) => s + v, 0)), c = levels.map((_, j) => m.reduce((s, row) => s + row[j], 0)), w = (i, j) => (weighted ? 1 - Math.abs(i - j) / (k - 1) : i === j ? 1 : 0);
  let po = 0, pe = 0; for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { po += w(i, j) * m[i][j] / N; pe += w(i, j) * r[i] * c[j] / (N * N); }
  return { n: N, po: agree / N, kappa: pe === 1 ? (po === 1 ? 1 : NaN) : (po - pe) / (1 - pe) };
}
export const kappaLabel = k => (!isFinite(k) ? '–' : k < 0 ? 'peor que el azar' : k < 0.21 ? 'leve' : k < 0.41 ? 'regular' : k < 0.61 ? 'moderada' : k < 0.81 ? 'sustancial' : 'casi perfecta');
const ORDINAL = { rob2: ['low', 'some', 'high'], 'robins-i': ['low', 'moderate', 'serious', 'critical'], 'robins-e': ['low', 'some', 'high', 'vhigh'] };
// por dominio y global: acuerdo, kappa y kappa ponderado lineal (solo escalas ordinales)
export function agreement(p) {
  const inst = instOf(p.inst), rows = [], ev = p.studies.map(s => ({ A: evalStudy(p, s, 'A'), B: evalStudy(p, s, 'B') }));
  const cols = inst.kind === 'nos' ? [['S', 'Selección', e => String(e.stars.S), ['0', '1', '2', '3', '4']], ['C', 'Comparabilidad', e => String(e.stars.C), ['0', '1', '2']], ['O', 'Desenlace', e => String(e.stars.O), ['0', '1', '2', '3']]].map(([id, name, get, levels]) => ({ id, name, get: e => (e.items.every(x => x.j) ? get(e) : null), levels })) : inst.kind === 'checklist' ? inst.items.map((it, i) => ({ id: `Ítem ${it.n}`, get: e => e.items[i].j, levels: ['y', 'n', 'u', 'na'] })) : inst.kind === 'amstar' ? inst.items.map((it, i) => ({ id: `Ítem ${it.n}`, get: e => e.items[i].j, levels: ['y', 'py', 'n'] })) : inst.doms(p.studies[0]?.meta || defMeta(inst)).map((d, i) => ({ id: d.id, name: d.name, get: e => e.doms[i]?.j, levels: inst.levels }));
  cols.push({ id: 'Global', name: 'Juicio global', get: e => e.overall.j, levels: inst.kind === 'amstar' ? ['chigh', 'cmod', 'clow', 'ccrit'] : inst.overallLevels || inst.levels });
  for (const c of cols) {
    const pairs = ev.map(e => [c.get(e.A), c.get(e.B)]).filter(([a, b]) => a && b), ord = ORDINAL[inst.id];
    const k = kappa(pairs, c.levels), wk = ord && c.levels === inst.levels ? kappa(pairs.filter(([a, b]) => ord.includes(a) && ord.includes(b)), ord, true) : null;
    rows.push({ id: c.id, name: c.name || '', n: pairs.length, po: k.po, kappa: k.kappa, wkappa: wk ? wk.kappa : null });
  }
  return rows;
}

// ---------------------------------------------------------------- formatos de intercambio (robvis)
const EN = { low: 'Low', lowc: 'Low', some: 'Some concerns', high: 'High', vhigh: 'Very high', moderate: 'Moderate', serious: 'Serious', critical: 'Critical', ni: 'No information', unclear: 'Unclear' };
const FROM = { ...Object.fromEntries(Object.entries(EN).filter(([k]) => k !== 'lowc').map(([k, v]) => [v.toLowerCase(), k])), 'bajo': 'low', 'bajo riesgo': 'low', 'algunas preocupaciones': 'some', 'alto': 'high', 'alto riesgo': 'high', 'moderado': 'moderate', 'serio': 'serious', 'crítico': 'critical', 'critico': 'critical', 'sin información': 'ni', 'no claro': 'unclear', 'l': 'low', 'h': 'high', 'u': 'unclear', 'm': 'moderate', 's': 'serious', 'c': 'critical', 'n': 'ni', 'unclear risk': 'unclear', 'very high': 'vhigh', 'muy alto': 'vhigh', 'no info': 'ni', 'no information': 'ni' };
const esc = v => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
export function robvisCSV(p) {
  const inst = instOf(p.inst); if (!inst.robvis) throw new Error(`${inst.name} no tiene formato robvis.`);
  const first = p.studies[0]?.meta || defMeta(inst), dn = inst.doms(first).map(d => d.id), rows = [['Study', ...dn, 'Overall', 'Weight']];
  for (const s of p.studies) { const f = finalStudy(p, s); rows.push([s.name, ...f.doms.map(j => EN[j] || ''), EN[f.overall] || '', s.weight]); }
  return rows.map(r => r.map(esc).join(',')).join('\n');
}
// filas {Study, D1.., Overall, Weight} → estudios con solo juicios finales (sin respuestas)
export function fromRobvisRows(p, rows) {
  const inst = instOf(p.inst), dn = inst.doms(defMeta(inst)).map(d => d.id), out = [], bad = [];
  for (const r of rows) {
    const key = k => Object.keys(r).find(x => x.trim().toLowerCase() === k.toLowerCase()), name = r[key('Study')] ?? Object.values(r)[0]; if (!name) continue;
    const s = newStudy(inst.id, String(name)), w = parseFloat(String(r[key('Weight')] ?? '').replace(',', '.')); if (isFinite(w) && w > 0) s.weight = w;
    s.asm.A = { jud: {}, ov: {} };
    dn.forEach(d => { const raw = r[key(d)]; if (raw == null || raw === '') return; const j = FROM[String(raw).trim().toLowerCase()]; if (j && inst.levels.includes(j)) s.asm.A.jud[d] = { sel: j }; else bad.push(`${name}: ${d} = «${raw}»`); });
    const ov = r[key('Overall')]; if (ov) { const j = FROM[String(ov).trim().toLowerCase()]; if (j && inst.levels.includes(j)) s.asm.A.ov.sel = j; else bad.push(`${name}: Overall = «${ov}»`); }
    out.push(s);
  }
  return { studies: out, bad };
}
export const levelWord = j => (LV[j] ? LV[j].t : '');
