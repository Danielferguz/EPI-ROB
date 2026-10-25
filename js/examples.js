// Ejemplos didácticos con estudios FICTICIOS (no corresponden a publicaciones reales). Cada instrumento tiene varios escenarios;
// el perfil de cada estudio (una letra por dominio) genera las respuestas, y el sustento de cada dominio se toma de la guía (guides.js).
import { ROB2, ROBINS_I, QUADAS2, PROBAST, AMSTAR2 } from './instruments.js?v=2026.10.25-1';
import { ROBINS_E, ROB1, JBI, NOS, JBI_ITEMS, NOS_ITEMS } from './instruments2.js?v=2026.10.25-1';
import { ROBINS_I2 } from './instruments3.js?v=2026.10.25-1';
import { newStudy } from './store.js?v=2026.10.25-1';
import { GUIDES } from './guides.js?v=2026.10.25-1';

const LVL = { rob2: { L: 'low', S: 'some', H: 'high' }, 'robins-i': { L: 'low', M: 'moderate', S: 'serious', C: 'critical', N: 'ni' }, quadas2: { L: 'low', H: 'high', U: 'unclear' }, probast: { L: 'low', H: 'high', U: 'unclear' }, 'robins-e': { L: 'low', S: 'some', H: 'high', V: 'vhigh' }, 'robins-i2': { L: 'low', M: 'moderate', S: 'serious', C: 'critical' }, rob1: { L: 'low', H: 'high', U: 'unclear' } };
const lowc = (key, k, c) => (key === 'robins-e' || key === 'robins-i2') && k === 0 && c === 'L';
const note = (guide, d, lv) => GUIDES[guide][d]?.[lv]?.e || '';
const fill = (inst, key, name, code, ans, meta = {}, extra = {}) => {
  const s = newStudy(inst.id, `${name} (ejemplo ficticio)`, meta), jud = {};
  [...code].forEach((c, k) => { const d = `D${k + 1}`, lv = LVL[key][c]; jud[d] = { note: note(key, d, lowc(key, k, c) ? 'lowc' : lv), ...(extra.sel ? { sel: lowc(key, k, c) ? 'lowc' : lv } : {}), ...(extra.app?.[k] ? { app: extra.app[k] } : {}) }; });
  s.asm.A = { ans, jud }; s.vignette = [...code].map((c, k) => `D${k + 1}: ${note(key, `D${k + 1}`, lowc(key, k, c) ? 'lowc' : LVL[key][c])}`).join(' ');
  return s;
};
const worst = (code, order) => order.find(l => [...code].some(c => c === l)) || order.at(-1);

// ---------------------------------------------------------------- RoB 2
const R2 = {
  D1: { L: { '1.1': 'Y', '1.2': 'Y', '1.3': 'N' }, S: { '1.1': 'Y', '1.2': 'NI', '1.3': 'N' }, H: { '1.1': 'Y', '1.2': 'N', '1.3': 'N' } },
  D2: { L: { '2.1': 'N', '2.2': 'N', '2.6': 'Y' }, S: { '2.1': 'Y', '2.2': 'Y', '2.3': 'NI', '2.6': 'Y' }, H: { '2.1': 'Y', '2.2': 'Y', '2.3': 'Y', '2.4': 'Y', '2.5': 'N', '2.6': 'Y' } },
  D3: { L: { '3.1': 'Y' }, S: { '3.1': 'N', '3.2': 'N', '3.3': 'Y', '3.4': 'N' }, H: { '3.1': 'N', '3.2': 'N', '3.3': 'Y', '3.4': 'Y' } },
  D4: { L: { '4.1': 'N', '4.2': 'N', '4.3': 'N' }, S: { '4.1': 'N', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'N' }, H: { '4.1': 'N', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y' } },
  D5: { L: { '5.1': 'Y', '5.2': 'N', '5.3': 'N' }, S: { '5.1': 'N', '5.2': 'N', '5.3': 'N' }, H: { '5.1': 'N', '5.2': 'Y', '5.3': 'N' } },
};
const ex = (id, title, desc, make) => ({ id, title, desc, make });
const rob2Set = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: ROB2, expect: list.map(([, c]) => ({ L: 'low', S: 'some', H: 'high' }[worst(c, ['H', 'S', 'L'])])), studies: list.map(([n, c, res]) => fill(ROB2, 'rob2', n, c, Object.assign({}, ...[...c].map((x, k) => R2[`D${k + 1}`][x])), { result: res, effect: 'assign' })) }));

