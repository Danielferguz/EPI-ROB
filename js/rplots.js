// Figuras de riesgo de sesgo en SVG: semáforo (estudios × dominios) y barras de resumen (proporción por dominio, opcionalmente ponderada).
import { LV } from './instruments.js?v=2026.10.23-1';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STYLE = '<style>text{font:12px system-ui,sans-serif;fill:currentColor}.h{font-weight:600}.m{fill:var(--muted,#666)}.s{font-size:11px}</style>';
const dark = new Set(['some', 'moderate', 'unclear', 'ni', 'py', 'na', 'cmod', 'conc_unclear']);
const wrap = (t, n) => { const w = String(t).split(/\s+/), out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); } if (cur) out.push(cur); return out; };
const legendRow = (levels, x0, y, W) => { let x = x0, s = ''; for (const l of levels) { const d = LV[l]; s += `<circle cx="${x + 7}" cy="${y}" r="7" fill="${d.c}"/><text x="${x + 7}" y="${y + 4}" text-anchor="middle" class="s" fill="${dark.has(l) ? '#1B1B1B' : '#FFFFFF'}" style="font-weight:700">${esc(d.s)}</text><text x="${x + 20}" y="${y + 4}" class="s">${esc(d.t)}</text>`; x += 30 + 6.2 * d.t.length; if (l !== levels.at(-1) && x + 30 + 6.2 * LV[levels[levels.indexOf(l) + 1]].t.length > W - 8) { x = x0; y += 20; } } return { s, y }; };

// rows: [{name, js:[nivel…], overall}], cols: [{id, short, crit?}]; legend: niveles de las celdas; legendOverall: niveles distintos para la columna global
export function trafficLight(rows, cols, { title = '', legend = [], legendOverall = null, overall = true, cell = 30, maxName = 34 } = {}) {
  const names = rows.map(r => wrap(r.name, maxName)), lw = Math.min(280, 6.4 * Math.max(...names.map(n => Math.max(...n.map(l => l.length))), 8)), x0 = lw + 14, rowH = Math.max(cell, ...names.map(n => 14 * n.length + 6));
  const nc = cols.length + (overall ? 1 : 0), gap = overall ? 12 : 0, W = Math.max(x0 + nc * cell + gap + 20, 300), top = 36 + (title ? 18 : 0), H = top + rows.length * rowH + 30 + 24 * (legendOverall ? 2 : 1);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="plot" role="img" aria-label="${esc(title || 'Semáforo de riesgo de sesgo')}">${STYLE}`;
  if (title) s += `<text x="8" y="18" class="h">${esc(title)}</text>`;
  const cx = k => x0 + k * cell + cell / 2 + (overall && k === cols.length ? gap : 0);
  [...cols, ...(overall ? [{ id: 'Global', short: 'Global' }] : [])].forEach((c, k) => { s += `<text x="${cx(k)}" y="${top - 10}" text-anchor="middle" class="${k === cols.length && overall ? 'h' : c.crit ? 'h' : ''}">${esc(c.short ?? c.id)}</text>`; });
  rows.forEach((r, i) => {
    const y = top + i * rowH + rowH / 2; names[i].forEach((l, k) => { s += `<text x="${lw + 4}" y="${y + 4 + (k - (names[i].length - 1) / 2) * 14}" text-anchor="end">${esc(l)}</text>`; });
    const vals = [...r.js, ...(overall ? [r.overall] : [])];
    vals.forEach((j, k) => { const d = LV[j]; s += d ? `<circle cx="${cx(k)}" cy="${y}" r="${cell * 0.38}" fill="${d.c}"><title>${esc(r.name)}: ${esc(d.t)}</title></circle><text x="${cx(k)}" y="${y + 4.5}" text-anchor="middle" fill="${dark.has(j) ? '#1B1B1B' : '#FFFFFF'}" style="font-weight:700;font-size:13px">${esc(d.s)}</text>` : `<circle cx="${cx(k)}" cy="${y}" r="${cell * 0.38}" fill="none" stroke="#B5BCBE" stroke-dasharray="2 2"/>`; });
  });
  if (overall) s += `<line x1="${x0 + cols.length * cell + gap / 2}" x2="${x0 + cols.length * cell + gap / 2}" y1="${top - 4}" y2="${top + rows.length * rowH}" stroke="#B5BCBE"/>`;
  const yl = top + rows.length * rowH + 22, a = legendRow(legend, 8, yl, W); s += a.s;
  if (legendOverall) s += legendRow(legendOverall, 8, a.y + 22, W).s;
  return s + '</svg>';
}

// cols: [{id, name}], counts: {id: {nivel: peso}}; levels: orden de apilado (de mejor a peor)
export function summaryBar(cols, counts, levels, { title = '', weighted = false } = {}) {
  const lines = cols.map(c => wrap(c.name, 40)), lw = Math.min(300, 6.4 * Math.max(...lines.map(l => Math.max(...l.map(t => t.length))), 8)), x0 = lw + 14, bw = 380, W = Math.max(x0 + bw + 30, 540), rowH = 32, top = 34 + (title ? 18 : 0), H = top + cols.length * rowH + 66;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="plot" role="img" aria-label="${esc(title || 'Resumen de riesgo de sesgo')}">${STYLE}`;
  if (title) s += `<text x="8" y="18" class="h">${esc(title)}</text>`;
  cols.forEach((c, i) => {
    const y = top + i * rowH, cn = counts[c.id] || {}, tot = levels.reduce((a, l) => a + (cn[l] || 0), 0) || 1; let x = x0;
    lines[i].forEach((t, k) => { s += `<text x="${lw + 4}" y="${y + 17 + (k - (lines[i].length - 1) / 2) * 13}" text-anchor="end" class="${c.id === 'Global' ? 'h' : ''}">${esc(t)}</text>`; });
    levels.forEach(l => { const w = (cn[l] || 0) / tot * bw; if (w <= 0) return; const pct = Math.round((cn[l] || 0) / tot * 100); s += `<rect x="${x}" y="${y + 4}" width="${w}" height="${rowH - 10}" fill="${LV[l].c}"><title>${esc(c.name)}: ${esc(LV[l].t)} ${pct} %</title></rect>`; if (w > 26) s += `<text x="${x + w / 2}" y="${y + 18}" text-anchor="middle" class="s" fill="${dark.has(l) ? '#1B1B1B' : '#FFFFFF'}">${pct} %</text>`; x += w; });
  });
  const yb = top + cols.length * rowH + 2; s += `<line x1="${x0}" x2="${x0 + bw}" y1="${yb}" y2="${yb}" stroke="currentColor" stroke-width=".7"/>`;
  [0, 25, 50, 75, 100].forEach(v => { const x = x0 + v / 100 * bw; s += `<line x1="${x}" x2="${x}" y1="${yb}" y2="${yb + 4}" stroke="currentColor"/><text x="${x}" y="${yb + 16}" text-anchor="middle" class="s">${v} %</text>`; });
  s += `<text x="${x0 + bw / 2}" y="${yb + 30}" text-anchor="middle" class="s m">${weighted ? 'Proporción ponderada por el peso de cada estudio' : 'Proporción de estudios'}</text>`;
  return s + legendRow(levels, 8, yb + 48, W).s + '</svg>';
}
