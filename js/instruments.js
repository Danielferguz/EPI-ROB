// Instrumentos de riesgo de sesgo: RoB 2, ROBINS-I, QUADAS-2, PROBAST y AMSTAR 2.
// Cada dominio define sus preguntas señalizadoras (con condiciones de visibilidad) y, cuando el instrumento publica un algoritmo,
// la función que propone el juicio. Los algoritmos de RoB 2 siguen las tablas 4, 6, 8, 10, 12 y 14 de la guía oficial (Higgins et al., 2019).
export const ANS = { Y: 'Sí', PY: 'Probablemente sí', PN: 'Probablemente no', N: 'No', NI: 'Sin información', NA: 'No aplica', U: 'No claro' };
export const O5 = ['Y', 'PY', 'PN', 'N', 'NI'], O5NA = [...O5, 'NA'], OYN = ['Y', 'N', 'NI'], OYNA = [...OYN, 'NA'];
export const isY = v => v === 'Y' || v === 'PY';
export const isN = v => v === 'N' || v === 'PN';
export class Pending extends Error { constructor(id) { super(id); this.id = id; } }
const getter = a => id => { const v = a[id]; if (v == null || v === '') throw new Pending(id); return v; };

// niveles de juicio (color, símbolo y texto; el símbolo evita depender solo del color)
export const LV = {
  low: { t: 'Bajo riesgo', s: '+', c: '#4F9D6B' }, some: { t: 'Algunas preocupaciones', s: '−', c: '#E3B341' }, high: { t: 'Alto riesgo', s: '×', c: '#C25450' },
  moderate: { t: 'Riesgo moderado', s: '−', c: '#E3B341' }, serious: { t: 'Riesgo serio', s: '×', c: '#D9822B' }, critical: { t: 'Riesgo crítico', s: '!', c: '#8B2E3B' },
  unclear: { t: 'No claro', s: '?', c: '#9AA3A6' }, ni: { t: 'Sin información', s: '?', c: '#9AA3A6' },
  y: { t: 'Sí', s: '+', c: '#4F9D6B' }, py: { t: 'Sí parcial', s: '±', c: '#E3B341' }, n: { t: 'No', s: '×', c: '#C25450' }, na: { t: 'No aplica', s: '·', c: '#9AA3A6' },
  chigh: { t: 'Confianza alta', s: 'A', c: '#4F9D6B' }, cmod: { t: 'Confianza moderada', s: 'M', c: '#E3B341' }, clow: { t: 'Confianza baja', s: 'B', c: '#C25450' }, ccrit: { t: 'Confianza críticamente baja', s: 'CB', c: '#8B2E3B' },
  conc_low: { t: 'Preocupación baja', s: '+', c: '#4F9D6B' }, conc_high: { t: 'Preocupación alta', s: '×', c: '#C25450' }, conc_unclear: { t: 'Preocupación no clara', s: '?', c: '#9AA3A6' },
};
const J = (j, why) => ({ j, why });