// ---------------------------------------------------------------- ROBINS-I
const robinsISet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: ROBINS_I, expect: list.map(([, c]) => ({ C: 'critical', S: 'serious', N: 'ni', M: 'moderate', L: 'low' }[worst(c, ['C', 'S', 'N', 'M', 'L'])])), studies: list.map(([n, c, res]) => fill(ROBINS_I, 'robins-i', n, c, {}, { result: res, effect: 'assign', conf: 'edad, sexo, comorbilidad' }, { sel: true })) }));

// ---------------------------------------------------------------- QUADAS-2 y PROBAST
const qd = { L: [{ '1.1': 'Y', '1.2': 'Y', '1.3': 'Y' }, { '2.1': 'Y', '2.2': 'Y' }, { '3.1': 'Y', '3.2': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'Y' }], H: [{ '1.1': 'Y', '1.2': 'N', '1.3': 'Y' }, { '2.1': 'N', '2.2': 'NA' }, { '3.1': 'Y', '3.2': 'N' }, { '4.1': 'Y', '4.2': 'N', '4.3': 'Y', '4.4': 'Y' }], U: [{ '1.1': 'NI', '1.2': 'Y', '1.3': 'Y' }, { '2.1': 'Y', '2.2': 'NI' }, { '3.1': 'NI', '3.2': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'NI', '4.4': 'Y' }] };
const quadasSet = (id, title, desc, meta, list) => ex(id, title, desc, () => ({ inst: QUADAS2, expect: list.map(([, c]) => ({ H: 'high', U: 'unclear', L: 'low' }[worst(c, ['H', 'U', 'L'])])), studies: list.map(([n, c]) => fill(QUADAS2, 'quadas2', n, c, Object.assign({}, ...[...c].map((x, k) => qd[x][k])), meta, { app: [...c].map((x, k) => (k < 3 ? (x === 'H' ? 'conc_high' : x === 'U' ? 'conc_unclear' : 'conc_low') : null)) })) }));
const pd = { L: [{ '1.1': 'Y', '1.2': 'Y' }, { '2.1': 'Y', '2.2': 'Y', '2.3': 'Y' }, { '3.1': 'Y', '3.2': 'Y', '3.3': 'Y', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y', '4.6': 'Y', '4.7': 'Y', '4.8': 'Y', '4.9': 'Y' }],
  H: [{ '1.1': 'N', '1.2': 'Y' }, { '2.1': 'Y', '2.2': 'N', '2.3': 'Y' }, { '3.1': 'Y', '3.2': 'Y', '3.3': 'N', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'PN', '4.2': 'N', '4.3': 'Y', '4.4': 'N', '4.5': 'N', '4.6': 'Y', '4.7': 'PN', '4.8': 'N', '4.9': 'Y' }],
  U: [{ '1.1': 'Y', '1.2': 'NI' }, { '2.1': 'Y', '2.2': 'Y', '2.3': 'NI' }, { '3.1': 'Y', '3.2': 'NI', '3.3': 'Y', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'NI', '4.5': 'Y', '4.6': 'Y', '4.7': 'Y', '4.8': 'Y', '4.9': 'Y' }] };
const probastSet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: PROBAST, expect: list.map(([, c, st]) => { const w = worst(c, ['H', 'U', 'L']); return w === 'H' ? 'high' : w === 'U' ? 'unclear' : st === 'dev' ? 'high' : 'low'; }), studies: list.map(([n, c, st]) => fill(PROBAST, 'probast', n, c, Object.assign({}, ...[...c].map((x, k) => pd[x][k])), { model: 'Puntaje de riesgo', outcome: 'Evento a 5 años', stype: st }, { app: [...c].map((x, k) => (k < 3 ? (x === 'H' ? 'conc_high' : x === 'U' ? 'conc_unclear' : 'conc_low') : null)) })) }));

