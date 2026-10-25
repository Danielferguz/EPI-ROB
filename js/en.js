// Textos en inglés para figuras y tablas exportables (la interfaz sigue en español).
export const LVEN = {
  low: 'Low risk of bias', lowc: 'Low risk of bias (except uncontrolled confounding)', some: 'Some concerns', high: 'High risk of bias', moderate: 'Moderate risk of bias', serious: 'Serious risk of bias', critical: 'Critical risk of bias',
  vhigh: 'Very high risk of bias', unclear: 'Unclear risk of bias', ni: 'No information', y: 'Yes', py: 'Partial yes', n: 'No', na: 'Not applicable',
  chigh: 'High confidence', cmod: 'Moderate confidence', clow: 'Low confidence', ccrit: 'Critically low confidence', inc: 'Include', seek: 'Seek further information', exc: 'Exclude',
  qgood: 'Good quality', qfair: 'Fair quality', qpoor: 'Poor quality', conc_low: 'Low concern', conc_high: 'High concern', conc_unclear: 'Unclear concern',
};
const DOM = {
  rob2: ['Randomisation process', 'Deviations from intended interventions', 'Missing outcome data', 'Measurement of the outcome', 'Selection of the reported result'],
  'robins-i': ['Confounding', 'Selection of participants', 'Classification of interventions', 'Deviations from intended interventions', 'Missing data', 'Measurement of outcomes', 'Selection of the reported result'],
  'robins-i2': ['Confounding', 'Classification of interventions', 'Selection of participants', 'Missing data', 'Measurement of the outcome', 'Selection of the reported result'],
  'robins-e': ['Confounding', 'Measurement of the exposure', 'Selection of participants', 'Post-exposure interventions', 'Missing data', 'Measurement of the outcome', 'Selection of the reported result'],
  rob1: ['Random sequence generation', 'Allocation concealment', 'Blinding of participants and personnel', 'Blinding of outcome assessment', 'Incomplete outcome data', 'Selective reporting', 'Other bias'],
  quadas2: ['Patient selection', 'Index test', 'Reference standard', 'Flow and timing'],
  probast: ['Participants', 'Predictors', 'Outcome', 'Analysis'],
};
export const domEN = (inst, id, fallback) => DOM[inst]?.[+String(id).replace(/\D/g, '') - 1] || fallback;
// columnas de instrumentos por ítems (AMSTAR 2, JBI, Newcastle-Ottawa)
const COL = { 'Selección': 'Selection', 'Comparab.': 'Comparab.', 'Comparabilidad': 'Comparability', 'Desenlace': 'Outcome', 'Ítem': 'Item', '(crítico)': '(critical)', 'de': 'of' };
export const colEN = s => String(s ?? '').replace(/Selección|Comparabilidad|Comparab\.|Desenlace|Ítem|\(crítico\)|★ de/g, m => (m === '★ de' ? '★ of' : COL[m]));
export const UNIT = { resultado: 'Result', estudio: 'Study', modelo: 'Model', 'revisión': 'Review' };
// títulos de los ejemplos para el título de las figuras
export const EX_TITLE = {
  dexa: 'Dexamethasone in severe pneumonia', dolor: 'Interventions for low back pain', perdidas: 'Trials with loss to follow-up', estatinas: 'Statins and dementia (cohorts)', cirugia: 'Surgery versus medical treatment',
  estatinas2: 'Statins and dementia (new-user cohorts)', emulacion: 'Target trial emulation with per-protocol effect', parteb: 'Part B: when to stop the assessment', dimerod: 'D-dimer and deep vein thrombosis', ia: 'Artificial intelligence for chest radiographs',
  erc: 'Chronic kidney disease risk models', sepsis: 'Sepsis scores', pm25: 'PM2.5 and mortality (cohorts)', solventes: 'Occupational exposure to solvents', acupuntura: 'Acupuncture trials', probioticos: 'Probiotics trials for diarrhoea',
  'amstar2|estatinas': 'Systematic reviews of statins', 'amstar2|dieta': 'Systematic reviews on diet and mortality', hta: 'Prevalence of hypertension in adults', vih: 'HIV prevalence by region', tabaco: 'Smoking and lung cancer (cohorts)', dieta: 'Mediterranean diet and mortality',
};