// ------------------------------------------------------------------ RoB 2
const rob2Items = {
  1.1: ['¿La secuencia de asignación fue aleatoria?', 'Sí si hubo un componente aleatorio (números generados por computadora, tabla, moneda, dados, barajado). La minimización suele incluir azar. No si fue predecible (alternancia, fecha, historia clínica, decisión del clínico).'],
  1.2: ['¿La secuencia de asignación permaneció oculta hasta que los participantes fueron incluidos y asignados?', 'Sí con asignación central o remota (web/teléfono, farmacia) o sobres opacos, sellados y numerados. No si la lista era visible o predecible. Esta pregunta pesa más que las otras dos.'],
  1.3: ['¿Las diferencias basales entre los grupos sugieren un problema con el proceso de aleatorización?', 'Las diferencias compatibles con el azar no cuentan. Sí si hay desequilibrios que el azar explica mal: tamaños de grupo muy distintos de la razón prevista, exceso de diferencias significativas, pronósticos muy desiguales o similitud sospechosa.'],
  3.1: ['¿Se dispuso de datos de este desenlace para todos o casi todos los participantes aleatorizados?', 'Casi todos: lo suficiente para confiar en el resultado (en general ≥ 95 %; menos si el desenlace es raro y el número absoluto de perdidos es pequeño).'],
  3.2: ['¿Hay evidencia de que el resultado no está sesgado por los datos faltantes?', 'Evidencia: análisis que corrigen el sesgo, análisis de sensibilidad, o datos faltantes similares entre grupos con razones no relacionadas con el valor real.'],
  3.3: ['¿Los datos faltantes podrían depender del valor real del desenlace?', 'Sí si la pérdida o el abandono pudo relacionarse con el estado de salud (p. ej., se pierde a quienes empeoran).'],
  3.4: ['¿Es probable que la falta de datos dependiera del valor real del desenlace?', 'Sí si las razones o proporciones de pérdida difieren entre grupos de forma que sugiere esa dependencia.'],
  4.1: ['¿El método de medición del desenlace fue inapropiado?', 'No juzga si el desenlace es relevante, sino si el instrumento puede detectar el efecto (validez, sensibilidad, umbral).'],
  4.2: ['¿La medición o verificación del desenlace pudo diferir entre los grupos?', 'Métodos comparables = mismos instrumentos, umbrales y calendario de seguimiento en ambos grupos.'],
  4.3: ['¿Quienes evaluaron el desenlace conocían la intervención recibida?', 'En desenlaces reportados por el participante, el evaluador es el participante: no es ciego si conoce su grupo.'],
  4.4: ['¿La evaluación del desenlace pudo estar influida por el conocimiento de la intervención?', 'Los desenlaces subjetivos (dolor, calidad de vida) o con juicio del evaluador son los más susceptibles.'],
  4.5: ['¿Es probable que la evaluación estuviera influida por ese conocimiento?', 'Sí si hay razones para creer que quienes evaluaron tenían expectativas sobre las intervenciones.'],
  5.1: ['¿Los datos se analizaron según un plan preespecificado y finalizado antes de disponer de datos desenmascarados?', 'Requiere protocolo o plan de análisis estadístico fechado antes del desenmascaramiento (registro, SAP).'],
  5.2: ['¿El resultado evaluado fue probablemente seleccionado, según los resultados, entre múltiples mediciones elegibles del desenlace (escalas, definiciones, tiempos)?', 'Sí si el desenlace se midió de varias formas elegibles y solo se informa una, sin justificación en el plan.'],
  5.3: ['¿El resultado evaluado fue probablemente seleccionado entre múltiples análisis elegibles de los datos?', 'Sí si se hicieron varios análisis (ajustados/no ajustados, diferentes puntos de corte o subgrupos) y se informa uno.'],
};
const ri = (id, opts = O5, show) => ({ id: String(id), q: rob2Items[id][0], opts, h: rob2Items[id][1], show });
const aw = v => isY(v) || v === 'NI';
export const ROB2 = {
  id: 'rob2', name: 'RoB 2', full: 'Risk of Bias 2 (Cochrane)', design: 'Ensayos aleatorizados de grupos paralelos', unit: 'resultado',
  ref: 'Sterne JAC, Savović J, Page MJ, et al. RoB 2: a revised tool for assessing risk of bias in randomised trials. BMJ 2019;366:l4898. Guía: Higgins JPT, Savović J, Page MJ, Sterne JAC (eds), 22 ago 2019.',
  levels: ['low', 'some', 'high'], robvis: 'ROB2', hasAlgo: true,
  meta: [{ id: 'result', label: 'Resultado numérico evaluado', ph: 'p. ej., RR 0,83 (IC 95 % 0,75–0,93), mortalidad a 28 días' }, { id: 'cmp', label: 'Comparación', ph: 'p. ej., dexametasona vs atención habitual' },
    { id: 'effect', label: 'Efecto de interés', type: 'choice', opts: [['assign', 'Efecto de la asignación (por intención de tratar)'], ['adhere', 'Efecto de adherirse a la intervención (por protocolo)']], def: 'assign' }],
  guide: 'RoB 2 evalúa <b>un resultado numérico concreto</b>, no «el estudio». Cada dominio propone un juicio con un algoritmo oficial; usted puede cambiarlo si lo justifica por escrito. El dominio 2 tiene dos versiones según el efecto de interés.',
  doms(meta) {
    const adhere = meta.effect === 'adhere';
    return [
      { id: 'D1', short: 'D1', name: 'Proceso de aleatorización', items: [ri(1.1), ri(1.2), ri(1.3)],
        algo(g) {
          const c = g('1.2'); if (isN(c)) return J('high', '1.2 = N/PN: secuencia no oculta → Alto, con independencia de 1.1 y 1.3.');
          const b = g('1.3');
          if (c === 'NI') return isY(b) ? J('high', 'Ocultamiento sin información (1.2 = SI) y desequilibrio basal sospechoso (1.3 = S/PS) → Alto.') : J('some', 'Ocultamiento sin información (1.2 = SI) y sin desequilibrio sospechoso → Algunas preocupaciones.');
          const s = g('1.1');
          if (isY(b)) return J('some', 'Ocultamiento adecuado pero desequilibrio basal sospechoso (1.3 = S/PS) → Algunas preocupaciones (valore Alto si además la secuencia no fue aleatoria).');
          if (isN(s)) return J('some', 'Ocultamiento adecuado pero secuencia no aleatoria (1.1 = N/PN) → Algunas preocupaciones.');
          return J('low', 'Secuencia aleatoria (o sin información), ocultamiento adecuado y sin desequilibrio sospechoso → Bajo.');
        } },
      adhere ? {
        id: 'D2', short: 'D2', name: 'Desviaciones de las intervenciones previstas (efecto de adherirse)',
        items: [{ id: '2.1', q: '¿Los participantes conocían la intervención asignada durante el ensayo?', opts: O5, h: 'Sí si hubo efectos adversos específicos que delataran el grupo o no hubo enmascaramiento.' },
          { id: '2.2', q: '¿Los cuidadores y quienes aplicaban las intervenciones conocían la asignación?', opts: O5, h: 'Sí si la asignación no estuvo oculta o no hubo placebo o simulación.' },
          { id: '2.3', q: '[Si procede] Si S/PS/SI a 2.1 o 2.2: ¿las intervenciones no previstas en el protocolo importantes estuvieron balanceadas entre grupos?', opts: O5NA, show: a => aw(a['2.1']) || aw(a['2.2']), h: 'Cointervenciones pronósticas que los participantes recibieron fuera del protocolo. «No aplica» si las consideraciones preliminares no lo requieren.' },
          { id: '2.4', q: '[Si procede] ¿Hubo fallos en la implementación de la intervención que pudieron afectar el desenlace?', opts: O5NA, h: 'No si la intervención se implementó con éxito en la mayoría de los participantes.' },
          { id: '2.5', q: '[Si procede] ¿Hubo no adherencia al régimen asignado que pudo afectar los desenlaces?', opts: O5NA, h: 'Incluye cumplimiento imperfecto, cese, cruce al comparador y cambio a otra intervención activa.' },
          { id: '2.6', q: 'Si N/PN/SI a 2.3, o S/PS/SI a 2.4 o 2.5: ¿se usó un análisis apropiado para estimar el efecto de adherirse a la intervención?', opts: O5NA, show: a => dev2b(a).prob, h: 'ITT, por protocolo ingenuo y «como se trató» no son apropiados; sí lo son variables instrumentales o ponderación por probabilidad inversa bien justificadas.' }],
        algo(g, a) {
          const aware = aw(g('2.1')) || aw(g('2.2')); if (aware) g('2.3'); g('2.4'); g('2.5');
          const p = dev2b(a); if (!p.prob) return J('low', 'Sin problemas de cointervenciones, implementación ni adherencia → Bajo.');
          return isY(g('2.6')) ? J('some', 'Hubo problemas, pero el análisis fue apropiado para el efecto de adherirse (2.6 = S/PS) → Algunas preocupaciones.') : J('high', 'Hubo problemas y el análisis no fue apropiado (2.6 = N/PN/SI) → Alto.');
        } } : {
        id: 'D2', short: 'D2', name: 'Desviaciones de las intervenciones previstas (efecto de la asignación)',
        items: [{ id: '2.1', q: '¿Los participantes conocían la intervención asignada durante el ensayo?', opts: O5, h: 'Sí si hubo efectos adversos específicos que delataran el grupo o no hubo enmascaramiento.' },
          { id: '2.2', q: '¿Los cuidadores y quienes aplicaban las intervenciones conocían la asignación?', opts: O5, h: 'Sí si la asignación no estuvo oculta o no hubo placebo o simulación.' },
          { id: '2.3', q: 'Si S/PS/SI a 2.1 o 2.2: ¿hubo desviaciones de la intervención prevista que surgieron por el contexto del ensayo?', opts: O5NA, show: a => aw(a['2.1']) || aw(a['2.2']), h: 'Solo S/PS si hay evidencia o razón fuerte para creer que el contexto del ensayo causó fallos o intervenciones no permitidas. Los cambios que ocurrirían igual fuera del ensayo, y los permitidos por el protocolo (p. ej., suspender por toxicidad), son No.' },
          { id: '2.4', q: 'Si S/PS a 2.3: ¿esas desviaciones probablemente afectaron el desenlace?', opts: O5NA, show: a => isY(a['2.3']) && (aw(a['2.1']) || aw(a['2.2'])), h: 'Las desviaciones solo sesgan si afectan el desenlace.' },
          { id: '2.5', q: 'Si S/PS/SI a 2.4: ¿esas desviaciones estuvieron balanceadas entre grupos?', opts: ['Y', 'PY', 'PN', 'N', 'NI', 'NA'], show: a => isY(a['2.3']) && a['2.4'] && a['2.4'] !== 'NA' && !isN(a['2.4']), h: 'El desbalance aumenta el sesgo.' },
          { id: '2.6', q: '¿Se usó un análisis apropiado para estimar el efecto de la asignación?', opts: ['Y', 'PY', 'PN', 'N', 'NI'], h: 'ITT y «ITT modificado» (excluye solo a quienes no tienen datos del desenlace) son apropiados; el «por protocolo» ingenuo y el «como se trató» no. Excluir a elegibles tras aleatorizar no es apropiado.' },
          { id: '2.7', q: 'Si N/PN/SI a 2.6: ¿pudo haber un impacto sustancial por no analizar a los participantes en el grupo aleatorizado?', opts: O5NA, show: a => a['2.6'] && !isY(a['2.6']), h: 'No hay umbral fijo: puede ser sustancial con < 5 % de participantes mal analizados si el desenlace es raro.' }],
        algo(g) {
          const u1 = g('2.1'), u2 = g('2.2'), aware = aw(u1) || aw(u2); let p1, w1;
          if (!aware) { p1 = 'low'; w1 = 'Participantes y personal sin conocer la asignación → Parte 1 Bajo.'; } else {
            const d = g('2.3');
            if (isN(d)) { p1 = 'low'; w1 = 'Conocían la asignación pero sin desviaciones por el contexto del ensayo → Parte 1 Bajo.'; }
            else if (d === 'NI') { p1 = 'some'; w1 = 'Sin información sobre desviaciones por el contexto → Parte 1 Algunas preocupaciones.'; }
            else if (isN(g('2.4'))) { p1 = 'some'; w1 = 'Hubo desviaciones, pero sin probable efecto en el desenlace → Parte 1 Algunas preocupaciones.'; }
            else if (isY(g('2.5'))) { p1 = 'some'; w1 = 'Desviaciones que afectan el desenlace pero balanceadas → Parte 1 Algunas preocupaciones.'; }
            else { p1 = 'high'; w1 = 'Desviaciones que afectan el desenlace y desbalanceadas (o sin información) → Parte 1 Alto.'; }
          }
          let p2, w2;
          if (isY(g('2.6'))) { p2 = 'low'; w2 = 'Análisis apropiado → Parte 2 Bajo.'; } else if (isN(g('2.7'))) { p2 = 'some'; w2 = 'Análisis inapropiado sin impacto sustancial → Parte 2 Algunas preocupaciones.'; } else { p2 = 'high'; w2 = 'Análisis inapropiado con posible impacto sustancial → Parte 2 Alto.'; }
          return J(p1 === 'high' || p2 === 'high' ? 'high' : p1 === 'some' || p2 === 'some' ? 'some' : 'low', `${w1} ${w2} El dominio toma la peor de las dos partes.`);
        } },
      { id: 'D3', short: 'D3', name: 'Datos faltantes del desenlace', items: [ri(3.1), ri(3.2, ['Y', 'PY', 'PN', 'N', 'NA'], a => !isY(a['3.1'])), ri(3.3, O5NA, a => !isY(a['3.1']) && isN(a['3.2'])), ri(3.4, O5NA, a => !isY(a['3.1']) && isN(a['3.2']) && !isN(a['3.3']))],
        algo(g) {
          if (isY(g('3.1'))) return J('low', 'Datos completos o casi completos (3.1 = S/PS) → Bajo.');
          if (isY(g('3.2'))) return J('low', 'Evidencia de que el resultado no está sesgado por los faltantes (3.2 = S/PS) → Bajo.');
          if (isN(g('3.3'))) return J('low', 'Los faltantes no podrían depender del valor real (3.3 = N/PN) → Bajo.');
          return isN(g('3.4')) ? J('some', 'Podrían depender del valor real pero no es probable (3.4 = N/PN) → Algunas preocupaciones.') : J('high', 'Es probable (o no descartable) que dependan del valor real (3.4 = S/PS/SI) → Alto.');
        } },
      { id: 'D4', short: 'D4', name: 'Medición del desenlace', items: [ri(4.1), ri(4.2, O5, a => !isY(a['4.1'])), ri(4.3, O5NA, a => !isY(a['4.1']) && !isY(a['4.2'])), ri(4.4, O5NA, a => !isY(a['4.1']) && !isY(a['4.2']) && !isN(a['4.3']) && a['4.3'] !== 'NA'), ri(4.5, O5NA, a => !isY(a['4.1']) && !isY(a['4.2']) && !isN(a['4.3']) && a['4.3'] !== 'NA' && !isN(a['4.4']) && a['4.4'] !== 'NA')],
        algo(g) {
          if (isY(g('4.1'))) return J('high', 'Método de medición inapropiado (4.1 = S/PS) → Alto.');
          const d = g('4.2'); if (isY(d)) return J('high', 'La medición pudo diferir entre grupos (4.2 = S/PS) → Alto.');
          const base = d === 'NI' ? 'some' : 'low', pre = d === 'NI' ? 'Sin información sobre medición comparable (4.2 = SI); ' : '', t = base === 'low' ? 'Bajo.' : 'Algunas preocupaciones.';
          if (isN(g('4.3'))) return J(base, `${pre}evaluadores sin conocer la asignación (4.3 = N/PN) → ${t}`);
          if (isN(g('4.4'))) return J(base, `${pre}la evaluación no podía estar influida por el conocimiento (4.4 = N/PN) → ${t}`);
          return isN(g('4.5')) ? J('some', `${pre}pudo estar influida pero no es probable (4.5 = N/PN) → Algunas preocupaciones.`) : J('high', 'Es probable que el conocimiento de la intervención influyera en la evaluación (4.5 = S/PS/SI) → Alto.');
        } },
      { id: 'D5', short: 'D5', name: 'Selección del resultado reportado', items: [ri(5.1), ri(5.2), ri(5.3)],
        algo(g) {
          const a2 = g('5.2'); if (isY(a2)) return J('high', '5.2 = S/PS: resultado probablemente seleccionado entre mediciones → Alto.');
          const a3 = g('5.3'); if (isY(a3)) return J('high', '5.3 = S/PS: resultado probablemente seleccionado entre análisis → Alto.');
          if (a2 === 'NI' || a3 === 'NI') return J('some', 'Sin información sobre selección entre mediciones o análisis (5.2 o 5.3 = SI) → Algunas preocupaciones.');
          return isY(g('5.1')) ? J('low', 'Plan preespecificado y sin selección aparente → Bajo.') : J('some', 'Sin selección aparente pero sin plan preespecificado verificable (5.1 = N/PN/SI) → Algunas preocupaciones.');
        } },
    ];
  },
  overall(js) {
    if (js.some(x => !x)) return J(null, 'Complete los cinco dominios.');
    if (js.includes('high')) return J('high', 'Al menos un dominio en Alto riesgo.');
    const n = js.filter(x => x === 'some').length;
    if (n) return J('some', n > 1 ? `${n} dominios con algunas preocupaciones y ninguno Alto. Valore si en conjunto reducen sustancialmente la confianza en el resultado: podría justificarse Alto.` : 'Un dominio con algunas preocupaciones y ninguno Alto.');
    return J('low', 'Todos los dominios en Bajo riesgo.');
  },
};
function dev2b(a) { const awr = aw(a['2.1']) || aw(a['2.2']); const p3 = awr && a['2.3'] && (isN(a['2.3']) || a['2.3'] === 'NI'), p4 = a['2.4'] && (isY(a['2.4']) || a['2.4'] === 'NI'), p5 = a['2.5'] && (isY(a['2.5']) || a['2.5'] === 'NI'); return { prob: !!(p3 || p4 || p5) }; }