// ---------------------------------------------------------------- ROBINS-E
const RE = {
  D1: { L: { '1a.1': 'Y', '1a.2': 'Y', '1a.3': 'N', '1a.4': 'N' }, S: { '1a.1': 'WN', '1a.2': 'Y', '1a.3': 'N', '1a.4': 'N' }, H: { '1a.1': 'SN' }, V: { '1a.1': 'Y', '1a.2': 'PY', '1a.3': 'Y', '1a.4': 'Y' } },
  D2: { L: { '2.1': 'Y', '2.2': 'N' }, S: { '2.1': 'Y', '2.2': 'WY', '2.3': 'PN', '2.4': 'WY' }, H: { '2.1': 'SN', '2.2': 'N' }, V: { '2.1': 'SN', '2.2': 'SY' } },
  D3: { L: { '3.1': 'Y', '3.3': 'N' }, S: { '3.1': 'NI', '3.3': 'N' }, H: { '3.1': 'N', '3.2': 'N', '3.3': 'N', '3.6': 'N', '3.7': 'WN' }, V: { '3.1': 'N', '3.2': 'N', '3.3': 'N', '3.6': 'N', '3.7': 'SN' } },
  D4: { L: { '4.1': 'N' }, S: { '4.1': 'NI' }, H: { '4.1': 'Y', '4.2': 'N' }, V: { '4.1': 'Y', '4.2': 'N' } },
  D5: { L: { '5.1': 'Y', '5.2': 'Y', '5.3': 'Y' }, S: { '5.1': 'N', '5.2': 'Y', '5.3': 'Y', '5.4': 'Y', '5.5': 'N', '5.6': 'WY' }, H: { '5.1': 'N', '5.2': 'Y', '5.3': 'Y', '5.4': 'Y', '5.5': 'N', '5.6': 'N' }, V: { '5.1': 'N', '5.2': 'Y', '5.3': 'Y', '5.4': 'Y', '5.5': 'SY', '5.10': 'N' } },
  D6: { L: { '6.1': 'N', '6.2': 'N' }, S: { '6.1': 'N', '6.2': 'Y', '6.3': 'WY' }, H: { '6.1': 'Y' }, V: { '6.1': 'Y' } },
  D7: { L: { '7.1': 'Y' }, S: { '7.1': 'N', '7.2': 'N', '7.3': 'NI', '7.4': 'N', '7.5': 'N' }, H: { '7.1': 'N', '7.2': 'Y', '7.3': 'N', '7.4': 'N', '7.5': 'N' }, V: { '7.1': 'N', '7.2': 'Y', '7.3': 'Y', '7.4': 'Y', '7.5': 'N' } },
};
const robinsESet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: ROBINS_E, expect: list.map(([, c, meta]) => (meta?.b3 === 'Y' ? 'vhigh' : ({ V: 'vhigh', H: 'high', S: 'some', L: 'lowc' }[worst(c, ['V', 'H', 'S', 'L'])]))), studies: list.map(([n, c, meta]) => fill(ROBINS_E, 'robins-e', n, c, Object.assign({}, ...[...c].map((x, k) => RE[`D${k + 1}`][x])), { result: 'HR por incremento de exposición', exposure: 'Exposición ambiental modelada', confs: 'edad, sexo, tabaco, nivel socioeconómico', ...meta })) }));

