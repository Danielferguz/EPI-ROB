// ROBINS-I V2 (seguimiento/cohortes; borrador del 20 de noviembre de 2025, Sterne, Higgins et al., www.riskofbias.info).
// Los algoritmos transcriben los diagramas de flujo de cada dominio de la guía oficial. Las preguntas están resumidas y parafraseadas:
// consulte el documento original (CC BY-NC-ND 4.0) para el texto completo y la guía de cada pregunta.
import { register, O5, isY, isN, J } from './instruments.js?v=2026.10.25-4';

const inn = (v, ...xs) => xs.includes(v);
const O4 = ['Y', 'PY', 'PN', 'N'], OW = ['Y', 'PY', 'WN', 'SN', 'NI'], OSW = ['SY', 'WY', 'PN', 'N', 'NI'];
const q = (id, n, text, opts, h, show) => ({ id, n, q: text, opts, h, show });
const T = { low: 'Bajo', lowc: 'Bajo (salvo confusión no controlada)', moderate: 'Moderado', serious: 'Serio', critical: 'Crítico' };
const out = (j, w) => J(j, `${w} → ${T[j]}.`);
const WHICH = ['low', 'moderate', 'serious', 'critical'];
const yn = (id, label, def, extra = {}) => ({ id, label, type: 'choice', opts: [['N', 'No'], ['PN', 'Probablemente no'], ['PY', 'Probablemente sí'], ['Y', 'Sí']], def, ...extra });