// ------------------------------------------------------------------ ROBINS-I (v1, 2016): sin algoritmo oficial; juicio del evaluador
const RLV = ['low', 'moderate', 'serious', 'critical', 'ni'];
const rq = (id, q, h, opts = O5, show) => ({ id, q, h, opts, show });
const none = (a, k) => !a[k] || isN(a[k]);
export const ROBINS_I = {
  id: 'robins-i', name: 'ROBINS-I', full: 'Risk Of Bias In Non-randomized Studies of Interventions', design: 'Estudios no aleatorizados de intervenciones (cohortes, casos y controles, series)', unit: 'resultado',
  ref: 'Sterne JAC, Hernán MA, Reeves BC, et al. ROBINS-I: a tool for assessing risk of bias in non-randomised studies of interventions. BMJ 2016;355:i4919.',
  levels: RLV, robvis: 'ROBINS-I', hasAlgo: false,
  meta: [{ id: 'result', label: 'Resultado numérico evaluado', ph: 'p. ej., HR 0,72 (IC 95 % 0,6–0,9)' }, { id: 'cmp', label: 'Comparación', ph: 'p. ej., estatinas vs no uso' }, { id: 'conf', label: 'Dominios de confusión importantes', ph: 'p. ej., edad, sexo, diabetes, gravedad basal' },
    { id: 'effect', label: 'Efecto de interés', type: 'choice', opts: [['assign', 'Efecto de la asignación (inicio de la intervención)'], ['adhere', 'Efecto de iniciar y adherirse a la intervención']], def: 'assign' }],
  guide: 'ROBINS-I compara el estudio con un <b>ensayo pragmático hipotético</b> («ensayo diana») sin sesgo. El instrumento no publica un algoritmo en su versión 1: las preguntas señalizadoras orientan y el juicio es suyo (Bajo, Moderado, Serio, Crítico o Sin información). Un resultado «Bajo» es raro: equivale a un buen ensayo aleatorizado.',
  doms(meta) {
    const adhere = meta.effect === 'adhere', crit = 'Bajo: comparable a un ensayo aleatorizado bien hecho · Moderado: sólido para un estudio no aleatorizado, no comparable a un ECA · Serio: problemas importantes · Crítico: demasiado problemático para aportar evidencia · Sin información: sin datos para juzgar.';
    return [
      { id: 'D1', short: 'D1', name: 'Confusión', crit: crit + ' Considere confusión basal y, si procede, tiempo-dependiente.', items: [
        rq('1.1', '¿Hay potencial de confusión del efecto de la intervención en este estudio?', 'Si N/PN (p. ej., aleatorización o daño muy improbable relacionado con confusores) el estudio puede considerarse de bajo riesgo en este dominio.'),
        rq('1.2', 'Si S/PS a 1.1: ¿el análisis dividió el seguimiento según la intervención recibida?', 'Se pregunta para decidir si hay que evaluar confusión tiempo-dependiente.', O5, a => isY(a['1.1'])),
        rq('1.3', 'Si S/PS a 1.2: ¿las discontinuaciones o cambios de intervención se relacionaron probablemente con factores pronósticos?', 'Si sí, hay confusión tiempo-dependiente (preguntas 1.7–1.8).', O5, a => isY(a['1.1']) && isY(a['1.2'])),
        rq('1.4', '¿Se usó un método de análisis apropiado que controló todos los dominios de confusión importantes?', 'Regresión, estratificación, emparejamiento, PS, estandarización, etc., con todos los confusores.', O5, a => isY(a['1.1']) && (none(a, '1.2') || none(a, '1.3'))),
        rq('1.5', 'Si S/PS a 1.4: ¿los dominios controlados se midieron de forma válida y fiable?', 'Valore error de medición de los confusores disponibles.', O5, a => isY(a['1.1']) && isY(a['1.4']) && (none(a, '1.2') || none(a, '1.3'))),
        rq('1.6', '¿Se controló por variables posteriores a la intervención que pudieron ser afectadas por ella?', 'Controlar por mediadores o colisionadores introduce sesgo.', O5, a => isY(a['1.1']) && (none(a, '1.2') || none(a, '1.3'))),
        rq('1.7', '¿Se usó un análisis apropiado que controló todos los dominios de confusión y la confusión tiempo-dependiente?', 'Métodos G: ponderación por probabilidad inversa tiempo-dependiente, g-fórmula, etc.', O5, a => isY(a['1.1']) && isY(a['1.2']) && isY(a['1.3'])),
        rq('1.8', 'Si S/PS a 1.7: ¿los dominios controlados se midieron de forma válida y fiable?', 'Igual que 1.5.', O5, a => isY(a['1.1']) && isY(a['1.2']) && isY(a['1.3']) && isY(a['1.7'])),
      ] },
      { id: 'D2', short: 'D2', name: 'Selección de participantes en el estudio', crit: crit + ' Cuidado con la selección según características posteriores al inicio.', items: [
        rq('2.1', '¿La selección de participantes (o del análisis) se basó en características observadas después del inicio de la intervención?', 'Ejemplo: incluir solo a quienes sobreviven o permanecen en tratamiento un tiempo.'),
        rq('2.2', 'Si S/PS a 2.1: ¿las variables posteriores que influyeron en la selección se asociaron probablemente con la intervención?', '', O5, a => isY(a['2.1'])),
        rq('2.3', 'Si S/PS a 2.2: ¿esas variables fueron influidas por el desenlace o por una causa del desenlace?', '', O5, a => isY(a['2.1']) && isY(a['2.2'])),
        rq('2.4', '¿Coinciden el inicio del seguimiento y el inicio de la intervención para la mayoría de los participantes?', 'Si no (p. ej., usuarios prevalentes), hay riesgo de sesgo por tiempo inmortal o por supervivientes.'),
        rq('2.5', 'Si S/PS a 2.2 y 2.3, o N/PN a 2.4: ¿se usaron técnicas de ajuste que probablemente corrigen los sesgos de selección?', '', O5, a => (isY(a['2.2']) && isY(a['2.3'])) || isN(a['2.4'])),
      ] },
      { id: 'D3', short: 'D3', name: 'Clasificación de las intervenciones', crit: crit + ' La clasificación no diferencial (aleatoria) suele dar riesgo bajo/moderado.', items: [
        rq('3.1', '¿Los grupos de intervención estaban claramente definidos?', 'Intervención, dosis, duración y comparador definidos sin ambigüedad.'),
        rq('3.2', '¿La información usada para definir los grupos se registró al inicio de la intervención?', 'Información prospectiva y registrada al inicio reduce el sesgo de recuerdo.'),
        rq('3.3', '¿La clasificación de la intervención pudo estar afectada por el conocimiento del desenlace o de su riesgo?', 'Clasificación diferencial según el desenlace.'),
      ] },
      adhere ? { id: 'D4', short: 'D4', name: 'Desviaciones de las intervenciones previstas (iniciar y adherirse)', crit, items: [
        rq('4.3', '¿Las cointervenciones importantes estuvieron balanceadas entre los grupos?', ''), rq('4.4', '¿La intervención se implementó con éxito en la mayoría de los participantes?', ''),
        rq('4.5', '¿Los participantes se adhirieron al régimen asignado?', ''),
        rq('4.6', 'Si N/PN a 4.3, 4.4 o 4.5: ¿se usó un análisis apropiado para estimar el efecto de iniciar y adherirse?', 'IPW u otros métodos G; los análisis por protocolo ingenuos no son apropiados.', O5, a => isN(a['4.3']) || isN(a['4.4']) || isN(a['4.5'])),
      ] } : { id: 'D4', short: 'D4', name: 'Desviaciones de las intervenciones previstas (efecto de la asignación)', crit, items: [
        rq('4.1', '¿Hubo desviaciones de la intervención prevista más allá de lo esperable en la práctica habitual?', 'Las desviaciones que ocurren en la práctica habitual no sesgan este efecto.'),
        rq('4.2', 'Si S/PS a 4.1: ¿esas desviaciones estuvieron desbalanceadas entre grupos y probablemente afectaron el desenlace?', '', O5, a => isY(a['4.1'])),
      ] },
      { id: 'D5', short: 'D5', name: 'Datos faltantes', crit, items: [
        rq('5.1', '¿Hubo datos del desenlace para todos o casi todos los participantes?', ''), rq('5.2', '¿Se excluyó a participantes por falta de datos de la intervención?', ''), rq('5.3', '¿Se excluyó a participantes por falta de datos en otras variables necesarias?', ''),
        rq('5.4', 'Si N/PN a 5.1, o S/PS a 5.2 o 5.3: ¿las proporciones y razones de datos faltantes son similares entre intervenciones?', '', O5, a => isN(a['5.1']) || isY(a['5.2']) || isY(a['5.3'])),
        rq('5.5', 'Si N/PN a 5.1, o S/PS a 5.2 o 5.3: ¿hay evidencia de que los resultados son robustos a los datos faltantes?', 'Imputación múltiple, análisis de sensibilidad, etc.', O5, a => isN(a['5.1']) || isY(a['5.2']) || isY(a['5.3'])),
      ] },
      { id: 'D6', short: 'D6', name: 'Medición de los desenlaces', crit, items: [
        rq('6.1', '¿La medida del desenlace pudo estar influida por el conocimiento de la intervención recibida?', 'La mortalidad por todas las causas casi no depende del evaluador.'),
        rq('6.2', '¿Los evaluadores conocían la intervención recibida?', ''), rq('6.3', '¿Los métodos de evaluación del desenlace fueron comparables entre grupos?', ''),
        rq('6.4', '¿Algún error sistemático en la medición del desenlace se relacionó con la intervención recibida?', 'Clasificación errónea diferencial.'),
      ] },
      { id: 'D7', short: 'D7', name: 'Selección del resultado reportado', crit, items: [
        rq('7.1', '¿El efecto reportado fue probablemente seleccionado, según los resultados, entre múltiples mediciones del desenlace?', ''), rq('7.2', '… entre múltiples análisis de la relación intervención–desenlace?', ''), rq('7.3', '… entre diferentes subgrupos?', ''),
      ] },
    ];
  },
  overall(js) {
    if (js.some(x => !x)) return J(null, 'Juzgue los siete dominios.');
    if (js.includes('critical')) return J('critical', 'Al menos un dominio en riesgo crítico.');
    if (js.includes('serious')) return J('serious', 'Al menos un dominio en riesgo serio y ninguno crítico.');
    if (js.includes('ni')) return J('ni', 'Sin indicación clara de riesgo serio o crítico, pero falta información en uno o más dominios clave.');
    if (js.includes('moderate')) return J('moderate', 'Todos los dominios con riesgo bajo o moderado.');
    return J('low', 'Todos los dominios en riesgo bajo.');
  },
};

