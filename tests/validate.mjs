// Validación de los algoritmos: se enumeran TODAS las combinaciones de respuestas de cada dominio de RoB 2 y se comparan con las tablas
// oficiales de la guía (Higgins et al., 22 ago 2019: tablas 1, 4, 6, 8, 10, 12 y 14) transcritas como filas independientes del código.
import { ROB2, ROBINS_I, QUADAS2, PROBAST, AMSTAR2, evalAssessment, amItem, amOverall, O5 } from '../js/instruments.js';
import { kappa, robvisCSV, fromRobvisRows, newProject, newStudy, agreement, parseProject } from '../js/store.js';
import { parseCSV } from '../js/io.js';
import { ROBINS_E, ROB1, JBI, NOS, nosQuality } from '../js/instruments2.js';
import { EXAMPLES } from '../js/examples.js';
import { GUIDES } from '../js/guides.js';

let fails = 0, checks = 0;
const ok = (name, cond, extra = '') => { checks++; if (!cond) { fails++; console.log('FAIL', name, extra); } else console.log('ok  ', name); };
const Y = ['Y', 'PY'], N = ['N', 'PN'], NI = ['NI'], ANY = O5, YN = [...Y, ...N], YNI = [...Y, 'NI'], NNI = [...N, 'NI'];
const match = (row, vals) => row.every((set, i) => set === '*' || set.includes(vals[i]));
const table = (rows, vals) => { const hits = rows.filter(r => match(r[0], vals)); if (hits.length !== 1) return { err: `${hits.length} filas para ${vals}` }; return { j: hits[0][1] }; };
const combos = sets => sets.reduce((acc, s) => acc.flatMap(a => s.map(x => [...a, x])), [[]]);
const dom = (inst, meta, id) => inst.doms(meta).find(d => d.id === id);
const run = (d, ids, vals, meta = {}) => { const a = Object.fromEntries(ids.map((id, i) => [id, vals[i]])); return evalAssessment({ doms: () => [d], overall: () => ({ j: null, why: '' }) }, meta, { ans: a }).doms[0].sug; };
function exhaustive(name, d, ids, sets, oracle, meta) {
  let n = 0, bad = null; for (const vals of combos(sets)) { n++; const o = oracle(vals); const got = run(d, ids, vals, meta); if (o.err) { bad = o.err; break; } if (got !== o.j) { bad = `${vals} → ${got}, tabla = ${o.j}`; break; } }
  ok(`${name}: ${n} combinaciones coinciden con la tabla oficial`, !bad, bad);
}

const m0 = { effect: 'assign' };
// Tabla 4 (D1) más el criterio de la tabla 3 para secuencia no aleatoria con ocultamiento y sin desequilibrio
const T4 = [[[YNI, Y, NNI], 'low'], [[Y, Y, Y], 'some'], [[[...N, 'NI'], Y, Y], 'some'], [[N, Y, NNI], 'some'], [['*', NI, NNI], 'some'], [['*', NI, Y], 'high'], [['*', N, '*'], 'high']];
const T4x = T4.map(([r, j]) => [r.map(x => (x === '*' ? ANY : x)), j]);
exhaustive('RoB 2 D1', dom(ROB2, m0, 'D1'), ['1.1', '1.2', '1.3'], [ANY, ANY, ANY], v => table(T4x, v), m0);