// ---------------------------------------------------------------- ROBINS-I V2 (seis dominios; D1 depende de C4)
const RI2 = {
  D1a: { L: { '1a.1': 'Y', '1a.2': 'Y', '1a.3': 'N', '1a.4': 'N' }, M: { '1a.1': 'WN', '1a.2': 'Y', '1a.3': 'N', '1a.4': 'N' }, S: { '1a.1': 'SN', '1a.4': 'N' }, C: { '1a.1': 'SN', '1a.4': 'Y' } },
  D1b: { L: { '1b.1': 'Y', '1b.2': 'Y', '1b.3': 'Y', '1b.5': 'N' }, M: { '1b.1': 'Y', '1b.2': 'WN', '1b.3': 'Y', '1b.5': 'N' }, S: { '1b.1': 'N', '1b.4': 'N', '1b.5': 'N' }, C: { '1b.1': 'N', '1b.4': 'Y' } },
  D2: { L: { '2.1': 'Y', '2.4': 'N', '2.5': 'N' }, M: { '2.1': 'Y', '2.4': 'N', '2.5': 'Y' }, S: { '2.1': 'N', '2.2': 'N', '2.3': 'N', '2.4': 'N', '2.5': 'N' }, C: { '2.1': 'N', '2.2': 'N', '2.3': 'N', '2.4': 'SY' } },
  D3: { L: { '3.1': 'Y', '3.2': 'N', '3.3': 'N' }, M: { '3.1': 'WN', '3.3': 'N' }, S: { '3.1': 'SN', '3.3': 'N', '3.6': 'N', '3.7': 'N', '3.8': 'N' }, C: { '3.1': 'SN', '3.3': 'N', '3.6': 'N', '3.7': 'N', '3.8': 'Y' } },
  D4: { L: { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y' }, M: { '4.1': 'Y', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y', '4.6': 'Y', '4.11': 'N' }, S: { '4.1': 'Y', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y', '4.6': 'WN', '4.11': 'N' }, C: { '4.1': 'Y', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y', '4.6': 'SN', '4.11': 'N' } },
  D5: { L: { '5.1': 'N', '5.2': 'N' }, M: { '5.1': 'N', '5.2': 'Y', '5.3': 'WY' }, S: { '5.1': 'Y' } },
  D6: { L: { '6.1': 'Y' }, M: { '6.1': 'N', '6.2': 'N', '6.3': 'NI', '6.4': 'N' }, S: { '6.1': 'N', '6.2': 'Y', '6.3': 'N', '6.4': 'N' }, C: { '6.1': 'N', '6.2': 'Y', '6.3': 'Y', '6.4': 'N' } },
};
const robinsI2Set = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: ROBINS_I2, expect: list.map(([, c, , meta]) => (meta?.b3 === 'Y' ? 'critical' : { C: 'critical', S: 'serious', M: 'moderate', L: 'lowc' }[worst(c, ['C', 'S', 'M', 'L'])])), studies: list.map(([n, c, res, meta]) => fill(ROBINS_I2, 'robins-i2', n, c, Object.assign({}, ...[...c].map((x, k) => RI2[k === 0 ? (meta?.c4 === 'Y' ? 'D1b' : 'D1a') : `D${k + 1}`][x])), { result: res, cmp: 'intervención vs comparador', conf: 'edad, sexo, comorbilidad, gravedad basal', c4: 'N', b1: 'Y', b3: 'N', ...meta })) }));

// ---------------------------------------------------------------- RoB 1
const rob1Set = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: ROB1, expect: list.map(([, c]) => ({ H: 'high', U: 'unclear', L: 'low' }[worst(c, ['H', 'U', 'L'])])), studies: list.map(([n, c]) => fill(ROB1, 'rob1', n, c, {}, { note: 'Desenlace principal' }, { sel: true })) }));

// ---------------------------------------------------------------- JBI y NOS
const jbiSet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: JBI, expect: list.map(([, c]) => { const a = [...c].filter(x => x !== 'x'), p = 100 * a.filter(x => x === 'y').length / a.length; return p >= 70 ? 'inc' : p < 50 ? 'exc' : 'seek'; }), studies: list.map(([n, c, meta]) => { const s = newStudy(JBI.id, `${n} (ejemplo ficticio)`, meta), ans = {}, jud = {}; [...c].forEach((x, i) => { const v = x === 'x' ? 'na' : x; ans[`i${i + 1}`] = v; const g = GUIDES.jbi[i][v === 'na' ? 'y' : v]; if (v !== 'y' && v !== 'na') jud[`i${i + 1}`] = { note: g.e }; }); s.asm.A = { ans, jud }; return s; }) }));
const nosSet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: NOS, expect: list.map(l => l[3]), studies: list.map(([n, c, meta]) => { const s = newStudy(NOS.id, `${n} (ejemplo ficticio)`, meta), ans = {}, jud = {}; [...c].forEach((x, i) => { const it = NOS_ITEMS[i]; ans[it.id] = x; jud[it.id] = { note: GUIDES.nos[it.id][x]?.e || '' }; }); s.asm.A = { ans, jud }; return s; }) }));