// ------------------------------------------------------------------ QUADAS-2
const qa = (id, q, h, opts = OYN) => ({ id, q, h, opts });
const qDom = (id, name, items, app) => ({
  id, short: id, name, items, app,
  algo(g) {
    const v = items.filter(it => !it.opts.includes('NA') || g(it.id) !== 'NA').map(it => g(it.id));
    if (v.includes('N')) return J('high', 'Al menos una pregunta con «No» → Alto.');
    if (v.every(x => x === 'Y')) return J('low', 'Todas las preguntas con «Sí» → Bajo.');
    return J('unclear', 'Sin «No», pero con «No claro» → No claro.');
  },
});
export const QUADAS2 = {
  id: 'quadas2', name: 'QUADAS-2', full: 'Quality Assessment of Diagnostic Accuracy Studies 2', design: 'Estudios de exactitud diagnóstica', unit: 'estudio',
  ref: 'Whiting PF, Rutjes AWS, Westwood ME, et al. QUADAS-2: a revised tool for the quality assessment of diagnostic accuracy studies. Ann Intern Med 2011;155:529–36.',
  levels: ['low', 'high', 'unclear'], robvis: 'QUADAS-2', hasAlgo: true, appLevels: ['conc_low', 'conc_high', 'conc_unclear'],
  meta: [{ id: 'index', label: 'Prueba índice', ph: 'p. ej., dímero D' }, { id: 'ref', label: 'Estándar de referencia', ph: 'p. ej., ecografía venosa' }, { id: 'target', label: 'Condición objetivo', ph: 'p. ej., trombosis venosa profunda' }],
  guide: 'QUADAS-2 evalúa el <b>riesgo de sesgo</b> en cuatro dominios y las <b>preocupaciones de aplicabilidad</b> en los tres primeros. Regla del instrumento: todas las preguntas en «Sí» → bajo; algún «No» → alto; en otro caso, no claro.',
  doms: () => [
    qDom('D1', 'Selección de pacientes', [qa('1.1', '¿Se incluyó una muestra consecutiva o aleatoria de pacientes?', ''), qa('1.2', '¿Se evitó un diseño de casos y controles?', 'Los diseños de casos y controles tienden a sobreestimar la exactitud.'), qa('1.3', '¿Se evitaron exclusiones inapropiadas?', '')], true),
    qDom('D2', 'Prueba índice', [qa('2.1', '¿Los resultados de la prueba índice se interpretaron sin conocer los del estándar de referencia?', ''), qa('2.2', 'Si se usó un umbral, ¿estaba preespecificado?', 'No aplica si la prueba no usa umbral.', OYNA)], true),
    qDom('D3', 'Estándar de referencia', [qa('3.1', '¿Es probable que el estándar de referencia clasifique correctamente la condición objetivo?', ''), qa('3.2', '¿Los resultados del estándar de referencia se interpretaron sin conocer los de la prueba índice?', '')], true),
    qDom('D4', 'Flujo y tiempos', [qa('4.1', '¿Hubo un intervalo apropiado entre la prueba índice y el estándar de referencia?', ''), qa('4.2', '¿Todos los pacientes recibieron un estándar de referencia?', ''), qa('4.3', '¿Todos recibieron el mismo estándar de referencia?', ''), qa('4.4', '¿Todos los pacientes se incluyeron en el análisis?', '')], false),
  ],
  overall(js) {
    if (js.some(x => !x)) return J(null, 'Complete los cuatro dominios.');
    if (js.includes('high')) return J('high', 'Al menos un dominio con riesgo alto.');
    if (js.every(x => x === 'low')) return J('low', 'Todos los dominios con riesgo bajo.');
    return J('unclear', 'Sin riesgo alto, pero al menos un dominio no claro.');
  },
};

