// Figuras de riesgo de sesgo en SVG: semáforo (estudios × dominios) y barras de resumen (proporción por dominio, opcionalmente ponderada).
// Dos estilos: «robvis» (círculos sin cuadrícula) y «revman» (cuadrícula negra con círculos + / ? / −, como las figuras de RevMan).
// El tamaño de letra fs (unidades de la figura) escala textos y espaciados; el ancho final lo fija figs.js (ver data-fs).
import { LV } from './instruments.js?v=2026.10.25-2';
import { LVEN } from './en.js?v=2026.10.25-2';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const style = fs => `<style>text{font:${fs}px system-ui,sans-serif;fill:currentColor}.h{font-weight:600}.m{fill:var(--muted,#666)}.s{font-size:${+(fs * 0.92).toFixed(2)}px}</style>`;
const dark = new Set(['some', 'moderate', 'unclear', 'ni', 'py', 'na', 'cmod', 'conc_unclear', 'seek', 'qfair', 'lowc']);
const wrap = (t, n) => { const w = String(t).split(/\s+/), out = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); } if (cur) out.push(cur); return out; };
// colores y símbolos de RevMan (verde +, amarillo ?, rojo −); los niveles extra de ROBINS-I/E mantienen símbolos propios
const RM = { low: ['#66CC33', '+'], lowc: ['#66CC33', '+'], some: ['#EEEE55', '?'], unclear: ['#EEEE55', '?'], ni: ['#EEEE55', '?'], moderate: ['#EEEE55', '?'], high: ['#D8361F', '−'], serious: ['#F28C28', '×'], critical: ['#8B1A1A', '!'], vhigh: ['#8B1A1A', '!'] };
export const look = (l, st) => { const d = LV[l]; if (!d) return null; const r = st === 'revman' && RM[l]; return { c: r ? r[0] : d.c, s: r ? r[1] : d.s, t: LVEN[l] || d.t, ink: st === 'revman' ? '#000000' : (dark.has(l) ? '#1B1B1B' : '#FFFFFF') }; };
const dom = id => /^D\d+$/.test(String(id));
const letter = i => String.fromCharCode(65 + i);

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
export function trafficLight(rows, cols, { title = '', legend = [], legendOverall = null, overall = true, cell = 30, maxName = 34, fs = 12, st = 'robvis' } = {}) {
  const k = fs / 12, rm = st === 'revman', lh = 14 * k;
  const names = rows.map(r => wrap(r.name, maxName)), lw = Math.min(280 * k, 6.4 * k * Math.max(...names.map(n => Math.max(...n.map(l => l.length))), 8));
  const cw = rm ? Math.max(Math.round(fs * 2.7), Math.round(fs * 4.4)) : cell * k, ch = rm ? Math.round(fs * 2.7) : cell * k;
  const rowH = Math.max(ch, ...names.map(n => lh * n.length + 6 * k)), nc = cols.length + (overall ? 1 : 0), gap = overall ? 12 * k : 0;
  const x0 = rm ? 8 + lw + 14 * k : lw + 14 * k, top = (rm ? 30 : 36) * k + (title ? 18 * k : 0);
  const heads = [...cols.map((c, i) => (rm && cols.every(q => dom(q.id)) ? letter(i) : (c.short ?? c.id))), ...(overall ? ['Overall'] : [])];
  // leyenda de dominios (RevMan): (A) nombre completo
  const keyLines = rm && cols.every(c => dom(c.id) && c.name) ? cols.flatMap((c, i) => wrap(`(${letter(i)}) ${c.name}`, Math.round(110 / k * 1.1))) : [];
  const Wn = x0 + nc * cw + gap + 20 * k, W = Math.max(Wn, 300 * k, rm ? 420 * k : 0);
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
      if (rm) s += `<rect x="${X - cw / 2}" y="${top + i * rowH}" width="${cw}" height="${rowH}" fill="#FFFFFF" stroke="#000000" stroke-width="${+(1.2 * k).toFixed(2)}"/>`;
      s += d ? `<circle cx="${X}" cy="${yc}" r="${(rm ? ch * 0.36 : ch * 0.38)}" fill="${d.c}"><title>${esc(r.name)}: ${esc(d.t)}${c && c.t ? ' ' + esc(c.t) : ''}</title></circle><text x="${X}" y="${yc + 4.5 * k}" text-anchor="middle" style="fill:${d.ink};font-weight:700;font-size:${+((c && c.t ? 9.5 : 13) * k).toFixed(2)}px">${esc(lab)}</text>` : `<circle cx="${X}" cy="${yc}" r="${ch * 0.38}" fill="none" stroke="#B5BCBE" stroke-dasharray="2 2"/>`;
    });
  });
  if (overall && !rm) s += `<line x1="${x0 + cols.length * cw + gap / 2}" x2="${x0 + cols.length * cw + gap / 2}" y1="${top - 4 * k}" y2="${top + rows.length * rowH}" stroke="#B5BCBE"/>`;
  let yl = top + rows.length * rowH + 22 * k;
  if (keyLines.length) { keyLines.forEach((t, q) => { s += `<text x="8" y="${yl + q * lh - 4 * k}" class="s">${esc(t)}</text>`; }); yl += keyLines.length * lh + 6 * k; }
  const a = legendRow(legend, 8, yl, W, fs, st); s += a.s;
  if (legendOverall) s += legendRow(legendOverall, 8, a.y + 22 * k, W, fs, st).s;
  return s + '</svg>';
}

// cols: [{id, name}], counts: {id: {nivel: peso}}; levels: orden de apilado (de mejor a peor)
export function summaryBar(cols, counts, levels, { title = '', weighted = false, fs = 12, st = 'robvis' } = {}) {
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
