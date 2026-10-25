// Figuras de riesgo de sesgo en SVG: semáforo (estudios × dominios) y barras de resumen (proporción por dominio, opcionalmente ponderada).
// Dos estilos: «robvis» (círculos sin cuadrícula) y «revman» (cuadrícula negra con círculos + / ? / −, como las figuras de RevMan).
// El tamaño de letra fs (unidades de la figura) escala textos y espaciados; el ancho final lo fija figs.js (ver data-fs).
import { LV } from './instruments.js?v=2026.10.25-5';
import { LVEN } from './en.js?v=2026.10.25-5';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const style = fs => `<style>text{font:${fs}px system-ui,sans-serif;fill:currentColor}.h{font-weight:600}.m{fill:var(--muted,#666)}.s{font-size:${+(fs * 0.92).toFixed(2)}px}</style>`;
const dark = new Set(['some', 'moderate', 'unclear', 'ni', 'py', 'na', 'cmod', 'conc_unclear', 'seek', 'qfair']);
const wrap = (t, n) => { const w = String(t).split(/\s+/), out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); } if (cur) out.push(cur); return out; };
// colores y símbolos de RevMan (verde +, amarillo ?, rojo −); los niveles extra de ROBINS-I/E mantienen símbolos propios
const RM = { low: ['#6EC83C', '+'], lowc: ['#6EC83C', '+'], some: ['#EBEB4B', '?'], unclear: ['#EBEB4B', '?'], ni: ['#EBEB4B', '?'], moderate: ['#EBEB4B', '?'], high: ['#D1361F', '−'], serious: ['#F28C28', '×'], critical: ['#B3261E', '!'], vhigh: ['#B3261E', '!'] };
export const look = (l, st) => { const d = LV[l]; if (!d) return null; const r = st === 'revman' && RM[l]; return { c: r ? r[0] : d.c, s: r ? r[1] : d.s, t: LVEN[l] || d.t, ink: st === 'revman' ? '#000000' : (dark.has(l) ? '#1B1B1B' : '#FFFFFF') }; };
const dom = id => /^D\d+$/.test(String(id));
const letter = i => String.fromCharCode(65 + i);