// Tabla 6 (D2, efecto de la asignación): parte 1 + parte 2 y regla de combinación
const P1 = [[[N, N, '*', '*', '*'], 'low'], [['*', '*', N, '*', '*'], 'low'], [['*', '*', NI, '*', '*'], 'some'], [['*', '*', Y, N, '*'], 'some'], [['*', '*', Y, YNI, Y], 'some'], [['*', '*', Y, YNI, NNI], 'high']];
const part1 = v => { const aware = YNI.includes(v[0]) || YNI.includes(v[1]); if (!aware) return 'low'; const rows = P1.slice(1).map(([r, j]) => [r.map(x => (x === '*' ? ANY : x)), j]); const hit = rows.filter(r => match(r[0], v)); return hit.length === 1 ? hit[0][1] : `err${hit.length}`; };
const part2 = v => (Y.includes(v[5]) ? 'low' : N.includes(v[6]) ? 'some' : 'high');
const comb = (a, b) => (a === 'high' || b === 'high' ? 'high' : a === 'some' || b === 'some' ? 'some' : 'low');
exhaustive('RoB 2 D2 (asignación)', dom(ROB2, m0, 'D2'), ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'], [ANY, ANY, ANY, ANY, ANY, ANY, ANY], v => ({ j: comb(part1(v), part2(v)) }), m0);

// Tabla 8 (D2, efecto de adherirse)
const NAx = [...N, 'NA'], YNIx = [...Y, 'NI'];
const T8 = [[[N, N, ['NA'], NAx, NAx, ['NA']], 'low'], [[YNIx, '*', [...Y, 'NA'], NAx, NAx, ['NA']], 'low']];
const ad = v => { // v = [2.1, 2.2, 2.3, 2.4, 2.5, 2.6]
  const aware = YNI.includes(v[0]) || YNI.includes(v[1]);
  const p3 = aware && (NNI.includes(v[2])), p4 = YNIx.includes(v[3]), p5 = YNIx.includes(v[4]);
  if (!(p3 || p4 || p5)) return 'low'; return Y.includes(v[5]) ? 'some' : 'high';
};
let nAd = 0, badAd = null; const sets8 = [ANY, ANY, O5.concat('NA'), O5.concat('NA'), O5.concat('NA'), O5.concat('NA')];
for (const v of combos(sets8)) { nAd++; const a = Object.fromEntries(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'].map((id, i) => [id, v[i]])); const d = dom(ROB2, { effect: 'adhere' }, 'D2'); const got = evalAssessment({ doms: () => [d], overall: () => ({ j: null, why: '' }) }, {}, { ans: a }).doms[0].sug; const aware = YNI.includes(v[0]) || YNI.includes(v[1]); if (!aware && v[2] !== 'NA') { /* 2.3 no se pregunta si ambos N/PN */ } if (got !== ad(v)) { badAd = `${v} → ${got} vs ${ad(v)}`; break; } }
ok(`RoB 2 D2 (adherencia): ${nAd} combinaciones coinciden con la tabla 8 (reglas de las 13 filas)`, !badAd, badAd);
// las 13 filas de la tabla 8 se verifican de forma explícita
{ const rows = [
  [['N', 'N', 'NA', 'N', 'N', 'NA'], 'low'], [['Y', 'N', 'Y', 'N', 'N', 'NA'], 'low'], [['N', 'N', 'NA', 'Y', 'N', 'Y'], 'some'], [['N', 'N', 'NA', 'N', 'Y', 'Y'], 'some'], [['Y', 'N', 'Y', 'Y', 'N', 'Y'], 'some'], [['Y', 'N', 'Y', 'N', 'Y', 'Y'], 'some'], [['Y', 'N', 'N', 'Y', 'Y', 'Y'], 'some'],
  [['N', 'N', 'NA', 'Y', 'N', 'N'], 'high'], [['N', 'N', 'NA', 'N', 'NI', 'N'], 'high'], [['Y', 'N', 'Y', 'Y', 'N', 'NI'], 'high'], [['NI', 'N', 'NA', 'N', 'Y', 'N'], 'high'], [['Y', 'N', 'NI', 'N', 'N', 'N'], 'high']];
  const d = dom(ROB2, { effect: 'adhere' }, 'D2'); const bad = rows.filter(([v, j]) => evalAssessment({ doms: () => [d], overall: () => ({ j: null, why: '' }) }, {}, { ans: Object.fromEntries(['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'].map((id, i) => [id, v[i]])) }).doms[0].sug !== j);
  ok('RoB 2 D2 (adherencia): ejemplos de la tabla 8', !bad.length, JSON.stringify(bad)); }

// Tabla 10 (D3)
const T10 = [[[Y, '*', '*', '*'], 'low'], [[NNI, Y, '*', '*'], 'low'], [[NNI, N, N, '*'], 'low'], [[NNI, N, YNI, N], 'some'], [[NNI, N, YNI, YNI], 'high']];
exhaustive('RoB 2 D3', dom(ROB2, m0, 'D3'), ['3.1', '3.2', '3.3', '3.4'], [ANY, [...Y, ...N], ANY, ANY], v => { const hits = T10.filter(([r]) => r.every((s, i) => s === '*' || s.includes(v[i]))); return hits.length ? { j: hits[0][1] } : { err: 'sin fila' }; }, m0);
// 3.2 con NI: la tabla lo agrupa con N/PN solo en la guía de Excel; aquí no se ofrece como opción (Y/PY/PN/N)

// Tabla 12 (D4)
const T12 = [[[NNI, N, N, '*', '*'], 'low'], [[NNI, N, YNI, N, '*'], 'low'], [[NNI, N, YNI, YNI, N], 'some'], [[NNI, N, YNI, YNI, YNI], 'high'], [[NNI, NI, N, '*', '*'], 'some'], [[NNI, NI, YNI, N, '*'], 'some'], [[NNI, NI, YNI, YNI, N], 'some'], [[NNI, NI, YNI, YNI, YNI], 'high'], [[Y, '*', '*', '*', '*'], 'high'], [['*', Y, '*', '*', '*'], 'high']];
exhaustive('RoB 2 D4', dom(ROB2, m0, 'D4'), ['4.1', '4.2', '4.3', '4.4', '4.5'], [ANY, ANY, ANY, ANY, ANY], v => { const hits = T12.filter(([r]) => r.every((s, i) => s === '*' || s.includes(v[i]))); const hs = [...new Set(hits.map(h => h[1]))]; return hs.length === 1 ? { j: hs[0] } : { err: `${hits.length} filas ${hs}` }; }, m0);

// Tabla 14 (D5)
const T14 = [[[Y, N, N], 'low'], [[NNI, N, N], 'some'], [['*', N, NI], 'some'], [['*', NI, N], 'some'], [['*', NI, NI], 'some'], [['*', Y, '*'], 'high'], [['*', '*', Y], 'high']];
exhaustive('RoB 2 D5', dom(ROB2, m0, 'D5'), ['5.1', '5.2', '5.3'], [ANY, ANY, ANY], v => { const hits = T14.filter(([r]) => r.every((s, i) => s === '*' || s.includes(v[i]))); const hs = [...new Set(hits.map(h => h[1]))]; return hs.length === 1 ? { j: hs[0] } : { err: `${hits.length} filas ${hs}` }; }, m0);

// Tabla 1 (juicio global) y comportamiento «pendiente»
{ const o = ROB2.overall;
  ok('RoB 2 global: todo bajo → bajo', o(['low', 'low', 'low', 'low', 'low']).j === 'low');
  ok('RoB 2 global: algún «algunas preocupaciones» sin alto', o(['low', 'some', 'low', 'low', 'low']).j === 'some');
  ok('RoB 2 global: algún alto domina', o(['some', 'high', 'low', 'some', 'low']).j === 'high');
  ok('RoB 2 global: incompleto → sin juicio', o(['low', null, 'low', 'low', 'low']).j === null);
  const e = evalAssessment(ROB2, m0, { ans: { '1.2': 'N' } }); ok('RoB 2 D1 se resuelve con 1.2 = N sin más respuestas', e.doms[0].sug === 'high' && !e.doms[0].pending);
  const e2 = evalAssessment(ROB2, m0, { ans: { '1.2': 'Y' } }); ok('RoB 2 D1 queda pendiente si faltan 1.3/1.1', e2.doms[0].pending && e2.doms[0].sug === null);
  const e3 = evalAssessment(ROB2, m0, { ans: { '1.2': 'N' }, jud: { D1: { sel: 'some' } } }); ok('el juicio manual sustituye al propuesto', e3.doms[0].j === 'some' && e3.doms[0].sug === 'high'); }

// QUADAS-2: todo Sí → bajo; algún No → alto; otro caso → no claro; «No aplica» se ignora
{ const d = dom(QUADAS2, {}, 'D2'); const r = a => evalAssessment(QUADAS2, {}, { ans: a }).doms[1].sug;
  ok('QUADAS-2 todo Sí → bajo', r({ '2.1': 'Y', '2.2': 'Y' }) === 'low'); ok('QUADAS-2 algún No → alto', r({ '2.1': 'N', '2.2': 'NI' }) === 'high');
  ok('QUADAS-2 No claro sin No → no claro', r({ '2.1': 'Y', '2.2': 'NI' }) === 'unclear'); ok('QUADAS-2 umbral «No aplica» se ignora', r({ '2.1': 'Y', '2.2': 'NA' }) === 'low');
  ok('QUADAS-2 global', QUADAS2.overall(['low', 'unclear', 'low', 'low']).j === 'unclear' && QUADAS2.overall(['low', 'high', 'unclear', 'low']).j === 'high' && QUADAS2.overall(['low', 'low', 'low', 'low']).j === 'low'); }

// PROBAST
{ const base = Object.fromEntries(['1.1', '1.2'].map(k => [k, 'Y'])), r = (a, meta = {}) => evalAssessment(PROBAST, { stype: 'devval', ...meta }, { ans: a }).doms;
  ok('PROBAST D1 todo Sí → bajo', r(base)[0].sug === 'low'); ok('PROBAST D1 PN → alto', r({ '1.1': 'PN', '1.2': 'Y' })[0].sug === 'high'); ok('PROBAST D1 NI → no claro', r({ '1.1': 'NI', '1.2': 'PY' })[0].sug === 'unclear');
  const d4 = Object.fromEntries(['4.1', '4.3', '4.4', '4.6', '4.7'].map(k => [k, 'Y']));
  ok('PROBAST D4 en validación ignora 4.2, 4.5, 4.8, 4.9', r(d4, { stype: 'val' })[3].sug === 'low' && r(d4, { stype: 'val' })[3].total === 5);
  ok('PROBAST D4 en desarrollo exige 4.2, 4.5, 4.8, 4.9', r(d4, { stype: 'dev' })[3].pending === true);
  ok('PROBAST global: desarrollo sin validación externa y todo bajo → alto', PROBAST.overall(['low', 'low', 'low', 'low'], { stype: 'dev' }).j === 'high' && PROBAST.overall(['low', 'low', 'low', 'low'], { stype: 'dev', big: true }).j === 'low' && PROBAST.overall(['low', 'low', 'low', 'low'], { stype: 'devval' }).j === 'low');
  ok('PROBAST global: no claro / alto', PROBAST.overall(['low', 'unclear', 'low', 'low'], { stype: 'val' }).j === 'unclear' && PROBAST.overall(['low', 'unclear', 'high', 'low'], {}).j === 'high'); }

// ROBINS-I: sin algoritmo; global según el peor dominio
{ const o = ROBINS_I.overall; ok('ROBINS-I global: crítico > serio > sin info > moderado > bajo', o(['low', 'moderate', 'serious', 'critical', 'low', 'low', 'low']).j === 'critical' && o(['low', 'moderate', 'serious', 'ni', 'low', 'low', 'low']).j === 'serious' && o(['low', 'moderate', 'ni', 'low', 'low', 'low', 'low']).j === 'ni' && o(['low', 'moderate', 'low', 'low', 'low', 'low', 'low']).j === 'moderate' && o(Array(7).fill('low')).j === 'low');
  const e = evalAssessment(ROBINS_I, { effect: 'assign' }, { ans: { '1.1': 'N' }, jud: { D1: { sel: 'low' } } }); ok('ROBINS-I: el juicio es manual y 1.1 = N oculta el resto de D1', e.doms[0].j === 'low' && e.doms[0].total === 1);
  const e2 = evalAssessment(ROBINS_I, { effect: 'adhere' }, {}); ok('ROBINS-I: D4 cambia según el efecto de interés', e2.doms[3].name.includes('iniciar y adherirse')); }

// AMSTAR 2
{ const items = AMSTAR2.items, asm = (ans, chk) => ({ ans, chk });
  const all = { y: items.map(() => 'y'), };
  ok('AMSTAR 2: todo «sí» → confianza alta', amOverall(all.y).j === 'chigh');
  const w = (idx, v) => { const a = items.map(() => 'y'); idx.forEach(i => (a[i - 1] = v)); return a; };
  ok('AMSTAR 2: una debilidad no crítica → alta; dos → moderada', amOverall(w([1], 'n')).j === 'chigh' && amOverall(w([1, 3], 'n')).j === 'cmod');
  ok('AMSTAR 2: un fallo crítico → baja; dos → críticamente baja', amOverall(w([2], 'n')).j === 'clow' && amOverall(w([2, 4], 'n')).j === 'ccrit' && amOverall(w([2, 1, 3, 5], 'n')).j === 'clow');
  ok('AMSTAR 2: «sí parcial» no cuenta como debilidad', amOverall(w([2, 4, 7], 'py')).j === 'chigh');
  const i2 = items[1], c = k => Object.fromEntries([[2, k]]);
  ok('AMSTAR 2 ítem 2: criterios → no / parcial / sí', amItem(i2, {}, { chk: c(['py0', 'py1', 'py2']) }).j === 'n' && amItem(i2, {}, { chk: c(['py0', 'py1', 'py2', 'py3']) }).j === 'py' && amItem(i2, {}, { chk: c(['py0', 'py1', 'py2', 'py3', 'y0', 'y1', 'y2', 'y3']) }).j === 'y');
  const i9 = items[8]; ok('AMSTAR 2 ítem 9 (ECA y no aleatorios): se toma el peor', amItem(i9, { st: 'both' }, { chk: { '9r': ['py0', 'py1', 'y0', 'y1'], '9n': ['py0', 'py1'] } }).j === 'py' && amItem(i9, { st: 'rct' }, { chk: { '9r': ['py0', 'py1', 'y0', 'y1'] } }).j === 'y');
  ok('AMSTAR 2: ítems 11, 12 y 15 «no aplica» sin metaanálisis', [10, 11, 14].every(i => amItem(items[i], { ma: 'no' }, {}).j === 'na')); }

// Kappa de Cohen (sklearn.metrics.cohen_kappa_score) y kappa ponderado lineal
{ const a = ['low', 'low', 'some', 'high', 'some', 'low', 'high', 'some', 'low', 'high'], b = ['low', 'some', 'some', 'high', 'low', 'low', 'some', 'some', 'low', 'high'], pr = a.map((x, i) => [x, b[i]]), lv = ['low', 'some', 'high'];
  ok('kappa = sklearn (0.545454…)', Math.abs(kappa(pr, lv).kappa - 0.5454545454545454) < 1e-12); ok('kappa ponderado lineal = sklearn (0.651163…)', Math.abs(kappa(pr, lv, true).kappa - 0.6511627906976745) < 1e-12);
  ok('kappa 2×2 = 0.4', Math.abs(kappa([...Array(20).fill(['a', 'a']), ...Array(5).fill(['a', 'b']), ...Array(10).fill(['b', 'a']), ...Array(15).fill(['b', 'b'])], ['a', 'b']).kappa - 0.4) < 1e-12); }

// ROBINS-E: se enumeran las combinaciones y se comparan con los diagramas de flujo de la guía oficial (24 mar 2024), transcritos como tablas de caminos
{ const E = (meta, id) => ROBINS_E.doms(meta).find(d => d.id === id), runE = (d, ids, vals, meta) => evalAssessment({ doms: () => [d], overall: () => ({ j: null, why: '' }), levels: [] }, meta, { ans: Object.fromEntries(ids.map((id, i) => [id, vals[i]])) }).doms[0].sug;
  const YY = ['Y', 'PY'], NN = ['N', 'PN'], isy = v => YY.includes(v), isn = v => NN.includes(v);
  const sweep = (name, d, ids, oracle, meta, cap = 300000) => { const sets = d.items.map(it => it.opts); let n = 0, bad = null; const rec = (k, acc) => { if (bad || n >= cap) return; if (k === sets.length) { n++; const o = oracle(acc), g = runE(d, ids, acc, meta); if (g !== o) bad = `${acc} → ${g}, diagrama = ${o}`; return; } for (const v of sets[k]) rec(k + 1, [...acc, v]); }; rec(0, []); ok(`ROBINS-E ${name}: ${n} combinaciones coinciden con el diagrama oficial`, !bad, bad); };
  const mA = { b1: 'Y', c5: 'N' }, mB = { b1: 'Y', c5: 'Y', c6: 'N', c7: 'Y', c8: 'Y' };
  // D1 (a): caminos del diagrama 1
  sweep('D1 (a)', E(mA, 'D1'), ['1a.1', '1a.2', '1a.3', '1a.4'], ([q1, q2, q3, q4]) => {
    if (['SN', 'NI'].includes(q1)) return 'high';
    if (isy(q3)) return isy(q4) ? 'vhigh' : isy(q2) ? 'high' : 'vhigh';              // control de variables posteriores
    if (['SN', 'NI'].includes(q2)) return 'high';
    if (isy(q4)) return 'high';
    return isy(q1) && isy(q2) ? 'lowc' : 'some'; }, mA);
  // D1 (b)
  sweep('D1 (b)', E(mB, 'D1'), ['1b.1', '1b.2', '1b.3', '1b.4', '1b.5'], ([q1, q2, q3, q4, q5]) => {
    if (!isy(q1)) return isy(q4) ? 'vhigh' : isy(q5) ? 'vhigh' : 'high';
    if (['SN', 'NI'].includes(q2) || ['SN', 'NI'].includes(q3) || isy(q5)) return 'high';
    return isy(q2) && isy(q3) ? 'lowc' : 'some'; }, mB);
  // D2: tabla 3×3 de caminos con el recuadro de error diferencial
  const box = (q3, q4) => (q3 === 'SY' ? 'high' : isn(q3) ? (isn(q4) ? 'low' : q4 === 'SY' ? 'high' : 'some') : (q4 === 'SY' ? 'high' : 'some'));
  sweep('D2', E(mA, 'D2'), ['2.1', '2.2', '2.3', '2.4'], ([q1, q2, q3, q4]) => {
    const row = isy(q1) ? 0 : ['WN', 'NI'].includes(q1) ? 1 : 2, col = isn(q2) ? 0 : q2 === 'SY' ? 2 : 1, B = col ? box(q3, q4) : null;
    const T = [[() => 'low', b => b, b => ({ low: 'some', some: 'high', high: 'vhigh' }[b])], [() => 'some', b => (b === 'low' ? 'some' : 'high'), b => (b === 'low' ? 'high' : 'vhigh')], [() => 'high', b => (b === 'low' ? 'high' : 'vhigh'), () => 'vhigh']];
    return T[row][col](B); }, mA);
  // D3
  const selA = (q1, q2) => (isy(q1) ? 'low' : q1 === 'NI' ? 'some' : isn(q2) ? 'high' : 'some'), selB = (q3, q4, q5) => (isn(q3) ? 'low' : q3 === 'NI' ? 'some' : isn(q4) ? 'low' : q4 === 'NI' ? 'some' : isy(q5) ? 'high' : 'some');
  sweep('D3', E(mA, 'D3'), ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7'], ([q1, q2, q3, q4, q5, q6, q7]) => { const A = selA(q1, q2), B = selB(q3, q4, q5); if (A === 'low' && B === 'low') return 'low'; if (A !== 'high' && B !== 'high') return 'some'; if (isy(q6)) return 'some'; return isy(q7) ? 'some' : q7 === 'WN' ? 'high' : 'vhigh'; }, mA, 400000);
  // D4, D6, D7
  sweep('D4', E(mA, 'D4'), ['4.1', '4.2'], ([q1, q2]) => (isn(q1) ? 'low' : q1 === 'NI' ? 'some' : isy(q2) ? 'some' : 'high'), mA);
  sweep('D6', E(mA, 'D6'), ['6.1', '6.2', '6.3'], ([q1, q2, q3]) => { if (isy(q1)) return 'high'; if (isn(q1)) return isn(q2) ? 'low' : isn(q3) ? 'low' : q3 === 'SY' ? 'high' : 'some'; return isn(q2) ? 'some' : q3 === 'SY' ? 'high' : 'some'; }, mA);
  sweep('D7', E(mA, 'D7'), ['7.1', '7.2', '7.3', '7.4', '7.5'], ([q1, ...r]) => { if (isy(q1)) return 'low'; const n = r.filter(isy).length; return n > 2 ? 'vhigh' : n ? 'high' : r.includes('NI') ? 'some' : 'low'; }, mA);
  // D5: caminos del diagrama 5 (muestreo: más de 10 millones de combinaciones)
  sweep('D5', E(mA, 'D5'), ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10'], ([a, b, c, q4, q5, q6, q7, q8, q9, q10]) => {
    if ([a, b, c].every(isy)) return 'low'; const ev = hi => (isy(q10) ? 'some' : hi);
    if (isy(q4) || q4 === 'NI') return isn(q5) ? (q6 === 'SY' ? 'low' : isn(q6) ? 'high' : 'some') : q5 === 'SY' ? ev('vhigh') : ev('high');
    if (isy(q7)) return isy(q8) ? 'some' : q8 === 'SN' ? ev('vhigh') : ev('high');
    return isy(q9) ? 'some' : q9 === 'SN' ? ev('vhigh') : ev('high'); }, mA, 250000);
  // juicio global y detención en la sección B
  ok('ROBINS-E global: muy alto > alto > algunas preocupaciones > bajo (salvo confusión)', ROBINS_E.overall(['lowc', 'low', 'high', 'low', 'some', 'low', 'low'], mA).j === 'high' && ROBINS_E.overall(['lowc', 'low', 'high', 'low', 'vhigh', 'low', 'low'], mA).j === 'vhigh' && ROBINS_E.overall(['lowc', 'some', 'low', 'low', 'low', 'low', 'low'], mA).j === 'some' && ROBINS_E.overall(['lowc', 'low', 'low', 'low', 'low', 'low', 'low'], mA).j === 'lowc');
  ok('ROBINS-E: B3 = Sí o B2 = Sí detienen la evaluación (muy alto)', ROBINS_E.overall([], { ...mA, b3: 'Y' }).j === 'vhigh' && ROBINS_E.overall([], { ...mA, b1: 'N', b2: 'Y' }).j === 'vhigh' && ROBINS_E.overall(Array(7).fill(null), { ...mA, b1: 'Y', b2: 'Y' }).j === null);
  ok('ROBINS-E: las variantes del D1 y D2 cambian con C5–C8', E({ ...mA }, 'D1').items[0].id === '1a.1' && E(mB, 'D1').items[0].id === '1b.1' && E({ b1: 'Y', c5: 'Y', c6: 'Y' }, 'D2').name.includes('variante b') && E({ b1: 'Y', c5: 'Y', c6: 'N', c7: 'Y' }, 'D2').name.includes('variante c')); }
// NOS (umbrales AHRQ) y JBI (umbrales configurables)
{ const q = nosQuality; ok('NOS AHRQ: buena / regular / pobre', q(4, 2, 3) === 'qgood' && q(3, 1, 2) === 'qgood' && q(2, 1, 2) === 'qfair' && q(3, 1, 1) === 'qpoor' && q(3, 0, 3) === 'qpoor' && q(1, 2, 3) === 'qpoor' && q(2, 2, 3) === 'qfair' && q(4, 2, 1) === 'qpoor');
  const asm = (v, meta = {}) => evalAssessment(JBI, { cutInc: 70, cutExc: 50, ...meta }, { ans: Object.fromEntries([...v].map((x, i) => [`i${i + 1}`, x === 'x' ? 'na' : x])) });
  ok('JBI: umbrales 70 % / 50 % sobre ítems aplicables y «No aplica» fuera del denominador', asm('yyyyyyyyy').overall.sug === 'inc' && asm('yyyyyyynn').overall.sug === 'inc' && asm('yyyyynnnn').overall.sug === 'seek' && asm('yyynnnnnn').overall.sug === 'exc' && asm('yyyyyyyyx').overall.sug === 'inc' && asm('yyyyyynnx').summary.applicable === 8 && asm('yyyyyynnx').overall.sug === 'inc');
  ok('JBI: umbral configurable', asm('yyyyyynnn', { cutInc: 60 }).overall.sug === 'inc' && asm('yyyyyynnn', { cutInc: 80, cutExc: 70 }).overall.sug === 'exc');
  const sn = evalAssessment(NOS, {}, { ans: { S1: 'a', S2: 'a', S3: 'a', S4: 'a', C1: 'a', C2: 'b', O1: 'a', O2: 'a', O3: 'a' } }); ok('NOS: estrellas por categoría (4, 1, 3) y total 8', sn.stars.S === 4 && sn.stars.C === 1 && sn.stars.O === 3 && sn.stars.total === 8);
  const r1 = ROB1.overall; ok('RoB 1: alto > poco claro > bajo', r1(['low', 'high', 'unclear', 'low', 'low', 'low', 'low']).j === 'high' && r1(['low', 'unclear', 'low', 'low', 'low', 'low', 'low']).j === 'unclear' && r1(Array(7).fill('low')).j === 'low' && r1(['low', null, 'low', 'low', 'low', 'low', 'low']).j === null); }

// robvis: exportar e importar conserva los juicios
{ const p = newProject('rob2'); const ex = EXAMPLES.rob2[0].make(); p.studies = ex.studies; const csv = robvisCSV(p), rows = parseCSV(csv), back = fromRobvisRows(p, rows);
  ok('robvis CSV: cabecera Study,D1…D5,Overall,Weight', csv.split('\n')[0] === 'Study,D1,D2,D3,D4,D5,Overall,Weight');
  ok('robvis CSV: ida y vuelta conserva los juicios', back.studies.length === p.studies.length && back.bad.length === 0 && p.studies.every((s, i) => JSON.stringify(finalFor(s)) === JSON.stringify(finalFor(back.studies[i]))));
  function finalFor(s) { const e = evalAssessment(ROB2, s.meta, s.asm.A); return [e.doms.map(d => d.j), e.overall.j]; }
  const pe = newProject('robins-e'); pe.studies = EXAMPLES['robins-e'][0].make().studies; const ce = robvisCSV(pe).split('\n'); ok('robvis ROBINS-E: «Very high» se exporta y se vuelve a leer', ce.some(l => l.includes('Very high')) && fromRobvisRows(pe, parseCSV(robvisCSV(pe))).bad.length === 0); }

// ejemplos: todos completos y con el juicio global esperado
for (const [id, sets] of Object.entries(EXAMPLES)) for (const set of sets) { const ex = set.make(), I = ex.inst;
  const inc = ex.studies.filter(s => { const e = evalAssessment(I, s.meta, s.asm.A); return e.cells ? e.items.some(x => !x.j) || !e.overall.j : e.doms.some(d => !d.j) && !(I.stop && I.stop(s.meta)) || !e.overall.j; });
  ok(`ejemplo ${id}/${set.id}: ${ex.studies.length} estudios completos`, !inc.length, inc.map(s => s.name).join(', '));
  const bad = ex.studies.filter((s, i) => evalAssessment(I, s.meta, s.asm.A).overall.j !== ex.expect[i]); ok(`ejemplo ${id}/${set.id}: juicio global esperado`, !bad.length, bad.map(s => `${s.name}: ${evalAssessment(I, s.meta, s.asm.A).overall.j}`).join('; '));
  if (!I.kind) { const badD = []; ex.studies.forEach(s => evalAssessment(I, s.meta, s.asm.A).doms.forEach(d => { if (d.sel && d.sel !== d.sug && I.hasAlgo) badD.push(s.name + d.id); })); ok(`ejemplo ${id}/${set.id}: los juicios fijados coinciden con el algoritmo`, !badD.length, badD.join(',')); } }

// la guía cubre todos los dominios y niveles de cada instrumento
{ const cov = (I, key) => { const g = GUIDES[key]; if (Array.isArray(g)) return g.length === I.items.length; if (I.kind === 'nos') return I.items.every(it => Object.keys(g[it.id] || {}).length >= it.opts.length); return I.doms(Object.fromEntries(I.meta.filter(m => m.def != null).map(m => [m.id, m.def]))).every(d => (d.levels || I.levels).every(l => g[d.id]?.[l] || (l === 'low' && g[d.id]?.lowc)) || d.levels?.every(l => g[d.id]?.[l])); };
  for (const [id, key] of [['rob2', 'rob2'], ['robins-i', 'robins-i'], ['quadas2', 'quadas2'], ['probast', 'probast'], ['robins-e', 'robins-e'], ['rob1', 'rob1'], ['jbi-prev', 'jbi'], ['nos-cohort', 'nos'], ['amstar2', 'amstar2']]) ok(`guía de «${id}» cubre todos los dominios/ítems y niveles`, cov(INSTRUMENTS_BY_ID(id), key)); }
function INSTRUMENTS_BY_ID(id) { return EXAMPLES[id][0].make().inst; }

// concordancia con dos revisores simulados
{ const p = newProject('rob2'); p.twoRev = true; p.studies = EXAMPLES.rob2[0].make().studies; p.studies.forEach(s => (s.asm.B = JSON.parse(JSON.stringify(s.asm.A)))); const ag = agreement(p); ok('concordancia idéntica → kappa 1', ag.every(r => r.n === 0 || Math.abs(r.kappa - 1) < 1e-12 || isNaN(r.kappa)));
  const pn = newProject('nos-cohort'); pn.twoRev = true; pn.studies = EXAMPLES['nos-cohort'][0].make().studies; pn.studies.forEach(s => (s.asm.B = JSON.parse(JSON.stringify(s.asm.A)))); ok('concordancia con NOS y JBI no falla', agreement(pn).length === 4 && agreement({ ...pn, inst: 'jbi-prev', studies: EXAMPLES['jbi-prev'][0].make().studies.map(s => ({ ...s, asm: { A: s.asm.A, B: s.asm.A, C: {} } })) }).length === 10); }
// serialización
{ const p = newProject('quadas2'); p.studies = EXAMPLES.quadas2[0].make().studies; const q = parseProject(JSON.stringify(p)); ok('proyecto JSON: ida y vuelta', q.studies.length === p.studies.length && q.inst === 'quadas2'); }

console.log(fails ? `${fails} de ${checks} comprobaciones fallaron` : `${checks}/${checks} comprobaciones correctas`);
process.exit(fails ? 1 : 0);