// ------------------------------------------------------------------ PROBAST
const DEVONLY = new Set(['4.2', '4.5', '4.8', '4.9']);
const pq = (id, q, h) => ({ id, q, h, opts: O5, naIf: (a, meta) => DEVONLY.has(id) && meta.stype === 'val', show: (a, meta) => !(DEVONLY.has(id) && meta.stype === 'val') });
const pDom = (id, name, items, app) => ({
  id, short: id, name, items, app,
  algo(g, a, meta) {
    const vis = items.filter(it => !it.naIf(a, meta)), v = vis.map(it => g(it.id));
    if (v.some(isN)) return J('high', 'Al menos una pregunta con N/PN señala potencial de sesgo → Alto (puede reconsiderarse con justificación).');
    if (v.every(isY)) return J('low', 'Todas las preguntas con S/PS → Bajo.');
    return J('unclear', 'Sin N/PN, pero con «Sin información» → No claro.');
  },
});
export const PROBAST = {
  id: 'probast', name: 'PROBAST', full: 'Prediction model Risk Of Bias ASsessment Tool', design: 'Estudios de desarrollo o validación de modelos de predicción diagnóstica y pronóstica', unit: 'modelo',
  ref: 'Wolff RF, Moons KGM, Riley RD, et al. PROBAST: a tool to assess the risk of bias and applicability of prediction model studies. Ann Intern Med 2019;170:51–58. Moons KGM, et al. Explanation and elaboration. Ann Intern Med 2019;170:W1–W33.',
  levels: ['low', 'high', 'unclear'], robvis: 'PROBAST', hasAlgo: true, appLevels: ['conc_low', 'conc_high', 'conc_unclear'],
  meta: [{ id: 'model', label: 'Modelo evaluado', ph: 'p. ej., Puntaje X para riesgo de ERC a 5 años' }, { id: 'outcome', label: 'Desenlace a predecir', ph: '' },
    { id: 'stype', label: 'Tipo de evaluación', type: 'choice', opts: [['dev', 'Desarrollo sin validación externa'], ['devval', 'Desarrollo con validación externa'], ['val', 'Solo validación']], def: 'dev' },
    { id: 'big', label: 'Desarrollo con muestra muy grande y validación interna', type: 'check', show: m => m.stype === 'dev' }],
  guide: 'PROBAST evalúa una evaluación de <b>un modelo</b> (desarrollo y/o validación). Cuatro dominios con 20 preguntas; las preguntas 4.2, 4.5, 4.8 y 4.9 solo aplican al desarrollo. Los tres primeros dominios también se juzgan por aplicabilidad. Un desarrollo sin validación externa con todo «bajo» debe considerarse de alto riesgo salvo que la muestra sea muy grande y tenga validación interna.',
  doms: () => [
    pDom('D1', 'Participantes', [pq('1.1', '¿Se usaron fuentes de datos apropiadas (cohorte, ECA o casos y controles anidado)?', ''), pq('1.2', '¿Todas las inclusiones y exclusiones de participantes fueron apropiadas?', '')], true),
    pDom('D2', 'Predictores', [pq('2.1', '¿Los predictores se definieron y evaluaron de forma similar en todos los participantes?', ''), pq('2.2', '¿Las evaluaciones de los predictores se hicieron sin conocer el desenlace?', ''), pq('2.3', '¿Todos los predictores están disponibles en el momento en que se usará el modelo?', '')], true),
    pDom('D3', 'Desenlace', [pq('3.1', '¿El desenlace se determinó de forma apropiada?', ''), pq('3.2', '¿Se usó una definición de desenlace preespecificada o estándar?', ''), pq('3.3', '¿Se excluyeron los predictores de la definición del desenlace?', ''), pq('3.4', '¿El desenlace se definió y determinó de forma similar en todos los participantes?', ''), pq('3.5', '¿El desenlace se determinó sin conocer la información de los predictores?', ''), pq('3.6', '¿El intervalo entre la evaluación de predictores y la del desenlace fue apropiado?', '')], true),
    pDom('D4', 'Análisis', [pq('4.1', '¿Hubo un número razonable de participantes con el desenlace?', 'Referencia habitual: al menos 10 eventos por parámetro candidato en desarrollo y ≥ 100 eventos en validación (use pmsampsize / EPI-PREDIC).'), pq('4.2', '¿Los predictores continuos y categóricos se manejaron apropiadamente?', 'Evitar dicotomizar o categorizar sin motivo; modelar la no linealidad.'), pq('4.3', '¿Se incluyó en el análisis a todos los participantes reclutados?', ''), pq('4.4', '¿Los participantes con datos faltantes se manejaron apropiadamente?', 'Imputación múltiple en lugar de casos completos cuando se pierde información relevante.'), pq('4.5', '¿Se evitó seleccionar predictores por análisis univariable?', ''), pq('4.6', '¿Se consideraron apropiadamente las complejidades de los datos (censura, riesgos competitivos, muestreo de controles)?', ''), pq('4.7', '¿Se evaluaron apropiadamente las medidas de rendimiento relevantes (calibración, discriminación)?', ''), pq('4.8', '¿Se consideraron el sobreajuste y el optimismo del rendimiento?', 'Bootstrap o validación cruzada que repitan todo el proceso de modelado.'), pq('4.9', '¿Los predictores y sus pesos en el modelo final corresponden a los resultados del análisis multivariable?', '')], false),
  ],
  overall(js, meta) {
    if (js.some(x => !x)) return J(null, 'Complete los cuatro dominios.');
    if (js.includes('high')) return J('high', 'Al menos un dominio con riesgo alto.');
    if (js.every(x => x === 'low')) return meta.stype === 'dev' && !meta.big ? J('high', 'Todos los dominios con riesgo bajo, pero es un desarrollo sin validación externa y sin muestra muy grande con validación interna: PROBAST recomienda considerar riesgo alto.') : J('low', 'Todos los dominios con riesgo bajo.');
    return J('unclear', 'Sin riesgo alto, pero al menos un dominio no claro.');
  },
};

