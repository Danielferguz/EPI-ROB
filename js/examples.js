// Ejemplos didácticos con estudios FICTICIOS (no corresponden a publicaciones reales) para recorrer cada instrumento.
import { ROB2, ROBINS_I, QUADAS2, PROBAST, AMSTAR2 } from './instruments.js?v=2026.10.23-1';
import { newStudy } from './store.js?v=2026.10.23-1';

const R2 = {
  D1: { L: { '1.1': 'Y', '1.2': 'Y', '1.3': 'N' }, S: { '1.1': 'Y', '1.2': 'NI', '1.3': 'N' }, H: { '1.1': 'Y', '1.2': 'N', '1.3': 'N' } },
  D2: { L: { '2.1': 'N', '2.2': 'N', '2.6': 'Y' }, S: { '2.1': 'Y', '2.2': 'Y', '2.3': 'NI', '2.6': 'Y' }, H: { '2.1': 'Y', '2.2': 'Y', '2.3': 'Y', '2.4': 'Y', '2.5': 'N', '2.6': 'Y' } },
  D3: { L: { '3.1': 'Y' }, S: { '3.1': 'N', '3.2': 'N', '3.3': 'Y', '3.4': 'N' }, H: { '3.1': 'N', '3.2': 'N', '3.3': 'Y', '3.4': 'Y' } },
  D4: { L: { '4.1': 'N', '4.2': 'N', '4.3': 'N' }, S: { '4.1': 'N', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'N' }, H: { '4.1': 'N', '4.2': 'N', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y' } },
  D5: { L: { '5.1': 'Y', '5.2': 'N', '5.3': 'N' }, S: { '5.1': 'N', '5.2': 'N', '5.3': 'N' }, H: { '5.1': 'N', '5.2': 'Y', '5.3': 'N' } },
};
const by = (inst, name, ans, meta = {}, jud = {}) => { const s = newStudy(inst.id, name, meta); s.asm.A = { ans, jud }; return s; };
const rob2 = () => ({
  inst: ROB2, expect: ['low', 'some', 'high', 'some', 'high', 'some'],
  studies: [['Andrade 2021', 'LLLLL', 'RR 0,83 (IC 95 % 0,75–0,93), mortalidad a 28 días'], ['Benítez 2019', 'LSLSL', 'DM −1,2 puntos EVA a 8 semanas'], ['Castro 2020', 'HSLHS', 'OR 0,52, diarrea a 7 días'], ['Domínguez 2018', 'SLSLL', 'HR 0,91, primer evento'], ['Espinoza 2022', 'LLHLS', 'DM −4,1 mmHg a 12 semanas'], ['Fuentes 2017', 'SSSSS', 'RR 0,70, hospitalización a 6 meses']]
    .map(([n, code, res], i) => by(ROB2, `${n} (ejemplo ficticio)`, Object.assign({}, ...[...code].map((c, k) => R2[`D${k + 1}`][c])), { result: res, effect: 'assign' }, i === 4 ? { D1: { note: 'Sin ocultamiento descrito pero aleatorización central confirmada en el protocolo.' } } : {})),
});

const RL = { L: 'low', M: 'moderate', S: 'serious', C: 'critical', N: 'ni' };
const robinsi = () => ({
  inst: ROBINS_I, expect: ['moderate', 'serious', 'critical', 'ni', 'moderate'],
  studies: [['Gómez 2020', 'MLLLLLL'], ['Herrera 2019', 'SMLLMLM'], ['Ibáñez 2018', 'CSMMSMS'], ['Jiménez 2021', 'MNLLNML'], ['Klein 2022', 'MLLMLLM']].map(([n, code], i) => {
    const jud = Object.fromEntries([...code].map((c, k) => [`D${k + 1}`, { sel: RL[c] }]));
    const ans = i === 0 ? { '1.1': 'Y', '1.2': 'N', '1.4': 'Y', '1.5': 'PY', '1.6': 'N', '2.1': 'N', '2.4': 'Y', '3.1': 'Y', '3.2': 'Y', '3.3': 'N', '4.1': 'N', '5.1': 'Y', '5.2': 'N', '5.3': 'N', '6.1': 'PY', '6.2': 'Y', '6.3': 'Y', '6.4': 'N', '7.1': 'N', '7.2': 'N', '7.3': 'N' } : {};
    return by(ROBINS_I, `${n} (ejemplo ficticio)`, ans, { result: 'HR ajustado', effect: 'assign', conf: 'edad, sexo, comorbilidad' }, jud);
  }),
});

const qd = { L: [{ '1.1': 'Y', '1.2': 'Y', '1.3': 'Y' }, { '2.1': 'Y', '2.2': 'Y' }, { '3.1': 'Y', '3.2': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'Y' }], H: [{ '1.1': 'Y', '1.2': 'N', '1.3': 'Y' }, { '2.1': 'N', '2.2': 'NA' }, { '3.1': 'Y', '3.2': 'N' }, { '4.1': 'Y', '4.2': 'N', '4.3': 'Y', '4.4': 'Y' }], U: [{ '1.1': 'NI', '1.2': 'Y', '1.3': 'Y' }, { '2.1': 'Y', '2.2': 'NI' }, { '3.1': 'NI', '3.2': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'NI', '4.4': 'Y' }] };
const quadas2 = () => ({
  inst: QUADAS2, expect: ['low', 'high', 'unclear', 'high', 'unclear'],
  studies: [['Ortiz 2022', 'LLLL'], ['Chen 2020', 'HLLL'], ['Paredes 2023', 'LULL'], ['Quiroga 2019', 'LLHL'], ['Rojas 2021', 'LLUL']].map(([n, code]) => {
    const ans = Object.assign({}, ...[...code].map((c, k) => qd[c === 'U' || c === 'H' || c === 'L' ? c : 'L'][k])); const jud = Object.fromEntries([...code].map((c, k) => [`D${k + 1}`, k < 3 ? { app: c === 'H' ? 'conc_high' : 'conc_low' } : {}]).filter(([, v]) => v.app));
    return by(QUADAS2, `${n} (ejemplo ficticio)`, ans, { index: 'Prueba rápida', ref: 'PCR', target: 'Infección' }, jud);
  }),
});

const pd = { L: [{ '1.1': 'Y', '1.2': 'Y' }, { '2.1': 'Y', '2.2': 'Y', '2.3': 'Y' }, { '3.1': 'Y', '3.2': 'Y', '3.3': 'Y', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'Y', '4.5': 'Y', '4.6': 'Y', '4.7': 'Y', '4.8': 'Y', '4.9': 'Y' }],
  H: [{ '1.1': 'N', '1.2': 'Y' }, { '2.1': 'Y', '2.2': 'N', '2.3': 'Y' }, { '3.1': 'Y', '3.2': 'Y', '3.3': 'Y', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'PN', '4.2': 'N', '4.3': 'Y', '4.4': 'N', '4.5': 'N', '4.6': 'Y', '4.7': 'PN', '4.8': 'N', '4.9': 'Y' }],
  U: [{ '1.1': 'Y', '1.2': 'NI' }, { '2.1': 'Y', '2.2': 'Y', '2.3': 'NI' }, { '3.1': 'Y', '3.2': 'NI', '3.3': 'Y', '3.4': 'Y', '3.5': 'Y', '3.6': 'Y' }, { '4.1': 'Y', '4.2': 'Y', '4.3': 'Y', '4.4': 'NI', '4.5': 'Y', '4.6': 'Y', '4.7': 'Y', '4.8': 'Y', '4.9': 'Y' }] };
const probast = () => ({
  inst: PROBAST, expect: ['low', 'high', 'unclear', 'high', 'low'],
  studies: [['Salas 2021 (desarrollo y validación)', 'LLLL', 'devval'], ['Tapia 2019 (desarrollo)', 'LLLL', 'dev'], ['Urrutia 2022 (validación)', 'LULL', 'val'], ['Vera 2020 (desarrollo)', 'HLLH', 'devval'], ['Walker 2023 (validación)', 'LLLL', 'val']].map(([n, code, st]) => {
    const ans = Object.assign({}, ...[...code].map((c, k) => pd[c][k])); return by(PROBAST, `${n} (ejemplo ficticio)`, ans, { model: 'Puntaje de riesgo', outcome: 'Evento a 5 años', stype: st });
  }),
});

// 16 ítems: y / py / n para cada uno (los ítems con criterios generan las casillas marcadas)
const am = (name, r, meta) => {
  const s = newStudy('amstar2', name, meta), ans = {}, chk = {};
  AMSTAR2.items.forEach((it, i) => {
    const v = r[i]; if (it.yn) { ans[`i${it.n}`] = v === 'y' ? 'y' : 'n'; return; }
    const mk = sets => sets.flatMap(st => (v === 'y' || (v === 'py' && st.lvl === 'py') ? st.c.map(c => c[0]) : []));
    if (it.split) { if (meta.st !== 'nrsi' && it.setsR) chk[`${it.n}r`] = mk(it.setsR); if (meta.st !== 'rct') chk[`${it.n}n`] = mk(it.setsN); } else chk[it.n] = mk(it.sets);
  });
  s.asm.A = { ans, chk }; return s;
};
const Yx = 'y'.repeat(16).split(''), withv = (idx, v) => { const a = [...Yx]; idx.forEach(i => (a[i - 1] = v)); return a; };
const amstar2 = () => ({
  inst: AMSTAR2, expect: ['chigh', 'cmod', 'clow', 'ccrit', 'chigh'],
  studies: [am('Revisión A (ejemplo ficticio)', Yx, { st: 'rct', ma: 'yes' }), am('Revisión B (ejemplo ficticio)', withv([3, 5], 'n'), { st: 'both', ma: 'yes' }), am('Revisión C (ejemplo ficticio)', withv([2], 'n'), { st: 'rct', ma: 'yes' }), am('Revisión D (ejemplo ficticio)', withv([2, 4, 7], 'n'), { st: 'nrsi', ma: 'yes' }), am('Revisión E (ejemplo ficticio)', withv([10], 'n'), { st: 'rct', ma: 'no' })],
});
export const EXAMPLES = { rob2, 'robins-i': robinsi, quadas2, probast, amstar2 };
