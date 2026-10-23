export const GUIDE_HTML = `
<div class="card prose">
  <h2>Riesgo de sesgo: qué es y cómo se evalúa</h2>
  <div class="howto"><div><b>Qué se hace</b>Se juzga si el diseño, la conducción o el análisis de un estudio pudieron distorsionar su resultado. Cada instrumento organiza el juicio en <i>dominios</i> y <i>preguntas señalizadoras</i>.</div><div><b>Para qué</b>Ponderar la confianza en la evidencia (GRADE), decidir análisis de sensibilidad en un metaanálisis y cumplir PRISMA 2020.</div><div><b>Cómo interpretar</b>El juicio es de un <i>resultado</i> concreto (RoB 2, ROBINS-I) o del estudio/modelo/revisión (QUADAS-2, PROBAST, AMSTAR 2). Es una descripción de riesgo, no una puntuación: no sume dominios.</div></div>
  <h3>Cómo trabaja EPI-ROB</h3>
  <ol><li><b>Elija el instrumento</b> según el diseño del estudio (tarjetas de abajo) y añada los estudios.</li><li><b>Responda las preguntas señalizadoras</b>: Sí, Probablemente sí, Probablemente no, No o Sin información. Cada pregunta trae una nota breve de ayuda.</li><li><b>Revise el juicio propuesto</b> por el algoritmo oficial (RoB 2, QUADAS-2, PROBAST, AMSTAR 2). Puede cambiarlo, pero debe justificarlo con una cita del estudio.</li><li><b>Dos revisores</b> (opcional): cada uno evalúa por separado; el programa calcula el acuerdo y el kappa y le ayuda a registrar el consenso.</li><li><b>Figuras</b>: semáforo y barras de resumen listos para la revista (SVG, PNG, TIFF), texto de métodos y exportación compatible con <i>robvis</i>.</li></ol>
  <div class="warn">Los algoritmos <b>proponen</b> un juicio; la decisión final y su justificación son del evaluador. ROBINS-I no publica algoritmo en su versión 1: allí el juicio es siempre suyo.</div>
</div>`;
export const HELP_HTML = `
<h2>Ayuda</h2>
<h3>Instrumentos incluidos</h3>
<ul>
<li><b>RoB 2</b> (ensayos aleatorizados de grupos paralelos): cinco dominios, algoritmos de la guía oficial de 2019 para el efecto de la asignación y para el efecto de adherirse. Se evalúa un resultado numérico concreto.</li>
<li><b>ROBINS-I</b> (no aleatorizados, versión 1 de 2016): siete dominios con preguntas señalizadoras y juicio del evaluador (bajo, moderado, serio, crítico, sin información); el global sigue la regla del instrumento.</li>
<li><b>QUADAS-2</b> (exactitud diagnóstica): cuatro dominios, aplicabilidad en los tres primeros; todo «Sí» → bajo, algún «No» → alto, resto → no claro.</li>
<li><b>PROBAST</b> (modelos de predicción): cuatro dominios y 20 preguntas; las preguntas 4.2, 4.5, 4.8 y 4.9 solo aplican al desarrollo; advertencia de PROBAST para desarrollos sin validación externa.</li>
<li><b>AMSTAR 2</b> (revisiones sistemáticas): 16 ítems con casillas de criterios para «Sí parcial / Sí»; siete ítems críticos; la confianza global (alta, moderada, baja, críticamente baja) sale del número de fallos críticos y debilidades no críticas.</li>
</ul>
<p>No incluidos: ROBINS-E y RoB 2 para ensayos por conglomerados o cruzados. Si los necesita, use las plantillas oficiales en <a href="https://www.riskofbias.info">riskofbias.info</a> y cargue los juicios con «Importar juicios (CSV)».</p>
<h3>Respuestas y juicios</h3>
<ul><li><b>Probablemente sí / no</b> tienen las mismas consecuencias que Sí / No; indican que usted infiere con información indirecta. <b>Sin información</b> solo cuando el informe no permite juzgar.</li><li>Las preguntas que dejan de ser necesarias se ocultan según sus respuestas anteriores.</li><li>El juicio manual reemplaza al propuesto y se marca como «modificado».</li></ul>
<h3>Dos revisores y consenso</h3>
<p>Active «Dos revisores» en el paso 2. Cada revisor trabaja en su propia pestaña (sus respuestas no se mezclan). En el paso 4 se calculan acuerdo y kappa (de Cohen; ponderado lineal para escalas ordinales) y se copian al consenso los dominios elegidos. Las figuras usan el consenso si existe; si no, el revisor 1. Trabajando sobre un mismo navegador no hay verdadera independencia: exporte el JSON de cada revisor y combínelos si trabajan en equipos distintos.</p>
<h3>Datos y privacidad</h3>
<p>El proyecto se guarda en el almacenamiento local de su navegador (se pierde si limpia datos del sitio). Descargue el JSON periódicamente. Nada se envía a servidores.</p>
<h3>Importar y exportar</h3>
<ul><li><b>CSV compatible con robvis</b>: columnas <code>Study, D1…Dk, Overall, Weight</code> con <code>Low, Some concerns, High</code> (RoB 2), <code>Low, Moderate, Serious, Critical, No information</code> (ROBINS-I) o <code>Low, High, Unclear</code> (QUADAS-2, PROBAST). También se leen etiquetas en español.</li><li><b>Tabla en color (Excel)</b> con juicios y sustentos.</li></ul>
<h3>Validación</h3>
<p><code>node tests/validate.mjs</code> enumera todas las combinaciones de respuestas de cada dominio de RoB 2 y las compara con las tablas 1, 4, 6, 8, 10, 12 y 14 de la guía oficial; comprueba reglas de QUADAS-2, PROBAST y AMSTAR 2, el kappa frente a <i>scikit-learn</i> y la ida y vuelta de los formatos.</p>
<h3>Referencias</h3>
<ul>
<li>Sterne JAC et al. RoB 2. <i>BMJ</i> 2019;366:l4898. Higgins JPT et al. (eds). RoB 2 guidance for parallel trials, 2019.</li>
<li>Sterne JAC et al. ROBINS-I. <i>BMJ</i> 2016;355:i4919.</li>
<li>Whiting PF et al. QUADAS-2. <i>Ann Intern Med</i> 2011;155:529–36.</li>
<li>Wolff RF et al. PROBAST. <i>Ann Intern Med</i> 2019;170:51–58.</li>
<li>Shea BJ et al. AMSTAR 2. <i>BMJ</i> 2017;358:j4008.</li>
<li>McGuinness LA, Higgins JPT. Risk-of-bias VISualization (robvis). <i>Res Synth Methods</i> 2021;12:55–61.</li>
</ul>
<h3>Cita y licencia</h3>
<p>Fernández-Guzmán D. EPI-ROB (EPI-LAB). CC BY-NC-ND 4.0. Las preguntas se reformulan en español a partir de los instrumentos publicados; no sustituyen sus guías oficiales.</p>`;