// ---------------------------------------------------------------- AMSTAR 2
const am = (name, r, meta) => {
  const s = newStudy('amstar2', `${name} (ejemplo ficticio)`, meta), ans = {}, chk = {}, jud = {};
  AMSTAR2.items.forEach((it, i) => {
    const v = r[i]; if (v === 'n' || v === 'py') jud[`i${it.n}`] = { note: GUIDES.amstar2[i][v]?.e || '' };
    if (it.yn) { ans[`i${it.n}`] = v === 'y' ? 'y' : 'n'; return; }
    const mk = sets => sets.flatMap(st => (v === 'y' || (v === 'py' && st.lvl === 'py') ? st.c.map(c => c[0]) : []));
    if (it.split) { if (meta.st !== 'nrsi' && it.setsR) chk[`${it.n}r`] = mk(it.setsR); if (meta.st !== 'rct') chk[`${it.n}n`] = mk(it.setsN); } else chk[it.n] = mk(it.sets);
  });
  s.asm.A = { ans, chk, jud }; return s;
};
const Yx = 'y'.repeat(16).split(''), withv = (idx, v, base = Yx) => { const a = [...base]; idx.forEach(i => (a[i - 1] = v)); return a; };
const amSet = (id, title, desc, list) => ex(id, title, desc, () => ({ inst: AMSTAR2, expect: list.map(l => l[2]), studies: list.map(([n, r, , m]) => am(n, r, m)) }));