// ------------------------------------------------------------------ estilo RevMan (como en las revisiones Cochrane): cuadrícula negra, círculos con borde, leyenda a la derecha
const CW = 6.0; // ancho medio de un carácter (unidades de k = fs/12)
function trafficRM(rows, cols, { title = '', legend = [], legendOverall = null, overall = true, fs = 12, heads = false } = {}) {
  const k = fs / 12, cell = Math.round(fs * 2.1), nc = cols.length + (overall ? 1 : 0), gap = overall ? cell * 0.35 : 0, sw = +(1.1 * k).toFixed(2);
  const lw = Math.max(...rows.map(r => String(r.name).length), 6) * 7.0 * k, x0 = 8 * k + lw + 12 * k, gridW = nc * cell + gap, hasKey = cols.every(c => dom(c.id) && c.name);
  const levels = [...new Set([...(legend || []), ...(legendOverall || [])])].reverse(), keys = hasKey ? cols.map(c => `${c.short ?? c.id}: ${c.name}`) : [];
  const legX = x0 + gridW + 2.2 * fs, legW = Math.max(...levels.map(l => (look(l, 'revman').t.length + 4) * CW * k), ...keys.map(t => t.length * CW * k), 70 * k), W = legX + legW + 10 * k;
  const top = (title ? 24 : 8) * k + (heads || overall ? 16 * k : 4 * k), legH = (levels.length + 1) * 1.8 * fs + (keys.length ? 10 * k + keys.length * lh14(k) : 0), H = Math.max(top + rows.length * cell + 10 * k, top + legH + 6 * k);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(1)} ${+H.toFixed(1)}" data-fs="${fs}" class="plot" role="img" aria-label="${esc(title || 'Risk of bias traffic-light plot')}" style="max-width:${Math.round(W * 1.15)}px">${style(fs)}`;
  if (title) s += `<text x="8" y="${17 * k}" class="h">${esc(title)}</text>`;
  const cx = c => x0 + c * cell + cell / 2 + (overall && c === cols.length ? gap : 0);
  [...cols.map((c, i) => (heads ? (c.short ?? c.id) : '')), ...(overall ? ['Overall'] : [])].forEach((h, i) => { if (h) s += `<text x="${cx(i)}" y="${top - 6 * k}" text-anchor="middle" class="${i === cols.length ? 'h' : ''}">${esc(h)}</text>`; });
  rows.forEach((r, i) => {
    const yc = top + i * cell + cell / 2; s += `<text x="${x0 - 7 * k}" y="${yc + 4 * k}" text-anchor="end" style="font-variant:small-caps">${esc(r.name)}</text>`;
    [...r.js, ...(overall ? [r.overall] : [])].forEach((c, q) => {
      const j = c && typeof c === 'object' ? c.j : c, d = look(j, 'revman'), X = cx(q), lab = c && typeof c === 'object' && c.t ? c.t : d?.s;
      s += `<rect x="${X - cell / 2}" y="${top + i * cell}" width="${cell}" height="${cell}" fill="#FFFFFF" stroke="#000000" stroke-width="${sw}"/>`;
      if (d) s += `<circle cx="${X}" cy="${yc}" r="${cell * 0.36}" fill="${d.c}" stroke="#000000" stroke-width="${sw}"><title>${esc(r.name)}: ${esc(d.t)}</title></circle><text x="${X}" y="${yc + cell * 0.18}" text-anchor="middle" style="font-weight:700;fill:#000;font-size:${+(cell * 0.52).toFixed(1)}px">${esc(lab)}</text>`;
    });
  });
  let y = top + 4 * k; s += `<text x="${legX}" y="${y + 4 * k}" class="h">Judgement</text>`; y += 1.8 * fs;
  levels.forEach(l => { const d = look(l, 'revman'), rr = cell * 0.36; s += `<circle cx="${legX + rr}" cy="${y}" r="${rr}" fill="${d.c}" stroke="#000" stroke-width="${sw}"/><text x="${legX + rr}" y="${y + cell * 0.18}" text-anchor="middle" style="font-weight:700;fill:#000;font-size:${+(cell * 0.52).toFixed(1)}px">${esc(d.s)}</text><text x="${legX + 2 * rr + 8 * k}" y="${y + 4 * k}">${esc(d.t.replace(/ risk of bias$/i, '').replace(/^Low risk.*/, 'Low'))}</text>`; y += 1.8 * fs; });
  y += 6 * k; keys.forEach((t, i) => { s += `<text x="${legX}" y="${y + i * lh14(k)}">${esc(t)}</text>`; });
  return s + '</svg>';
}
const lh14 = k => 15 * k;
function summaryRM(cols, counts, levels, { title = '', weighted = false, fs = 12, xlab = '' } = {}) {
  const k = fs / 12, rh = 22 * k, bh = 15 * k, lw = Math.max(...cols.map(c => String(c.name).length), 8) * CW * k, x0 = 10 * k + lw + 10 * k, bw = 330 * k, W = x0 + bw + 24 * k, top = (title ? 26 : 10) * k, axY = top + cols.length * rh + 4 * k;
  const legItems = levels.map(l => look(l, 'revman')), legW = legItems.map(d => d.t.length * 6.6 * k + 46 * k), legRows = []; { let cur = [], w = 0; legItems.forEach((d, i) => { if (w + legW[i] > W - 16 * k && cur.length) { legRows.push(cur); cur = []; w = 0; } cur.push(i); w += legW[i]; }); if (cur.length) legRows.push(cur); }
  const H = axY + 50 * k + legRows.length * 20 * k, sw = +(0.9 * k).toFixed(2);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(1)} ${+H.toFixed(1)}" data-fs="${fs}" class="plot" role="img" aria-label="${esc(title || 'Risk of bias summary')}" style="max-width:${Math.round(W * 1.15)}px">${style(fs)}`;
  if (title) s += `<text x="8" y="${17 * k}" class="h">${esc(title)}</text>`;
  cols.forEach((c, i) => {
    const y = top + i * rh, cn = counts[c.id] || {}, tot = levels.reduce((a, l) => a + (cn[l] || 0), 0) || 1; let x = x0;
    s += `<text x="${x0 - 8 * k}" y="${y + bh / 2 + 5 * k}" text-anchor="end">${esc(c.name)}</text>`;
    levels.forEach(l => { const w = (cn[l] || 0) / tot * bw; if (w <= 0) return; const d = look(l, 'revman'); s += `<rect x="${x}" y="${y}" width="${w}" height="${bh}" fill="${d.c}" stroke="#000" stroke-width="${sw}"><title>${esc(c.name)}: ${esc(d.t)} ${Math.round((cn[l] || 0) / tot * 100)} %</title></rect>`; x += w; });
  });
  s += `<line x1="${x0}" x2="${x0 + bw}" y1="${axY}" y2="${axY}" stroke="#000" stroke-width="${sw}"/>`;
  [0, 25, 50, 75, 100].forEach(v => { const x = x0 + v / 100 * bw; s += `<line x1="${x}" x2="${x}" y1="${axY}" y2="${axY + 4 * k}" stroke="#000" stroke-width="${sw}"/><text x="${x}" y="${axY + 17 * k}" text-anchor="middle">${v}</text>`; });
  s += `<text x="${x0 + bw / 2}" y="${axY + 33 * k}" text-anchor="middle">${esc(xlab || (weighted ? 'Weighted risk of bias %' : 'Risk of bias %'))}</text>`;
  legRows.forEach((r, q) => { let x = 12 * k; r.forEach(i => { const d = legItems[i]; s += `<rect x="${x}" y="${axY + 46 * k + q * 20 * k}" width="${14 * k}" height="${12 * k}" fill="${d.c}" stroke="#000" stroke-width="${sw}"/><text x="${x + 20 * k}" y="${axY + 56 * k + q * 20 * k}">${esc(d.t)}</text>`; x += legW[i]; }); });
  return s + '</svg>';
}

