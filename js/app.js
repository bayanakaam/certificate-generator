(() => {
'use strict';
const { t } = window.I18N;
const isEn = () => window.I18N.getLang() === 'en';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const collator = new Intl.Collator(['ar', 'en'], { numeric: true, sensitivity: 'base' });
const LS_KEY = 'certgen.v1', LS_IMG = 'certgen.v1.img', LS_FONTS = 'certgen.v1.fonts', LS_TOUR = 'certgen.tour';


/* ================= fonts ================= */
const GF_AR = [
  ['Cairo', 'wght@200..1000'], ['Tajawal', 'wght@200;300;400;500;700;800;900'], ['Almarai', 'wght@300;400;700;800'],
  ['Amiri', 'wght@400;700'], ['Noto Kufi Arabic', 'wght@100..900'], ['Noto Naskh Arabic', 'wght@400..700'],
  ['Reem Kufi', 'wght@400..700'], ['El Messiri', 'wght@400..700'], ['Changa', 'wght@200..800'],
  ['Markazi Text', 'wght@400..700'], ['Aref Ruqaa', 'wght@400;700'], ['Scheherazade New', 'wght@400;700'], ['Lalezar', ''],
];
const GF_LAT = [['Great Vibes', ''], ['Playfair Display', 'wght@400..900'], ['Cinzel', 'wght@400..900'], ['Montserrat', 'wght@100..900']];
const SYS = ['Sakkal Majalla', 'Traditional Arabic', 'Simplified Arabic', 'Arabic Typesetting', 'Andalus', 'Arial', 'Tahoma', 'Times New Roman', 'Segoe UI'];
const FONT_SAMPLE = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي ةىءآأإؤئ لا ـ 0123456789 ٠١٢٣٤٥٦٧٨٩ abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ .,:/-()';
for (const [n, w] of [...GF_AR, ...GF_LAT]) {
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${n.replace(/ /g, '+')}${w ? ':' + w : ''}&display=swap`;
  document.head.appendChild(l);
}

/* ================= state ================= */
const DEF = {
  label: 'نص', text: '', x: 0, y: 0, font: 'Cairo', size: 60, weight: '700', italic: false, color: '#1f2937',
  align: 'center', maxWidth: 0, lineHeight: 1.4, opacity: 1, digits: 'asis',
  stroke: false, strokeColor: '#ffffff', strokeWidth: 3, shadow: false, shadowColor: '#000000', shadowBlur: 8, visible: true,
};
const S = {
  img: null, imgSrc: '', W: 0, H: 0,
  rows: [], cols: [], dataName: '', sheetSrc: '', showSrc: false,
  vars: [], map: {},
  fields: [], selId: null,
  classCol: '', sortCol: '', topCol: '',
  excluded: new Set(), order: [], pv: 0, zoom: 1,
  customFonts: [],
  out: { images: true, format: 'png', name: '', pdfClass: false, pdfAll: false, scale: 1 },
};
const uid = () => Math.random().toString(36).slice(2, 9);
const sel = () => S.fields.find(f => f.id === S.selId) || null;

/* ================= helpers ================= */
/* message at the bottom; optional action button (e.g. «تراجع») so nobody needs keyboard shortcuts */
function toast(msg, ms = 4000, action) {
  const el = $('#toast'), btn = $('#toastAct');
  $('#toastMsg').textContent = msg;
  btn.hidden = !action; el.classList.toggle('has-act', !!action);
  if (action) { btn.textContent = action.label; btn.onclick = () => { el.classList.remove('show'); action.fn(); }; }
  el.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), action ? Math.max(ms, 8000) : ms);
}
const undoAction = () => ({ label: t('تراجع'), fn: () => undo() });
/* large, clear confirm / text-input window (replaces the browser's small confirm/prompt) */
const IC_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5M12 18h.01"/></svg>';
function ask({ title, text = '', ok, cancel, danger = false, input = null, icon }) {
  return new Promise(res => {
    const d = $('#dlgAsk'), yes = $('#askYes'), no = $('#askNo'), inp = $('#askInput');
    $('#askTitle').textContent = title;
    $('#askText').textContent = text; $('#askText').hidden = !text;
    yes.textContent = ok; no.textContent = cancel || t('إلغاء');
    yes.className = 'btn ' + (danger ? 'danger' : 'primary');
    $('#askIc').innerHTML = icon || IC_WARN; $('#askIc').className = 'ask-ic' + (danger ? ' red' : '');
    inp.hidden = input == null; if (input != null) inp.value = input;
    d.returnValue = '';
    d.onclose = () => res(d.returnValue === 'ok' ? (input != null ? inp.value : true) : (input != null ? null : false));
    d.showModal();
    if (input != null) { inp.focus(); inp.select(); } else (danger ? no : yes).focus();
  });
}
const AR_D = '٠١٢٣٤٥٦٧٨٩', FA_D = '۰۱۲۳۴۵۶۷۸۹';
function convDigits(s, mode) {
  if (mode === 'ar') return s.replace(/[0-9]/g, d => AR_D[d]).replace(/[۰-۹]/g, d => AR_D[FA_D.indexOf(d)]);
  if (mode === 'en') return s.replace(/[٠-٩]/g, d => AR_D.indexOf(d)).replace(/[۰-۹]/g, d => FA_D.indexOf(d));
  return s;
}
const TODAY = new Date();
const fmtDate = () => `${TODAY.getDate()}/${TODAY.getMonth() + 1}/${TODAY.getFullYear()}`;
const fmtHijri = () => { try { return new Intl.DateTimeFormat((isEn() ? 'en' : 'ar-SA') + '-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(TODAY); } catch { return ''; } };
/* built-in variables — Arabic and English names both work in any language */
const BUILTINS = {
  'م': c => String(c.seq ?? 1), 'No': c => String(c.seq ?? 1),
  'عدد_طلاب_الصف': c => String(c.count ?? ''), 'ClassSize': c => String(c.count ?? ''),
  'تاريخ_اليوم': fmtDate, 'Today': fmtDate,
  'تاريخ_هجري': fmtHijri, 'HijriDate': fmtHijri,
};
const builtinLabels = () => isEn()
  ? { 'No': 'Student no. in class', 'ClassSize': 'Class size', 'Today': "Today's date", 'HijriDate': 'Hijri date' }
  : { 'م': 'رقم الطالب في الصف', 'عدد_طلاب_الصف': 'عدد طلاب الصف', 'تاريخ_اليوم': 'تاريخ اليوم', 'تاريخ_هجري': 'التاريخ الهجري' };
const seqKey = () => isEn() ? '{No}' : '{م}';
function resolve(tpl, row, c = {}) {
  return String(tpl ?? '').replace(/\{([^{}]+)\}/g, (m, k) => {
    k = k.trim();
    const has = key => row && Object.prototype.hasOwnProperty.call(row, key);
    if (has(S.map[k])) return String(row[S.map[k]] ?? '').trim();
    if (has(k)) return String(row[k] ?? '').trim();
    if (BUILTINS[k]) return BUILTINS[k](c);
    if (c.sample && c.sample[k] != null) return c.sample[k];
    return row ? m : k;
  });
}
const isLinked = k => S.cols.includes(S.map[k]) || S.cols.includes(k);
function unknownVars(tpl) {
  const out = [];
  String(tpl).replace(/\{([^{}]+)\}/g, (m, k) => { k = k.trim(); if (!BUILTINS[k] && !isLinked(k)) out.push(k); });
  return out;
}
const vkey = s => norm(s).replace(/[\s_\-\/.]+/g, '').replace(/^ال/, '');
function autoMap() {
  for (const v of S.vars) {
    if (S.cols.includes(S.map[v])) continue;
    const kv = vkey(v);
    S.map[v] = S.cols.find(c => c === v) || S.cols.find(c => vkey(c) === kv)
      || (kv.length >= 3 ? S.cols.find(c => { const kc = vkey(c); return kc.length >= 3 && (kc.includes(kv) || kv.includes(kc)); }) : '') || '';
  }
}
function hexA(h, a) { const n = parseInt(String(h).slice(1), 16) || 0; return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
const safe = s => String(s ?? '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 90);
const pad = (n, total) => String(n).padStart(Math.max(2, String(total).length), '0');
const tick = () => new Promise(r => setTimeout(r, 0));
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}
const canvasBlob = (c, type, q) => new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error(t('تعذر إنشاء الصورة'))), type, q));
function insertAtCursor(el, text) {
  const s = el.selectionStart ?? el.value.length, e = el.selectionEnd ?? s;
  el.value = el.value.slice(0, s) + text + el.value.slice(e);
  el.focus(); el.setSelectionRange(s + text.length, s + text.length);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}
const isMobile = () => matchMedia('(max-width:900px)').matches;

/* ================= class ordering ================= */
function norm(s) {
  return String(s).replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, d => AR_D.indexOf(d)).replace(/[۰-۹]/g, d => FA_D.indexOf(d)).toLowerCase();
}
const ORDS = [[11, /حادي عشر|احد عشر|حاديه عشر|eleventh/], [12, /ثاني عشر|اثني عشر|اثنا عشر|ثانيه عشر|twelfth/], [1, /اول|first/], [2, /ثاني|second/], [3, /ثالث|third/],
  [4, /رابع|fourth/], [5, /خامس|fifth/], [6, /سادس|sixth/], [7, /سابع|seventh/], [8, /ثامن|eighth/], [9, /تاسع|ninth/], [10, /عاشر|tenth/]];
function classRank(s) {
  const n = norm(s);
  let stage = 0;
  if (/ثانوي|high school/.test(n)) stage = 200; else if (/متوسط|اعدادي|middle/.test(n)) stage = 100;
  if (/روضه|تمهيدي|بستان|kg|kindergarten|pre-?k/.test(n)) return stage;
  for (const [r, re] of ORDS) if (re.test(n)) return stage + r;
  const d = n.match(/\d+/); if (d) return stage + Number(d[0]);
  return 9999;
}
const cmpClass = (a, b) => classRank(a) - classRank(b) || collator.compare(a, b);
function rebuildOrder() {
  const cc = S.classCol, sc = S.sortCol, tc = S.topCol;
  const items = S.rows.map((row, i) => ({
    row, i,
    cls: cc ? (String(row[cc] ?? '').trim() || t('بدون صف')) : t('جميع الطلاب'),
    top: tc ? (String(row[tc] ?? '').trim() || t('بدون')) : '',
  }));
  items.sort((a, b) => collator.compare(a.top, b.top) || cmpClass(a.cls, b.cls)
    || (sc ? collator.compare(String(a.row[sc] ?? ''), String(b.row[sc] ?? '')) : 0) || a.i - b.i);
  let key = null, seq = 0; const counts = {};
  for (const it of items) {
    it.gkey = it.top + '\u0001' + it.cls;
    if (it.gkey !== key) { key = it.gkey; seq = 0; }
    it.seq = ++seq; counts[it.gkey] = (counts[it.gkey] || 0) + 1;
  }
  for (const it of items) it.count = counts[it.gkey];
  S.order = items;
}
function getGroups() {
  const g = []; let cur = null;
  for (const it of S.order) {
    if (!cur || cur.key !== it.gkey) { cur = { key: it.gkey, cls: it.cls, top: it.top, items: [] }; g.push(cur); }
    cur.items.push(it);
  }
  return g;
}

/* ================= rendering ================= */
const RTL_RE = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const fontStr = (f, size) => `${f.italic ? 'italic ' : ''}${f.weight} ${size}px "${f.font}"`;
function measureField(ctx, f, text) {
  const lines = text.split(/\r?\n/);
  let size = +f.size || 10;
  ctx.font = fontStr(f, size);
  let w = 0; for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  if (f.maxWidth > 0 && w > f.maxWidth) {
    size = Math.max(4, size * f.maxWidth / w); ctx.font = fontStr(f, size);
    w = 0; for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  }
  const lh = size * (+f.lineHeight || 1.4), h = lh * lines.length;
  return { lines, size, w, h, lh, top: f.y - h / 2, text };
}
function drawField(ctx, f, text) {
  const m = measureField(ctx, f, text);
  ctx.save();
  ctx.globalAlpha = +f.opacity || 1;
  ctx.font = fontStr(f, m.size);
  ctx.textAlign = f.align; ctx.textBaseline = 'middle';
  ctx.direction = RTL_RE.test(text) ? 'rtl' : 'ltr';
  m.lines.forEach((l, i) => {
    const ly = m.top + m.lh * (i + 0.5);
    if (f.shadow) { ctx.shadowColor = hexA(f.shadowColor, .5); ctx.shadowBlur = +f.shadowBlur; ctx.shadowOffsetY = Math.max(1, f.shadowBlur / 3); }
    if (f.stroke && f.strokeWidth > 0) {
      ctx.lineJoin = 'round'; ctx.miterLimit = 2; ctx.lineWidth = f.strokeWidth * 2; ctx.strokeStyle = f.strokeColor;
      ctx.strokeText(l, f.x, ly); ctx.shadowColor = 'transparent';
    }
    ctx.fillStyle = f.color; ctx.fillText(l, f.x, ly); ctx.shadowColor = 'transparent';
  });
  ctx.restore();
  return m;
}
function fieldText(f, row, c) { return convDigits(resolve(f.text, row, c), f.digits); }
function renderCert(ctx, row, c) {
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(S.img, 0, 0, S.W, S.H);
  const boxes = {};
  for (const f of S.fields) if (f.visible) boxes[f.id] = drawField(ctx, f, fieldText(f, row, c));
  return boxes;
}

/* ================= editor canvas ================= */
const cv = $('#cv'), cx = cv.getContext('2d'), wrap = $('#canvasWrap');
let boxes = {}, guides = [], rafId = 0, drag = null;
const fontTried = new Set();
const curItem = () => S.order[S.pv] || null;
function requestRender() { if (!rafId) rafId = requestAnimationFrame(() => { rafId = 0; draw(); }); }
function pxScale() { const r = cv.getBoundingClientRect(); return r.width ? cv.width / r.width : 1; }
function draw() {
  if (!S.img) return;
  if (cv.width !== S.W || cv.height !== S.H) { cv.width = S.W; cv.height = S.H; layoutCanvas(); }
  const it = curItem();
  boxes = renderCert(cx, it ? it.row : null, it || {});
  for (const f of S.fields) {
    const b = boxes[f.id]; if (!b) continue;
    const fs = fontStr(f, 40), tx = b.text || 'ا', key = fs + '|' + tx;
    if (!fontTried.has(key)) {
      fontTried.add(key);
      try { if (!document.fonts.check(fs, tx)) document.fonts.load(fs, tx).then(requestRender, () => {}); } catch {}
    }
  }
  drawOverlay();
}
function boxRect(f, b) {
  const p = Math.max(4, b.size * 0.1), w = Math.max(b.w, b.size * 0.8);
  const left = f.align === 'center' ? f.x - w / 2 : f.align === 'right' ? f.x - w : f.x;
  return { x: left - p, y: b.top - p, w: w + p * 2, h: b.h + p * 2 };
}
const corners = r => [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]];
function drawOverlay() {
  const k = pxScale(), showAll = $('#tgGuides').checked;
  cx.save();
  for (const f of S.fields) {
    const b = boxes[f.id]; if (!b) continue;
    const r = boxRect(f, b);
    if (f.id === S.selId) {
      if (f.maxWidth > 0) {
        const L = f.align === 'center' ? f.x - f.maxWidth / 2 : f.align === 'right' ? f.x - f.maxWidth : f.x;
        cx.strokeStyle = '#f59e0b'; cx.lineWidth = 1.5 * k; cx.setLineDash([6 * k, 4 * k]);
        cx.strokeRect(L, r.y, f.maxWidth, r.h);
      }
      cx.setLineDash([]); cx.strokeStyle = '#2563eb'; cx.lineWidth = 2 * k; cx.strokeRect(r.x, r.y, r.w, r.h);
      const hs = (isMobile() ? 14 : 9) * k;
      for (const [hx, hy] of corners(r)) {
        cx.fillStyle = '#fff'; cx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
        cx.lineWidth = 1.5 * k; cx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
      }
    } else if (showAll) {
      cx.strokeStyle = 'rgba(37,99,235,.6)'; cx.lineWidth = 1 * k; cx.setLineDash([5 * k, 4 * k]);
      cx.strokeRect(r.x, r.y, r.w, r.h);
    }
  }
  cx.setLineDash([]); cx.strokeStyle = '#ec4899'; cx.lineWidth = 1.2 * k;
  for (const g of guides) {
    cx.beginPath();
    if (g.x != null) { cx.moveTo(g.x, 0); cx.lineTo(g.x, S.H); } else { cx.moveTo(0, g.y); cx.lineTo(S.W, g.y); }
    cx.stroke();
  }
  cx.restore();
}
function layoutCanvas() {
  if (!S.img) return;
  const p = isMobile() ? 24 : 48;
  const aw = wrap.clientWidth - p, ah = wrap.clientHeight - p;
  if (aw <= 0 || ah <= 0) return;
  const fit = Math.max(0.02, Math.min(aw / S.W, ah / S.H));
  const z = fit * S.zoom;
  cv.style.width = Math.round(S.W * z) + 'px'; cv.style.height = Math.round(S.H * z) + 'px';
  $('#zVal').textContent = Math.round(S.zoom * 100) + '%';
  requestRender();
}
new ResizeObserver(layoutCanvas).observe(wrap);
function setZoom(z) { S.zoom = Math.min(6, Math.max(0.25, z)); layoutCanvas(); }
$('#zIn').onclick = () => setZoom(S.zoom * 1.25);
$('#zOut').onclick = () => setZoom(S.zoom / 1.25);
$('#zFit').onclick = () => setZoom(1);
wrap.addEventListener('wheel', e => { if (e.ctrlKey && S.img) { e.preventDefault(); setZoom(S.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); } }, { passive: false });
$('#tgGuides').onchange = requestRender;

function toImg(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
function hitHandle(p) {
  const f = sel(); if (!f || !boxes[f.id]) return null;
  const r = boxRect(f, boxes[f.id]), hs = (isMobile() ? 22 : 10) * pxScale();
  return corners(r).some(([hx, hy]) => Math.abs(p.x - hx) <= hs && Math.abs(p.y - hy) <= hs) ? f : null;
}
function hitField(p) {
  for (let i = S.fields.length - 1; i >= 0; i--) {
    const f = S.fields[i], b = boxes[f.id]; if (!b) continue;
    const r = boxRect(f, b);
    if (p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h) return f;
  }
  return null;
}
cv.addEventListener('pointerdown', e => {
  if (!S.img || e.button !== 0) return;
  const p = toImg(e);
  let f = hitHandle(p);
  if (f) {
    const r = boxRect(f, boxes[f.id]), c = { x: r.x + r.w / 2, y: f.y };
    drag = { mode: 'resize', f, c, d0: Math.hypot(p.x - c.x, p.y - c.y) || 1, s0: +f.size, mw0: +f.maxWidth };
  } else if ((f = hitField(p))) {
    select(f.id);
    drag = { mode: 'move', f, ox: p.x - f.x, oy: p.y - f.y };
  } else select(null);
  if (drag) { cv.setPointerCapture(e.pointerId); e.preventDefault(); }
});
cv.addEventListener('pointermove', e => {
  if (!S.img) return;
  const p = toImg(e);
  if (!drag) { cv.style.cursor = hitHandle(p) ? 'nwse-resize' : hitField(p) ? 'move' : 'default'; return; }
  const f = drag.f;
  if (drag.mode === 'move') {
    let nx = p.x - drag.ox, ny = p.y - drag.oy; guides = [];
    if (!e.altKey) {
      const th = 8 * pxScale(), others = S.fields.filter(o => o !== f && o.visible);
      const snap = (v, cands) => { let best = null; for (const c of cands) if (Math.abs(v - c) < th && (best === null || Math.abs(v - c) < Math.abs(v - best))) best = c; return best; };
      const bx = snap(nx, [S.W / 2, ...others.map(o => o.x)]); if (bx !== null) { nx = bx; guides.push({ x: bx }); }
      const by = snap(ny, [S.H / 2, ...others.map(o => o.y)]); if (by !== null) { ny = by; guides.push({ y: by }); }
    }
    f.x = Math.round(nx); f.y = Math.round(ny);
  } else {
    const ratio = Math.hypot(p.x - drag.c.x, p.y - drag.c.y) / drag.d0;
    f.size = Math.max(4, Math.round(drag.s0 * ratio));
    if (drag.mw0 > 0) f.maxWidth = Math.round(drag.mw0 * ratio);
  }
  syncProps(); requestRender();
});
const endDrag = () => { if (drag) { drag = null; guides = []; requestRender(); saveSoon(); } };
cv.addEventListener('pointerup', endDrag);
cv.addEventListener('pointercancel', endDrag);

document.addEventListener('keydown', e => {
  if ($('dialog[open]') || $('.tour-block')) return;
  const inField = e.target.closest('input,textarea,select,[contenteditable]');
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !inField && (e.code === 'KeyZ' || e.code === 'KeyY')) {
    e.preventDefault();
    if (e.code === 'KeyY' || e.shiftKey) redo(); else undo();
    return;
  }
  if (inField) return;
  const f = sel(); if (!f) return;
  const st = e.shiftKey ? 10 : 1;
  if (e.key === 'ArrowLeft') f.x -= st;
  else if (e.key === 'ArrowRight') f.x += st;
  else if (e.key === 'ArrowUp') f.y -= st;
  else if (e.key === 'ArrowDown') f.y += st;
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); return delField(f.id); }
  else if (e.key === 'Escape') return select(null);
  else if (mod && e.code === 'KeyD') { e.preventDefault(); return dupField(f.id); }
  else return;
  e.preventDefault(); syncProps(); requestRender(); saveSoon();
});

/* ================= undo / redo ================= */
const HIST = { stack: [], redo: [], max: 120 };
const imgKey = () => S.imgSrc ? S.imgSrc.length + ':' + S.imgSrc.slice(-64) : '';
const histState = () => JSON.stringify({ fields: S.fields, vars: S.vars, map: S.map, img: imgKey(), data: S.dataId || 0, W: S.W, H: S.H });
const histImgs = new Map();   // image fingerprint -> data url (images are large, store once)
const histData = new Map();   // data id -> loaded student data (kept in memory only, so a deleted file can be undone)
let dataSeq = 0;
function commit() {
  const s = histState();
  if (HIST.stack[HIST.stack.length - 1] === s) return;
  if (S.imgSrc) histImgs.set(imgKey(), S.imgSrc);
  HIST.stack.push(s); if (HIST.stack.length > HIST.max) HIST.stack.shift();
  HIST.redo = []; updateUndoUI();
}
function restore(s) {
  const d = JSON.parse(s);
  S.fields = d.fields; S.vars = d.vars; S.map = d.map;
  if (!sel()) S.selId = null;
  if ((d.data || 0) !== (S.dataId || 0)) {
    const ds = histData.get(d.data);
    if (ds) Object.assign(S, ds, { excluded: new Set(ds.excluded) }); else clearDataState();
    S.dataId = ds ? d.data : 0; $('#gsUrl').value = S.sheetSrc || '';
    rebuildOrder();
  }
  if (!d.img) { if (S.img) clearImageState(); if (d.W) { S.W = d.W; S.H = d.H; } }
  else { const src = histImgs.get(d.img); if (src && src !== S.imgSrc) setImage(src, { keepFields: true, noCommit: true }); }
  renderAllPanels(); requestRender(); saveLocal(true);
  updateUndoUI();
}
function undo() {
  flushSave();
  if (HIST.stack.length < 2) return;
  HIST.redo.push(HIST.stack.pop());
  restore(HIST.stack[HIST.stack.length - 1]);
  toast(t('تم التراجع'), 1200);
}
function redo() {
  flushSave();
  const s = HIST.redo.pop(); if (!s) return;
  HIST.stack.push(s); restore(s);
  toast(t('تمت الإعادة'), 1200);
}
function updateUndoUI() {
  $('#btnUndo').disabled = HIST.stack.length < 2;
  $('#btnRedo').disabled = !HIST.redo.length;
}
$('#btnUndo').onclick = undo;
$('#btnRedo').onclick = redo;

/* ================= image ================= */
function setImage(src, opt = {}) {
  const im = new Image();
  im.onload = () => {
    const oldW = S.W, oldH = S.H;
    S.img = im; S.imgSrc = src; S.W = im.naturalWidth; S.H = im.naturalHeight;
    if (!opt.keepFields && oldW && oldH && (oldW !== S.W || oldH !== S.H) && S.fields.length) {
      const rx = S.W / oldW, ry = S.H / oldH;
      for (const f of S.fields) { f.x = Math.round(f.x * rx); f.y = Math.round(f.y * ry); f.size = Math.round(f.size * rx); f.maxWidth = Math.round(f.maxWidth * rx); }
    }
    $('#emptyStage').hidden = true; cv.hidden = false;
    $('#imgInfo').hidden = false; $('#dzImg').hidden = true;
    $('#imgThumb').src = src; $('#imgDims').textContent = t('%w × %h بكسل', { w: S.W, h: S.H });
    S.zoom = 1; cv.width = S.W; cv.height = S.H;
    if (!S.fields.length && !opt.keepFields) for (const v of S.vars) S.fields.push(newField(`{${v}}`, v));
    renderList(); renderVars(); layoutCanvas(); updateSteps();
    if (opt.noCommit) saveLocal(true); else saveSoon();
    if (opt.user && isMobile()) setTab('stage');
    opt.done && opt.done();
  };
  im.onerror = () => toast(t('تعذر فتح الصورة'));
  im.src = src;
}
/* remove the image but keep S.W/S.H, so fields rescale onto the next image */
function clearImageState() {
  S.img = null; S.imgSrc = ''; boxes = {};
  cv.hidden = true; $('#emptyStage').hidden = false;
  $('#imgInfo').hidden = true; $('#dzImg').hidden = false; $('#imgThumb').removeAttribute('src');
  lastImg = null; try { localStorage.removeItem(LS_IMG); } catch {}
}
function deleteImage() {
  if (!S.img) return;
  flushSave();
  clearImageState(); renderAllPanels(); saveSoon();
  toast(t('تم حذف الصورة — الحقول باقية بأماكنها.'), 8000, undoAction());
}
async function newDesign() {
  if (!S.img && !S.fields.length && !S.vars.length && !S.rows.length) return toast(t('الموقع فارغ أصلاً'));
  if (!await ask({ title: t('البدء بتصميم جديد؟'), text: t('سيتم مسح الصورة والحقول والمتغيرات والبيانات والبدء من جديد. هل أنت متأكد؟'), ok: t('نعم، امسح كل شيء'), danger: true })) return;
  flushSave();
  clearImageState(); clearDataState(); rebuildOrder();
  S.fields = []; S.vars = []; S.map = {}; S.selId = null; S.W = 0; S.H = 0;
  renderAllPanels(); requestRender(); saveSoon();
  if (isMobile()) setTab('setup');
  toast(t('تم مسح كل شيء — يمكنك البدء من جديد.'), 8000, undoAction());
}
function loadImageFile(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) return toast(t('الرجاء اختيار صورة (PNG أو JPG). إذا كانت الشهادة PDF صدّرها كصورة أولاً.'), 5000);
  const rd = new FileReader(); rd.onload = () => setImage(rd.result, { user: true }); rd.readAsDataURL(file);
}

/* ================= templates gallery ================= */
const TPL = window.CERT_TEMPLATES;
async function loadTplFonts(tp, lang) {
  const fs = tp.fields(lang);
  await Promise.all(fs.map(f => document.fonts.load(`${f.weight} 40px "${f.font}"`, FONT_SAMPLE).catch(() => {})));
}
function drawTemplate(ctx, tp, lang, sampleRow) {
  tp.bg(ctx, TPL.W, TPL.H);
  for (const fd of tp.fields(lang)) {
    const f = { ...DEF, ...fd };
    drawField(ctx, f, convDigits(resolve(f.text, null, { sample: sampleRow }), 'asis'));
  }
}
function renderGallery() {
  const grid = $('#tplGrid'); grid.innerHTML = '';
  const lang = window.I18N.getLang(), sample = TPL.text[lang].sample;
  for (const tp of TPL.list) {
    const b = document.createElement('button'); b.className = 'tpl'; b.type = 'button';
    const c = document.createElement('canvas'); c.width = 600; c.height = Math.round(600 * TPL.H / TPL.W);
    const sp = document.createElement('span'); sp.textContent = tp.name[lang];
    const sm = document.createElement('small'); sm.textContent = tp.desc[lang]; sp.appendChild(sm);
    b.append(c, sp); grid.appendChild(b);
    const paint = () => { const x = c.getContext('2d'); x.setTransform(c.width / TPL.W, 0, 0, c.width / TPL.W, 0, 0); drawTemplate(x, tp, lang, sample); };
    paint(); loadTplFonts(tp, lang).then(paint);
    b.onclick = () => applyTemplate(tp);
  }
}
function openGallery(e) { e && e.stopPropagation(); renderGallery(); $('#dlgTpl').showModal(); }
$('#btnTplOpen').onclick = openGallery;
$('#btnTplOpen2').onclick = openGallery;
async function applyTemplate(tp) {
  if (S.fields.length && !await ask({ title: t('استبدال التصميم الحالي؟'), text: t('سيتم استبدال الصورة والحقول الحالية بالقالب. هل تريد المتابعة؟'), ok: t('نعم، استخدم القالب') })) return;
  const lang = window.I18N.getLang();
  $('#dlgTpl').close();
  toast(t('جاري تجهيز القالب...'), 4000);
  await loadTplFonts(tp, lang);
  const c = document.createElement('canvas'); c.width = TPL.W; c.height = TPL.H;
  tp.bg(c.getContext('2d'), TPL.W, TPL.H);
  const fields = tp.fields(lang).map(fd => ({ ...DEF, ...fd, id: uid() }));
  const vars = TPL.text[lang].vars;
  S.fields = []; S.selId = null;
  for (const v of vars) if (!S.vars.includes(v)) S.vars.push(v);
  if (S.cols.length) autoMap();
  S.W = 0; S.H = 0;   // no rescaling: template fields are already in template pixels
  setImage(c.toDataURL('image/png'), {
    keepFields: true, user: true,
    done: () => { S.fields = fields; renderAllPanels(); requestRender(); saveSoon(); toast(t('✓ تم تطبيق القالب — اضغط على أي نص لتعديله')); },
  });
}

/* ================= data ================= */
function pickCol(cols, regs, avoid) {
  for (const re of regs) { const c = cols.find(c => re.test(c) && !(avoid && avoid.test(c))); if (c) return c; }
  return '';
}
async function loadDataFile(file) {
  if (!file) return;
  S.sheetSrc = '';
  return loadDataBuffer(file.name, await file.arrayBuffer());
}
async function loadDataBuffer(name, buf, keep) {
  if (typeof XLSX === 'undefined') return toast(t('مكتبة قراءة Excel لم تُحمَّل — تأكد من الاتصال بالإنترنت'));
  S.showSrc = false; flushSave();
  const prev = keep ? { classCol: S.classCol, sortCol: S.sortCol, topCol: S.topCol, pv: S.pv, excluded: new Set(S.excluded), name: S.out.name } : null;
  let wb;
  try {
    if (/\.(csv|txt|tsv)$/i.test(name)) {
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { text = new TextDecoder('windows-1256').decode(buf); }
      wb = XLSX.read(text.replace(/^﻿/, ''), { type: 'string', raw: true });
    } else wb = XLSX.read(buf, { type: 'array' });
  } catch (err) { console.error(err); return toast(t('تعذر قراءة الملف — تأكد أنه ملف Excel أو CSV')); }

  const SHEET = t('اسم الورقة');
  const rows = [], cols = [], multi = wb.SheetNames.length > 1;
  for (const sn of wb.SheetNames) {
    const arr = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '', blankrows: false });
    const hi = arr.findIndex(r => r.some(c => String(c).trim() !== ''));
    if (hi < 0) continue;
    const seen = {};
    const hdr = arr[hi].map((h, i) => {
      let n = String(h).replace(/\s+/g, ' ').trim() || t('عمود %n', { n: i + 1 });
      if (seen[n]) n = `${n} ${++seen[n]}`; else seen[n] = 1;
      return n;
    });
    let added = 0;
    for (const r of arr.slice(hi + 1)) {
      if (!r.some(c => String(c).trim() !== '')) continue;
      const o = {}; hdr.forEach((h, i) => o[h] = String(r[i] ?? '').trim());
      if (multi) o[SHEET] = sn;
      rows.push(o); added++;
    }
    if (added) for (const h of hdr) if (!cols.includes(h)) cols.push(h);
  }
  if (!rows.length) return toast(t('لم يتم العثور على بيانات في الملف'));
  if (multi) cols.push(SHEET);

  S.rows = rows; S.cols = cols; S.dataName = name; S.excluded.clear(); S.topCol = '';
  S.classCol = pickCol(cols, [/^الصف$/, /^الفصل$/, /^الشعبة$/, /^(class|grade|section)$/i, /صف/, /فصل/, /شعب/, /class|grade|section/i]) || (multi ? SHEET : '');
  S.sortCol = pickCol(cols, [/^اسم الطالب/, /اسم.*طالب|طالب.*اسم/, /^الاسم/, /^student name/i, /طالب/, /اسم/, /name/i], /معلم|مدرس|استاذ|أستاذ|teacher|ولي|school|مدرسة/i) || cols[0];
  S.pv = 0;
  autoMap();
  const viaVar = re => { const v = S.vars.find(v => re.test(v) && S.cols.includes(S.map[v])); return v ? S.map[v] : ''; };
  if (!S.classCol) S.classCol = viaVar(/صف|فصل|شعب|class/i);
  if (!S.sortCol || S.sortCol === cols[0]) S.sortCol = viaVar(/اسم.*طالب|^الاسم|طالب|student/i) || S.sortCol;
  S.out.name = S.sortCol ? `{${S.sortCol}}` : '';
  if (prev) {
    const ok = c => !c || cols.includes(c);
    if (ok(prev.classCol)) S.classCol = prev.classCol;
    if (ok(prev.sortCol)) S.sortCol = prev.sortCol;
    if (ok(prev.topCol)) S.topCol = prev.topCol;
    S.excluded = prev.excluded;
    if (prev.name) S.out.name = prev.name;
  }
  rebuildOrder();
  if (prev) S.pv = Math.min(prev.pv, S.order.length - 1);
  S.dataId = ++dataSeq; histData.set(S.dataId, dataSnap()); saveSoon();
  refreshDataUI(); renderVars(); renderVarChips(); renderQuick(); syncProps(); updateSteps(); requestRender();
  const unlinked = S.vars.filter(v => !isLinked(v));
  if (unlinked.length) toast(t('تم تحميل %n طالب — اختر العمود المناسب للمتغيرات المعلَّمة باللون الأصفر', { n: rows.length }), 5000);
  else if (!keep) toast(t('تم تحميل %n طالب في %c صف', { n: rows.length, c: getGroups().length }));
}
const dataSnap = () => ({ rows: S.rows, cols: S.cols, dataName: S.dataName, sheetSrc: S.sheetSrc, classCol: S.classCol, sortCol: S.sortCol, topCol: S.topCol, excluded: [...S.excluded], pv: 0 });
function clearDataState() {
  Object.assign(S, { rows: [], cols: [], dataName: '', sheetSrc: '', classCol: '', sortCol: '', topCol: '', order: [], pv: 0, showSrc: false, dataId: 0 });
  S.excluded = new Set(); $('#gsUrl').value = '';
}
function deleteData() {
  if (!S.rows.length) return;
  flushSave();
  clearDataState(); rebuildOrder(); renderAllPanels(); requestRender(); saveSoon();
  toast(t('تم حذف بيانات الطلاب — المتغيرات باقية.'), 8000, undoAction());
}
function refreshDataUI() {
  const has = S.rows.length > 0;
  $('#dataInfo').hidden = !has;
  $('#dzData').hidden = $('#gsBox').hidden = has && !S.showSrc;
  $('#btnGsRefresh').hidden = !S.sheetSrc;
  refreshPreviewSel();
  if (!has) return;
  $('#dataName').textContent = S.dataName; $('#dataCount').textContent = t('%n طالب', { n: S.rows.length });
  const sc = $('#selClass'), ss = $('#selSort');
  sc.innerHTML = ''; ss.innerHTML = '';
  sc.add(new Option(t('— بدون (كل الطلاب مجموعة واحدة) —'), ''));
  ss.add(new Option(t('— حسب ترتيبهم في الملف —'), ''));
  for (const c of S.cols) { sc.add(new Option(c, c)); ss.add(new Option(t('أبجدياً حسب: %c', { c }), c)); }
  sc.value = S.classCol; ss.value = S.sortCol;
  const cl = $('#classList'); cl.innerHTML = '';
  for (const g of getGroups()) {
    const d = document.createElement('div'); d.className = 'class-row';
    d.innerHTML = '<span><span class="top"></span><span class="c"></span></span><span class="n"></span>';
    d.querySelector('.top').textContent = g.top ? g.top + ' › ' : '';
    d.querySelector('.c').textContent = g.cls; d.querySelector('.n').textContent = g.items.length;
    cl.appendChild(d);
  }
}
/* ---------- Google Sheets ---------- */
function sheetExportUrl(u) {
  u = String(u || '').trim();
  let m = u.match(/\/spreadsheets\/d\/e\/([\w-]+)/);
  if (m) return `https://docs.google.com/spreadsheets/d/e/${m[1]}/pub?output=xlsx`;
  m = u.match(/\/spreadsheets\/d\/([\w-]{20,})/) || u.match(/^([\w-]{30,})$/);
  if (m) return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=xlsx`;
  return null;
}
async function loadFromSheet(url, keep) {
  const ex = sheetExportUrl(url);
  if (!ex) return toast(t('الرابط غير صحيح — انسخ رابط الجدول من شريط العنوان في Google Sheets'), 5000);
  const btns = [$('#btnGs'), $('#btnGsRefresh')];
  btns.forEach(b => b.disabled = true); toast(t('جاري جلب البيانات من Google Sheets...'), 10000);
  try {
    let r;
    try { r = await fetch(ex, { cache: 'no-store' }); } catch { throw new Error('private'); }
    if (!r.ok) throw new Error(r.status === 404 ? 'notfound' : 'private');
    const buf = await r.arrayBuffer(), sig = new Uint8Array(buf, 0, Math.min(2, buf.byteLength));
    if (!(sig[0] === 0x50 && sig[1] === 0x4b)) throw new Error('private');
    S.sheetSrc = url.trim(); $('#gsUrl').value = S.sheetSrc;
    await loadDataBuffer(t('جدول Google Sheets'), buf, keep);
    if (keep) toast(t('✓ تم تحديث البيانات — %n طالب', { n: S.rows.length }));
    saveSoon();
  } catch (e) {
    if (/^(file|data):$/.test(location.protocol) && e.message === 'private')
      return toast(t('الجلب من Google Sheets يعمل من النسخة المنشورة على الإنترنت فقط: bayanakaam.github.io/certificate-generator'), 8000);
    toast(e.message === 'notfound' ? t('لم يُعثر على الجدول — تأكد من الرابط')
      : t('تعذر الوصول للجدول — افتحه في Google Sheets واضغط «مشاركة» ثم اختر «أي شخص لديه الرابط»'), 7000);
  } finally { btns.forEach(b => b.disabled = false); }
}
$('#btnGs').onclick = () => loadFromSheet($('#gsUrl').value, false);
$('#gsUrl').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#btnGs').click(); } });
$('#btnGsRefresh').onclick = () => loadFromSheet(S.sheetSrc, true);
$('#btnChangeData').onclick = () => { S.showSrc = !S.showSrc; refreshDataUI(); };

function refreshPreviewSel() {
  const s = $('#pvSel'); s.innerHTML = '';
  if (!S.order.length) { s.add(new Option(t('— حمّل ملف البيانات لمعاينة الأسماء —'), '')); $('#pvInfo').textContent = ''; return; }
  const labelCol = S.sortCol || S.cols[0];
  for (const g of getGroups()) {
    const og = document.createElement('optgroup'); og.label = `${g.top ? g.top + ' › ' : ''}${g.cls} (${g.items.length})`;
    for (const it of g.items) og.appendChild(new Option(`${it.seq}. ${it.row[labelCol] || '—'}`, S.order.indexOf(it)));
    s.appendChild(og);
  }
  S.pv = Math.max(0, Math.min(S.pv, S.order.length - 1)); s.value = S.pv;
  $('#pvInfo').textContent = t('%a من %b', { a: S.pv + 1, b: S.order.length });
}
function setPv(i) {
  if (!S.order.length) return;
  S.pv = (i + S.order.length) % S.order.length; $('#pvSel').value = S.pv;
  $('#pvInfo').textContent = t('%a من %b', { a: S.pv + 1, b: S.order.length }); requestRender(); syncProps();
}
$('#pvSel').onchange = e => setPv(+e.target.value);
$('#pvPrev').onclick = () => setPv(S.pv - 1);
$('#pvNext').onclick = () => setPv(S.pv + 1);
$('#selClass').onchange = e => { S.classCol = e.target.value; if (S.topCol === S.classCol) S.topCol = ''; S.excluded.clear(); rebuildOrder(); refreshDataUI(); requestRender(); };
$('#selSort').onchange = e => { S.sortCol = e.target.value; rebuildOrder(); refreshDataUI(); requestRender(); };

$('#btnViewData').onclick = () => {
  const cols = S.cols, tw = $('#tblWrap');
  const tb0 = document.createElement('table');
  const hr = tb0.createTHead().insertRow(); ['#', ...cols].forEach(c => { const th = document.createElement('th'); th.textContent = c; hr.appendChild(th); });
  const tb = tb0.createTBody();
  let n = 0;
  for (const g of getGroups()) {
    const gr = tb.insertRow(); gr.className = 'grp'; const gc = gr.insertCell(); gc.colSpan = cols.length + 1;
    gc.textContent = `${g.top ? g.top + ' › ' : ''}${g.cls} — ${t('%n طالب', { n: g.items.length })}`;
    for (const it of g.items) {
      if (++n > 1500) break;
      const r = tb.insertRow(); r.insertCell().textContent = it.seq;
      for (const c of cols) r.insertCell().textContent = it.row[c];
    }
  }
  tw.innerHTML = ''; tw.appendChild(tb0); $('#dlgTable').showModal();
};

$('#dlSample').onclick = () => {
  if (typeof XLSX === 'undefined') return toast(t('تحتاج اتصالاً بالإنترنت'));
  const data = isEn() ? [
    ['Student Name', 'Class', 'Grade', 'Teacher', 'Date'],
    ['Sarah Mitchell', 'Grade 5', 'Excellent', 'Mr. James Carter', '21/11/2026'],
    ['Omar Haddad', 'Grade 5', 'Very Good', 'Mr. James Carter', '21/11/2026'],
    ['Lily Chen', 'Grade 6', 'Excellent', 'Mr. James Carter', '21/11/2026'],
    ['Noah Brooks', 'Grade 6', 'Good', 'Mr. James Carter', '21/11/2026'],
    ['Emma Rossi', 'Grade 4', 'Outstanding', 'Mr. James Carter', '21/11/2026'],
  ] : [
    ['اسم الطالب', 'الصف', 'التقدير', 'اسم المعلم', 'التاريخ'],
    ['محمد أحمد علي', 'الصف الخامس', 'ممتاز', 'أ. خالد يوسف', '2026/11/21'],
    ['سارة محمود حسن', 'الصف الخامس', 'جيد جداً', 'أ. خالد يوسف', '2026/11/21'],
    ['عمر خالد سليمان', 'الصف السادس', 'ممتاز', 'أ. خالد يوسف', '2026/11/21'],
    ['ليان إبراهيم ناصر', 'الصف السادس', 'جيد', 'أ. خالد يوسف', '2026/11/21'],
    ['يوسف عبد الرحمن', 'الصف الرابع', 'ممتاز مرتفع', 'أ. خالد يوسف', '2026/11/21'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data); ws['!cols'] = data[0].map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('الطلاب'));
  if (!isEn()) { ws['!views'] = [{ RTL: true }]; wb.Workbook = { Views: [{ RTL: true }] }; }
  XLSX.writeFile(wb, t('نموذج-بيانات-الطلاب.xlsx'));
};

/* ================= fields ================= */
function newField(text, label) {
  const n = S.fields.length;
  return { ...DEF, id: uid(), label: label || t('نص'), text,
    x: Math.round(S.W / 2), y: Math.round(Math.min(S.H * 0.9, S.H * 0.35 + n * S.H * 0.1)),
    size: Math.max(12, Math.round(S.W / 28)) };
}
function addField(text, label) {
  if (!S.img) return toast(t('أضف صورة الشهادة أولاً'));
  const f = newField(text, label); S.fields.push(f); select(f.id); saveSoon();
  if (!text) { if (isMobile()) setTab('props'); setTimeout(() => $('#pText').focus(), 0); }
}
function delField(id) { S.fields = S.fields.filter(f => f.id !== id); if (S.selId === id) S.selId = null; select(S.selId); saveSoon(); }
function dupField(id) {
  const f = S.fields.find(x => x.id === id); if (!f) return;
  const c = { ...f, id: uid(), label: f.label + t(' (نسخة)'), y: f.y + Math.round(f.size * 1.5) };
  S.fields.push(c); select(c.id); saveSoon();
}
function select(id) { S.selId = id; renderList(); renderVars(); syncProps(); requestRender(); $('#propsBadge').hidden = !id; }

const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function renderList() {
  const ul = $('#fieldList'); ul.innerHTML = '';
  if (!S.fields.length) {
    const li = document.createElement('li'); li.className = 'empty-li';
    li.textContent = S.cols.length ? t('اضغط على اسم عمود أعلاه لإضافته كحقل') : t('لا توجد حقول بعد');
    ul.appendChild(li); return;
  }
  for (const f of S.fields) {
    const li = document.createElement('li');
    li.className = 'fitem' + (f.id === S.selId ? ' active' : '') + (f.visible ? '' : ' off');
    li.innerHTML = `<button class="eye">${f.visible ? EYE : EYE_OFF}</button><div class="ft"><b></b><small></small></div><span class="sw"></span>`;
    li.querySelector('.eye').title = t('إظهار/إخفاء');
    li.querySelector('b').textContent = f.label || t('بدون اسم');
    li.querySelector('small').textContent = `${f.text.replace(/\n/g, ' ') || t('(فارغ)')} · ${f.font}`;
    li.querySelector('.sw').style.background = f.color;
    li.onclick = () => { select(f.id); if (isMobile()) setTab('props'); };
    li.querySelector('.eye').onclick = e => { e.stopPropagation(); f.visible = !f.visible; renderList(); requestRender(); saveSoon(); };
    ul.appendChild(li);
  }
}
function renderQuick() {
  const q = $('#quickAdd'); q.innerHTML = '';
  const linkedCols = new Set(S.vars.map(v => S.map[v]).concat(S.vars));
  const rest = S.cols.filter(c => !linkedCols.has(c));
  if (!rest.length) return;
  const lab = document.createElement('div'); lab.className = 'chip-label'; lab.textContent = t('أعمدة أخرى في ملف Excel — اضغط لإضافتها:'); q.appendChild(lab);
  for (const c of rest) {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = '+ ' + c;
    b.onclick = () => addVar(c); q.appendChild(b);
  }
}
function makeVarChips(container, target) {
  container.innerHTML = '';
  const names = [...S.vars, ...S.cols.filter(c => !S.vars.includes(c) && !S.vars.some(v => S.map[v] === c))];
  for (const c of names) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c; b.title = t('إدراج') + ` {${c}}`;
    b.onclick = () => insertAtCursor(target, `{${c}}`); container.appendChild(b);
  }
  for (const [k, l] of Object.entries(builtinLabels())) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip alt'; b.textContent = l; b.title = t('إدراج') + ` {${k}}`;
    b.onclick = () => insertAtCursor(target, `{${k}}`); container.appendChild(b);
  }
}
function renderVarChips() { makeVarChips($('#varChips'), $('#pText')); }
$('#btnAddField').onclick = () => addField('', t('نص'));

/* ================= user variables ================= */
const varSuggest = () => isEn()
  ? ['Student Name', 'Class', 'Grade', 'Teacher', 'Date', 'Subject', 'School', 'Average']
  : ['اسم الطالب', 'الصف', 'التقدير', 'اسم المعلم', 'التاريخ', 'المادة', 'اسم المدرسة', 'المعدل'];
const IC_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>';
const IC_DEL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const usesVar = v => S.fields.some(f => f.text.includes(`{${v}}`));
const cleanName = s => String(s || '').replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
function addVar(name) {
  name = cleanName(name);
  if (!name) { $('#newVar').focus(); return toast(t('اكتب اسم المتغير أولاً')); }
  if (BUILTINS[name]) return toast(t('هذا الاسم محجوز، اختر اسماً آخر'));
  if (!S.vars.includes(name)) S.vars.push(name);
  autoMap();
  if (S.img && !usesVar(name)) addField(`{${name}}`, name);
  else if (!S.img) toast(t('تمت إضافة «%v» — سيظهر على الشهادة عند إضافة صورتها', { v: name }));
  renderVars(); renderVarChips(); renderQuick(); syncProps(); requestRender(); saveSoon();
}
async function renameVar(old) {
  const nv = cleanName(await ask({ title: t('تغيير اسم المتغير'), text: t('اكتب الاسم الجديد:'), ok: t('حفظ'), input: old, icon: IC_EDIT }));
  if (!nv || nv === old) return;
  if (S.vars.includes(nv)) return toast(t('يوجد متغير بهذا الاسم'));
  S.vars[S.vars.indexOf(old)] = nv;
  S.map[nv] = S.map[old]; delete S.map[old];
  for (const f of S.fields) { f.text = f.text.split(`{${old}}`).join(`{${nv}}`); if (f.label === old) f.label = nv; }
  if (!S.cols.includes(S.map[nv])) { S.map[nv] = ''; autoMap(); }
  renderAllPanels(); requestRender(); saveSoon();
}
function removeVar(v) {
  const linked = S.fields.filter(f => f.text.trim() === `{${v}}`);
  S.vars = S.vars.filter(x => x !== v); delete S.map[v];
  if (linked.length) { S.fields = S.fields.filter(f => !linked.includes(f)); if (!sel()) S.selId = null; }
  renderAllPanels(); requestRender(); saveSoon();
}
function renderVars() {
  const ul = $('#varList'); ul.innerHTML = '';
  const hasData = S.cols.length > 0;
  for (const v of S.vars) {
    const ok = isLinked(v), li = document.createElement('li');
    li.className = 'vitem' + (hasData && !ok ? ' bad' : '');
    li.innerHTML = `<div class="vh"><b></b><span class="slot"></span><button class="mini" data-a="edit">${IC_EDIT}</button><button class="mini del" data-a="del">${IC_DEL}</button></div><div class="vstat"></div>`;
    li.querySelector('[data-a=edit]').title = t('تغيير الاسم');
    li.querySelector('[data-a=del]').title = t('حذف');
    li.querySelector('b').textContent = v;
    const slot = li.querySelector('.slot');
    if (usesVar(v)) { const s = document.createElement('span'); s.className = 'vtag on'; s.textContent = t('على الشهادة'); slot.replaceWith(s); }
    else if (S.img) { const b = document.createElement('button'); b.className = 'vtag add'; b.textContent = t('+ أضفه للشهادة'); b.onclick = () => { addField(`{${v}}`, v); renderVars(); }; slot.replaceWith(b); }
    const st = li.querySelector('.vstat');
    if (!hasData) st.textContent = t('سيُعبّأ من ملف Excel');
    else if (ok) { st.className = 'vstat ok'; st.textContent = t('✓ مرتبط بعمود: %c', { c: S.cols.includes(S.map[v]) ? S.map[v] : v }); }
    else { st.className = 'vstat bad'; st.textContent = t('⚠ لم يُعثر على عمود بهذا الاسم — اختر العمود:'); }
    if (hasData) {
      const s = document.createElement('select');
      s.add(new Option(t('— اختر العمود من ملف Excel —'), ''));
      for (const c of S.cols) s.add(new Option(c, c));
      s.value = S.cols.includes(S.map[v]) ? S.map[v] : (S.cols.includes(v) ? v : '');
      s.onchange = () => { S.map[v] = s.value; renderVars(); renderQuick(); renderVarChips(); syncProps(); requestRender(); saveSoon(); };
      li.appendChild(s);
    }
    li.querySelector('[data-a=edit]').onclick = () => renameVar(v);
    li.querySelector('[data-a=del]').onclick = () => removeVar(v);
    ul.appendChild(li);
  }
  const sg = $('#varSuggest'); sg.innerHTML = '';
  const rest = varSuggest().filter(x => !S.vars.includes(x));
  if (rest.length) {
    const l = document.createElement('div'); l.className = 'chip-label'; l.textContent = t('اقتراحات سريعة:'); sg.appendChild(l);
    for (const x of rest) { const b = document.createElement('button'); b.className = 'chip alt'; b.textContent = '+ ' + x; b.onclick = () => addVar(x); sg.appendChild(b); }
  }
  $('#btnVarTemplate').hidden = !S.vars.length;
  updateSteps();
}
$('#btnAddVar').onclick = () => { addVar($('#newVar').value); $('#newVar').value = ''; $('#newVar').focus(); };
$('#newVar').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#btnAddVar').click(); } });
$('#btnVarTemplate').onclick = () => {
  if (typeof XLSX === 'undefined') return toast(t('تحتاج اتصالاً بالإنترنت'));
  const hdr = [...S.vars];
  if (!hdr.some(v => /صف|فصل|شعب|class/i.test(v))) hdr.splice(Math.min(1, hdr.length), 0, t('الصف'));
  const ws = XLSX.utils.aoa_to_sheet([hdr]);
  ws['!cols'] = hdr.map(() => ({ wch: 24 }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, t('الطلاب'));
  if (!isEn()) { ws['!views'] = [{ RTL: true }]; wb.Workbook = { Views: [{ RTL: true }] }; }
  XLSX.writeFile(wb, t('بيانات-الشهادات.xlsx'));
  toast(t('عبّئ الملف ببيانات الطلاب (طالب في كل سطر) ثم ارفعه هنا'), 4000);
};

/* ================= properties panel ================= */
function buildFontSelect() {
  const s = $('#pFont'), cur = s.value; s.innerHTML = '';
  const groups = [[t('خطوط عربية'), GF_AR.map(x => x[0])], [t('خطوط ويندوز المثبتة'), SYS], [t('خطوط إنجليزية'), GF_LAT.map(x => x[0])]];
  if (S.customFonts.length) groups.unshift([t('خطوطك المرفوعة'), S.customFonts.map(x => x.name)]);
  for (const [g, list] of groups) {
    const og = document.createElement('optgroup'); og.label = g;
    for (const n of list) { const o = new Option(n, n); o.style.fontFamily = `"${n}"`; og.appendChild(o); }
    s.appendChild(og);
  }
  if (cur) s.value = cur;
}
const SWATCHES = ['#111827', '#374151', '#1e3a8a', '#1d4ed8', '#0f766e', '#166534', '#7f1d1d', '#b91c1c', '#9a6b1f', '#c9a227', '#6b21a8', '#ffffff'];
for (const c of SWATCHES) {
  const b = document.createElement('button'); b.style.background = c; b.title = c;
  b.onclick = () => setProp('color', c); $('#swatches').appendChild(b);
}
function setProp(k, v) { const f = sel(); if (!f) return; f[k] = v; syncProps(); renderList(); requestRender(); saveSoon(); }
function syncProps(except) {
  const f = sel();
  $('#props').hidden = !f; $('#propsEmpty').hidden = !!f;
  if (!f) return;
  if (![...$('#pFont').options].some(o => o.value === f.font)) $('#pFont').add(new Option(f.font, f.font));
  for (const el of $$('[data-k]', $('#props'))) {
    if (el === except) continue;
    const v = f[el.dataset.k];
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'number') el.value = Math.round(v * 100) / 100;
    else el.value = v;
  }
  for (const b of $$('#segAlign button')) b.classList.toggle('on', b.dataset.v === f.align);
  for (const d of $$('[data-show]', $('#props'))) d.hidden = !f[d.dataset.show];
  const fp = $('#fontPreview'); fp.style.fontFamily = `"${f.font}"`; fp.style.fontWeight = f.weight; fp.style.fontStyle = f.italic ? 'italic' : 'normal';
  const it = curItem(); const sample = fieldText(f, it ? it.row : null, it || {}).split('\n')[0];
  fp.textContent = sample.trim() || t('محمد أحمد — 2026');
  const unk = S.cols.length ? unknownVars(f.text) : [];
  const w = $('#pWarn'); w.hidden = !unk.length;
  if (unk.length) w.textContent = t('هذه المتغيرات غير موجودة في الملف: %v', { v: unk.map(u => '{' + u + '}').join(isEn() ? ', ' : '، ') });
}
$('#props').addEventListener('input', e => {
  const el = e.target, k = el.dataset.k, f = sel();
  if (!k || !f) return;
  let v;
  if (el.type === 'checkbox') v = el.checked;
  else if (el.type === 'number' || el.type === 'range') { v = parseFloat(el.value); if (isNaN(v)) return; }
  else v = el.value;
  if (el.classList.contains('hex')) { if (!/^#[0-9a-f]{6}$/i.test(v)) return; }
  f[k] = v; syncProps(el); renderList(); requestRender(); saveSoon();
  if (k === 'text') { clearTimeout(renderVars._t); renderVars._t = setTimeout(renderVars, 300); }
});
$$('#segAlign button').forEach(b => b.onclick = () => setProp('align', b.dataset.v));
$('#btnDel').onclick = () => { const f = sel(); if (f) delField(f.id); };
$('#btnDup').onclick = () => { const f = sel(); if (f) dupField(f.id); };
$('#btnCenterH').onclick = () => setProp('x', Math.round(S.W / 2));
$('#btnCenterV').onclick = () => setProp('y', Math.round(S.H / 2));
if ('EyeDropper' in window) {
  $('#btnEye').onclick = async () => { try { const r = await new EyeDropper().open(); setProp('color', r.sRGBHex); } catch {} };
} else $('#btnEye').hidden = true;

async function addCustomFont(name, dataUrl) {
  const ff = new FontFace(name, `url(${dataUrl})`);
  await ff.load(); document.fonts.add(ff);
  if (!S.customFonts.some(x => x.name === name)) S.customFonts.push({ name, data: dataUrl });
}
$('#inFont').onchange = async e => {
  const file = e.target.files[0]; e.target.value = ''; if (!file) return;
  const name = file.name.replace(/\.[^.]+$/, '');
  const dataUrl = await new Promise(r => { const rd = new FileReader(); rd.onload = () => r(rd.result); rd.readAsDataURL(file); });
  try {
    await addCustomFont(name, dataUrl); buildFontSelect(); setProp('font', name);
    try { localStorage.setItem(LS_FONTS, JSON.stringify(S.customFonts)); } catch {}
    toast(t('تمت إضافة الخط: %n', { n: name }));
  } catch { toast(t('تعذر تحميل ملف الخط')); }
};

/* ================= save / load ================= */
let saveT = 0;
function snapshot() {
  return { v: 1, W: S.W, H: S.H, fields: S.fields, vars: S.vars, map: S.map, out: S.out, sheetUrl: S.sheetSrc || $('#gsUrl').value.trim() };
}
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(saveLocal, 350); updateSteps(); }
function flushSave() { if (saveT) { clearTimeout(saveT); saveT = 0; saveLocal(); } }
let lastImg = null;
function saveLocal(noCommit) {
  saveT = 0;
  try { localStorage.setItem(LS_KEY, JSON.stringify(snapshot())); } catch {}
  if (S.imgSrc && S.imgSrc !== lastImg) {
    try { localStorage.setItem(LS_IMG, S.imgSrc); lastImg = S.imgSrc; } catch { try { localStorage.removeItem(LS_IMG); } catch {} }
  }
  if (noCommit !== true) commit();
}
function applySnapshot(d) {
  S.W = d.W || 0; S.H = d.H || 0;
  S.fields = (d.fields || []).map(f => ({ ...DEF, ...f, id: f.id || uid() }));
  S.out = { ...S.out, ...(d.out || {}) };
  S.vars = Array.isArray(d.vars) ? d.vars.slice() : [];
  S.map = { ...(d.map || {}) };
  if (d.sheetUrl) $('#gsUrl').value = d.sheetUrl;
  if (S.cols.length) autoMap();
  S.selId = null; renderAllPanels();
}
$('#btnSaveTpl').onclick = () => {
  if (!S.img) return toast(t('لا يوجد تصميم لحفظه بعد'));
  const d = { ...snapshot(), image: S.imgSrc, customFonts: S.customFonts };
  download(new Blob([JSON.stringify(d)], { type: 'application/json' }), t('تصميم-الشهادة.json'));
  toast(t('تم حفظ التصميم — افتحه لاحقاً من «فتح تصميم»'), 4000);
};
async function loadTemplateFile(file) {
  try {
    const d = JSON.parse(await file.text());
    if (!d.fields) throw 0;
    for (const cf of d.customFonts || []) { try { await addCustomFont(cf.name, cf.data); } catch {} }
    buildFontSelect(); applySnapshot(d);
    if (d.image) setImage(d.image, { keepFields: true }); else requestRender();
    toast(t('تم فتح التصميم'));
  } catch { toast(t('ملف التصميم غير صالح')); }
}
$('#inTpl').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) loadTemplateFile(f); };

/* ================= steps, drop zones, panels ================= */
function updateSteps() {
  $('#st1').classList.toggle('done', !!S.img);
  $('#stV').classList.toggle('done', S.vars.length > 0);
  $('#st2').classList.toggle('done', S.rows.length > 0);
  $('#st3').classList.toggle('done', S.fields.length > 0);
}
function renderAllPanels() {
  renderList(); renderVars(); renderVarChips(); renderQuick(); refreshDataUI(); syncProps(); updateSteps();
  $('#propsBadge').hidden = !S.selId;
}
function bindDrop(el, input, handler) {
  el.addEventListener('click', e => { if (e.target.closest('.howto')) return; input.click(); });
  el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
  el.addEventListener('dragleave', () => el.classList.remove('over'));
  el.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); el.classList.remove('over'); handler(e.dataTransfer.files[0]); });
  input.addEventListener('change', () => { const f = input.files[0]; input.value = ''; handler(f); });
}
bindDrop($('#dzImg'), $('#inImg'), loadImageFile);
bindDrop($('#emptyStage'), $('#inImg'), loadImageFile);
bindDrop($('#dzData'), $('#inData'), loadDataFile);
$('#btnChangeImg').onclick = () => $('#inImg').click();
$('#btnDelImg').onclick = deleteImage;
$('#btnDelData').onclick = deleteData;
$('#btnNew').onclick = newDesign;
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => {
  e.preventDefault();
  const f = e.dataTransfer.files[0]; if (!f) return;
  if (/^image\//.test(f.type)) loadImageFile(f);
  else if (/\.json$/i.test(f.name)) loadTemplateFile(f);
  else if (/\.(xlsx|xls|xlsm|ods|csv|txt)$/i.test(f.name)) loadDataFile(f);
});
for (const b of $$('[data-close]')) b.onclick = () => b.closest('dialog').close();

/* ================= mobile tabs ================= */
function setTab(tab) {
  document.body.dataset.tab = tab;
  for (const b of $$('#mnav button')) b.classList.toggle('on', b.dataset.tab === tab);
  if (tab === 'stage') requestAnimationFrame(layoutCanvas);
}
for (const b of $$('#mnav button')) b.onclick = () => setTab(b.dataset.tab);

/* ================= single preview download ================= */
$('#btnPreviewDl').onclick = async () => {
  if (!S.img) return toast(t('أضف صورة الشهادة أولاً'));
  await ensureAllFonts();
  const c = document.createElement('canvas'); c.width = S.W; c.height = S.H;
  const it = curItem(); renderCert(c.getContext('2d'), it ? it.row : null, it || {});
  const nm = it ? safe(resolve(S.out.name || seqKey(), it.row, it)) : t('معاينة');
  download(await canvasBlob(c, 'image/png'), `${nm || t('شهادة')}.png`);
};
async function ensureAllFonts() {
  await Promise.all(S.fields.map(f => document.fonts.load(fontStr(f, 40), FONT_SAMPLE).catch(() => {})));
  try { await document.fonts.ready; } catch {}
}

/* ================= export ================= */
const dlg = $('#dlgExport');
let busy = false, cancelFlag = false;
$('#btnExport').onclick = () => {
  if (!S.img) return toast(t('أضف صورة الشهادة أولاً'));
  if (!S.rows.length) return toast(t('حمّل ملف بيانات الطلاب أولاً'));
  if (!S.fields.length) return toast(t('أضف حقلاً واحداً على الأقل على الشهادة'));
  const ot = $('#oTop'); ot.innerHTML = '';
  ot.add(new Option(t('— بدون —'), ''));
  for (const c of S.cols) if (c !== S.classCol) ot.add(new Option(t('مجلد لكل: %c', { c }), c));
  ot.value = S.topCol;
  $('#oImages').checked = S.out.images; $('#oFormat').value = S.out.format; $('#oScale').value = String(S.out.scale);
  $('#oName').value = S.out.name; $('#oPdfClass').checked = false; $('#oPdfAll').checked = false;   // PDF options always start unchecked
  makeVarChips($('#oNameChips'), $('#oName'));
  renderExpClasses();
  $('#expProg').hidden = true; $('#expGo').disabled = false; $('#expCancel').textContent = t('إغلاق');
  dlg.showModal();
};
function renderExpClasses() {
  const box = $('#expClasses'); box.innerHTML = '';
  for (const g of getGroups()) {
    const l = document.createElement('label');
    l.innerHTML = '<input type="checkbox"><span class="c"></span><span class="n"></span>';
    const cb = l.querySelector('input'); cb.checked = !S.excluded.has(g.key);
    cb.onchange = () => { cb.checked ? S.excluded.delete(g.key) : S.excluded.add(g.key); renderExpSummary(); };
    l.querySelector('.c').textContent = (g.top ? g.top + ' › ' : '') + g.cls;
    l.querySelector('.n').textContent = g.items.length;
    box.appendChild(l);
  }
  renderExpSummary();
}
function renderExpSummary() {
  const gs = getGroups().filter(g => !S.excluded.has(g.key));
  const n = gs.reduce((a, g) => a + g.items.length, 0);
  const box = $('#expSummary'); box.innerHTML = '';
  for (const [v, l] of [[n, t('شهادة')], [gs.length, t('صف')], [S.fields.filter(f => f.visible).length, t('حقل على كل شهادة')]]) {
    const d = document.createElement('div'); d.className = 'stat';
    const b = document.createElement('b'); b.textContent = v; const s = document.createElement('span'); s.textContent = l;
    d.append(b, s); box.appendChild(d);
  }
}
$('#expAll').onclick = () => { S.excluded.clear(); renderExpClasses(); };
$('#expNone').onclick = () => { getGroups().forEach(g => S.excluded.add(g.key)); renderExpClasses(); };
$('#oTop').onchange = e => { S.topCol = e.target.value; S.excluded.clear(); rebuildOrder(); refreshDataUI(); renderExpClasses(); requestRender(); };
dlg.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
$('#expCancel').onclick = () => { if (busy) cancelFlag = true; else dlg.close(); };

function pdfCfg(w, h) {
  const land = w >= h, r = Math.max(w, h) / Math.min(w, h);
  if (Math.abs(r - Math.SQRT2) < 0.06) return { format: 'a4', orientation: land ? 'landscape' : 'portrait' };
  return { format: [w * 0.75, h * 0.75], orientation: land ? 'landscape' : 'portrait' };
}
class PdfOut {
  constructor(w, h) { this.cfg = pdfCfg(w, h); this.doc = null; }
  add(jpg) {
    if (!this.doc) this.doc = new jspdf.jsPDF({ unit: 'pt', format: this.cfg.format, orientation: this.cfg.orientation, compress: true });
    else this.doc.addPage(this.cfg.format, this.cfg.orientation);
    const pw = this.doc.internal.pageSize.getWidth(), ph = this.doc.internal.pageSize.getHeight();
    this.doc.addImage(jpg, 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
  }
  out() { return this.doc ? this.doc.output('arraybuffer') : null; }
}
function progress(done, total, txt) {
  $('#expBar').style.width = (total ? done / total * 100 : 0) + '%';
  $('#expTxt').textContent = txt;
}
$('#expGo').onclick = async () => {
  if (busy) return;
  const o = S.out;
  o.images = $('#oImages').checked; o.format = $('#oFormat').value; o.scale = +$('#oScale').value;
  o.name = $('#oName').value; o.pdfClass = $('#oPdfClass').checked; o.pdfAll = $('#oPdfAll').checked; saveSoon();
  if (!o.images && !o.pdfClass && !o.pdfAll) return toast(t('اختر نوعاً واحداً على الأقل من المخرجات'));
  if ((o.pdfClass || o.pdfAll) && typeof jspdf === 'undefined') return toast(t('مكتبة PDF لم تُحمَّل — تأكد من الاتصال بالإنترنت'));
  if (typeof JSZip === 'undefined') return toast(t('مكتبة الضغط لم تُحمَّل — تأكد من الاتصال بالإنترنت'));
  const groups = getGroups().filter(g => !S.excluded.has(g.key));
  if (!groups.length) return toast(t('اختر صفاً واحداً على الأقل'));

  busy = true; cancelFlag = false;
  $('#expProg').hidden = false; $('#expGo').disabled = true; $('#expCancel').textContent = t('إيقاف');
  const total = groups.reduce((a, g) => a + g.items.length, 0);
  progress(0, total, t('جاري تجهيز الخطوط...'));
  try {
    await ensureAllFonts();
    const cw = Math.round(S.W * o.scale), ch = Math.round(S.H * o.scale);
    const c = document.createElement('canvas'); c.width = cw; c.height = ch;
    const ctx = c.getContext('2d');
    const zip = new JSZip(), all = o.pdfAll ? new PdfOut(cw, ch) : null;
    const ext = o.format === 'jpg' ? 'jpg' : 'png', mime = o.format === 'jpg' ? 'image/jpeg' : 'image/png';
    let done = 0, lastTop = null, clsIdx = 0;
    for (const g of groups) {
      if (g.top !== lastTop) { lastTop = g.top; clsIdx = 0; }
      clsIdx++;
      const clsFolder = `${pad(clsIdx, 9)} - ${safe(g.cls) || t('صف')}`;
      const folder = S.topCol ? `${safe(g.top) || t('بدون')}/${clsFolder}` : clsFolder;
      const pdf = o.pdfClass ? new PdfOut(cw, ch) : null, used = new Set();
      for (const it of g.items) {
        if (cancelFlag) throw new Error('cancel');
        ctx.setTransform(o.scale, 0, 0, o.scale, 0, 0);
        renderCert(ctx, it.row, it);
        if (o.images) {
          const base = `${pad(it.seq, g.items.length)} - ${safe(resolve(o.name || seqKey(), it.row, it)) || t('شهادة')}`;
          let nm = base, k = 2; while (used.has(nm)) nm = `${base} (${k++})`; used.add(nm);
          zip.file(`${folder}/${nm}.${ext}`, await canvasBlob(c, mime, 0.95));
        }
        if (pdf || all) { const jpg = c.toDataURL('image/jpeg', 0.92); if (pdf) pdf.add(jpg); if (all) all.add(jpg); }
        done++; progress(done, total, `${g.top ? g.top + ' › ' : ''}${g.cls} — ${t('%a من %b', { a: it.seq, b: g.items.length })}   (${t('الإجمالي')} ${done}/${total})`);
        await tick();
      }
      if (pdf) zip.file(`${folder}/${t('شهادات %c', { c: safe(g.cls) })}.pdf`, pdf.out());
    }
    if (all) { progress(done, total, t('جاري إنشاء ملف PDF المجمّع...')); await tick(); zip.file(t('جميع الشهادات مرتبة حسب الصف.pdf'), all.out()); }
    progress(done, total, t('جاري ضغط الملف...'));
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' }, m => $('#expTxt').textContent = `${t('جاري ضغط الملف...')} ${Math.round(m.percent)}%`);
    const d = new Date();
    download(blob, `${t('الشهادات')} ${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.zip`);
    progress(total, total, t('✓ تم توليد %n شهادة في %c صف — تم تحميل ملف ZIP', { n: total, c: groups.length }));
    toast(t('تم! افتح ملف ZIP المحمَّل'));
  } catch (err) {
    if (err.message === 'cancel') progress(0, 1, t('تم الإيقاف'));
    else { console.error(err); progress(0, 1, t('حدث خطأ: ') + err.message); }
  } finally {
    busy = false; $('#expGo').disabled = false; $('#expCancel').textContent = t('إغلاق');
  }
};

/* ================= welcome tour ================= */
const TOUR = () => [
  { el: null, title: t('أهلاً بك في مولّد الشهادات 👋'), text: t('في دقيقة واحدة تصنع شهادة لكل طالب من ملف Excel، مرتبة حسب الصف. خذ جولة سريعة (5 خطوات).') },
  { el: '#cardImg', tab: 'setup', title: t('١. صورة الشهادة'), text: t('ارفع صورة شهادتك الفارغة، أو اختر من «قوالب جاهزة» تصميماً جاهزاً بنقرة واحدة.') },
  { el: '#cardVars', tab: 'setup', title: t('٢. المتغيرات'), text: t('اكتب أسماء المعلومات التي تريدها على الشهادة (اسم الطالب، الصف، التقدير...). كل متغير يظهر كحقل تسحبه لمكانه.') },
  { el: '#cardData', tab: 'setup', title: t('٣. بيانات الطلاب'), text: t('ارفع ملف Excel أو الصق رابط Google Sheets. يُربط كل متغير بعموده تلقائياً، وتُرتَّب الشهادات حسب الصف.') },
  { el: '#stage', tab: 'stage', title: t('٤. صمّم الشهادة'), text: t('اسحب الحقول لمكانها، واسحب الزوايا لتكبير الخط. من لوحة التنسيق تختار الخط واللون. تنقّل بين الطلاب لمعاينة كل شهادة.') },
  { el: '#btnExport', title: t('٥. ولّد الشهادات'), text: t('اضغط هنا لتحصل على ملف ZIP فيه مجلد لكل صف وملف PDF جاهز للطباعة. يمكنك إعادة هذه الجولة من زر «؟» في الأعلى.') },
];
let tourIdx = 0, tourEls = null;
function startTour() {
  endTour();
  const block = document.createElement('div'); block.className = 'tour-block';
  const hole = document.createElement('div'); hole.className = 'tour-hole';
  const pop = document.createElement('div'); pop.className = 'tour-pop'; pop.setAttribute('role', 'dialog');
  pop.style.transition = 'none'; setTimeout(() => { pop.style.transition = ''; }, 400);   // first placement without sliding in
  document.body.append(block, hole, pop);
  tourEls = { block, hole, pop }; tourIdx = 0;
  block.onclick = () => {};
  addEventListener('resize', placeTour); document.addEventListener('keydown', tourKey);
  showTourStep();
}
function tourKey(e) {
  if (!tourEls) return;
  if (e.key === 'Escape') endTour();
  else if (e.key === 'Enter') nextTour();
}
function nextTour() { const n = TOUR().length; if (tourIdx < n - 1) { tourIdx++; showTourStep(); } else endTour(); }
function endTour() {
  if (!tourEls) return;
  Object.values(tourEls).forEach(x => x.remove()); tourEls = null;
  removeEventListener('resize', placeTour); document.removeEventListener('keydown', tourKey);
  try { localStorage.setItem(LS_TOUR, '1'); } catch {}
}
function showTourStep() {
  const steps = TOUR(), st = steps[tourIdx], { pop } = tourEls;
  if (st.tab && isMobile()) setTab(st.tab);
  pop.innerHTML = `<div class="tp-n"></div><h4></h4><p></p><div class="tp-f"><div class="tp-dots"></div><button class="btn small ghost" data-a="skip"></button><button class="btn small ghost" data-a="prev"></button><button class="btn small primary" data-a="next"></button></div>`;
  pop.querySelector('.tp-n').textContent = t('الخطوة %a من %b', { a: tourIdx + 1, b: steps.length });
  pop.querySelector('h4').textContent = st.title; pop.querySelector('p').textContent = st.text;
  pop.querySelector('.tp-dots').innerHTML = steps.map((_, i) => `<i class="${i === tourIdx ? 'on' : ''}"></i>`).join('');
  const bs = pop.querySelector('[data-a=skip]'), bp = pop.querySelector('[data-a=prev]'), bn = pop.querySelector('[data-a=next]');
  bs.textContent = t('تخطي'); bp.textContent = t('السابق'); bn.textContent = tourIdx === steps.length - 1 ? t('ابدأ الآن') : t('التالي');
  bp.hidden = tourIdx === 0; bs.hidden = tourIdx === steps.length - 1;
  bs.onclick = endTour; bp.onclick = () => { tourIdx--; showTourStep(); }; bn.onclick = nextTour;
  const target = st.el && $(st.el);
  if (target) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  setTimeout(placeTour, target ? 320 : 0);
  bn.focus();
}
function placeTour() {
  if (!tourEls) return;
  const st = TOUR()[tourIdx], { hole, pop } = tourEls, target = st.el && $(st.el);
  const vw = innerWidth, vh = innerHeight, pw = pop.offsetWidth, ph = pop.offsetHeight, m = 12;
  if (!target || !target.offsetParent) {
    hole.classList.add('none');
    pop.style.left = (vw - pw) / 2 + 'px'; pop.style.top = (vh - ph) / 2 + 'px'; return;
  }
  hole.classList.remove('none');
  const r = target.getBoundingClientRect(), p = 6;
  const top = Math.max(4, r.top - p), bottom = Math.min(vh - 4, r.bottom + p);
  Object.assign(hole.style, { left: r.left - p + 'px', top: top + 'px', width: r.width + p * 2 + 'px', height: bottom - top + 'px' });
  let x, y;
  const spaceSide = Math.max(r.left, vw - r.right);
  if (spaceSide > pw + 2 * m && r.height > ph * .6) {           // beside the target
    x = r.left > vw - r.right ? r.left - pw - m : r.right + m;
    y = Math.min(Math.max(m, r.top + r.height / 2 - ph / 2), vh - ph - m);
  } else {                                                        // below or above
    x = Math.min(Math.max(m, r.left + r.width / 2 - pw / 2), vw - pw - m);
    y = bottom + m + ph < vh ? bottom + m : Math.max(m, top - ph - m);
  }
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
}
$('#btnTour').onclick = startTour;
$('#footTour').onclick = startTour;

/* ================= language ================= */
function updateLangBtn() {
  const en = isEn();
  $('#langLbl').textContent = en ? 'العربية' : 'English';
  $('#btnLang').title = en ? 'العربية' : 'English';
}
$('#btnLang').onclick = () => {
  const next = isEn() ? 'ar' : 'en';
  window.I18N.setLang(next);
};
window.I18N.onLang(() => {
  updateLangBtn(); buildFontSelect(); rebuildOrder(); renderAllPanels(); requestRender();
  if (S.img) $('#imgDims').textContent = t('%w × %h بكسل', { w: S.W, h: S.H });
  if (dlg.open) dlg.close();
  if (tourEls) showTourStep();
});

/* ================= init ================= */
window.I18N.apply();
updateLangBtn();
buildFontSelect();
try { for (const cf of JSON.parse(localStorage.getItem(LS_FONTS) || '[]')) addCustomFont(cf.name, cf.data).then(buildFontSelect, () => {}); } catch {}
let restored = false;
try {
  const d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
  if (d) { applySnapshot(d); restored = true; }
  const img = localStorage.getItem(LS_IMG);
  if (img) { lastImg = img; setImage(img, { keepFields: true, noCommit: true, done: () => commit() }); }
} catch {}
renderAllPanels();
if (!S.imgSrc) commit();
let seenTour = false; try { seenTour = !!localStorage.getItem(LS_TOUR); } catch { seenTour = true; }
if (!seenTour && !restored) setTimeout(startTour, 600);
window.__cert = { S, setImage, loadDataFile, loadFromSheet, addField, select, requestRender, getGroups, undo, redo, applyTemplate, startTour, setTab, HIST };
})();