export const EXAMPLES = {
  rob2: [
    rob2Set('dexa', 'Dexametasona en neumonía grave', 'Cinco ensayos con distintos perfiles: del ensayo impecable al que combina ocultamiento ausente y análisis por protocolo.', [['Andrade 2021', 'LLLLL', 'RR 0,83 (IC 95 % 0,75–0,93), mortalidad a 28 días'], ['Benítez 2019', 'LSLSL', 'RR 0,90, mortalidad a 28 días'], ['Castro 2020', 'HSLHS', 'RR 0,60, mortalidad a 28 días'], ['Domínguez 2018', 'SLSLL', 'RR 0,95, mortalidad a 28 días'], ['Espinoza 2022', 'LLHLS', 'RR 0,78, mortalidad a 28 días']]),
    rob2Set('dolor', 'Intervenciones para el dolor lumbar', 'Desenlace autorreportado: el cegamiento y la selección del resultado pesan más. Ensayos abiertos.', [['Fuentes 2017', 'SSLHS', 'DM −1,2 puntos EVA a 8 semanas'], ['Gallardo 2020', 'LHLHH', 'DM −2,0 puntos EVA a 12 semanas'], ['Herrera 2022', 'LLLSL', 'DM −0,8 puntos EVA a 8 semanas'], ['Ibáñez 2016', 'SHSHS', 'DM −1,5 puntos EVA a 4 semanas']]),
    rob2Set('perdidas', 'Ensayos con pérdidas de seguimiento', 'Énfasis en el dominio 3: datos faltantes y su relación con el desenlace.', [['Jiménez 2019', 'LLLLL', 'HR 0,80, progresión a 2 años'], ['Klein 2018', 'LLHLL', 'HR 0,70, progresión a 2 años'], ['Luna 2021', 'LLSLL', 'HR 0,85, progresión a 2 años'], ['Mora 2020', 'SLHLS', 'HR 0,65, progresión a 2 años']]),
  ],
  'robins-i': [
    robinsISet('estatinas', 'Estatinas y demencia (cohortes)', 'Cuatro cohortes con juicios de dominio distintos; el global sale de la regla del instrumento.', [['Gómez 2020', 'MLLLLLL', 'HR 0,78'], ['Herrera 2019', 'SMLLMLM', 'HR 0,62'], ['Ibáñez 2018', 'CSMMSMS', 'HR 0,40'], ['Jiménez 2021', 'MNLLNML', 'HR 0,85']]),
    robinsISet('cirugia', 'Cirugía frente a tratamiento médico', 'Comparaciones no aleatorizadas donde la gravedad determina la intervención.', [['Klein 2017', 'SMMLMMM', 'OR 0,55'], ['Luna 2018', 'MLLMLLL', 'OR 0,70'], ['Mora 2019', 'CSSMMSM', 'OR 0,30']]),
  ],
  'robins-i2': [
    robinsI2Set('estatinas2', 'Estatinas y demencia (cohortes de nuevos usuarios)', 'Efecto de la asignación (por intención de tratar): del estudio con control impecable al que combina confusión grave y selección por usuarios prevalentes.', [['Gómez 2022', 'LLLLLL', 'HR 0,80 (IC 95 % 0,70–0,92)'], ['Herrera 2021', 'MLMLLM', 'HR 0,70 (IC 95 % 0,58–0,85)'], ['Ibáñez 2020', 'SMSMSM', 'HR 0,55 (IC 95 % 0,40–0,76)'], ['Jiménez 2019', 'CSSSSC', 'HR 0,30 (IC 95 % 0,18–0,50)']]),
    robinsI2Set('emulacion', 'Emulación de ensayo con efecto por protocolo', 'La variante B del dominio 1 exige métodos G para la confusión tiempo-dependiente (C4 = Sí).', [['Klein 2023', 'LLLLLL', 'HR 0,78', { c4: 'Y' }], ['Luna 2022', 'MLMLMM', 'HR 0,85', { c4: 'Y' }], ['Mora 2021', 'SLLMLL', 'HR 0,60', { c4: 'Y' }], ['Núñez 2020', 'CMSLLM', 'HR 0,45', { c4: 'Y' }]]),
    robinsI2Set('parteb', 'Parte B: cuando no hace falta seguir', 'Resultados sin ningún intento de control de la confusión o con un método de medida inapropiado: riesgo crítico directo.', [['Ortiz 2018', 'LLLLLL', 'HR 0,90'], ['Paz 2017', 'CMLLLL', 'RR 0,40 (sin ajustar)', { b1: 'N', b2: 'Y' }], ['Quispe 2016', 'LLLLSL', 'RR 0,70 (escala no validada)', { b3: 'Y' }]]),
  ],
  quadas2: [
    quadasSet('dimerod', 'Dímero D y trombosis venosa profunda', 'Estudios de exactitud diagnóstica en urgencias.', { index: 'Dímero D', ref: 'Ecografía venosa', target: 'TVP' }, [['Ortiz 2022', 'LLLL'], ['Chen 2020', 'HLLL'], ['Paredes 2023', 'LULL'], ['Quiroga 2019', 'LLHL'], ['Rojas 2021', 'ULUU']]),
    quadasSet('ia', 'Inteligencia artificial en radiografía de tórax', 'Casos y controles frente a cohortes prospectivas.', { index: 'Algoritmo de IA', ref: 'Lectura de consenso de radiólogos', target: 'Neumonía' }, [['Soto 2021', 'HHLL'], ['Torres 2022', 'LLLL'], ['Uribe 2020', 'LHUL'], ['Vega 2023', 'LLLH']]),
  ],
  probast: [
    probastSet('erc', 'Modelos de riesgo de enfermedad renal crónica', 'Desarrollo, desarrollo con validación y solo validación.', [['Salas 2021 (desarrollo y validación)', 'LLLL', 'devval'], ['Tapia 2019 (desarrollo)', 'LLLL', 'dev'], ['Urrutia 2022 (validación)', 'LULL', 'val'], ['Vera 2020 (desarrollo y validación)', 'HLLH', 'devval'], ['Walker 2023 (validación)', 'LLLL', 'val']]),
    probastSet('sepsis', 'Puntajes de sepsis', 'Predictores que no están disponibles en el momento de uso y desenlaces mal definidos.', [['Xu 2020 (desarrollo)', 'LHLH', 'dev'], ['Yáñez 2022 (validación)', 'LLUL', 'val'], ['Zapata 2021 (desarrollo y validación)', 'LLHL', 'devval']]),
  ],
  'robins-e': [
    robinsESet('pm25', 'PM2,5 y mortalidad (cohortes)', 'Exposición ambiental: confusión y medición de la exposición pesan más.', [['Aguirre 2019', 'LLLLLLL', {}], ['Bravo 2020', 'SSSLSLS', {}], ['Cortés 2018', 'HSHLHSH', {}], ['Duarte 2021', 'VHSLSLS', {}]]),
    robinsESet('solventes', 'Exposición ocupacional a solventes', 'Incluye un resultado que se detiene en la sección B (método de medida de la exposición inapropiado).', [['Escobar 2017', 'SVHLSLH', { b1: 'Y' }], ['Flores 2016', 'HHSLSSS', { b1: 'Y' }], ['Guerra 2015', 'LLLLLLL', { b3: 'Y' }]]),
  ],
  rob1: [
    rob1Set('acupuntura', 'Ensayos de acupuntura', 'Herramienta Cochrane original (2011): bajo, alto o poco claro.', [['Navarro 2012', 'LLLLLLL'], ['Ortega 2010', 'UUHHLLL'], ['Pizarro 2013', 'HHHHULL'], ['Quispe 2011', 'LULUULU']]),
    rob1Set('probioticos', 'Ensayos de probióticos en diarrea', 'Perfiles mixtos: el global lo decide el peor dominio clave.', [['Ramos 2012', 'LLLLUUL'], ['Sosa 2014', 'LLLLLLH'], ['Trujillo 2013', 'LLLLLLL']]),
  ],
  'jbi-prev': [
    jbiSet('hta', 'Prevalencia de hipertensión en adultos', 'Cuatro estudios: de una encuesta nacional a una muestra de conveniencia.', [['Vargas 2020', 'yyyyyyyyy'], ['Yupanqui 2019', 'ynyyuyyyn'], ['Zegarra 2018', 'nnnyuuynn'], ['Alvarado 2021', 'yyuyyyyyx']]),
    jbiSet('vih', 'Prevalencia de VIH por región', 'Cuestiones de cobertura y de tasa de respuesta.', [['Bernal 2017', 'yyyyyyyyy'], ['Cabrera 2019', 'ynyyyyynu'], ['Delgado 2022', 'yuyyuuyyy']]),
  ],
  'nos-cohort': [
    nosSet('tabaco', 'Tabaquismo y cáncer de pulmón (cohortes)', 'Cuatro cohortes: de una buena a una de calidad pobre según la regla AHRQ.', [['Espinosa 2015', 'aaaaaaaaa', { main: 'edad', follow: '10 años' }, 'qgood'], ['Figueroa 2012', 'bbcaabaab', { main: 'edad', follow: '10 años' }, 'qfair'], ['Gutiérrez 2010', 'cbcbbbcbd', { main: 'edad' }, 'qpoor'], ['Hidalgo 2018', 'abcaabaaa', { main: 'edad', follow: '5 años' }, 'qfair']]),
    nosSet('dieta', 'Dieta mediterránea y mortalidad', 'Cohortes poblacionales con distinta calidad de seguimiento.', [['Iglesias 2014', 'aabaaaaab', { main: 'edad y sexo' }, 'qgood'], ['Jara 2016', 'ccdabbdbc', { main: 'edad y sexo' }, 'qpoor'], ['Lara 2019', 'abcaabbab', { main: 'edad y sexo' }, 'qfair']]),
  ],
  amstar2: [
    amSet('estatinas', 'Revisiones de estatinas', 'De una revisión impecable a otra con tres fallos críticos.', [['Revisión A', Yx, 'chigh', { st: 'rct', ma: 'yes' }], ['Revisión B', withv([3, 5], 'n'), 'cmod', { st: 'both', ma: 'yes' }], ['Revisión C', withv([2], 'n'), 'clow', { st: 'rct', ma: 'yes' }], ['Revisión D', withv([2, 4, 7], 'n'), 'ccrit', { st: 'nrsi', ma: 'yes' }], ['Revisión E', withv([10], 'n'), 'chigh', { st: 'rct', ma: 'no' }]]),
    amSet('dieta', 'Revisiones sobre dieta y mortalidad', 'Revisiones con «Sí parcial» (no cuentan como debilidad) y sin metaanálisis.', [['Revisión F', withv([2, 4, 8, 9], 'py'), 'chigh', { st: 'both', ma: 'yes' }], ['Revisión G', withv([13], 'n', withv([2, 4], 'py')), 'clow', { st: 'nrsi', ma: 'no' }], ['Revisión H', withv([1, 3, 5, 6, 12], 'n'), 'cmod', { st: 'rct', ma: 'yes' }]]),
  ],
};
