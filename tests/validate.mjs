// Validación de los algoritmos: se enumeran TODAS las combinaciones de respuestas de cada dominio de RoB 2 y se comparan con las tablas
// oficiales de la guía (Higgins et al., 22 ago 2019: tablas 1, 4, 6, 8, 10, 12 y 14) transcritas como filas independientes del código.
import { ROB2, ROBINS_I, QUADAS2, PROBAST, AMSTAR2, evalAssessment, amItem, amOverall, O5 } from '../js/instruments.js';
import { kappa, robvisCSV, fromRobvisRows, newProject, newStudy, agreement, parseProject } from '../js/store.js';
import { parseCSV } from '../js/io.js';
import { EXAMPLES } from '../js/examples.js';

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

// robvis: exportar e importar conserva los juicios
{ const p = newProject('rob2'); const ex = EXAMPLES.rob2(); p.studies = ex.studies; const csv = robvisCSV(p), rows = parseCSV(csv), back = fromRobvisRows(p, rows);
  ok('robvis CSV: cabecera Study,D1…D5,Overall,Weight', csv.split('\n')[0] === 'Study,D1,D2,D3,D4,D5,Overall,Weight');
  ok('robvis CSV: ida y vuelta conserva los juicios', back.studies.length === p.studies.length && back.bad.length === 0 && p.studies.every((s, i) => JSON.stringify(finalFor(p, s)) === JSON.stringify(finalFor({ ...p, twoRev: false }, back.studies[i]))));
  function finalFor(pp, s) { const e = evalAssessment(ROB2, s.meta, s.asm.A); return [e.doms.map(d => d.j), e.overall.j]; } }

// ejemplos: todos completos y con los juicios esperados
for (const [id, mk] of Object.entries(EXAMPLES)) { const ex = mk(); const inc = ex.studies.filter(s => { const e = evalAssessment(ex.inst, s.meta, s.asm.A); return ex.inst.kind === 'amstar' ? e.items.some(x => !x.j) : e.doms.some(d => !d.j) || !e.overall.j; });
  ok(`ejemplo ${id}: ${ex.studies.length} estudios completos`, !inc.length, inc.map(s => s.name).join(', '));
  if (ex.expect) { const bad = ex.studies.filter((s, i) => { const e = evalAssessment(ex.inst, s.meta, s.asm.A); const got = ex.inst.kind === 'amstar' ? e.overall.j : e.overall.j; return got !== ex.expect[i]; }); ok(`ejemplo ${id}: juicio global esperado`, !bad.length, bad.map(s => s.name).join(', ')); } }
// concordancia con dos revisores simulados
{ const p = newProject('rob2'); p.twoRev = true; const ex = EXAMPLES.rob2(); p.studies = ex.studies; p.studies.forEach(s => (s.asm.B = JSON.parse(JSON.stringify(s.asm.A)))); const ag = agreement(p); ok('concordancia idéntica → kappa 1', ag.every(r => r.n === 0 || Math.abs(r.kappa - 1) < 1e-12 || isNaN(r.kappa))); }
// serialización
{ const p = newProject('quadas2'); p.studies = EXAMPLES.quadas2().studies; const q = parseProject(JSON.stringify(p)); ok('proyecto JSON: ida y vuelta', q.studies.length === p.studies.length && q.inst === 'quadas2'); }

console.log(fails ? `${fails} de ${checks} comprobaciones fallaron` : `${checks}/${checks} comprobaciones correctas`);
process.exit(fails ? 1 : 0);