function legendRow(levels, x0, y, W, fs, st) {
  const k = fs / 12; let x = x0, s = '';
  for (const l of levels) {
    const d = look(l, st), r = 7 * k;
    s += `<circle cx="${x + r}" cy="${y}" r="${r}" fill="${d.c}"/><text x="${x + r}" y="${y + 4 * k}" text-anchor="middle" class="s" style="fill:${d.ink};font-weight:700">${esc(d.s)}</text><text x="${x + 2 * r + 6 * k}" y="${y + 4 * k}" class="s">${esc(d.t)}</text>`;
    x += 2 * r + 24 * k + 6.2 * k * d.t.length;
    const nx = levels[levels.indexOf(l) + 1];
    if (nx && x + 2 * r + 24 * k + 6.2 * k * LV[nx].t.length > W - 8) { x = x0; y += 20 * k; }
  }
  return { s, y };
}

// rows: [{name, js:[nivel…], overall}], cols: [{id, short, name?, crit?}]; legend: niveles de las celdas; legendOverall: niveles distintos para la columna global
export function trafficLight(rows, cols, { title = '', legend = [], legendOverall = null, overall = true, cell = 30, maxName = 34, fs = 12, st = 'robvis', heads: showHeads = false } = {}) {
  if (st === 'revman') return trafficRM(rows, cols, { title, legend, legendOverall, overall, fs, heads: showHeads });
  const k = fs / 12, rm = st === 'revman', lh = 14 * k;
  const names = rows.map(r => wrap(r.name, maxName)), lw = Math.min(280 * k, 6.4 * k * Math.max(...names.map(n => Math.max(...n.map(l => l.length))), 8));
  const cw = rm ? Math.max(Math.round(fs * 2.7), Math.round(fs * 4.4)) : cell * k, ch = rm ? Math.round(fs * 2.7) : cell * k;
  const rowH = Math.max(ch, ...names.map(n => lh * n.length + 6 * k)), nc = cols.length + (overall ? 1 : 0), gap = overall ? 12 * k : 0;
  const x0 = rm ? 8 + lw + 14 * k : lw + 14 * k, top = (rm ? 30 : 36) * k + (title ? 18 * k : 0);
  const heads = [...cols.map((c, i) => (rm && cols.every(q => dom(q.id)) ? letter(i) : (c.short ?? c.id))), ...(overall ? ['Overall'] : [])];
  // leyenda de dominios: RevMan «(A) nombre»; robvis «D1: nombre»
  const hasKey = cols.every(c => dom(c.id) && c.name), Wn = x0 + nc * cw + gap + 20 * k, W = Math.max(Wn, 300 * k, hasKey || rm ? 420 * k : 0);
  const keyLines = hasKey ? cols.flatMap((c, i) => wrap(`${rm ? `(${letter(i)})` : `${c.short ?? c.id}:`} ${c.name}`, Math.floor((W - 16 * k) / (5.8 * k)))) : [];
  const nl = L => (L ? (legendRow(L, 8, 0, W, fs, st).y / (20 * k)) + 1 : 0);
  const keyH = keyLines.length ? keyLines.length * lh + 14 * k : 0;
  const H = top + rows.length * rowH + 16 * k + keyH + 22 * k * (nl(legend) + nl(legendOverall)) + (rm ? 6 * k : 0);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(1)} ${+H.toFixed(1)}" data-fs="${fs}" class="plot" role="img" aria-label="${esc(title || 'Traffic-light plot of risk of bias')}" style="max-width:${Math.round(W * 1.15)}px">${style(fs)}`;
  if (title) s += `<text x="8" y="${18 * k}" class="h">${esc(title)}</text>`;
  const cx = i => x0 + i * cw + cw / 2 + (overall && i === cols.length ? gap : 0);
  heads.forEach((h, i) => { s += `<text x="${cx(i)}" y="${top - 10 * k}" text-anchor="middle" class="${i === cols.length && overall ? 'h' : cols[i]?.crit ? 'h' : ''}">${esc(h)}</text>`; });
  rows.forEach((r, i) => {
    const yc = top + i * rowH + rowH / 2, vals = [...r.js, ...(overall ? [r.overall] : [])];
    names[i].forEach((l, q) => { const yy = yc + 4 * k + (q - (names[i].length - 1) / 2) * lh; s += rm ? `<text x="8" y="${yy}">${esc(l)}</text>` : `<text x="${lw + 4}" y="${yy}" text-anchor="end">${esc(l)}</text>`; });
    vals.forEach((c, q) => {
      const j = c && typeof c === 'object' ? c.j : c, d = look(j, st), lab = c && typeof c === 'object' && c.t ? c.t : d?.s, X = cx(q);
      s += d ? `<circle cx="${X}" cy="${yc}" r="${ch * 0.38}" fill="${d.c}"${rm ? ` stroke="#000000" stroke-width="${+(1.3 * k).toFixed(2)}"` : ''}><title>${esc(r.name)}: ${esc(d.t)}${c && c.t ? ' ' + esc(c.t) : ''}</title></circle><text x="${X}" y="${yc + 4.5 * k}" text-anchor="middle" style="fill:${d.ink};font-weight:700;font-size:${+((c && c.t ? 9.5 : 13) * k).toFixed(2)}px">${esc(lab)}</text>` : `<circle cx="${X}" cy="${yc}" r="${ch * 0.38}" fill="none" stroke="#B5BCBE" stroke-dasharray="2 2"/>`;
    });
  });
  if (rm) s += `<line x1="8" x2="${W - 8}" y1="${top - 4 * k}" y2="${top - 4 * k}" stroke="#000000" stroke-width="${+(1.2 * k).toFixed(2)}"/>`;
  if (overall && !rm) s += `<line x1="${x0 + cols.length * cw + gap / 2}" x2="${x0 + cols.length * cw + gap / 2}" y1="${top - 4 * k}" y2="${top + rows.length * rowH}" stroke="#B5BCBE"/>`;
  let yl = top + rows.length * rowH + 22 * k;
  if (keyLines.length) { keyLines.forEach((t, q) => { s += `<text x="8" y="${yl + q * lh - 4 * k}" class="s">${esc(t)}</text>`; }); yl += keyLines.length * lh + 6 * k; }
  const a = legendRow(legend, 8, yl, W, fs, st); s += a.s;
  if (legendOverall) s += legendRow(legendOverall, 8, a.y + 22 * k, W, fs, st).s;
  return s + '</svg>';
}

