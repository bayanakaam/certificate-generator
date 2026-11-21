/* Built-in certificate templates — original designs drawn with canvas.
   Each template: bg(ctx, W, H) draws the decoration; fields describe editable text placed on top. */
(() => {
'use strict';
const W = 2000, H = 1414;

/* ---------- drawing helpers ---------- */
function star(ctx, cx, cy, spikes, outer, inner, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer, a = rot + i * Math.PI / spikes;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function gold(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#a87420'); g.addColorStop(.25, '#e9c46a'); g.addColorStop(.5, '#b8862b');
  g.addColorStop(.75, '#f3d27a'); g.addColorStop(1, '#a87420');
  return g;
}
function sigLines(ctx, color, width = 3) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
  for (const [a, b] of [[.12, .36], [.64, .88]]) { ctx.beginPath(); ctx.moveTo(W * a, H * .835); ctx.lineTo(W * b, H * .835); ctx.stroke(); }
  ctx.restore();
}
function cornerOrnament(ctx, x, y, sx, sy, color, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx * s, sy * s); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(0, 0); ctx.lineTo(90, 0); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI / 2); ctx.stroke();
  star(ctx, 0, 0, 4, 20, 7, 0); ctx.fill();
  for (const [px, py] of [[110, 0], [0, 110]]) { ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}

/* ---------- shared text ---------- */
const TXT = {
  ar: {
    title: 'شهادة تقدير', intro: 'تُمنح هذه الشهادة للطالب/ة',
    desc: 'تقديراً لتفوقه في {الصف} بتقدير {التقدير}\nمع تمنياتنا بدوام التوفيق والنجاح',
    teacherLbl: 'المعلم/ة', dateLbl: 'التاريخ',
    vars: ['اسم الطالب', 'الصف', 'التقدير', 'اسم المعلم', 'التاريخ'],
    sample: { 'اسم الطالب': 'سارة محمد العلي', 'الصف': 'الصف الخامس', 'التقدير': 'ممتاز', 'اسم المعلم': 'أ. خالد يوسف', 'التاريخ': '2026/11/21' },
  },
  en: {
    title: 'Certificate of Appreciation', intro: 'This certificate is proudly presented to',
    desc: 'In recognition of outstanding achievement in {Class} with a grade of {Grade}\nWishing you continued success',
    teacherLbl: 'Teacher', dateLbl: 'Date',
    vars: ['Student Name', 'Class', 'Grade', 'Teacher', 'Date'],
    sample: { 'Student Name': 'Sarah Mitchell', 'Class': 'Grade 5', 'Grade': 'Excellent', 'Teacher': 'Mr. James Carter', 'Date': '21/11/2026' },
  },
};

/* style: { title:[fontAr,fontEn,color,weight], intro:[...], name:[...], desc:[...], small:[...] }, titleText optional */
function makeFields(lang, st) {
  const T = TXT[lang], v = T.vars, ar = lang === 'ar';
  const f = (key, text, x, y, size, s, extra = {}) => ({
    label: key, text, x: Math.round(W * x), y: Math.round(H * y), size,
    font: s[ar ? 0 : 1], color: s[2], weight: String(s[3] || 700), align: 'center', ...extra,
  });
  const tX = ar ? .76 : .24, dX = ar ? .24 : .76;   // teacher signature on the reading-start side
  const L = ar
    ? { title: 'العنوان', intro: 'سطر تمهيدي', desc: 'الوصف', tl: 'عنوان المعلم', dl: 'عنوان التاريخ' }
    : { title: 'Title', intro: 'Intro line', desc: 'Description', tl: 'Teacher label', dl: 'Date label' };
  const title = (st.titleText && st.titleText[lang]) || T.title;
  return [
    f(L.title, title, .5, st.titleY || .2, st.titleSize || (ar ? 128 : 104), st.title),
    f(L.intro, T.intro, .5, .335, ar ? 46 : 42, st.intro),
    f(v[0], `{${v[0]}}`, .5, .45, ar ? 112 : 104, st.name, { maxWidth: Math.round(W * .62) }),
    f(L.desc, T.desc.replace('{الصف}', `{${v[1]}}`).replace('{التقدير}', `{${v[2]}}`), .5, .585, ar ? 42 : 38, st.desc, { lineHeight: 1.7 }),
    f(v[3], `{${v[3]}}`, tX, .795, 44, st.sig),
    f(L.tl, T.teacherLbl, tX, .875, 34, st.small),
    f(v[4], `{${v[4]}}`, dX, .795, 44, st.sig),
    f(L.dl, T.dateLbl, dX, .875, 34, st.small),
  ];
}

/* ---------- the templates ---------- */
const TEMPLATES = [
  {
    id: 'classic', name: { ar: 'كلاسيكي ذهبي', en: 'Classic Gold' }, desc: { ar: 'إطار ذهبي فاخر وختم', en: 'Gold frame with seal' },
    style: {
      title: ['Aref Ruqaa', 'Cinzel', '#8a5a12', 700], intro: ['Amiri', 'Playfair Display', '#5b4636', 400],
      name: ['Amiri', 'Great Vibes', '#1f2937', 700], desc: ['Amiri', 'Playfair Display', '#4b3b2f', 400],
      sig: ['Amiri', 'Playfair Display', '#1f2937', 700], small: ['Amiri', 'Playfair Display', '#8a6d3b', 400],
    },
    bg(ctx) {
      ctx.fillStyle = '#fdf8ec'; ctx.fillRect(0, 0, W, H);
      const rg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * .75);
      rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(226,203,150,.45)');
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = gold(ctx, 0, 0, W, H); ctx.lineWidth = 28; ctx.strokeRect(44, 44, W - 88, H - 88);
      ctx.lineWidth = 4; ctx.strokeRect(84, 84, W - 168, H - 168);
      ctx.lineWidth = 1.5; ctx.strokeRect(98, 98, W - 196, H - 196);
      const c = '#b8862b';
      cornerOrnament(ctx, 120, 120, 1, 1, c); cornerOrnament(ctx, W - 120, 120, -1, 1, c);
      cornerOrnament(ctx, 120, H - 120, 1, -1, c); cornerOrnament(ctx, W - 120, H - 120, -1, -1, c);
      // divider under title
      ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(W * .36, H * .265); ctx.lineTo(W * .64, H * .265); ctx.stroke();
      star(ctx, W / 2, H * .265, 4, 16, 6, 0); ctx.fill(); ctx.restore();
      // seal
      const sx = W / 2, sy = H * .815;
      ctx.save();
      ctx.fillStyle = '#9b2c2c';
      for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx + d * 20, sy + 40); ctx.lineTo(sx + d * 70, sy + 150); ctx.lineTo(sx + d * 45, sy + 132); ctx.lineTo(sx + d * 32, sy + 160); ctx.lineTo(sx + d * -5, sy + 50); ctx.fill(); }
      star(ctx, sx, sy, 28, 92, 80); ctx.fillStyle = gold(ctx, sx - 90, sy - 90, sx + 90, sy + 90); ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, 66, 0, Math.PI * 2); ctx.fillStyle = '#c9972f'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#f6e3a8'; ctx.beginPath(); ctx.arc(sx, sy, 56, 0, Math.PI * 2); ctx.stroke();
      star(ctx, sx, sy, 5, 34, 14); ctx.fillStyle = '#fff4cf'; ctx.fill();
      ctx.restore();
      sigLines(ctx, '#b8862b');
    },
  },
  {
    id: 'modern', name: { ar: 'عصري', en: 'Modern' }, desc: { ar: 'أشكال هندسية بألوان هادئة', en: 'Clean geometric shapes' },
    style: {
      title: ['Cairo', 'Montserrat', '#0b3a53', 800], intro: ['Tajawal', 'Montserrat', '#475569', 500],
      name: ['Cairo', 'Playfair Display', '#0f766e', 800], desc: ['Tajawal', 'Montserrat', '#475569', 500],
      sig: ['Cairo', 'Montserrat', '#0b3a53', 700], small: ['Tajawal', 'Montserrat', '#64748b', 500],
    },
    bg(ctx) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#0b3a53'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 640, 0); ctx.lineTo(W, 470); ctx.fill();
      ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W - 420, 0); ctx.lineTo(W, 300); ctx.fill();
      ctx.fillStyle = '#5eead4'; ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(W, 330); ctx.lineTo(W, 560); ctx.lineTo(W - 200, 420); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(520, H); ctx.lineTo(0, H - 380); ctx.fill();
      ctx.fillStyle = '#0b3a53'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(300, H); ctx.lineTo(0, H - 220); ctx.fill();
      ctx.fillStyle = '#e6f4f2';
      const r = rng(7); for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(120 + (i % 8) * 34, 110 + Math.floor(i / 8) * 34, 6, 0, 7); ctx.fill(); }
      for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(W - 400 + (i % 8) * 34, H - 250 + Math.floor(i / 8) * 34, 6, 0, 7); ctx.fill(); }
      void r;
      ctx.fillStyle = '#0f766e'; rrect(ctx, W / 2 - 90, H * .262, 180, 10, 5); ctx.fill();
      sigLines(ctx, '#94a3b8', 2.5);
    },
  },
  {
    id: 'kids', name: { ar: 'للأطفال', en: 'Kids' }, desc: { ar: 'ألوان مرحة ونجوم', en: 'Playful colors and stars' },
    titleText: { ar: 'شهادة تميّز', en: 'Super Star Award' },
    style: {
      title: ['Lalezar', 'Lalezar', '#f97316', 400], intro: ['Changa', 'Montserrat', '#334155', 500],
      name: ['Lalezar', 'Lalezar', '#7c3aed', 400], desc: ['Changa', 'Montserrat', '#334155', 500],
      sig: ['Changa', 'Montserrat', '#0f172a', 700], small: ['Changa', 'Montserrat', '#64748b', 500],
    },
    bg(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fff7e6'); g.addColorStop(1, '#e8f6ff');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const rb = ctx.createLinearGradient(0, 0, W, H);
      ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6'].forEach((c, i, a) => rb.addColorStop(i / (a.length - 1), c));
      ctx.lineWidth = 22; ctx.strokeStyle = rb; rrect(ctx, 50, 50, W - 100, H - 100, 60); ctx.stroke();
      ctx.lineWidth = 4; ctx.setLineDash([2, 18]); ctx.lineCap = 'round'; ctx.strokeStyle = '#94a3b8';
      rrect(ctx, 92, 92, W - 184, H - 184, 40); ctx.stroke(); ctx.setLineDash([]);
      const cols = ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];
      const r = rng(42);
      for (let i = 0; i < 70; i++) {
        let x, y;
        do { x = 130 + r() * (W - 260); y = 130 + r() * (H - 260); } while (x > W * .14 && x < W * .86 && y > H * .12 && y < H * .93);
        ctx.fillStyle = cols[i % cols.length]; ctx.globalAlpha = .85;
        if (i % 3 === 0) { star(ctx, x, y, 5, 22 + r() * 18, 10 + r() * 6, r() * 6); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(x, y, 6 + r() * 9, 0, 7); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      // big stars beside the title
      for (const [x, c] of [[W * .2, '#facc15'], [W * .8, '#facc15']]) { star(ctx, x, H * .2, 5, 70, 30); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#f59e0b'; ctx.stroke(); }
      sigLines(ctx, '#cbd5e1', 3);
    },
  },
  {
    id: 'islamic', name: { ar: 'إسلامي', en: 'Islamic Pattern' }, desc: { ar: 'زخرفة هندسية — مناسب لتحفيظ القرآن', en: 'Geometric ornament border' },
    titleText: { ar: 'شهادة تكريم', en: 'Certificate of Honor' },
    style: {
      title: ['Aref Ruqaa', 'Cinzel', '#14532d', 700], intro: ['Amiri', 'Playfair Display', '#3f3f46', 400],
      name: ['Amiri', 'Playfair Display', '#14532d', 700], desc: ['Amiri', 'Playfair Display', '#3f3f46', 400],
      sig: ['Amiri', 'Playfair Display', '#1f2937', 700], small: ['Amiri', 'Playfair Display', '#a16207', 400],
    },
    bg(ctx) {
      ctx.fillStyle = '#fbf8ef'; ctx.fillRect(0, 0, W, H);
      const B = 34, T = 74;
      ctx.fillStyle = '#14532d'; ctx.fillRect(B, B, W - 2 * B, T); ctx.fillRect(B, H - B - T, W - 2 * B, T);
      ctx.fillRect(B, B, T, H - 2 * B); ctx.fillRect(W - B - T, B, T, H - 2 * B);
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2.5;
      const drawStar = (x, y) => { star(ctx, x, y, 8, 24, 13, Math.PI / 8); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = '#d4af37'; ctx.fill(); };
      const c = B + T / 2;
      for (let x = c; x <= W - c + 1; x += (W - 2 * c) / 26) { drawStar(x, c); drawStar(x, H - c); }
      for (let y = c; y <= H - c + 1; y += (H - 2 * c) / 18) { drawStar(c, y); drawStar(W - c, y); }
      ctx.lineWidth = 4; ctx.strokeRect(B + T + 14, B + T + 14, W - 2 * (B + T + 14), H - 2 * (B + T + 14));
      ctx.lineWidth = 1.5; ctx.strokeRect(B + T + 26, B + T + 26, W - 2 * (B + T + 26), H - 2 * (B + T + 26));
      // medallion between the title and the name
      ctx.save(); ctx.translate(W / 2, H * .268);
      ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-300, 0); ctx.lineTo(-40, 0); ctx.moveTo(40, 0); ctx.lineTo(300, 0); ctx.stroke();
      star(ctx, 0, 0, 8, 28, 16, Math.PI / 8); ctx.fillStyle = '#14532d'; ctx.fill(); ctx.stroke();
      ctx.restore();
      sigLines(ctx, '#d4af37', 2.5);
    },
  },
  {
    id: 'navy', name: { ar: 'أنيق كحلي', en: 'Elegant Navy' }, desc: { ar: 'خلفية داكنة ولمسات ذهبية', en: 'Dark background, gold accents' },
    style: {
      title: ['El Messiri', 'Cinzel', '#e5c06a', 700], intro: ['Tajawal', 'Montserrat', '#cbd5e1', 400],
      name: ['El Messiri', 'Great Vibes', '#ffffff', 700], desc: ['Tajawal', 'Montserrat', '#e2e8f0', 400],
      sig: ['El Messiri', 'Montserrat', '#ffffff', 600], small: ['Tajawal', 'Montserrat', '#e5c06a', 500],
    },
    bg(ctx) {
      const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(1, '#16305a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalAlpha = .06; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      for (let i = -H; i < W; i += 46) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
      ctx.restore();
      const gg = gold(ctx, 0, 0, W, H);
      ctx.strokeStyle = gg; ctx.lineWidth = 3; ctx.strokeRect(56, 56, W - 112, H - 112);
      ctx.lineWidth = 1.5; ctx.strokeRect(74, 74, W - 148, H - 148);
      ctx.lineWidth = 10; ctx.lineCap = 'square';
      for (const [x, y, sx, sy] of [[56, 56, 1, 1], [W - 56, 56, -1, 1], [56, H - 56, 1, -1], [W - 56, H - 56, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(x, y + sy * 150); ctx.lineTo(x, y); ctx.lineTo(x + sx * 150, y); ctx.stroke();
      }
      ctx.fillStyle = gg; star(ctx, W / 2, H * .268, 4, 18, 6, 0); ctx.fill();
      ctx.strokeStyle = gg; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W * .38, H * .268); ctx.lineTo(W * .48, H * .268); ctx.moveTo(W * .52, H * .268); ctx.lineTo(W * .62, H * .268); ctx.stroke();
      sigLines(ctx, '#e5c06a', 2);
    },
  },
  {
    id: 'minimal', name: { ar: 'بسيط', en: 'Minimal' }, desc: { ar: 'تصميم هادئ ونظيف', en: 'Quiet and clean' },
    style: {
      title: ['Noto Kufi Arabic', 'Montserrat', '#111827', 300], titleSize: 110,
      intro: ['Noto Kufi Arabic', 'Montserrat', '#6b7280', 400], name: ['Noto Kufi Arabic', 'Montserrat', '#111827', 700],
      desc: ['Noto Kufi Arabic', 'Montserrat', '#4b5563', 400], sig: ['Noto Kufi Arabic', 'Montserrat', '#111827', 600],
      small: ['Noto Kufi Arabic', 'Montserrat', '#9ca3af', 400],
    },
    bg(ctx) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#111827'; ctx.lineWidth = 3; ctx.strokeRect(70, 70, W - 140, H - 140);
      ctx.fillStyle = '#0f766e'; ctx.fillRect(W / 2 - 40, 70 - 8, 80, 16);
      ctx.fillStyle = '#e5e7eb'; ctx.fillRect(W / 2 - 60, H * .265, 120, 4);
      sigLines(ctx, '#d1d5db', 2);
    },
  },
];
for (const t of TEMPLATES) { t.style.titleText = t.titleText; t.fields = lang => makeFields(lang, t.style); }

window.CERT_TEMPLATES = { W, H, list: TEMPLATES, text: TXT };
})();
