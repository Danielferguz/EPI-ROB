# EPI-ROB

Evaluación del **riesgo de sesgo** y de la confianza en la evidencia, en el navegador. Un módulo de **EPI-LAB** (Daniel Fernández-Guzmán), hermano de [EPI-DATA](https://github.com/Danielferguz/EPI-DATA).

Nace como una versión ampliada del [evaluador de sesgo](https://jbarbozameca.github.io/riskofbias/) del Dr. Joshuan J. Barboza (RoB 2, ROBINS-E, QUADAS-3, AMSTAR 2). EPI-ROB es una implementación independiente (no reutiliza su código ni sus textos); sus algoritmos de RoB 2 se contrastaron con los de esa herramienta y con las tablas oficiales.

## Qué hace

- **Instrumentos**: RoB 2 (efecto de la asignación y de adherirse), RoB 1, ROBINS-I, ROBINS-E, QUADAS-2, PROBAST, AMSTAR 2, lista JBI de prevalencia y Newcastle-Ottawa (cohortes).
- **Guía de cada juicio**: en cada dominio, una tabla «¿cuándo corresponde cada opción?» con casos de ejemplo, y 2–3 ejemplos con estudios ficticios por instrumento.
- **Preguntas señalizadoras** con visibilidad condicional, notas de ayuda y **algoritmo oficial** que propone el juicio (RoB 2, QUADAS-2, PROBAST, AMSTAR 2); el evaluador puede cambiarlo y debe justificarlo.
- **Dos revisores + consenso**: acuerdo, kappa de Cohen y kappa ponderado lineal por dominio; resolución de discrepancias con un clic.
- **Figuras**: semáforo y barras de resumen (ponderables por peso del estudio) en SVG, PNG y TIFF con DPI y ancho de columna de revista.
- **Intercambio**: CSV compatible con [robvis](https://github.com/mcguinlu/robvis) (exportar e importar), tabla en color para Excel, proyecto JSON, texto de métodos y resultados en español e inglés.
- Todo se guarda **solo en el navegador**; no hay servidor.

## Validación

`node tests/validate.mjs` (121 comprobaciones):

- RoB 2: se enumeran **todas** las combinaciones de respuestas de cada dominio (D1 125, D2 78 125 y 32 400, D3 500, D4 3 125, D5 125) y se comparan con las tablas 4, 6, 8, 10, 12 y 14 de la guía oficial (Higgins et al., 2019), transcritas como filas independientes del código; más la tabla 1 (global).
- ROBINS-E: todas las combinaciones de D1–D4, D6 y D7 y miles de D3 y D5 frente a los diagramas de flujo oficiales (24 mar 2024); también coinciden con otra implementación independiente.
- QUADAS-2, PROBAST (preguntas solo de desarrollo; regla de desarrollo sin validación externa), AMSTAR 2 (criterios por ítem, ECA/no aleatorizados, sin metaanálisis, reglas de confianza global), ROBINS-I (global).
- Kappa frente a `sklearn.metrics.cohen_kappa_score`; ida y vuelta de robvis CSV y JSON; los ejemplos están completos y dan el juicio esperado.

## Límites

- ROBINS-I (v1) y RoB 1 no publican algoritmo: el juicio es del evaluador. No incluye RoB 2 para ensayos por conglomerados o cruzados ni NOS de casos y controles (cargue sus juicios con «Importar juicios»).
- JBI y NOS: los umbrales de decisión son convenciones configurables (el JBI no los define; los de NOS son los de AHRQ).
- Las preguntas están reformuladas en español y resumidas; no sustituyen las guías oficiales.
- La «independencia» de dos revisores en un mismo navegador es organizativa, no técnica.
- Los ejemplos usan estudios **ficticios**.

## Uso local

```
python3 -m http.server 8000   # y abrir http://localhost:8000
```

## Licencia y cita

CC BY-NC-ND 4.0. Ver `CITATION.cff`.