// ------------------------------------------------------------------ AMSTAR 2 (revisiones sistemáticas)
const S = (lvl, mode, c) => ({ lvl, mode, c: c.map((t, i) => [`${lvl}${i}`, t]) });
export const AMSTAR2 = {
  id: 'amstar2', name: 'AMSTAR 2', full: 'A MeaSurement Tool to Assess systematic Reviews 2', design: 'Revisiones sistemáticas de estudios aleatorizados y/o no aleatorizados', unit: 'revisión', kind: 'amstar',
  ref: 'Shea BJ, Reeves BC, Wells G, et al. AMSTAR 2: a critical appraisal tool for systematic reviews that include randomised or non-randomised studies of healthcare interventions, or both. BMJ 2017;358:j4008.',
  robvis: null, hasAlgo: true,
  meta: [{ id: 'st', label: 'Estudios incluidos', type: 'choice', opts: [['rct', 'Solo ECA'], ['nrsi', 'Solo no aleatorizados'], ['both', 'ECA y no aleatorizados']], def: 'rct' }, { id: 'ma', label: 'Metaanálisis', type: 'choice', opts: [['yes', 'Se realizó metaanálisis'], ['no', 'No se realizó metaanálisis']], def: 'yes' }],
  guide: 'AMSTAR 2 califica la <b>confianza</b> en los resultados de una revisión, no su «calidad» global. Siete ítems son <b>críticos</b> (2, 4, 7, 9, 11, 13, 15): un fallo crítico baja la confianza a «baja» y más de uno a «críticamente baja». Con 0–1 debilidades no críticas la confianza es alta; con más de una, moderada. «Sí parcial» no cuenta como debilidad.',
  items: [
    { n: 1, q: '¿Las preguntas de investigación y los criterios de inclusión incluyeron los componentes PICO?', yn: true, h: 'Población, intervención, comparador y desenlace (opcional: tiempo de seguimiento).' },
    { n: 2, crit: true, q: '¿El informe contiene una declaración explícita de que los métodos se establecieron antes de la revisión y se justificó cualquier desviación significativa del protocolo?',
      sets: [S('py', 'all', ['Pregunta de la revisión', 'Estrategia de búsqueda', 'Criterios de inclusión y exclusión', 'Método de evaluación del riesgo de sesgo']), S('y', 'all', ['Protocolo registrado', 'Plan de metaanálisis/síntesis (si procede)', 'Plan para investigar las causas de la heterogeneidad', 'Justificación de las desviaciones del protocolo'])] },
    { n: 3, q: '¿Los autores explicaron su selección de los diseños de estudio para la revisión?', yn: true, h: 'Sí si explican por qué incluyeron solo ECA, solo no aleatorizados o ambos.' },
    { n: 4, crit: true, q: '¿Los autores usaron una estrategia de búsqueda bibliográfica exhaustiva?',
      sets: [S('py', 'all', ['Buscó al menos en dos bases de datos relevantes', 'Proporcionó palabras clave y/o la estrategia de búsqueda', 'Justificó las restricciones de publicación (p. ej., idioma)']), S('y', 'all', ['Revisó las listas de referencias de los estudios incluidos', 'Buscó en registros de ensayos o estudios', 'Incluyó o consultó a expertos del área', 'Buscó literatura gris (si procede)', 'Realizó la búsqueda dentro de los 24 meses previos a finalizar la revisión'])] },
    { n: 5, q: '¿Los autores seleccionaron los estudios por duplicado?', yn: true, h: 'Sí si al menos dos revisores seleccionaron independientemente y llegaron a consenso, o si dos revisores seleccionaron una muestra con buen acuerdo (≥ 80 %) y uno hizo el resto.' },
    { n: 6, q: '¿Los autores extrajeron los datos por duplicado?', yn: true, h: 'Sí si al menos dos revisores extrajeron independientemente y llegaron a consenso, o hubo acuerdo en una muestra y el resto lo hizo uno.' },
    { n: 7, crit: true, q: '¿Los autores proporcionaron una lista de estudios excluidos y justificaron las exclusiones?',
      sets: [S('py', 'all', ['Proporcionó la lista de todos los estudios potencialmente relevantes leídos a texto completo y excluidos']), S('y', 'all', ['Justificó la exclusión de cada estudio potencialmente relevante'])] },
    { n: 8, q: '¿Los autores describieron los estudios incluidos con suficiente detalle?',
      sets: [S('py', 'all', ['Describió las poblaciones', 'Describió las intervenciones', 'Describió los comparadores', 'Describió los desenlaces', 'Describió los diseños']), S('y', 'all', ['Población en detalle', 'Intervención en detalle (incluidas dosis)', 'Comparador en detalle', 'Ámbito del estudio', 'Duración del seguimiento'])] },
    { n: 9, crit: true, q: '¿Los autores usaron una técnica satisfactoria para evaluar el riesgo de sesgo en los estudios individuales incluidos?', split: true,
      setsR: [S('py', 'all', ['Sesgo por falta de ocultamiento de la asignación', 'Sesgo por falta de cegamiento de pacientes y evaluadores (innecesario para desenlaces objetivos como la mortalidad)']), S('y', 'all', ['Secuencia de asignación no verdaderamente aleatoria', 'Selección del resultado reportado entre múltiples mediciones o análisis'])],
      setsN: [S('py', 'all', ['Sesgo por confusión', 'Sesgo de selección']), S('y', 'all', ['Métodos para determinar exposiciones y desenlaces', 'Selección del resultado reportado entre múltiples mediciones o análisis'])] },
    { n: 10, q: '¿Los autores informaron las fuentes de financiamiento de los estudios incluidos?', yn: true, h: 'Sí si se informó la financiación de cada estudio incluido; «sin información» no es suficiente.' },
    { n: 11, crit: true, ma: true, q: 'Si hubo metaanálisis: ¿los autores usaron métodos apropiados para la combinación estadística?', split: true,
      setsR: [S('y', 'all', ['Justificó combinar los datos en un metaanálisis', 'Usó una técnica ponderada apropiada y ajustó por heterogeneidad si la había', 'Investigó las causas de la heterogeneidad'])],
      setsN: [S('y', 'all', ['Justificó combinar los datos en un metaanálisis', 'Usó una técnica ponderada apropiada y ajustó por heterogeneidad si la había', 'Combinó estimaciones ajustadas por confusión en lugar de datos crudos (o justificó combinar datos crudos)', 'Presentó estimaciones separadas para ECA y no aleatorizados cuando incluyó ambos'])] },
    { n: 12, ma: true, q: 'Si hubo metaanálisis: ¿los autores evaluaron el impacto potencial del riesgo de sesgo de los estudios individuales en los resultados?', yn: true, h: 'Sí si incluyeron solo ECA de bajo riesgo, o si analizaron el impacto del riesgo de sesgo en la estimación combinada.' },
    { n: 13, crit: true, q: '¿Los autores tuvieron en cuenta el riesgo de sesgo de los estudios individuales al interpretar y discutir los resultados?', yn: true, h: 'Sí si solo incluyeron estudios de bajo riesgo, o discutieron el impacto del riesgo de sesgo moderado/alto en los resultados.' },
    { n: 14, q: '¿Los autores dieron una explicación satisfactoria y discutieron cualquier heterogeneidad observada?', yn: true, h: 'Sí si no hubo heterogeneidad significativa, o si investigaron sus fuentes y discutieron su impacto.' },
    { n: 15, crit: true, ma: true, q: 'Si hubo síntesis cuantitativa: ¿los autores investigaron adecuadamente el sesgo de publicación (sesgo de estudios pequeños) y discutieron su impacto?', yn: true, h: 'Sí si hicieron pruebas gráficas o estadísticas y discutieron la probabilidad y magnitud del impacto.' },
    { n: 16, q: '¿Los autores informaron posibles conflictos de interés, incluido el financiamiento de la revisión?', yn: true, h: 'Sí si informaron no tener conflictos o describieron su financiación y cómo manejaron los conflictos.' },
  ],
};
export const AM_CRIT = AMSTAR2.items.filter(i => i.crit).map(i => i.n);
const amRate = (sets, checked = []) => {
  const ok = s => s.c.every(c => checked.includes(c[0])), py = sets.find(s => s.lvl === 'py'), y = sets.find(s => s.lvl === 'y');
  if (py) return !ok(py) ? 'n' : ok(y) ? 'y' : 'py';
  return ok(y) ? 'y' : 'n';
};
// calificación de un ítem de AMSTAR 2 a partir de las respuestas {a:{yN:'y'|'n'}, c:{ítem:[ids marcados]}}
export function amItem(it, meta, asm) {
  const a = asm.ans || {}, c = asm.chk || {};
  if (it.ma && meta.ma === 'no') return J('na', 'No se realizó metaanálisis.');
  if (it.yn) return a[`i${it.n}`] ? J(a[`i${it.n}`], '') : J(null, '');
  if (it.split) {
    const parts = []; if (meta.st !== 'nrsi') parts.push(['ECA', amRate(it.setsR, c[`${it.n}r`])]); if (meta.st !== 'rct') parts.push(['No aleat.', amRate(it.setsN, c[`${it.n}n`])]);
    const ord = { y: 0, py: 1, n: 2 }, worst = parts.reduce((m, p) => (ord[p[1]] > ord[m] ? p[1] : m), 'y');
    return J(worst, parts.map(p => `${p[0]}: ${LV[p[1]].t}`).join(' · ') + (parts.length > 1 ? ' → se toma la más baja.' : ''));
  }
  const r = amRate(it.sets, c[it.n]); return J(r, `Criterios marcados → ${LV[r].t}.`);
}
export function amOverall(js) {
  let cw = 0, nw = 0; AMSTAR2.items.forEach((it, i) => { if (js[i] === 'n') (it.crit ? cw++ : nw++); });
  const j = cw > 1 ? 'ccrit' : cw === 1 ? 'clow' : nw > 1 ? 'cmod' : 'chigh';
  return { j, cw, nw, why: `${cw} fallo(s) crítico(s) y ${nw} debilidad(es) no crítica(s) → ${LV[j].t}.` };
}

