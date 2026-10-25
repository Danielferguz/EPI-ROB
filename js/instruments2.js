// Instrumentos adicionales: ROBINS-E (2024), RoB 1 (Cochrane 2011), lista JBI de prevalencia y Newcastle-Ottawa (cohortes).
// Los algoritmos de ROBINS-E transcriben los diagramas de flujo de la guía oficial (versión 24 de marzo de 2024).
import { register, O5, isY, isN, J, Pending } from './instruments.js?v=2026.10.25-5';

const inn = (v, ...xs) => xs.includes(v), O4 = ['Y', 'PY', 'PN', 'N'], OW = ['Y', 'PY', 'WN', 'SN', 'NI'], OSW = ['SY', 'WY', 'PN', 'N', 'NI'];
const q = (id, n, text, opts, h, show) => ({ id, n, q: text, opts, h, show });
const T = { low: 'Bajo', lowc: 'Bajo (salvo confusión no controlada)', some: 'Algunas preocupaciones', high: 'Alto', vhigh: 'Muy alto' };
const out = (j, w) => J(j, `${w} → ${T[j]}.`);

// ------------------------------------------------------------------ ROBINS-E
const v1b = m => isY(m.c7) && isY(m.c8);
const v2 = m => (isY(m.c5) && isY(m.c6) ? 'b' : isY(m.c5) && isN(m.c6) && isY(m.c7) ? 'c' : 'a');
const box2 = g => { // recuadro «sesgo del efecto por error de medición» del dominio 2
  const d = g('2.3'); if (d === 'SY') return ['high', '2.3 = SY'];
  const n = g('2.4');
  if (isN(d)) return isN(n) ? ['low', '2.3 y 2.4 = N/PN'] : n === 'SY' ? ['high', '2.3 = N/PN y 2.4 = SY'] : ['some', '2.3 = N/PN y 2.4 = WY/SI'];
  return n === 'SY' ? ['high', '2.3 = WY/SI y 2.4 = SY'] : ['some', '2.3 = WY/SI y 2.4 ≠ SY'];
};
export const ROBINS_E = {
  id: 'robins-e', name: 'ROBINS-E', full: 'Risk Of Bias In Non-randomized Studies – of Exposures (2024)', design: 'Estudios de seguimiento (cohortes) sobre efectos de exposiciones ambientales, ocupacionales o de estilo de vida', unit: 'resultado',
  ref: 'Higgins JPT, Morgan RL, Rooney AA, et al. A tool to assess risk of bias in non-randomized follow-up studies of exposure effects (ROBINS-E). Environ Int 2024;186:108602.',
  levels: ['low', 'some', 'high', 'vhigh'], overallLevels: ['lowc', 'some', 'high', 'vhigh'], legend: ['low', 'lowc', 'some', 'high', 'vhigh'], robvis: 'ROBINS-E', hasAlgo: true,
  meta: [{ id: 'result', label: 'Resultado numérico evaluado', ph: 'p. ej., HR 1,12 por 10 µg/m³ de PM2,5' }, { id: 'exposure', label: 'Exposición y cómo se midió', ph: 'p. ej., PM2,5 residencial modelado' }, { id: 'confs', label: 'Confusores importantes (definidos antes)', ph: 'p. ej., edad, sexo, tabaco, nivel socioeconómico' },
    { id: 'b1', label: 'B1. ¿Los autores intentaron controlar la confusión?', type: 'choice', opts: [['Y', 'Sí'], ['PY', 'Probablemente sí'], ['PN', 'Probablemente no'], ['N', 'No']], def: 'Y' },
    { id: 'b2', label: 'B2. Si N/PN en B1: ¿hay tanto potencial de confusión que el resultado sin ajustar no debe considerarse?', type: 'choice', opts: [['PN', 'Probablemente no'], ['N', 'No'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N', show: m => isN(m.b1) },
    { id: 'b3', label: 'B3. ¿El método de medir la exposición fue inapropiado?', type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N' },
    { id: 'b4', label: 'B4. ¿El método de medir el desenlace fue inapropiado?', type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N' },
    { id: 'c5', label: 'C5. ¿Mediciones repetidas de la exposición contribuyeron al análisis?', type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N' },
    { id: 'c6', label: 'C6. ¿Se derivó una sola estimación de exposición por participante a partir de las repetidas?', type: 'choice', opts: [['Y', 'Sí'], ['PY', 'Probablemente sí'], ['PN', 'Probablemente no'], ['N', 'No']], def: 'Y', show: m => isY(m.c5) },
    { id: 'c7', label: 'C7. ¿El análisis dividió el seguimiento según el estado o magnitud de la exposición?', type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N', show: m => isY(m.c5) && isN(m.c6) },
    { id: 'c8', label: 'C8. ¿Los cambios de exposición se relacionaron probablemente con factores pronósticos del desenlace?', type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def: 'N', show: m => isY(m.c5) && isN(m.c6) && isY(m.c7) }],
  guide: 'ROBINS-E evalúa <b>un resultado</b> de un estudio de seguimiento y exige definir antes el efecto causal de interés (población, exposición, ventana de exposición, resumen en el tiempo) y los <b>confusores importantes</b>. Las preguntas B1–B4 pueden detener la evaluación (riesgo muy alto). El dominio 1 y el 2 tienen variantes según cómo se midió la exposición. Escala de cuatro niveles: bajo (en D1: «salvo confusión no controlada»), algunas preocupaciones, alto y muy alto.',
  stop: m => (isN(m.b1) && isY(m.b2) ? 'B2' : isY(m.b3) ? 'B3' : isY(m.b4) ? 'B4' : null),
  doms(meta) {
    const b1v = v1b(meta), v2v = v2(meta);
    const d1 = b1v ? { id: 'D1', short: 'D1', name: 'Confusión (variante b: confusión basal y tiempo-dependiente)', levels: ['lowc', 'some', 'high', 'vhigh'], items: [
      q('1b.1', '1.1', '¿El método de análisis fue apropiado para controlar la confusión tiempo-dependiente además de la basal?', O5, 'Apropiados: ponderación por probabilidad inversa, g-fórmula, modelos estructurales marginales. La regresión con confusores actualizados puede sesgar si estos son afectados por la exposición previa.'),
      q('1b.2', '1.2', 'Si S/PS a 1.1: ¿se controlaron todos los factores de confusión basales y tiempo-dependientes importantes?', OW, 'WN: faltó alguno pero la confusión no controlada probablemente no es sustancial. SN: probablemente sustancial.', a => isY(a['1b.1'])),
      q('1b.3', '1.3', 'Si S/PS/WN a 1.2: ¿los factores controlados se midieron de forma válida y fiable?', ['Y', 'PY', 'WN', 'SN', 'NI'], 'Valide con qué variable se aproximó cada confusor y cuánto error de medición hay.', a => inn(a['1b.2'], 'Y', 'PY', 'WN')),
      q('1b.4', '1.4', 'Si N/PN/SI a 1.1: ¿se controlaron factores tiempo-dependientes u otras variables medidas después del inicio de la ventana de exposición?', O5, 'Ajustar por variables posteriores (mediadores o colisionadores) sesga.', a => !isY(a['1b.1']) && !!a['1b.1']),
      q('1b.5', '1.5', '¿Los controles negativos u otras consideraciones sugieren confusión no controlada?', O4, 'Un control negativo es una exposición o desenlace alternativo donde no debería haber asociación; si aparece, hay confusión.')],
      algo(g) {
        if (!isY(g('1b.1'))) return isY(g('1b.4')) ? out('vhigh', 'Método inapropiado y ajuste por variables posteriores (1.4 = S/PS)') : isY(g('1b.5')) ? out('vhigh', 'Método inapropiado y controles negativos sugieren confusión (1.5 = S/PS)') : out('high', 'Método inapropiado para confusión tiempo-dependiente (1.1 = N/PN/SI)');
        const a = g('1b.2'); if (inn(a, 'SN', 'NI')) return out('high', 'Confusores importantes sin controlar (1.2 = SN/SI)');
        const b = g('1b.3'); if (inn(b, 'SN', 'NI')) return out('high', 'Confusores medidos con error sustancial (1.3 = SN/SI)');
        if (isY(g('1b.5'))) return out('high', 'Controles negativos sugieren confusión no controlada (1.5 = S/PS)');
        return isY(a) && isY(b) ? out('lowc', 'Control completo y bien medido, sin señales de confusión') : out('some', 'Control incompleto o con error no sustancial (WN en 1.2 o 1.3)');
      } } : { id: 'D1', short: 'D1', name: 'Confusión (variante a: confusión basal)', levels: ['lowc', 'some', 'high', 'vhigh'], items: [
      q('1a.1', '1.1', '¿Los autores controlaron todos los factores de confusión importantes para los que era necesario?', OW, 'Compare con los confusores definidos antes (sección E). WN: faltó alguno pero la confusión residual probablemente no es sustancial; SN: probablemente sustancial.'),
      q('1a.2', '1.2', 'Si S/PS/WN a 1.1: ¿los factores controlados se midieron de forma válida y fiable con las variables disponibles?', OW, 'Valide qué variable representó cada confusor y cuánto error de medición hay.', a => inn(a['1a.1'], 'Y', 'PY', 'WN')),
      q('1a.3', '1.3', 'Si S/PS/WN a 1.1: ¿se controló por variables posteriores al inicio de la exposición que pudieron ser afectadas por ella?', O5, 'Ajustar por mediadores o colisionadores introduce sesgo.', a => inn(a['1a.1'], 'Y', 'PY', 'WN')),
      q('1a.4', '1.4', '¿Los controles negativos u otras consideraciones sugieren confusión no controlada seria?', O4, 'Si un control negativo muestra la misma asociación, hay confusión.')],
      algo(g) {
        const a = g('1a.1'); if (inn(a, 'SN', 'NI')) return out('high', 'Confusores importantes sin controlar (1.1 = SN/SI)');
        if (isY(g('1a.3'))) { if (isY(g('1a.4'))) return out('vhigh', 'Ajuste por variables post-exposición (1.3) y controles negativos con confusión seria (1.4)'); return isY(g('1a.2')) ? out('high', 'Ajuste por variables afectadas por la exposición (1.3 = S/PS), confusores bien medidos') : out('vhigh', 'Ajuste por variables post-exposición y confusores mal medidos'); }
        const b = g('1a.2'); if (inn(b, 'SN', 'NI')) return out('high', 'Confusores medidos con error sustancial (1.2 = SN/SI)');
        const n = g('1a.4'); if (isY(n)) return out('high', 'Controles negativos sugieren confusión seria (1.4 = S/PS)');
        return isY(a) && isY(b) ? out('lowc', 'Control completo y bien medido, sin señales de confusión') : out('some', 'Control incompleto o medición imperfecta no sustancial (WN)');
      } };
    const lab = { a: 'exposición en un único momento', b: 'varias mediciones resumidas en una', c: 'seguimiento dividido según la exposición' }[v2v];
    const d2 = { id: 'D2', short: 'D2', name: `Medición de la exposición (variante ${v2v}: ${lab})`, items: [
      q('2.1', '2.1', '¿La exposición medida caracteriza bien la métrica de exposición de interés (D2–D4)?', OW, 'Valore número y frecuencia de mediciones, ventana de exposición y cómo se resumieron.'),
      q('2.2', '2.2', '¿Hubo error de medición o mala clasificación de la exposición?', OSW, 'SY: probablemente sustancial; WY: presente pero probablemente no sustancial.'),
      q('2.3', '2.3', 'Si SY/WY a 2.2: ¿el error pudo ser diferencial (relacionado con el desenlace o su riesgo)?', ['SY', 'WY', 'PN', 'N', 'NI'], 'Más probable en estudios transversales o de casos y controles (sesgo de recuerdo).', a => inn(a['2.2'], 'SY', 'WY')),
      q('2.4', '2.4', 'Si SY/WY a 2.2 y N/PN/WY a 2.3: ¿es probable que el error no diferencial sesgue el efecto estimado?', ['SY', 'WY', 'PN', 'N', 'NI'], 'El error clásico suele sesgar hacia el nulo; el error tipo Berkson casi no sesga.', a => inn(a['2.2'], 'SY', 'WY') && inn(a['2.3'], 'N', 'PN', 'WY'))],
      algo(g) {
        const q1 = g('2.1'), q2 = g('2.2'); let b, w;
        if (isN(q2)) { if (isY(q1)) return out('low', 'Exposición bien caracterizada y sin error relevante'); if (inn(q1, 'WN', 'NI')) return out('some', 'Caracterización imperfecta (2.1 = WN/SI) sin error de medición'); return out('high', 'La medición no representa la exposición de interés (2.1 = SN)'); }
        if (q1 === 'SN' && q2 === 'SY') return out('vhigh', 'Exposición mal caracterizada (2.1 = SN) y error sustancial (2.2 = SY)');
        [b, w] = box2(g);
        if (isY(q1)) return q2 === 'SY' ? out({ low: 'some', some: 'high', high: 'vhigh' }[b], `Exposición bien caracterizada, error sustancial; recuadro ${w}`) : out(b, `Exposición bien caracterizada, error menor; recuadro ${w}`);
        if (inn(q1, 'WN', 'NI')) return q2 === 'SY' ? out(b === 'low' ? 'high' : 'vhigh', `Caracterización imperfecta y error sustancial; recuadro ${w}`) : out(b === 'low' ? 'some' : 'high', `Caracterización imperfecta y error menor; recuadro ${w}`);
        return out(b === 'low' ? 'high' : 'vhigh', `Exposición mal caracterizada con error; recuadro ${w}`);
      } };
    const d3 = { id: 'D3', short: 'D3', name: 'Selección de participantes', items: [
      q('3.1', '3.1', '¿El seguimiento comenzó en (o cerca de) el inicio de la ventana de exposición para la mayoría?', O5, 'Si no, hay riesgo de sesgo de tiempo inmortal o de prevalentes.'),
      q('3.2', '3.2', 'Si N/PN a 3.1: ¿el efecto de la exposición es probablemente constante durante el seguimiento analizado?', O5, 'Si el efecto cambia con el tiempo, comenzar tarde sesga.', a => isN(a['3.1'])),
      q('3.3', '3.3', '¿La selección en el estudio (o en el análisis) se basó en características observadas después del inicio de la ventana?', O5, 'Ejemplo: incluir solo a quienes sobreviven o siguen expuestos un tiempo.'),
      q('3.4', '3.4', 'Si S/PS a 3.3: ¿esas características probablemente fueron influidas por la exposición o una causa de ella?', O5, '', a => isY(a['3.3'])),
      q('3.5', '3.5', 'Si S/PS a 3.4: ¿esas características probablemente fueron influidas por el desenlace o una causa de él?', O5, '', a => isY(a['3.3']) && isY(a['3.4'])),
      q('3.6', '3.6', 'Si hay riesgo alto en la selección: ¿es probable que el análisis corrigiera todos los sesgos de selección?', O5, 'Ponderación por probabilidad inversa de selección u otros métodos.', a => selHigh(a)),
      q('3.7', '3.7', 'Si N/PN/SI a 3.6: ¿los análisis de sensibilidad mostraron impacto mínimo?', ['Y', 'PY', 'WN', 'SN'], 'WN: no hubo análisis de sensibilidad o muestran algún impacto; SN: impacto sustancial.', a => selHigh(a) && !isY(a['3.6']) && !!a['3.6'])],
      algo(g) {
        let A, B; const q1 = g('3.1');
        if (isY(q1)) A = 'low'; else if (q1 === 'NI') A = 'some'; else A = isN(g('3.2')) ? 'high' : 'some';
        const q3 = g('3.3');
        if (isN(q3)) B = 'low'; else if (q3 === 'NI') B = 'some'; else { const q4 = g('3.4'); if (isN(q4)) B = 'low'; else if (q4 === 'NI') B = 'some'; else B = isY(g('3.5')) ? 'high' : 'some'; }
        const why = `Parte A (inicio del seguimiento): ${T[A]}; parte B (selección tras el inicio): ${T[B]}`;
        if (A === 'low' && B === 'low') return out('low', why);
        if (A !== 'high' && B !== 'high') return out('some', why);
        if (isY(g('3.6'))) return out('some', `${why}; el análisis corrigió los sesgos (3.6 = S/PS)`);
        const s = g('3.7'); return isY(s) ? out('some', `${why}; sensibilidad con impacto mínimo`) : s === 'WN' ? out('high', `${why}; sin corrección ni evidencia de impacto mínimo (3.7 = WN)`) : out('vhigh', `${why}; impacto sustancial (3.7 = SN)`);
      } };
    const d4 = { id: 'D4', short: 'D4', name: 'Intervenciones posteriores a la exposición', levels: ['low', 'some', 'high'], items: [
      q('4.1', '4.1', '¿Hubo intervenciones posteriores a la exposición, influidas por la exposición previa, durante el seguimiento?', O5, 'Ejemplo: los más expuestos al asbesto recibieron más TAC, lo que redujo la mortalidad por cáncer de pulmón.'),
      q('4.2', '4.2', 'Si S/PS a 4.1: ¿es probable que el análisis corrigiera el efecto de esas intervenciones?', O5, 'Posible censurando al momento de la intervención con ponderación por probabilidad inversa de censura.', a => isY(a['4.1']))],
      algo(g) { const a = g('4.1'); if (isN(a)) return out('low', 'Sin intervenciones posteriores influidas por la exposición'); if (a === 'NI') return out('some', 'Sin información sobre intervenciones posteriores'); return isY(g('4.2')) ? out('some', 'Hubo intervenciones y el análisis las corrigió') : out('high', 'Hubo intervenciones sin corregir (4.2 = N/PN/SI)'); } };
    const miss = a => ['5.1', '5.2', '5.3'].some(k => isN(a[k]) || a[k] === 'NI');
    const d5 = { id: 'D5', short: 'D5', name: 'Datos faltantes', items: [
      q('5.1', '5.1', '¿Se dispuso de datos completos de la exposición para todos o casi todos?', O5, '«Casi todos»: los excluidos son tan pocos que no cambiarían el efecto de forma importante.'),
      q('5.2', '5.2', '¿Se dispuso de datos completos del desenlace para todos o casi todos?', O5, ''),
      q('5.3', '5.3', '¿Se dispuso de datos completos de los confusores para todos o casi todos?', O5, 'Los modelos ajustados excluyen en silencio a quienes no tienen todos los confusores.'),
      q('5.4', '5.4', 'Si N/PN/SI a 5.1–5.3: ¿el resultado se basa en un análisis de casos completos?', O5, '', a => miss(a)),
      q('5.5', '5.5', 'Si S/PS/SI a 5.4: ¿la exclusión por datos faltantes probablemente se relacionó con el valor real del desenlace?', OSW, '', a => miss(a) && (isY(a['5.4']) || a['5.4'] === 'NI')),
      q('5.6', '5.6', 'Si N/PN a 5.5: ¿se incluyeron en el modelo todos o la mayoría de los predictores de la falta de datos?', OSW, '', a => miss(a) && (isY(a['5.4']) || a['5.4'] === 'NI') && isN(a['5.5'])),
      q('5.7', '5.7', 'Si N/PN a 5.4: ¿el análisis se basó en imputar los valores faltantes?', ['Y', 'PY', 'PN', 'N'], '', a => miss(a) && isN(a['5.4'])),
      q('5.8', '5.8', 'Si S/PS a 5.7: ¿la imputación fue apropiada?', ['Y', 'PY', 'WN', 'SN', 'NI'], 'Imputación múltiple con MAR plausible y todos los predictores de la falta de datos y variables del análisis.', a => miss(a) && isN(a['5.4']) && isY(a['5.7'])),
      q('5.9', '5.9', 'Si N/PN a 5.7: ¿se usó un método alternativo apropiado para corregir el sesgo por datos faltantes?', ['Y', 'PY', 'WN', 'SN', 'NI'], 'Ponderación por probabilidad inversa, máxima verosimilitud completa, etc.', a => miss(a) && isN(a['5.4']) && isN(a['5.7'])),
      q('5.10', '5.10', '¿Hay evidencia de que el resultado no está sesgado por los datos faltantes?', ['Y', 'PY', 'PN', 'N'], 'Análisis de sensibilidad con supuestos plausibles de datos no ignorables.', a => miss(a))],
      algo(g, a) {
        if (['5.1', '5.2', '5.3'].map(g).every(isY)) return out('low', 'Datos completos de exposición, desenlace y confusores');
        const cc = g('5.4'), ev = (hi, why) => (isY(g('5.10')) ? out('some', `${why}; evidencia de que no hay sesgo (5.10 = S/PS)`) : out(hi, `${why}; sin evidencia de ausencia de sesgo (5.10 = N/PN)`));
        if (isY(cc) || cc === 'NI') {
          const x = g('5.5');
          if (isN(x)) { const p = g('5.6'); return p === 'SY' ? out('low', 'Casos completos; exclusión no relacionada con el desenlace y predictores de la falta de datos incluidos') : isN(p) ? out('high', 'Casos completos sin incluir los predictores de la falta de datos (5.6 = N/PN)') : out('some', 'Casos completos con predictores mayormente incluidos (5.6 = WY/SI)'); }
          return x === 'SY' ? ev('vhigh', 'Exclusión fuertemente relacionada con el desenlace (5.5 = SY)') : ev('high', 'Exclusión relacionada con el desenlace (5.5 = WY/SI)');
        }
        if (isY(g('5.7'))) { const m = g('5.8'); return isY(m) ? out('some', 'Imputación apropiada') : m === 'SN' ? ev('vhigh', 'Imputación inapropiada con sesgo no reducido (5.8 = SN)') : ev('high', 'Imputación imperfecta (5.8 = WN/SI)'); }
        const m = g('5.9'); return isY(m) ? out('some', 'Método alternativo apropiado') : m === 'SN' ? ev('vhigh', 'Método alternativo inapropiado (5.9 = SN)') : ev('high', 'Método alternativo imperfecto (5.9 = WN/SI)');
      } };
    const d6 = { id: 'D6', short: 'D6', name: 'Medición del desenlace', levels: ['low', 'some', 'high'], items: [
      q('6.1', '6.1', '¿La medición o verificación del desenlace pudo diferir entre grupos o niveles de exposición?', O5, 'Métodos comparables: mismos instrumentos, umbrales y tiempos sin importar la exposición.'),
      q('6.2', '6.2', '¿Los evaluadores del desenlace conocían la historia de exposición?', O5, 'En desenlaces autorreportados el evaluador es el participante.', a => !isY(a['6.1'])),
      q('6.3', '6.3', 'Si S/PS/SI a 6.2: ¿la evaluación pudo estar influida por ese conocimiento?', ['SY', 'WY', 'PN', 'N', 'NI'], 'Más probable en desenlaces subjetivos.', a => !isY(a['6.1']) && !isN(a['6.2']) && !!a['6.2'])],
      algo(g) {
        const a = g('6.1'); if (isY(a)) return out('high', 'La medición difirió entre niveles de exposición (6.1 = S/PS)');
        const b = g('6.2');
        if (isN(a)) { if (isN(b)) return out('low', 'Medición comparable y evaluadores sin conocer la exposición'); const c = g('6.3'); return isN(c) ? out('low', 'Medición comparable; no podía influirse (6.3 = N/PN)') : c === 'SY' ? out('high', 'Es probable que el conocimiento influyera (6.3 = SY)') : out('some', 'Pudo influir en pequeña medida (6.3 = WY/SI)'); }
        if (isN(b)) return out('some', '6.1 = SI; evaluadores sin conocer la exposición');
        return g('6.3') === 'SY' ? out('high', '6.1 = SI y probable influencia del conocimiento (6.3 = SY)') : out('some', '6.1 = SI; influencia no probable');
      } };
    const d7 = { id: 'D7', short: 'D7', name: 'Selección del resultado reportado', items: [
      q('7.1', '7.1', '¿El resultado se reportó según un plan de análisis predeterminado y disponible?', O5, 'Rara vez disponible fuera de ensayos: lo habitual es N/PN.'),
      q('7.2', '7.2', 'Si N/PN/SI a 7.1: ¿el resultado fue probablemente seleccionado, por su magnitud o significación, entre múltiples mediciones de la exposición?', O5, '', a => !isY(a['7.1']) && !!a['7.1']),
      q('7.3', '7.3', '¿… entre múltiples mediciones del desenlace?', O5, '', a => !isY(a['7.1']) && !!a['7.1']), q('7.4', '7.4', '¿… entre múltiples análisis de la relación exposición–desenlace?', O5, '', a => !isY(a['7.1']) && !!a['7.1']), q('7.5', '7.5', '¿… entre diferentes subgrupos?', O5, '', a => !isY(a['7.1']) && !!a['7.1'])],
      algo(g) {
        if (isY(g('7.1'))) return out('low', 'Resultado reportado según un plan predeterminado');
        const r = ['7.2', '7.3', '7.4', '7.5'].map(g), n = r.filter(isY).length;
        return n > 2 ? out('vhigh', `Más de dos fuentes de selección probables (${n})`) : n >= 1 ? out('high', `Una o dos fuentes de selección probables (${n})`) : r.includes('NI') ? out('some', 'Al menos un «sin información» y ningún S/PS') : out('low', 'Todas N/PN');
      } };
    return [d1, d2, d3, d4, d5, d6, d7];
  },
  overall(js, meta) {
    const s = ROBINS_E.stop(meta); if (s) return J('vhigh', `La evaluación se detiene en ${s}: el resultado se considera de riesgo muy alto y no requiere más evaluación.`);
    if (js.some(x => !x)) return J(null, 'Juzgue los siete dominios.');
    if (js.includes('vhigh')) return J('vhigh', 'Al menos un dominio en riesgo muy alto.');
    const nh = js.filter(x => x === 'high').length; if (nh) return J('high', nh > 1 ? `${nh} dominios en riesgo alto: si se potencian entre sí, puede justificarse «muy alto» (sobrescriba con justificación).` : 'Un dominio en riesgo alto y ninguno muy alto.');
    const ns = js.filter(x => x === 'some').length; if (ns) return J('some', ns > 1 ? `${ns} dominios con algunas preocupaciones: si su efecto es aditivo, puede justificarse «alto».` : 'Un dominio con algunas preocupaciones.');
    return J('lowc', 'Bajo en todos los dominios; en D1 siempre persiste la posibilidad de confusión no controlada.');
  },
};
const selHigh = a => {
  const q1 = a['3.1'], A = isY(q1) ? 'low' : q1 === 'NI' ? 'some' : isN(q1) ? (a['3.2'] ? (isN(a['3.2']) ? 'high' : 'some') : 'x') : 'x', q3 = a['3.3'];
  let B = 'x'; if (isN(q3)) B = 'low'; else if (q3 === 'NI') B = 'some'; else if (isY(q3)) { const q4 = a['3.4']; B = !q4 ? 'x' : isN(q4) ? 'low' : q4 === 'NI' ? 'some' : (a['3.5'] ? (isY(a['3.5']) ? 'high' : 'some') : 'x'); }
  return A === 'high' || B === 'high';
};

// ------------------------------------------------------------------ RoB 1 (Cochrane 2011)
const rb = (id, name, bias) => ({ id, short: id, name: `${name} (${bias})`, items: [] });
export const ROB1 = {
  id: 'rob1', name: 'RoB 1', full: 'Herramienta Cochrane de riesgo de sesgo (2011)', design: 'Ensayos aleatorizados (herramienta original, previa a RoB 2)', unit: 'estudio',
  ref: 'Higgins JPT, Altman DG, Gøtzsche PC, et al. The Cochrane Collaboration\'s tool for assessing risk of bias in randomised trials. BMJ 2011;343:d5928. Cochrane Handbook v5.1, cap. 8.',
  levels: ['low', 'high', 'unclear'], robvis: 'ROB1', hasAlgo: false,
  meta: [{ id: 'note', label: 'Desenlace evaluado (cegamiento y datos incompletos dependen del desenlace)', ph: 'p. ej., mortalidad; dolor autorreportado' }],
  guide: 'RoB 1 juzga siete dominios como <b>bajo</b>, <b>alto</b> o <b>poco claro</b> riesgo, con una frase de <i>sustento</i> citando el estudio. No tiene preguntas ni algoritmo: use los criterios de cada dominio. Cochrane recomienda ahora RoB 2; RoB 1 sigue usándose en revisiones antiguas y en actualizaciones.',
  doms: () => [rb('D1', 'Generación de la secuencia aleatoria', 'sesgo de selección'), rb('D2', 'Ocultamiento de la asignación', 'sesgo de selección'), rb('D3', 'Cegamiento de participantes y personal', 'sesgo de realización'), rb('D4', 'Cegamiento de los evaluadores del desenlace', 'sesgo de detección'), rb('D5', 'Datos de desenlace incompletos', 'sesgo de desgaste'), rb('D6', 'Notificación selectiva', 'sesgo de notificación'), rb('D7', 'Otras fuentes de sesgo', 'otros')],
  overall(js) {
    if (js.some(x => !x)) return J(null, 'Juzgue los siete dominios.');
    if (js.includes('high')) return J('high', 'Alto riesgo en al menos un dominio clave.');
    if (js.includes('unclear')) return J('unclear', 'Poco claro en al menos un dominio clave y ninguno alto.');
    return J('low', 'Bajo riesgo en todos los dominios clave. (Los «dominios clave» los define la revisión; aquí se usan los siete.)');
  },
};

// ------------------------------------------------------------------ JBI: estudios de prevalencia
export const JBI_ITEMS = [
  ['¿El marco muestral fue apropiado para la población objetivo?', 'Sí si incluye casi toda la población diana (censo, registro completo); No si es un grupo particular (una empresa, una profesión) generalizado a toda la población.'],
  ['¿Los participantes se reclutaron de forma apropiada?', 'Sí con muestreo probabilístico del marco o con inclusión de todos; No con muestras por conveniencia (encuesta callejera). El muestreo por conglomerados debe declararse y reflejarse en la precisión.'],
  ['¿El tamaño de muestra fue adecuado?', 'Sí si hubo cálculo de tamaño muestral o es una gran encuesta nacional; si no, estime n = Z²·P(1−P)/d² con la prevalencia esperada y la precisión deseada. Considere los subgrupos.'],
  ['¿Los sujetos y el contexto se describieron con detalle?', 'Sí si se describen edad, sexo, morbilidad, país/región y fechas de forma que otros juzguen si es comparable con su población.'],
  ['¿El análisis tuvo cobertura suficiente de la muestra identificada?', 'Evalúa el sesgo de cobertura: la respuesta puede ser alta en total pero baja en un subgrupo (p. ej., adultos mayores). No si algún subgrupo quedó subrepresentado sin ajuste.'],
  ['¿Se usaron métodos válidos para identificar la condición?', 'Sí si se usaron criterios diagnósticos o instrumentos validados; No si autorreporte o escalas no validadas con riesgo de sobre/subestimación.'],
  ['¿La condición se midió de forma estándar y fiable en todos los participantes?', 'Sí si los evaluadores fueron entrenados, se midió igual en todos y hubo comparación entre observadores cuando había varios.'],
  ['¿El análisis estadístico fue apropiado?', 'Sí si se informan numerador y denominador, las proporciones con IC y el método es adecuado a los supuestos (peso por diseño, conglomerados).'],
  ['¿La tasa de respuesta fue adecuada y, si fue baja, se manejó apropiadamente?', 'Sí si hubo buena respuesta o se analizaron los no respondedores y son comparables; No si hay muchas negativas o pérdidas sin análisis.'],
];
export const JBI = {
  id: 'jbi-prev', name: 'JBI Prevalencia', full: 'Lista de verificación crítica del JBI para estudios de prevalencia', design: 'Estudios de prevalencia e incidencia', unit: 'estudio', kind: 'checklist',
  ref: 'Munn Z, Moola S, Lisy K, Riitano D, Tufanaru C. Methodological guidance for systematic reviews of observational epidemiological studies reporting prevalence and incidence data. Int J Evid Based Healthc 2015;13:147–53. JBI Critical Appraisal Checklist for Studies Reporting Prevalence Data, 2020.',
  levels: ['inc', 'seek', 'exc'], robvis: null, hasAlgo: false,
  meta: [{ id: 'cutInc', label: 'Incluir si el % de «Sí» entre los ítems aplicables es ≥', type: 'number', def: 70 }, { id: 'cutExc', label: 'Excluir si el % de «Sí» es <', type: 'number', def: 50 }],
  guide: 'La lista del JBI tiene 9 preguntas con respuesta <b>Sí / No / Poco claro / No aplica</b>. El JBI <b>no fija puntos de corte</b>: el equipo decide antes cuántos «Sí» exige para <i>incluir</i>, <i>excluir</i> o <i>buscar más información</i>. EPI-ROB sugiere con dos umbrales configurables (70 % y 50 %) y usted decide.',
  items: JBI_ITEMS.map(([q, h], i) => ({ n: i + 1, q, h })),
  evaluate(meta, asm = {}) {
    const a = asm.ans || {}, items = JBI_ITEMS.map(([, h], i) => { const v = a[`i${i + 1}`]; return { n: i + 1, j: v || null, why: '', note: (asm.jud || {})[`i${i + 1}`]?.note || '' }; });
    const done = items.every(x => x.j), appl = items.filter(x => x.j && x.j !== 'na'), yes = appl.filter(x => x.j === 'y').length, pct = appl.length ? 100 * yes / appl.length : NaN, ov = asm.ov || {};
    const hi = +meta.cutInc || 70, lo = +meta.cutExc || 50, sug = !done ? null : pct >= hi ? 'inc' : pct < lo ? 'exc' : 'seek';
    const cell = { y: 'y', n: 'n', u: 'unclear', na: 'na' };
    return { items, cells: items.map(x => (x.j ? cell[x.j] : null)), cols: JBI_ITEMS.map((_, i) => ({ id: String(i + 1), short: String(i + 1), name: `Ítem ${i + 1}` })), legend: ['y', 'n', 'unclear', 'na'], legendOverall: ['inc', 'seek', 'exc'], summary: { yes, applicable: appl.length, pct },
      overall: { sug, j: ov.sel || sug, sel: ov.sel || null, why: done ? `${yes} de ${appl.length} ítems aplicables en «Sí» (${pct.toFixed(0)} %); umbrales: incluir ≥ ${hi} %, excluir < ${lo} % (convención del equipo, no del JBI).` : 'Responda los 9 ítems.', note: ov.note || '' } };
  },
};

// ------------------------------------------------------------------ Newcastle-Ottawa (cohortes)
export const NOS_ITEMS = [
  { id: 'S1', cat: 'S', q: 'Representatividad de la cohorte expuesta', opts: [['a', 'Verdaderamente representativa de la población de interés', 1], ['b', 'Algo representativa', 1], ['c', 'Grupo seleccionado (p. ej., voluntarios, enfermeras)', 0], ['d', 'Sin descripción de cómo se derivó la cohorte', 0]] },
  { id: 'S2', cat: 'S', q: 'Selección de la cohorte no expuesta', opts: [['a', 'Extraída de la misma comunidad que la cohorte expuesta', 1], ['b', 'Extraída de otra fuente', 0], ['c', 'Sin descripción', 0]] },
  { id: 'S3', cat: 'S', q: 'Verificación de la exposición', opts: [['a', 'Registro seguro (p. ej., historias quirúrgicas)', 1], ['b', 'Entrevista estructurada', 1], ['c', 'Autoinforme escrito', 0], ['d', 'Sin descripción', 0]] },
  { id: 'S4', cat: 'S', q: 'Demostración de que el desenlace no estaba presente al inicio', opts: [['a', 'Sí', 1], ['b', 'No', 0]] },
  { id: 'C1', cat: 'C', q: 'Comparabilidad: ¿controla por el factor más importante?', opts: [['a', 'Sí (ajuste o restricción por el factor más importante)', 1], ['b', 'No', 0]] },
  { id: 'C2', cat: 'C', q: 'Comparabilidad: ¿controla por algún factor adicional?', opts: [['a', 'Sí', 1], ['b', 'No', 0]] },
  { id: 'O1', cat: 'O', q: 'Evaluación del desenlace', opts: [['a', 'Evaluación independiente y ciega', 1], ['b', 'Vinculación de registros', 1], ['c', 'Autoinforme', 0], ['d', 'Sin descripción', 0]] },
  { id: 'O2', cat: 'O', q: '¿El seguimiento fue suficientemente largo para que ocurrieran los desenlaces?', opts: [['a', 'Sí (seleccione un periodo adecuado para el desenlace)', 1], ['b', 'No', 0]] },
  { id: 'O3', cat: 'O', q: 'Adecuación del seguimiento de las cohortes', opts: [['a', 'Seguimiento completo: todos los sujetos contabilizados', 1], ['b', 'Pérdidas improbables de introducir sesgo (pocas o descritas)', 1], ['c', 'Tasa de seguimiento menor al umbral y sin descripción de los perdidos', 0], ['d', 'Sin declaración', 0]] },
];
const CATN = { S: 'Selección', C: 'Comparabilidad', O: 'Desenlace' }, CATMAX = { S: 4, C: 2, O: 3 };
export const nosQuality = (S, C, O) => (S <= 1 || C === 0 || O <= 1 ? 'qpoor' : S >= 3 && O >= 2 ? 'qgood' : 'qfair');
export const NOS = {
  id: 'nos-cohort', name: 'Newcastle-Ottawa (cohortes)', full: 'Newcastle-Ottawa Scale para estudios de cohortes', design: 'Estudios de cohortes (también con versión para casos y controles)', unit: 'estudio', kind: 'nos',
  ref: 'Wells GA, Shea B, O\'Connell D, et al. The Newcastle-Ottawa Scale (NOS) for assessing the quality of nonrandomised studies in meta-analyses. Ottawa Hospital Research Institute. Conversión a estándares AHRQ: umbrales de buena, regular y pobre calidad.',
  levels: ['qgood', 'qfair', 'qpoor'], robvis: null, hasAlgo: false,
  meta: [{ id: 'main', label: 'Factor más importante para la comparabilidad', ph: 'p. ej., edad' }, { id: 'follow', label: 'Seguimiento mínimo suficiente / % de seguimiento aceptable', ph: 'p. ej., 5 años; ≥ 80 %' }],
  guide: 'La escala NOS asigna <b>estrellas (★)</b> en tres categorías: selección (máx. 4), comparabilidad (máx. 2) y desenlace (máx. 3), hasta 9 en total. No es una puntuación de calidad por sí misma: suele convertirse a <b>buena / regular / pobre</b> con los umbrales AHRQ (buena: ≥ 3★ en selección, ≥ 1★ en comparabilidad y ≥ 2★ en desenlace; pobre: ≤ 1★ en selección, 0★ en comparabilidad o ≤ 1★ en desenlace). Defina antes el factor más importante y los umbrales de seguimiento.',
  items: NOS_ITEMS, cats: CATN,
  evaluate(meta, asm = {}) {
    const a = asm.ans || {}, items = NOS_ITEMS.map(it => { const v = a[it.id], o = it.opts.find(x => x[0] === v); return { n: it.id, cat: it.cat, j: v || null, stars: o ? o[2] : 0, why: o ? o[1] : '', note: (asm.jud || {})[it.id]?.note || '' }; });
    const sum = c => items.filter(x => x.cat === c).reduce((s, x) => s + x.stars, 0), S = sum('S'), C = sum('C'), O = sum('O'), done = items.every(x => x.j), ov = asm.ov || {}, sug = done ? nosQuality(S, C, O) : null;
    const col = (c, v) => ({ j: v === CATMAX[c] ? 'low' : v === 0 ? 'high' : 'some', t: `${v}/${CATMAX[c]}` });
    return { items, stars: { S, C, O, total: S + C + O }, cells: [col('S', S), col('C', C), col('O', O), { j: (S + C + O) >= 7 ? 'low' : (S + C + O) <= 4 ? 'high' : 'some', t: `${S + C + O}/9` }], cols: [{ id: 'S', short: 'Selección', name: 'Selección (★ de 4)' }, { id: 'C', short: 'Comparab.', name: 'Comparabilidad (★ de 2)' }, { id: 'O', short: 'Desenlace', name: 'Desenlace (★ de 3)' }, { id: 'T', short: 'Total', name: 'Total (★ de 9)' }], legend: ['low', 'some', 'high'], legendOverall: ['qgood', 'qfair', 'qpoor'],
      overall: { sug, j: ov.sel || sug, sel: ov.sel || null, why: done ? `Selección ${S}★, comparabilidad ${C}★, desenlace ${O}★ (total ${S + C + O}/9) → ${{ qgood: 'buena', qfair: 'regular', qpoor: 'pobre' }[sug]} calidad (umbrales AHRQ).` : 'Responda los 9 apartados.', note: ov.note || '' } };
  },
};
register(ROBINS_E, ROB1, JBI, NOS);