export const ROBINS_I2 = {
  id: 'robins-i2', name: 'ROBINS-I V2', full: 'Risk Of Bias In Non-randomized Studies – of Interventions, versión 2 (borrador nov. 2025)', design: 'Estudios no aleatorizados de intervenciones con seguimiento (cohortes)', unit: 'resultado',
  ref: 'Sterne JAC, Mathur MB, Elbers R, et al. The Risk Of Bias In Non-randomized Studies – of Interventions, Version 2 (ROBINS-I V2) assessment tool (for follow-up studies). 20 de noviembre de 2025 (borrador). www.riskofbias.info.',
  levels: WHICH, overallLevels: ['lowc', 'moderate', 'serious', 'critical'], legend: ['low', 'lowc', 'moderate', 'serious', 'critical'], hasAlgo: true, stopWord: 'riesgo crítico',
  meta: [{ id: 'result', label: 'Resultado numérico evaluado (A1)', ph: 'p. ej., HR 0,72 (IC 95 % 0,6–0,9), mortalidad a 5 años' }, { id: 'cmp', label: 'Intervención y comparador (C2, C3)', ph: 'p. ej., iniciar estatinas vs no iniciar' },
    { id: 'conf', label: 'Confusores importantes definidos antes (P1)', ph: 'p. ej., edad, sexo, diabetes, gravedad basal' }, { id: 'target', label: 'Ensayo diana: participantes elegibles (C1)', ph: 'p. ej., adultos ≥ 40 años con hipertensión incidente' },
    yn('b1', 'B1. ¿Los autores intentaron controlar la confusión en este resultado?', 'Y'),
    { ...yn('b2', 'B2. Si N/PN en B1: ¿hay tanto potencial de confusión que el resultado sin ajustar no debe considerarse?', 'N'), show: m => isN(m.b1) },
    yn('b3', 'B3. ¿El método de medir el desenlace fue inapropiado?', 'N'),
    { id: 'c4', label: 'C4. ¿El análisis tuvo en cuenta cambios entre estrategias u otras desviaciones del protocolo durante el seguimiento?', type: 'choice', opts: [['N', 'No: estima el efecto de la asignación (por intención de tratar)'], ['Y', 'Sí: estima el efecto por protocolo']], def: 'N' }],
  guide: 'ROBINS-I V2 compara el resultado con un <b>ensayo diana</b> hipotético sin sesgo y tiene <b>seis dominios</b> (desaparece «desviaciones de la intervención»: se trata en la variante B de confusión). Antes de los dominios responda la parte B: si B2 o B3 son Sí, el resultado es de riesgo crítico y no hace falta seguir. C4 decide la variante del dominio 1 (A: confusión basal, por intención de tratar; B: confusión basal y tiempo-dependiente, por protocolo). Algunas preguntas distinguen «sí/no fuerte» y «sí/no débil»; el algoritmo propone el juicio y usted puede cambiarlo con justificación. Es un borrador sujeto a cambios.',
  stop: m => (isN(m.b1) && isY(m.b2) ? 'B2' : isY(m.b3) ? 'B3' : null),
  doms(meta) {
    const pp = isY(meta.c4);
    const d1 = pp ? { id: 'D1', short: 'D1', name: 'Confusión (variante B: confusión basal y tiempo-dependiente)', levels: ['lowc', 'moderate', 'serious', 'critical'], items: [
      q('1b.1', '1.1', '¿El método de análisis fue apropiado para controlar la confusión tiempo-dependiente además de la basal?', O5, 'Apropiados: métodos G (ponderación por probabilidad inversa, g-fórmula, modelos estructurales marginales). Incluir los confusores tiempo-dependientes en una regresión estándar suele ser inadecuado si la intervención los afecta.'),
      q('1b.2', '1.2', 'Si S/PS a 1.1: ¿se controlaron todos los confusores basales y tiempo-dependientes importantes?', OW, 'WN: faltó alguno pero la confusión no controlada probablemente no es sustancial (p. ej., está muy correlacionado con uno incluido). SN: probablemente sustancial.', a => isY(a['1b.1'])),
      q('1b.3', '1.3', 'Si S/PS/WN a 1.2: ¿los confusores controlados se midieron de forma válida y fiable?', OW, 'Valore qué variable representó cada confusor y cuánto error de medición hay.', a => inn(a['1b.2'], 'Y', 'PY', 'WN')),
      q('1b.4', '1.4', 'Si N/PN/SI a 1.1: ¿se controlaron variables medidas después del inicio de la intervención que pudo afectar ella?', O5, 'Controlar mediadores o colisionadores («sobreajuste») introduce sesgo.', a => !!a['1b.1'] && !isY(a['1b.1'])),
      q('1b.5', '1.5', '¿Los controles negativos, el análisis cuantitativo del sesgo u otras consideraciones sugieren confusión no controlada seria?', O4, 'Un control negativo es un análisis donde no debería haber asociación; si aparece, hay confusión.')],
      algo(g) {
        if (!isY(g('1b.1'))) { if (isY(g('1b.4'))) return out('critical', 'Método inapropiado y ajuste por variables posteriores (1.4 = S/PS)'); return isY(g('1b.5')) ? out('critical', 'Método inapropiado y controles negativos sugieren confusión seria (1.5 = S/PS)') : out('serious', 'Método inapropiado para confusión tiempo-dependiente'); }
        const a = g('1b.2'); if (inn(a, 'SN', 'NI')) return out('serious', 'Confusores importantes sin controlar (1.2 = SN/SI)');
        const b = g('1b.3');
        if (inn(b, 'SN', 'NI')) return out('serious', 'Confusores medidos con error sustancial (1.3 = SN/SI)');
        if (isY(g('1b.5'))) return out('serious', 'Controles negativos sugieren confusión seria (1.5 = S/PS)');
        return isY(a) && isY(b) ? out('lowc', 'Control completo y bien medido, sin señales de confusión') : out('moderate', 'Control incompleto o con error de medición no sustancial (WN en 1.2 o 1.3)');
      } } : { id: 'D1', short: 'D1', name: 'Confusión (variante A: confusión basal)', levels: ['lowc', 'moderate', 'serious', 'critical'], items: [
      q('1a.1', '1.1', '¿Los autores controlaron todos los confusores importantes para los que era necesario?', OW, 'Compare con la lista de confusores definida antes. Regresión, estratificación, emparejamiento, estandarización o ponderación (también por puntaje de propensión). WN: faltó alguno pero la confusión no controlada probablemente no es sustancial; SN: probablemente sustancial.'),
      q('1a.2', '1.2', 'Si S/PS/WN a 1.1: ¿los confusores controlados se midieron de forma válida y fiable con las variables disponibles?', OW, 'Valore error de medición de las variables usadas. WN: error probablemente no sustancial.', a => inn(a['1a.1'], 'Y', 'PY', 'WN')),
      q('1a.3', '1.3', 'Si S/PS/WN a 1.1: ¿se controlaron variables posteriores a la intervención que pudo afectar ella?', O5, 'Controlar mediadores o colisionadores introduce sesgo («sobreajuste»).', a => inn(a['1a.1'], 'Y', 'PY', 'WN')),
      q('1a.4', '1.4', '¿Los controles negativos, el análisis cuantitativo del sesgo u otras consideraciones sugieren confusión no controlada seria?', O4, 'Si no se usaron y nada sugiere confusión, responda N.')],
      algo(g) {
        const a = g('1a.1');
        if (inn(a, 'SN', 'NI')) return isY(g('1a.4')) ? out('critical', 'Confusores importantes sin controlar (1.1 = SN/SI) y señales de confusión seria (1.4 = S/PS)') : out('serious', 'Confusores importantes sin controlar (1.1 = SN/SI)');
        if (isY(g('1a.3'))) {
          if (isY(g('1a.4'))) return out('critical', 'Ajuste por variables posteriores (1.3 = S/PS) y señales de confusión seria (1.4 = S/PS)');
          return isY(g('1a.2')) ? out('serious', 'Ajuste por variables posteriores (1.3 = S/PS) con confusores bien medidos') : out('critical', 'Ajuste por variables posteriores (1.3 = S/PS) y confusores mal medidos o sin información (1.2)');
        }
        const m = g('1a.2');
        if (inn(m, 'SN', 'NI')) return out('serious', 'Confusores medidos con error sustancial (1.2 = SN/SI)');
        if (isY(g('1a.4'))) return out('serious', 'Señales de confusión no controlada seria (1.4 = S/PS)');
        return isY(a) && isY(m) ? out('lowc', 'Control completo y bien medido, sin señales de confusión') : out('moderate', 'Control incompleto o con error de medición no sustancial (WN)');
      } };
    const lvl = ['low', 'moderate', 'serious'], lvl2 = ['moderate', 'serious', 'critical'];
    const d2 = { id: 'D2', short: 'D2', name: 'Clasificación de las intervenciones', items: [
      q('2.1', '2.1', '¿Las estrategias de intervención eran distinguibles en el momento en que empezaría el seguimiento del ensayo diana?', O5, 'Si la clasificación de cada participante solo puede conocerse más tarde (p. ej., «tratamiento en los primeros 3 meses»), hay riesgo de tiempo inmortal.'),
      q('2.2', '2.2', 'Si N/PN/SI a 2.1: ¿casi todos los eventos del desenlace ocurrieron cuando las estrategias ya eran distinguibles?', O5, 'Si el periodo indistinguible aporta pocos eventos, el problema es menor.', a => !!a['2.1'] && !isY(a['2.1'])),
      q('2.3', '2.3', 'Si N/PN/SI a 2.2: ¿el análisis evitó los problemas de estrategias no distinguibles al inicio?', OSW, 'Ejemplo: clonar-censurar-ponderar. SY: lo evitó plenamente; WY: lo evitó solo en parte o hay dudas; N/PN: no lo evitó.', a => !!a['2.1'] && !isY(a['2.1']) && !!a['2.2'] && !isY(a['2.2'])),
      q('2.4', '2.4', '¿La clasificación de la intervención estuvo influida por el conocimiento del desenlace o de su riesgo?', OSW, 'Clasificación diferencial: SY si probablemente fue sustancial; WY si es posible pero no sustancial.'),
      q('2.5', '2.5', '¿Es probable que hubiera otros errores de clasificación (no influidos por el desenlace)?', O5, 'Errores aleatorios en la definición del grupo (registros, recuerdo).')],
      algo(g) {
        let k;
        if (isY(g('2.1')) || isY(g('2.2'))) k = 0; else { const c = g('2.3'); k = c === 'SY' ? 0 : inn(c, 'WY', 'NI') ? 1 : 2; }
        const c4 = g('2.4');
        if (k === 0) k = isN(c4) ? 0 : inn(c4, 'WY', 'NI') ? 1 : 2;
        else if (k === 1) { if (c4 === 'SY') return out('critical', 'Estrategias no claramente distinguibles al inicio y clasificación influida por el desenlace (2.4 = SY)'); k = isN(c4) ? 1 : 2; }
        else { if (!isN(c4)) return out('critical', 'Estrategias indistinguibles con análisis inapropiado y clasificación posiblemente influida por el desenlace (2.4)'); k = 2; }
        const e = g('2.5'); const W = ['estrategias distinguibles o con análisis plenamente apropiado y sin influencia del desenlace', 'distinción parcial o influencia posible del desenlace en la clasificación', 'problema de clasificación al inicio sin solución clara'][k];
        return isN(e) ? out(lvl[k], `${W}; sin otros errores probables (2.5 = N/PN)`) : out(lvl2[k], `${W}; otros errores de clasificación probables o sin información (2.5)`);
      } };
    const d3 = { id: 'D3', short: 'D3', name: 'Selección de participantes en el estudio (o en el análisis)', items: [
      q('3.1', '3.1', 'A. ¿El seguimiento del análisis empezó cuando empezaron las estrategias comparadas?', ['Y', 'PY', 'WN', 'SN', 'NI'], 'Si no (p. ej., usuarios prevalentes), hay sesgo de selección y tiempo inmortal. WN: el desfase es pequeño o poco relevante; SN: sustancial.'),
      q('3.2', '3.2', 'Si S/PS a 3.1: ¿se excluyeron del análisis los eventos ocurridos en un periodo posterior al inicio de las intervenciones?', O5, 'Excluir eventos tempranos introduce selección condicionada al futuro.', a => isY(a['3.1'])),
      q('3.3', '3.3', 'B. ¿La selección en el estudio o el análisis se basó en características observadas después del inicio de la intervención (distintas de 3.1 y 3.2)?', O5, 'Ejemplo: incluir solo a quienes siguen en tratamiento o sobreviven un tiempo.'),
      q('3.4', '3.4', 'Si S/PS a 3.3: ¿esas variables posteriores se asociaron probablemente con la intervención?', O5, '', a => isY(a['3.3'])),
      q('3.5', '3.5', 'Si S/PS a 3.4: ¿esas variables fueron influidas por el desenlace o por una causa del desenlace?', O5, '', a => isY(a['3.3']) && isY(a['3.4'])),
      q('3.6', '3.6', 'C. Si SN a 3.1 o S/PS a 3.5: ¿es probable que el análisis corrigiera todos los sesgos de selección identificados?', O5, 'Por ejemplo, ponderación por probabilidad inversa de selección.', a => selSer(a)),
      q('3.7', '3.7', 'Si N/PN/SI a 3.6: ¿los análisis de sensibilidad mostraron que el impacto probable era mínimo?', O5, '', a => selSer(a) && !isY(a['3.6']) && !!a['3.6']),
      q('3.8', '3.8', 'Si N/PN/SI a 3.7: ¿los sesgos de selección eran tan graves que el resultado no debe incluirse en una síntesis cuantitativa?', O5, 'Sí → riesgo crítico; No → serio.', a => selSer(a) && !isY(a['3.6']) && !!a['3.6'] && !isY(a['3.7']) && !!a['3.7'])],
      algo(g) {
        const x = g('3.1');
        const A = x === 'SN' ? 2 : isY(x) ? (isY(g('3.2')) ? 1 : 0) : 1;
        const y = g('3.3');
        let B; if (isN(y)) B = 0; else if (y === 'NI') B = 1; else { const z = g('3.4'); if (isN(z)) B = 0; else if (z === 'NI') B = 1; else B = isY(g('3.5')) ? 2 : 1; }
        const w = Math.max(A, B);
        if (w === 0) return out('low', `Parte A y parte B en riesgo bajo`);
        if (w === 1) return out('moderate', 'Como mucho riesgo moderado en las partes A y B');
        if (isY(g('3.6'))) return out('moderate', 'Riesgo serio en A o B, pero el análisis corrigió los sesgos de selección (3.6 = S/PS)');
        if (isY(g('3.7'))) return out('moderate', 'Riesgo serio en A o B; sin corrección, pero los análisis de sensibilidad muestran impacto mínimo (3.7 = S/PS)');
        return isY(g('3.8')) ? out('critical', 'Riesgo serio sin corrección ni sensibilidad, y sesgos tan graves que no debe sintetizarse (3.8 = S/PS)') : out('serious', 'Riesgo serio en A o B sin corrección ni evidencia de impacto mínimo');
      } };
    const ok3 = a => ['4.1', '4.2', '4.3'].every(k => isY(a[k]));
    const miss = a => ['4.1', '4.2', '4.3'].every(k => a[k]) && !ok3(a);
    const d4 = { id: 'D4', short: 'D4', name: 'Datos faltantes', items: [
      q('4.1', '4.1', '¿Se dispuso de datos completos de la intervención para todos o casi todos los participantes?', O5, '«Casi todos»: los excluidos son tan pocos que no cambiarían el efecto de forma importante.'),
      q('4.2', '4.2', '¿Se dispuso de datos completos del desenlace para todos o casi todos?', O5, ''),
      q('4.3', '4.3', '¿Se dispuso de datos completos de los confusores importantes para todos o casi todos?', O5, 'Los modelos ajustados excluyen en silencio a quienes no tienen todos los confusores.'),
      q('4.4', '4.4', 'Si N/PN/SI a 4.1–4.3: ¿el resultado se basa en un análisis de casos completos?', O5, '', a => miss(a)),
      q('4.5', '4.5', 'Si S/PS/SI a 4.4: ¿la exclusión por datos faltantes probablemente se relacionó con el valor real del desenlace?', O5, '', a => miss(a) && !isN(a['4.4']) && !!a['4.4']),
      q('4.6', '4.6', 'Si S/PS/SI a 4.5: ¿la relación entre desenlace y falta de datos probablemente se explica por las variables del modelo de análisis?', OW, 'Y/PY: sí, está explicada; WN o SI: dudosa; SN: probablemente no.', a => miss(a) && !isN(a['4.4']) && !!a['4.4'] && !isN(a['4.5']) && !!a['4.5']),
      q('4.7', '4.7', 'Si N/PN a 4.4: ¿el análisis se basó en imputar los valores faltantes?', O5, 'La imputación asigna valores estimados (múltiple, por regresión…).', a => miss(a) && isN(a['4.4'])),
      q('4.8', '4.8', 'Si S/PS a 4.7: ¿es razonable suponer que los datos faltaban al azar (MAR) o completamente al azar (MCAR)?', O5, '', a => miss(a) && isN(a['4.4']) && isY(a['4.7'])),
      q('4.9', '4.9', 'Si S/PS a 4.8: ¿la imputación se hizo de forma apropiada?', OW, 'Imputación simple (última observación) suele ser WN/SN.', a => miss(a) && isN(a['4.4']) && isY(a['4.7']) && isY(a['4.8'])),
      q('4.10', '4.10', 'Si N/PN/SI a 4.7: ¿se usó un método alternativo apropiado para corregir el sesgo por datos faltantes?', OW, 'Ponderación por probabilidad inversa, modelos conjuntos, etc.', a => miss(a) && isN(a['4.4']) && !isY(a['4.7']) && !!a['4.7']),
      q('4.11', '4.11', '¿Hay evidencia de que el resultado no está sesgado por los datos faltantes?', O4, 'Análisis de sensibilidad, comparación de completos e incompletos, razones de pérdida no relacionadas con el desenlace.', a => need411(a))],
      algo(g) {
        if (['4.1', '4.2', '4.3'].map(g).every(isY)) return out('low', 'Datos completos de intervención, desenlace y confusores');
        const cc = g('4.4'); let r;
        if (!isN(cc)) { if (isN(g('4.5'))) return out('low', 'Casos completos y exclusión no relacionada con el desenlace (4.5 = N/PN)'); const s = g('4.6'); r = isY(s) ? 0 : s === 'SN' ? 2 : 1; }
        else if (isY(g('4.7'))) { if (!isY(g('4.8'))) return out('serious', 'Imputación sin supuesto razonable de MAR/MCAR (4.8 = N/PN/SI)'); const m = g('4.9'); if (isY(m)) return out('low', 'Imputación apropiada'); r = m === 'SN' ? 2 : 1; }
        else { const m = g('4.10'); if (isY(m)) return out('low', 'Método alternativo apropiado'); r = m === 'SN' ? 2 : 1; }
        const ev = isY(g('4.11')), res = [[['low', 'moderate'], 'Evidencia de ausencia de sesgo (4.11 = S/PS) con relación explicada por el modelo'], [['moderate', 'serious'], 'Corrección parcial o dudosa'], [['serious', 'critical'], 'Corrección inapropiada']][r];
        return out(res[0][ev ? 0 : 1], `${res[1]}; ${ev ? 'con' : 'sin'} evidencia de ausencia de sesgo (4.11)`);
      } };
    const d5 = { id: 'D5', short: 'D5', name: 'Medición del desenlace', items: [
      q('5.1', '5.1', '¿La medición o verificación del desenlace pudo diferir entre los grupos de intervención?', O5, 'Comparable = mismos instrumentos, umbrales y calendario de seguimiento.'),
      q('5.2', '5.2', 'Si no S/PS a 5.1: ¿los evaluadores del desenlace conocían la intervención recibida?', O5, 'En desenlaces autorreportados el evaluador es el participante.', a => !!a['5.1'] && !isY(a['5.1'])),
      q('5.3', '5.3', 'Si S/PS/SI a 5.2: ¿la evaluación pudo estar influida por conocer la intervención?', OSW, 'SY: probablemente influida de forma sustancial (desenlaces subjetivos); WY: posible pero no sustancial.', a => !!a['5.1'] && !isY(a['5.1']) && !!a['5.2'] && !isN(a['5.2']))],
      algo(g) {
        const a = g('5.1'); if (isY(a)) return out('serious', 'La medición difirió entre grupos (5.1 = S/PS)');
        const b = g('5.2'), ni = a === 'NI';
        if (isN(b)) return ni ? out('moderate', '5.1 = SI, pero los evaluadores no conocían la intervención') : out('low', 'Medición comparable y evaluadores sin conocer la intervención');
        const c = g('5.3');
        if (c === 'SY') return out('serious', 'Evaluadores conocían la intervención y la evaluación pudo estar sustancialmente influida (5.3 = SY)');
        if (ni) return out('moderate', '5.1 = SI y evaluación posiblemente influida o sin información');
        return isN(c) ? out('low', 'Medición comparable; el conocimiento de la intervención no pudo influir (5.3 = N/PN)') : out('moderate', 'Medición comparable; posible influencia del conocimiento de la intervención (5.3 = WY/SI)');
      } };
    const d6 = { id: 'D6', short: 'D6', name: 'Selección del resultado reportado', items: [
      q('6.1', '6.1', '¿El resultado se reportó según un plan de análisis predeterminado y disponible?', O5, 'Protocolo o plan de análisis fechado antes de acceder a los datos del desenlace.'),
      q('6.2', '6.2', 'Si no S/PS a 6.1: ¿el resultado fue probablemente seleccionado entre múltiples mediciones del desenlace (escalas, definiciones, momentos)?', O5, '', a => !!a['6.1'] && !isY(a['6.1'])),
      q('6.3', '6.3', '¿… entre múltiples análisis de los datos (ajustados/no ajustados, otros modelos o puntos de corte)?', O5, '', a => !!a['6.1'] && !isY(a['6.1'])),
      q('6.4', '6.4', '¿… entre múltiples subgrupos?', O5, 'Frecuente en cohortes grandes con datos de rutina.', a => !!a['6.1'] && !isY(a['6.1']))],
      algo(g) {
        if (isY(g('6.1'))) return out('low', 'Resultado reportado según un plan predeterminado');
        const r = ['6.2', '6.3', '6.4'].map(g), n = r.filter(isY).length, ni = r.filter(x => x === 'NI').length;
        if (n >= 2) return out('critical', `Dos o más fuentes de selección probables (${n})`);
        if (n === 1 || ni === 3) return out('serious', n ? 'Una fuente de selección probable' : 'Sin información sobre las tres fuentes de selección');
        return ni ? out('moderate', 'Alguna fuente sin información y ninguna probable') : out('low', 'Ninguna fuente de selección probable (6.2–6.4 = N/PN)');
      } };
    return [d1, d2, d3, d4, d5, d6];
  },
  overall(js, meta) {
    const s = ROBINS_I2.stop(meta); if (s) return J('critical', `La evaluación se detiene en ${s}: el resultado se considera de riesgo crítico y no requiere más evaluación.`);
    if (js.some(x => !x)) return J(null, 'Juzgue los seis dominios.');
    if (js.includes('critical')) return J('critical', 'Al menos un dominio en riesgo crítico.');
    const ns = js.filter(x => x === 'serious').length; if (ns) return J('serious', ns > 1 ? `${ns} dominios en riesgo serio: si se potencian, puede justificarse «crítico» (sobrescriba con justificación).` : 'Al menos un dominio en riesgo serio y ninguno crítico.');
    const nm = js.filter(x => x === 'moderate').length; if (nm) return J('moderate', nm > 1 ? `${nm} dominios en riesgo moderado: si su efecto es aditivo, puede justificarse «serio» (sobrescriba con justificación).` : 'Al menos un dominio en riesgo moderado y ninguno serio o crítico.');
    return J('lowc', 'Dominio 1 bajo (salvo confusión no controlada) y bajo en todos los demás.');
  },
};
// riesgo serio en la parte A (3.1 = SN) o en la parte B (3.5 = S/PS): activa las preguntas 3.6 a 3.8
function selSer(a) { return a['3.1'] === 'SN' || (isY(a['3.3']) && isY(a['3.4']) && isY(a['3.5'])); }
// la 4.11 se contesta si la corrección es parcial: ver el diagrama del dominio 4
function need411(a) {
  if (!['4.1', '4.2', '4.3'].every(k => a[k]) || ['4.1', '4.2', '4.3'].every(k => isY(a[k]))) return false;
  if (!isN(a['4.4']) && a['4.4']) return !isN(a['4.5']) && !!a['4.5'] && !!a['4.6'];
  if (!isN(a['4.4'])) return false;
  if (isY(a['4.7'])) return isY(a['4.8']) && !!a['4.9'] && !isY(a['4.9']);
  return !!a['4.7'] && !!a['4.10'] && !isY(a['4.10']);
}
register(ROBINS_I2);