// cols: [{id, name}], counts: {id: {nivel: peso}}; levels: orden de apilado (de mejor a peor)
export function summaryBar(cols, counts, levels, { title = '', weighted = false, fs = 12, st = 'robvis' } = {}) {
  if (st === 'revman') return summaryRM(cols, counts, levels, { title, weighted, fs });
  const k = fs / 12, rm = st === 'revman', pad = rm && cols.every(c => dom(c.id) && c.name);
  const labels = cols.map((c, i) => (pad ? `(${letter(i)}) ${c.name}` : c.name)), lines = labels.map(t => wrap(t, 40));
  const lw = Math.min(300 * k, 6.4 * k * Math.max(...lines.map(l => Math.max(...l.map(t => t.length))), 8)), x0 = lw + 14 * k, bw = 380 * k, W = Math.max(x0 + bw + 30 * k, 540 * k), rowH = 32 * k, top = 34 * k + (title ? 18 * k : 0);
  const nLeg = legendRow(levels, 0, 0, W, fs, st).y / (20 * k) + 1, H = top + cols.length * rowH + 50 * k + 20 * k * nLeg;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(1)} ${+H.toFixed(1)}" data-fs="${fs}" class="plot" role="img" aria-label="${esc(title || 'Summary plot of risk of bias')}" style="max-width:${Math.round(W * 1.15)}px">${style(fs)}`;
  if (title) s += `<text x="8" y="${18 * k}" class="h">${esc(title)}</text>`;
  cols.forEach((c, i) => {
    const y = top + i * rowH, cn = counts[c.id] || {}, tot = levels.reduce((a, l) => a + (cn[l] || 0), 0) || 1; let x = x0;
    lines[i].forEach((t, q) => { s += `<text x="${lw + 4}" y="${y + 17 * k + (q - (lines[i].length - 1) / 2) * 13 * k}" text-anchor="end" class="${c.id === 'Global' ? 'h' : ''}">${esc(t)}</text>`; });
    levels.forEach(l => {
      const w = (cn[l] || 0) / tot * bw; if (w <= 0) return; const pct = Math.round((cn[l] || 0) / tot * 100), d = look(l, st);
      s += `<rect x="${x}" y="${y + 4 * k}" width="${w}" height="${rowH - 10 * k}" fill="${d.c}"${rm ? ` stroke="#000000" stroke-width="${+(1 * k).toFixed(2)}"` : ''}><title>${esc(c.name)}: ${esc(d.t)} ${pct} %</title></rect>`;
      if (w > 26 * k) s += `<text x="${x + w / 2}" y="${y + 18 * k}" text-anchor="middle" class="s" style="fill:${d.ink}">${pct} %</text>`;
      x += w;
    });
  });
  const yb = top + cols.length * rowH + 2 * k; s += `<line x1="${x0}" x2="${x0 + bw}" y1="${yb}" y2="${yb}" stroke="currentColor" stroke-width=".7"/>`;
  [0, 25, 50, 75, 100].forEach(v => { const x = x0 + v / 100 * bw; s += `<line x1="${x}" x2="${x}" y1="${yb}" y2="${yb + 4 * k}" stroke="currentColor"/><text x="${x}" y="${yb + 16 * k}" text-anchor="middle" class="s">${v} %</text>`; });
  s += `<text x="${x0 + bw / 2}" y="${yb + 30 * k}" text-anchor="middle" class="s m">${weighted ? 'Proportion weighted by study weight' : 'Proportion of studies'}</text>`;
  return s + legendRow(levels, 8, yb + 48 * k, W, fs, st).s + '</svg>';
}