export const INSTRUMENTS = [ROB2, ROBINS_I, QUADAS2, PROBAST, AMSTAR2];
export const instOf = id => INSTRUMENTS.find(i => i.id === id);
export const defMeta = inst => Object.fromEntries(inst.meta.filter(m => m.def != null).map(m => [m.id, m.def]));

// ------------------------------------------------------------------ evaluación de una valoración
export const visibleItems = (d, a, meta) => d.items.filter(it => !it.show || it.show(a, meta));
function evalDomain(d, a, meta) {
  if (!d.algo) return { sug: null, why: 'ROBINS-I no define un algoritmo: juzgue según los criterios del dominio.' };
  try { const r = d.algo(getter(a), a, meta); return { sug: r.j, why: r.why }; } catch (e) { if (e instanceof Pending) return { sug: null, pending: true, why: 'Faltan respuestas para proponer un juicio.' }; throw e; }
}
// asm = { ans:{id:code}, jud:{dominio:{sel,note,app,dir}}, ov:{sel,note}, chk }
export function evalAssessment(inst, meta, asm = {}) {
  if (inst.kind === 'amstar') {
    const items = inst.items.map(it => { const r = amItem(it, meta, asm), o = (asm.jud || {})[`i${it.n}`] || {}; return { n: it.n, crit: !!it.crit, j: r.j, why: r.why, note: o.note || '' }; });
    const done = items.every(x => x.j), ov = done ? amOverall(items.map(x => x.j)) : { j: null, why: 'Califique los 16 ítems.', cw: 0, nw: 0 };
    return { items, overall: { j: ov.j, why: ov.why, cw: ov.cw, nw: ov.nw, note: (asm.ov || {}).note || '' } };
  }
  const a = asm.ans || {}, jud = asm.jud || {};
  const doms = inst.doms(meta).map(d => {
    const r = evalDomain(d, a, meta), o = jud[d.id] || {}, vis = visibleItems(d, a, meta);
    return { id: d.id, short: d.short, name: d.name, sug: r.sug, why: r.why, pending: !!r.pending, sel: o.sel || null, j: o.sel || r.sug || null, note: o.note || '', app: o.app || null, dir: o.dir || '', hasApp: !!d.app, answered: vis.filter(it => a[it.id]).length, total: vis.length };
  });
  const ov = asm.ov || {}, r = inst.overall(doms.map(d => d.j), meta, doms);
  return { doms, overall: { sug: r.j, why: r.why, sel: ov.sel || null, j: ov.sel || r.j, note: ov.note || '' } };
}
// juicio final (sin evaluar de nuevo): para figuras y tablas
export const finalOf = (inst, meta, asm) => { const e = evalAssessment(inst, meta, asm); return inst.kind === 'amstar' ? { items: e.items.map(x => x.j), overall: e.overall.j } : { doms: e.doms.map(d => d.j), overall: e.overall.j, app: e.doms.map(d => d.app) }; };
