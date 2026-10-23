/* 高校足球物語 — 隊服工房 (crest and kit designer), merged into the game */
const Kit = (() => {
  const NUMF = "'Barlow Condensed','Arial Narrow','Roboto Condensed',sans-serif";
  const UIF = "'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif";
  const KITS = { home: '主場', away: '客場', gk: '門將' };
  const SW = ['#1f6b47', '#2e8b57', '#0f2a4a', '#1d4ed8', '#5aa9e6', '#b3122e', '#7a1d2b', '#e86a1c', '#f2c230', '#d9b44a', '#e8a0b4', '#6b3fa0', '#f4f1e6', '#ffffff', '#9aa3a8', '#2b2f33', '#0b0b0c'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let UID = 0; const uid = () => 'kt' + (++UID);
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ---------- presets ---------- */
  function kit(primary, secondary, trim, pattern, collar, o) { return Object.assign({ primary, secondary, trim, pattern, collar, sleeves: 'match', cuffs: true, chest: '', numColor: secondary, numStyle: 'solid', frontNum: true, shorts: secondary, shortsTrim: primary, shortsStripe: 'side', socks: primary, socksBand: secondary }, o || {}); }
  const PRESETS = [
    { label: '青葉綠', school: { short: 'AOBA', est: '1952' },
      crest: { shape: 'heater', field: 'solid', bg: '#1f6b47', bg2: '#2e8b57', fg: '#f4f1e6', accent: '#d9b44a', symbol: 'leaf', border: 'double', band: true, year: true },
      kits: { home: kit('#1f6b47', '#2e8b57', '#d9b44a', 'pinstripe', 'v', { chest: 'AOBA', numColor: '#f4f1e6', shorts: '#f4f1e6', shortsTrim: '#1f6b47', socks: '#1f6b47', socksBand: '#f4f1e6' }),
              away: kit('#f4f1e6', '#1f6b47', '#1f6b47', 'sash', 'crew', { chest: 'AOBA', shorts: '#1f6b47', shortsTrim: '#f4f1e6', socks: '#f4f1e6', socksBand: '#1f6b47' }),
              gk: kit('#2b2f33', '#f2c230', '#f2c230', 'chevron', 'polo', { shorts: '#2b2f33', shortsTrim: '#f2c230', socks: '#2b2f33', socksBand: '#f2c230', frontNum: false }) } },
    { label: '紅陵風', school: { short: 'KORYO', est: '1931' },
      crest: { shape: 'shield', field: 'halves', bg: '#b3122e', bg2: '#7a1d2b', fg: '#f2c230', accent: '#f2c230', symbol: 'flame', border: 'single', band: true, year: true },
      kits: { home: kit('#b3122e', '#7a1d2b', '#f2c230', 'halves', 'v', { numColor: '#ffffff', shorts: '#ffffff', shortsTrim: '#b3122e', socks: '#b3122e', socksBand: '#ffffff' }),
              away: kit('#ffffff', '#b3122e', '#b3122e', 'bands', 'crew', { shorts: '#b3122e', shortsTrim: '#ffffff', socks: '#ffffff', socksBand: '#b3122e' }),
              gk: kit('#2e8b57', '#2b2f33', '#2b2f33', 'fade', 'polo', { numColor: '#ffffff', shorts: '#2b2f33', shortsTrim: '#2e8b57', socks: '#2e8b57', socksBand: '#2b2f33', frontNum: false }) } },
    { label: '白濱藍', school: { short: 'SHIRA', est: '1948' },
      crest: { shape: 'round', field: 'stripes', bg: '#0f2a4a', bg2: '#1d4ed8', fg: '#ffffff', accent: '#5aa9e6', symbol: 'wave', border: 'double', band: true, year: true },
      kits: { home: kit('#0f2a4a', '#ffffff', '#5aa9e6', 'hoops', 'crew', { numColor: '#ffffff', numStyle: 'panel', shorts: '#0f2a4a', shortsTrim: '#5aa9e6', socks: '#0f2a4a', socksBand: '#ffffff' }),
              away: kit('#5aa9e6', '#0f2a4a', '#0f2a4a', 'yoke', 'v', { shorts: '#0f2a4a', shortsTrim: '#5aa9e6', socks: '#5aa9e6', socksBand: '#0f2a4a' }),
              gk: kit('#e86a1c', '#2b2f33', '#2b2f33', 'quarters', 'polo', { numColor: '#ffffff', numStyle: 'outline', shorts: '#2b2f33', shortsTrim: '#e86a1c', socks: '#e86a1c', socksBand: '#2b2f33', frontNum: false }) } },
    { label: '黑鷲金', school: { short: 'WASHI', est: '1960' },
      crest: { shape: 'octagon', field: 'solid', bg: '#0b0b0c', bg2: '#2b2f33', fg: '#f2c230', accent: '#f2c230', symbol: 'wing', border: 'double', band: true, year: true },
      kits: { home: kit('#0b0b0c', '#f2c230', '#f2c230', 'stripes', 'crew', { numColor: '#f2c230', numStyle: 'panel', shorts: '#0b0b0c', shortsTrim: '#f2c230', socks: '#0b0b0c', socksBand: '#f2c230' }),
              away: kit('#f2c230', '#0b0b0c', '#0b0b0c', 'sash', 'v', { shorts: '#0b0b0c', shortsTrim: '#f2c230', socks: '#f2c230', socksBand: '#0b0b0c' }),
              gk: kit('#6b3fa0', '#2b2f33', '#f2c230', 'fade', 'polo', { numColor: '#f2c230', shorts: '#2b2f33', shortsTrim: '#6b3fa0', socks: '#6b3fa0', socksBand: '#f2c230', frontNum: false }) } },
    { label: '櫻丘粉', school: { short: 'SAKURA', est: '1964' },
      crest: { shape: 'pennant', field: 'quarters', bg: '#ffffff', bg2: '#f6dbe3', fg: '#c2456b', accent: '#7a1d2b', symbol: 'sakura', border: 'single', band: true, year: true },
      kits: { home: kit('#e8a0b4', '#ffffff', '#7a1d2b', 'pinstripe', 'polo', { numColor: '#7a1d2b', shorts: '#ffffff', shortsTrim: '#7a1d2b', socks: '#e8a0b4', socksBand: '#ffffff' }),
              away: kit('#2b2f33', '#e8a0b4', '#e8a0b4', 'chevron', 'v', { shorts: '#2b2f33', shortsTrim: '#e8a0b4', socks: '#2b2f33', socksBand: '#e8a0b4' }),
              gk: kit('#5aa9e6', '#0f2a4a', '#0f2a4a', 'fade', 'polo', { shorts: '#0f2a4a', shortsTrim: '#5aa9e6', socks: '#5aa9e6', socksBand: '#0f2a4a', frontNum: false }) } },
  ];
  // a design = { school: { name, short, est }, crest, kits, player, active, view }
  function fromPreset(i, schoolName) {
    const p = clone(PRESETS[i]);
    return { school: { name: schoolName || '青葉高校', short: p.school.short, est: p.school.est }, crest: p.crest, kits: p.kits, player: { name: '', number: '10' }, active: 'home', view: 'front' };
  }
  const defaults = name => fromPreset(0, name);

  /* ---------- color utils ---------- */
  function lum(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const v = [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4));
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; }
  const contrast = (a, b) => { const A = lum(a), B = lum(b); return (Math.max(A, B) + .05) / (Math.min(A, B) + .05); };
  function hsl2hex(h, s, l) { s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join(''); }

  /* ---------- crest ---------- */
  const SHAPES = {
    heater: { d: 'M8,8 Q50,0 92,8 L92,58 Q92,98 50,116 Q8,98 8,58 Z', band: [0, 30], ty: 23, sym: 67, yr: 100, ss: 1.08, fs: 14 },
    shield: { d: 'M8,6 H92 V52 C92,86 72,104 50,116 C28,104 8,86 8,52 Z', band: [0, 28], ty: 22, sym: 63, yr: 96, ss: 1.02, fs: 14 },
    round: { d: 'M50,14 A46,46 0 1 1 49.99,14 Z', band: [16, 38], ty: 32, sym: 65, yr: 95, ss: .95, fs: 13 },
    pennant: { d: 'M10,6 H90 V78 L50,114 L10,78 Z', band: [0, 28], ty: 22, sym: 58, yr: 90, ss: .95, fs: 14 },
    octagon: { d: 'M32,6 H68 L94,32 V88 L68,114 H32 L6,88 V32 Z', band: [0, 28], ty: 22, sym: 64, yr: 100, ss: 1.02, fs: 13 },
    diamond: { d: 'M50,4 L96,60 L50,116 L4,60 Z', band: [30, 46], ty: 42, sym: 71, yr: 94, ss: .74, fs: 11 },
  };
  function pent(r) { return Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [r * Math.cos(a), r * Math.sin(a)]; }); }
  const P = a => a.map(q => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ');
  const SYM = {
    leaf: c => `<g transform="rotate(-24)"><path d="M0,-27 C17,-16 21,6 0,24 C-21,6 -17,-16 0,-27 Z" fill="${c.fg}"/><path d="M0,-18 V30 M0,-5 L9,-13 M0,5 L-10,-3 M0,14 L9,7" stroke="${c.bg}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`,
    star: c => { const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 10.5 : 26, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([r * Math.cos(a), r * Math.sin(a) + 2]); } return `<polygon points="${P(pts)}" fill="${c.fg}"/>`; },
    ball: c => { const p = pent(8.5), o = pent(23); return `<circle r="23" fill="${c.fg}"/><polygon points="${P(p)}" fill="${c.bg}"/><path d="${p.map((q, i) => `M${q[0].toFixed(1)},${q[1].toFixed(1)} L${o[i][0].toFixed(1)},${o[i][1].toFixed(1)}`).join(' ')}" stroke="${c.bg}" stroke-width="2.4"/>`; },
    wave: c => `<path d="M-26,-12 q6.5,-9 13,0 t13,0 t13,0 t13,0 M-26,2 q6.5,-9 13,0 t13,0 t13,0 t13,0 M-26,16 q6.5,-9 13,0 t13,0 t13,0 t13,0" stroke="${c.fg}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    mountain: c => `<circle cx="-15" cy="-17" r="5" fill="${c.fg}"/><path d="M-28,18 L-10,-8 L-2,3 L10,-20 L28,18 Z" fill="${c.fg}"/><path d="M10,-20 L16,-8 L12,-10 L9,-6 L6,-10 L4,-8 Z" fill="${c.bg}"/>`,
    wing: c => `<path d="M-24,12 C-12,-20 10,-24 26,-20 C16,-14 10,-8 5,-2 C13,-4 19,-4 23,-1 C15,3 9,7 3,9 C9,9 13,11 15,14 C1,19 -12,18 -24,12 Z" fill="${c.fg}"/>`,
    flame: c => `<path d="M0,-26 C11,-11 19,-2 15,11 C13,19 7,23 0,23 C-7,23 -15,19 -15,8 C-15,-2 -7,-5 -5,-15 C0,-9 2,-6 2,-2 C7,-8 5,-17 0,-26 Z" fill="${c.fg}"/>`,
    bolt: c => `<path d="M5,-26 L-15,4 L-2,4 L-7,26 L15,-6 L2,-6 L9,-26 Z" fill="${c.fg}"/>`,
    sakura: c => `${[0, 72, 144, 216, 288].map(r => `<path transform="rotate(${r})" d="M0,0 C-10,-7 -11,-20 -4.5,-25 L0,-21 L4.5,-25 C11,-20 10,-7 0,0 Z" fill="${c.fg}"/>`).join('')}<circle r="3.6" fill="${c.bg}"/>`,
    eagle: c => `<path d="M24,26 C14,12 14,0 20,-12 C12,-24 -4,-27 -14,-17 C-19,-12 -25,-7 -27,1 C-24,-1 -21,-1 -18,1 L-12,4 C-4,6 6,14 10,26 Z" fill="${c.fg}"/><circle cx="-7" cy="-11" r="3.2" fill="${c.bg}"/><path d="M-14,-15 L-1,-15" stroke="${c.bg}" stroke-width="2" stroke-linecap="round"/><path d="M6,0 L16,-4 M8,8 L17,5 M11,16 L18,14" stroke="${c.bg}" stroke-width="2" stroke-linecap="round"/>`,
    wolf: c => `<path d="M-20,-27 L-9,-12 L9,-12 L20,-27 L23,-4 L14,10 L6,26 L-6,26 L-14,10 L-23,-4 Z" fill="${c.fg}"/><path d="M-17,-19 L-11,-13 L-16,-9 Z M17,-19 L11,-13 L16,-9 Z" fill="${c.bg}"/><path d="M-13,-2 L-4,1 L-11,4 Z M13,-2 L4,1 L11,4 Z" fill="${c.bg}"/><path d="M-6,17 L0,21 L6,17" stroke="${c.bg}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    bear: c => `<circle cx="-16" cy="-15" r="8" fill="${c.fg}"/><circle cx="16" cy="-15" r="8" fill="${c.fg}"/><circle cx="-16" cy="-15" r="3.5" fill="${c.bg}"/><circle cx="16" cy="-15" r="3.5" fill="${c.bg}"/><circle cy="3" r="21" fill="${c.fg}"/><circle cx="-7.5" cy="-2" r="2.6" fill="${c.bg}"/><circle cx="7.5" cy="-2" r="2.6" fill="${c.bg}"/><ellipse cy="11" rx="9" ry="7" fill="${c.bg}"/><path d="M-4,7.5 H4 L0,12 Z" fill="${c.fg}"/>`,
    fox: c => `<path d="M-25,-25 L-8,-11 L8,-11 L25,-25 L21,0 L0,25 L-21,0 Z" fill="${c.fg}"/><path d="M-20,-18 L-11,-11 L-17,-6 Z M20,-18 L11,-11 L17,-6 Z" fill="${c.bg}"/><path d="M-12,-1 L-4,1 L-9,4.5 Z M12,-1 L4,1 L9,4.5 Z" fill="${c.bg}"/><path d="M-21,0 L-8,8 L0,25 Z M21,0 L8,8 L0,25 Z" fill="${c.bg}" opacity=".28"/>`,
    lion: c => { const pts = []; for (let i = 0; i < 24; i++) { const r = i % 2 ? 22 : 28, a = i * Math.PI / 12; pts.push([r * Math.cos(a), r * Math.sin(a)]); } return `<polygon points="${P(pts)}" fill="${c.fg}"/><circle r="15" fill="${c.bg}"/><circle cx="-5.5" cy="-3" r="2.3" fill="${c.fg}"/><circle cx="5.5" cy="-3" r="2.3" fill="${c.fg}"/><path d="M-4,3 H4 L0,8 Z" fill="${c.fg}"/><path d="M0,8 V11 M-5,12 Q0,15 5,12" stroke="${c.fg}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`; },
    horse: c => `<path d="M12,-27 L9,-17 C-3,-14 -13,-7 -21,5 C-25,11 -22,17 -16,17 C-10,17 -6,13 0,12 C2,18 3,23 4,27 L25,27 C23,10 23,-6 19,-18 Z" fill="${c.fg}"/><circle cx="2" cy="-5" r="2.6" fill="${c.bg}"/><circle cx="-17" cy="10" r="1.6" fill="${c.bg}"/><path d="M16,-14 L22,-12 M17,-4 L23,-2 M18,6 L24,8" stroke="${c.bg}" stroke-width="2" stroke-linecap="round"/>`,
    koi: c => `<path d="M-26,4 C-15,-14 9,-16 17,-4 L27,-15 L23,2 L27,17 L17,8 C9,18 -15,16 -26,4 Z" fill="${c.fg}"/><path d="M-6,-11 L2,-20 L5,-10 Z" fill="${c.fg}"/><circle cx="-16" cy="0" r="2.6" fill="${c.bg}"/><path d="M-9,-6 Q-5,4 -9,12" stroke="${c.bg}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    mono: (c, s) => `<text x="0" y="15" text-anchor="middle" font-family="${UIF}" font-weight="900" font-size="44" fill="${c.fg}">${esc(c.mono || (s.school.name || '校').trim().charAt(0) || '校')}</text>`,
  };
  function fieldPat(c) { const s = c.bg2; switch (c.field) {
    case 'halves': return `<rect x="50" y="0" width="50" height="120" fill="${s}"/>`;
    case 'stripes': return [5, 25, 45, 65, 85].map(x => `<rect x="${x}" y="0" width="10" height="120" fill="${s}"/>`).join('');
    case 'quarters': return `<rect x="50" y="0" width="50" height="60" fill="${s}"/><rect x="0" y="60" width="50" height="60" fill="${s}"/>`;
    case 'bend': return `<polygon points="-10,14 14,-10 110,86 86,110" fill="${s}"/>`;
    default: return ''; } }
  function crestInner(s) {
    const c = s.crest, S = SHAPES[c.shape] || SHAPES.heater, id = uid();
    const inner = 'translate(50,60) scale(.86) translate(-50,-60)';
    let g = `<defs><clipPath id="${id}"><path d="${S.d}"/></clipPath></defs><g clip-path="url(#${id})"><rect x="-5" y="-5" width="110" height="130" fill="${c.bg}"/>${fieldPat(c)}`;
    if (c.band) { const [a, b] = S.band;
      g += `<rect x="-5" y="${a}" width="110" height="${b - a}" fill="${c.accent}"/><rect x="-5" y="${b}" width="110" height="1.6" fill="${c.fg}" opacity=".6"/>`;
      g += `<text x="50" y="${S.ty}" text-anchor="middle" font-family="${NUMF}" font-weight="800" font-size="${S.fs}" letter-spacing="1.6" fill="${c.bg}">${esc((s.school.short || '').toUpperCase())}</text>`; }
    g += `<g transform="translate(50,${S.sym}) scale(${S.ss})">${(SYM[c.symbol] || SYM.leaf)(c, s)}</g>`;
    if (c.year && s.school.est) g += `<text x="50" y="${S.yr}" text-anchor="middle" font-family="${NUMF}" font-weight="700" font-size="${c.shape === 'diamond' ? 7.5 : 8.5}" letter-spacing="1.2" fill="${c.fg}">EST. ${esc(s.school.est)}</text>`;
    g += '</g>';
    if (c.border === 'none') g += `<path d="${S.d}" fill="none" stroke="rgba(0,0,0,.22)" stroke-width="1"/>`;
    else { g += `<path d="${S.d}" fill="none" stroke="${c.accent}" stroke-width="5" stroke-linejoin="round"/>`;
      if (c.border === 'double') g += `<path d="${S.d}" transform="${inner}" fill="none" stroke="${c.accent}" stroke-width="1.9" stroke-linejoin="round"/>`; }
    return g;
  }
  // small crest for headers, tables and the scoreboard
  const crestSVG = (s, cls = '') => `<svg class="${cls}" viewBox="-4 -4 108 128" role="img" aria-label="${esc(s.school.name)}隊徽">${crestInner(s)}</svg>`;

  /* ---------- kit ---------- */
  function pattern(k, id) { const s = k.secondary; switch (k.pattern) {
    case 'stripes': return [87.5, 137.5, 187.5, 237.5, 287.5].map(x => `<rect x="${x}" y="0" width="25" height="400" fill="${s}"/>`).join('');
    case 'pinstripe': { let o = ''; for (let x = 104; x < 300; x += 16) o += `<rect x="${x}" y="0" width="3" height="400" fill="${s}"/>`; return o; }
    case 'hoops': { let o = ''; for (let y = 66; y < 320; y += 46) o += `<rect x="0" y="${y}" width="400" height="23" fill="${s}"/>`; return o; }
    case 'bands': return `<rect x="0" y="138" width="400" height="20" fill="${s}"/><rect x="0" y="166" width="400" height="8" fill="${s}"/>`;
    case 'halves': return `<rect x="200" y="0" width="200" height="400" fill="${s}"/>`;
    case 'quarters': return `<rect x="200" y="0" width="200" height="170" fill="${s}"/><rect x="0" y="170" width="200" height="230" fill="${s}"/>`;
    case 'sash': return `<polygon points="86,42 126,22 334,292 294,322" fill="${s}"/>`;
    case 'chevron': return `<polygon points="80,72 200,152 320,72 320,108 200,188 80,108" fill="${s}"/>`;
    case 'yoke': return `<polygon points="0,0 400,0 400,92 200,112 0,92" fill="${s}"/>`;
    case 'fade': return `<rect x="0" y="0" width="400" height="330" fill="url(#${id}fd)"/>`;
    default: return ''; } }
  const SHADE = id => `<linearGradient id="${id}sh" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".24" stop-color="#fff" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".76" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>`;
  const FADE = (id, k) => `<linearGradient id="${id}fd" x1="0" x2="0" y1="0" y2="1"><stop offset=".28" stop-color="${k.secondary}" stop-opacity="0"/><stop offset="1" stop-color="${k.secondary}"/></linearGradient>`;
  const LS = 'M120,48 L100,128 L78,172 L30,150 L60,78 Z', RS = 'M280,48 L300,128 L322,172 L370,150 L340,78 Z';
  const LC = 'M30,150 L78,172 L85,162 L37,140 Z', RC = 'M370,150 L322,172 L315,162 L363,140 Z';
  const SH = 'M108,326 L292,326 L302,446 L212,452 L200,412 L188,452 L98,446 Z';
  const LSK = 'M118,462 H160 V566 Q160,588 138,588 H96 Q84,588 88,577 Q92,568 118,563 Z';
  const RSK = 'M282,462 H240 V566 Q240,588 262,588 H304 Q316,588 312,577 Q308,568 282,563 Z';
  const EDGE = 'rgba(0,0,0,.3)';
  const bodyPath = neck => `M120,48 L165,40 ${neck} L280,48 L300,128 L300,300 Q200,314 100,300 L100,128 Z`;

  function kitInner(s, key, view, player) {
    const k = s.kits[key], p = player || s.player || {}, id = uid(), back = view === 'back';
    const neck = back ? 'Q200,52 235,40' : k.collar === 'v' ? 'L200,88 L235,40' : k.collar === 'polo' ? 'Q200,62 235,40' : 'Q200,72 235,40';
    const body = bodyPath(neck);
    const sl = k.sleeves === 'secondary' ? k.secondary : k.sleeves === 'trim' ? k.trim : k.primary;
    const flip = back && ['halves', 'quarters', 'sash'].includes(k.pattern) ? ' transform="translate(400,0) scale(-1,1)"' : '';
    const shade = d => `<path d="${d}" fill="url(#${id}sh)"/>`;
    const line = d => `<path d="${d}" fill="none" stroke="${EDGE}" stroke-width="1.5" stroke-linejoin="round"/>`;
    let o = `<defs><clipPath id="${id}b"><path d="${body}"/></clipPath><clipPath id="${id}s"><path d="${SH}"/></clipPath>${SHADE(id)}${FADE(id, k)}</defs>`;
    o += [LSK, RSK].map(d => `<path d="${d}" fill="${k.socks}"/>`).join('');
    o += `<rect x="118" y="478" width="42" height="12" fill="${k.socksBand}"/><rect x="240" y="478" width="42" height="12" fill="${k.socksBand}"/><rect x="118" y="462" width="42" height="7" fill="#000" opacity=".14"/><rect x="240" y="462" width="42" height="7" fill="#000" opacity=".14"/>`;
    o += shade(LSK) + shade(RSK) + line(LSK) + line(RSK);
    let stripe = '';
    if (k.shortsStripe === 'side') stripe = `<polygon points="104,338 117,338 108,450 94,448" fill="${k.shortsTrim}"/><polygon points="296,338 283,338 292,450 306,448" fill="${k.shortsTrim}"/>`;
    else if (k.shortsStripe === 'double') stripe = `<polygon points="104,338 110,338 101,449 94,448" fill="${k.shortsTrim}"/><polygon points="115,338 120,338 112,450 106,449" fill="${k.shortsTrim}"/><polygon points="296,338 290,338 299,449 306,448" fill="${k.shortsTrim}"/><polygon points="285,338 280,338 288,450 294,449" fill="${k.shortsTrim}"/>`;
    o += `<g clip-path="url(#${id}s)"><rect x="80" y="320" width="240" height="140" fill="${k.shorts}"/>${stripe}<rect x="80" y="326" width="240" height="12" fill="${k.shortsTrim}"/></g>`;
    if (!back && p.number) o += `<text x="132" y="434" text-anchor="middle" font-family="${NUMF}" font-weight="800" font-size="26" fill="${k.shortsTrim}">${esc(p.number)}</text>`;
    o += shade(SH) + line(SH);
    if (!back) o += `<path d="M160,38 Q200,56 240,38 L200,104 Z" fill="${k.primary}"/><path d="M160,38 Q200,56 240,38 L200,104 Z" fill="#000" opacity=".4"/><path d="M165,41 Q200,54 235,41" fill="none" stroke="${k.trim}" stroke-width="5"/>`;
    o += `<path d="${LS}" fill="${sl}"/><path d="${RS}" fill="${sl}"/>`;
    if (k.cuffs) o += `<path d="${LC}" fill="${k.trim}"/><path d="${RC}" fill="${k.trim}"/>`;
    o += shade(LS) + shade(RS) + line(LS) + line(RS);
    o += `<g clip-path="url(#${id}b)"><rect width="400" height="400" fill="${k.primary}"/><g${flip}>${pattern(k, id)}</g></g>`;
    o += shade(body) + `<path d="M108,128 L110,296 M292,128 L290,296" stroke="#000" stroke-opacity=".08" stroke-width="1.5"/>` + line(body);
    if (back) o += `<path d="M165,40 Q200,52 235,40" fill="none" stroke="${k.trim}" stroke-width="7" stroke-linecap="round"/>`;
    else if (k.collar === 'v') o += `<path d="M165,40 L200,88 L235,40" fill="none" stroke="${k.trim}" stroke-width="7" stroke-linejoin="miter" stroke-linecap="round"/>`;
    else if (k.collar === 'polo') o += `<rect x="195" y="62" width="10" height="50" fill="${k.trim}"/><circle cx="200" cy="80" r="2.3" fill="#000" opacity=".35"/><circle cx="200" cy="98" r="2.3" fill="#000" opacity=".35"/><path d="M162,37 L200,63 L185,84 L154,51 Z" fill="${k.trim}" stroke="${EDGE}" stroke-width="1"/><path d="M238,37 L200,63 L215,84 L246,51 Z" fill="${k.trim}" stroke="${EDGE}" stroke-width="1"/>`;
    else o += `<path d="M165,40 Q200,72 235,40" fill="none" stroke="${k.trim}" stroke-width="7" stroke-linecap="round"/>`;
    const fx = w => k.numStyle === 'outline' ? ` stroke="${k.trim}" stroke-width="${w}" paint-order="stroke" stroke-linejoin="round"` : '';
    if (!back) {
      if (s.crest) o += `<g transform="translate(240,82) scale(.32)">${crestInner(s)}</g>`;
      if (k.frontNum && p.number) o += `<text x="160" y="124" text-anchor="middle" font-family="${NUMF}" font-weight="800" font-size="32" fill="${k.numColor}"${fx(3)}>${esc(p.number)}</text>`;
      if (k.chest) o += `<text x="200" y="196" text-anchor="middle" font-family="${NUMF}" font-weight="800" font-size="28" letter-spacing="3" fill="${k.numColor}"${fx(3)}>${esc(k.chest.toUpperCase())}</text>`;
    } else {
      if (k.numStyle === 'panel') o += `<rect x="122" y="74" width="156" height="196" rx="14" fill="${k.primary}"/>`;
      if (p.name) o += `<text x="200" y="106" text-anchor="middle" font-family="${NUMF},${UIF}" font-weight="700" font-size="25" letter-spacing="4"${String(p.name).length > 6 ? ' textLength="170" lengthAdjust="spacingAndGlyphs"' : ''} fill="${k.numColor}"${fx(2.5)}>${esc(String(p.name).toUpperCase())}</text>`;
      if (p.number) o += `<text x="200" y="252" text-anchor="middle" font-family="${NUMF}" font-weight="800" font-size="150" letter-spacing="-2" fill="${k.numColor}"${fx(6)}>${esc(p.number)}</text>`;
    }
    return o;
  }
  const kitSVG = (s, key, view, player, cls = '') => `<svg class="${cls}" viewBox="20 20 360 575" role="img" aria-label="${KITS[key]}球衣">${kitInner(s, key, view || 'front', player)}</svg>`;

  // a simple kit for the other schools, from their colour
  const PATS = ['solid', 'stripes', 'hoops', 'sash', 'halves', 'pinstripe', 'chevron', 'yoke'];
  // a varied, stable crest for each of the other schools, seeded by its name
  function hashStr(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) { let a = seed || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const ACCENTS = ['#d9b44a', '#f2c230', '#f4f1e6', '#ffffff', '#c0c6ca', '#0f2a4a', '#0b0b0c', '#b3122e', '#5aa9e6', '#e86a1c'];
  const CREST_SYMS = ['leaf', 'star', 'ball', 'wave', 'mountain', 'wing', 'flame', 'bolt', 'sakura', 'eagle', 'wolf', 'bear', 'fox', 'lion', 'horse', 'koi', 'mono', 'mono', 'mono'];
  const crestCache = {};
  function teamCrest(t) {
    const key = t.id + '|' + t.name + '|' + t.hue;
    if (crestCache[key]) return crestCache[key];
    const r = seeded(hashStr(t.name) ^ (t.id * 2654435761)), pk = a => a[Math.floor(r() * a.length)];
    const p = hsl2hex(t.hue, 55, 38);
    const dark = r() < .3;                                   // some schools use a dark field with the team colour as accent
    const bg = dark ? pk(['#0f2a4a', '#0b0b0c', '#2b2f33', '#7a1d2b']) : p;
    const accent = pk(ACCENTS.filter(c => contrast(c, bg) > 1.8));
    const bg2 = dark ? p : hsl2hex(t.hue, 50, r() < .5 ? 28 : 50);
    const fg = pk(['#ffffff', '#f4f1e6', accent].filter(c => contrast(c, bg) > 2.6).concat(['#ffffff']));
    const est = String(1900 + Math.floor(r() * 85));
    const d = { school: { name: t.name, short: t.short, est },
      crest: { shape: pk(Object.keys(SHAPES)), field: pk(['solid', 'solid', 'halves', 'stripes', 'quarters', 'bend']), bg, bg2, fg, accent,
        symbol: pk(CREST_SYMS), mono: Array.from(t.short)[0], border: pk(['double', 'single', 'single', 'none']), band: r() < .6, year: r() < .55 } };
    return (crestCache[key] = d);
  }
  function teamDesign(t) {
    const p = hsl2hex(t.hue, 55, 38), dark = '#1b1f1d', light = '#f4f1e6', c = teamCrest(t);
    return { school: c.school, crest: c.crest, player: {},
      kits: { home: kit(p, light, light, PATS[t.id % PATS.length], ['crew', 'v', 'polo'][t.id % 3], { numColor: light, shorts: t.id % 2 ? light : p, shortsTrim: t.id % 2 ? p : light, socks: p, socksBand: light }),
              away: kit(light, p, p, PATS[(t.id + 3) % PATS.length], 'crew', { numColor: p, shorts: p, shortsTrim: light, socks: light, socksBand: p }),
              gk: kit(dark, '#f2c230', '#f2c230', 'solid', 'polo', { frontNum: false, shorts: dark, shortsTrim: '#f2c230', socks: dark, socksBand: '#f2c230' }) } };
  }

  /* ---------- studio (the 隊服 tab) ---------- */
  const OPT = {
    shape: [['heater', '盾形'], ['shield', '方盾'], ['round', '圓章'], ['pennant', '錦旗'], ['octagon', '八角'], ['diamond', '菱形']],
    symbol: [['leaf', '葉'], ['star', '星'], ['ball', '足球'], ['wave', '浪'], ['mountain', '山'], ['wing', '翼'], ['flame', '焰'], ['bolt', '閃電'], ['sakura', '櫻'], ['eagle', '鷹'], ['wolf', '狼'], ['bear', '熊'], ['fox', '狐'], ['lion', '獅'], ['horse', '馬'], ['koi', '鯉'], ['mono', '校名首字']],
    field: [['solid', '單色'], ['halves', '左右分'], ['stripes', '直條'], ['quarters', '四分'], ['bend', '斜帶']],
    border: [['double', '雙線'], ['single', '單線'], ['none', '無邊框']],
    pattern: [['solid', '單色'], ['stripes', '直條'], ['pinstripe', '細直條'], ['hoops', '橫條'], ['bands', '胸前雙橫'], ['halves', '左右分'], ['quarters', '四分'], ['sash', '斜肩帶'], ['chevron', 'V 字'], ['yoke', '肩部拼色'], ['fade', '漸層']],
    collar: [['crew', '圓領'], ['v', 'V 領'], ['polo', 'Polo 領']],
    sleeves: [['match', '同主色'], ['secondary', '副色'], ['trim', '滾邊色']],
    numStyle: [['solid', '實心'], ['outline', '描邊'], ['panel', '號碼底板']],
    shortsStripe: [['side', '側條'], ['double', '雙側條'], ['none', '無']],
  };
  const PALS = [['#1f6b47', '#f4f1e6', '#d9b44a'], ['#0f2a4a', '#ffffff', '#5aa9e6'], ['#b3122e', '#ffffff', '#f2c230'], ['#0b0b0c', '#f2c230', '#f2c230'], ['#ffffff', '#0f2a4a', '#b3122e'], ['#e86a1c', '#0b0b0c', '#ffffff'], ['#5aa9e6', '#ffffff', '#0f2a4a'], ['#7a1d2b', '#5aa9e6', '#ffffff'], ['#6b3fa0', '#ffffff', '#f2c230'], ['#f4f1e6', '#7a1d2b', '#7a1d2b'], ['#2b2f33', '#e8a0b4', '#ffffff'], ['#1d4ed8', '#ffffff', '#b3122e'], ['#f2c230', '#1d4ed8', '#1d4ed8'], ['#9aa3a8', '#0f2a4a', '#e86a1c'], ['#2e8b57', '#0b0b0c', '#ffffff']];
  const rpick = a => a[Math.floor(Math.random() * a.length)];

  // the parts of a design that a kit change is charged for
  const sig = s => JSON.stringify([s.school.short, s.school.est, s.crest, s.kits]);
  // mount the designer into root. st is a working draft (edited in place); committed is the confirmed design.
  function mount(root, st, { toast, committed, locked, cost, budget, onCommit, onDiscard }) {
    const $ = s => root.querySelector(s);
    const cur = () => st.kits[st.active];
    const resolve = p => p.replace('*', st.active).split('.');
    const get = p => resolve(p).reduce((o, k) => o == null ? o : o[k], st);
    const set = (p, v) => { const ks = resolve(p), last = ks.pop(); ks.reduce((o, k) => o[k], st)[last] = v; };
    const fid = p => 'ks-' + p.replace('*', 'k').replace(/\./g, '-');
    function patternIcon(v) { const k = Object.assign({}, cur(), { pattern: v }), id = uid(), b = bodyPath('Q200,62 235,40');
      return `<svg viewBox="22 22 356 300" aria-hidden="true"><defs><clipPath id="${id}b"><path d="${b}"/></clipPath>${FADE(id, k)}</defs><path d="${LS}" fill="${k.primary}" stroke="${EDGE}" stroke-width="5"/><path d="${RS}" fill="${k.primary}" stroke="${EDGE}" stroke-width="5"/><g clip-path="url(#${id}b)"><rect width="400" height="400" fill="${k.primary}"/>${pattern(k, id)}</g><path d="${b}" fill="none" stroke="${EDGE}" stroke-width="5"/></svg>`; }
    const ICON = {
      pattern: patternIcon,
      shape: v => { const c = st.crest; return `<svg viewBox="-4 -4 108 128" aria-hidden="true"><path d="${SHAPES[v].d}" fill="${c.bg}" stroke="${c.accent}" stroke-width="6" stroke-linejoin="round"/></svg>`; },
      symbol: v => { const c = st.crest; return `<svg viewBox="-32 -32 64 64" aria-hidden="true"><circle r="31" fill="${c.bg}"/><g transform="scale(.88)">${SYM[v](c, st)}</g></svg>`; },
      field: v => { const c = Object.assign({}, st.crest, { field: v }), id = uid(), d = SHAPES.heater.d; return `<svg viewBox="-4 -4 108 128" aria-hidden="true"><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="100" height="120" fill="${c.bg}"/>${fieldPat(c)}</g><path d="${d}" fill="none" stroke="${c.accent}" stroke-width="5"/></svg>`; },
    };
    const optsF = (label, path, list, icon) => `<div class="field"><div class="flabel">${label}</div><div class="opts${icon ? ' has-icon' : ''}" data-kind="opts" data-path="${path}"${icon ? ` data-icon="${icon}"` : ''}>${list.map(([v, t]) => `<button type="button" class="opt" data-val="${v}">${icon ? '<span class="ico"></span>' : ''}<span>${t}</span></button>`).join('')}</div></div>`;
    const colorF = (label, path) => `<div class="field"><div class="flabel"><span>${label}</span><span class="hex"></span></div><div class="swatches" data-kind="color" data-path="${path}">${SW.map(c => `<button type="button" class="sw" data-val="${c}" style="--c:${c}" aria-label="${label} ${c}"></button>`).join('')}<label class="sw custom" title="自訂顏色"><input type="color" id="${fid(path)}" aria-label="${label}自訂顏色"></label></div></div>`;
    const textF = (label, path, attrs) => `<div class="field"><label class="flabel" for="${fid(path)}">${label}</label><input class="txt" id="${fid(path)}" data-kind="text" data-path="${path}" autocomplete="off" ${attrs || ''}></div>`;
    const togF = (label, path) => `<label class="toggle"><span>${label}</span><input type="checkbox" role="switch" id="${fid(path)}" data-kind="toggle" data-path="${path}"><i></i></label>`;

    root.innerHTML = `
    <div class="ks-layout">
      <div class="ks-left">
        <section class="ks-stage" aria-label="預覽">
          <div class="ks-stage-bar">
            <div class="ks-seg" data-role="kitTabs" role="group" aria-label="球衣">${Object.entries(KITS).map(([k, l]) => `<button type="button" data-kit="${k}">${l}</button>`).join('')}</div>
            <div class="ks-seg" data-role="viewTabs" role="group" aria-label="視角"><button type="button" data-view="front">正面</button><button type="button" data-view="back">背面</button></div>
          </div>
          <div class="ks-stage-main">
            <figure class="ks-crest-fig"><svg data-role="crestBig" viewBox="-4 -4 108 128" role="img" aria-label="隊徽"></svg><figcaption><div class="nm" data-role="capName"></div><div class="sub" data-role="capSub"></div></figcaption></figure>
            <figure class="ks-kit-fig"><svg data-role="kitBig" viewBox="20 20 360 575" role="img" aria-label="球衣球褲預覽"></svg></figure>
          </div>
        </section>
        <div class="ks-under">
          <div class="ks-lineup" data-role="lineup"></div>
          <div class="ks-actions">
            <button type="button" class="btn" data-role="random">隨機配色</button>
            <button type="button" class="btn" data-role="reset">重設</button>
          </div>
          <div class="ks-commit" data-role="commitBox"></div>
        </div>
      </div>
      <div class="ks-panel">
        <section class="ks-sec">
          <h2>學校。<span>套用一組範本，或從零開始。校名固定為 ${esc(st.school.name)}。</span></h2>
          <div class="ks-presets">${PRESETS.map((p, i) => `<button type="button" class="ks-preset" data-preset="${i}"><svg viewBox="-4 -4 108 128" aria-hidden="true">${crestInner({ school: { name: st.school.name, short: p.school.short, est: p.school.est }, crest: p.crest })}</svg>${esc(p.label)}</button>`).join('')}</div>
          <div class="ks-row">${textF('英文縮寫', 'school.short', 'maxlength="6"')}${textF('創校年', 'school.est', 'maxlength="4" inputmode="numeric"')}</div>
        </section>
        <section class="ks-sec">
          <h2>隊徽。<span>外形、圖案與底紋，決定學校的門面。</span></h2>
          ${optsF('外形', 'crest.shape', OPT.shape, 'shape')}
          ${optsF('圖案', 'crest.symbol', OPT.symbol, 'symbol')}
          ${optsF('底紋', 'crest.field', OPT.field, 'field')}
          <div class="ks-two">${colorF('底色', 'crest.bg')}${colorF('第二底色', 'crest.bg2')}${colorF('圖案色', 'crest.fg')}${colorF('邊框與緞帶', 'crest.accent')}</div>
          ${optsF('邊框', 'crest.border', OPT.border)}
          <div class="ks-toggles">${togF('縮寫緞帶', 'crest.band')}${togF('創校年份', 'crest.year')}</div>
        </section>
        <section class="ks-sec">
          <h2>球衣。<span>正在編輯<b data-role="kitLabel"></b>球衣，可在預覽上方切換。</span></h2>
          ${optsF('樣式', 'kits.*.pattern', OPT.pattern, 'pattern')}
          <div class="ks-two">${colorF('主色', 'kits.*.primary')}${colorF('副色', 'kits.*.secondary')}${colorF('滾邊色', 'kits.*.trim')}${colorF('文字與號碼', 'kits.*.numColor')}</div>
          ${optsF('領口', 'kits.*.collar', OPT.collar)}
          ${optsF('袖子', 'kits.*.sleeves', OPT.sleeves)}
          ${optsF('號碼樣式', 'kits.*.numStyle', OPT.numStyle)}
          <div class="ks-row">${textF('胸前文字', 'kits.*.chest', 'maxlength="10"')}</div>
          <div class="ks-toggles">${togF('袖口滾邊', 'kits.*.cuffs')}${togF('胸前小號碼', 'kits.*.frontNum')}</div>
        </section>
        <section class="ks-sec">
          <h2>球褲與球襪。<span>配色常與上衣互換，客場尤其如此。</span></h2>
          <div class="ks-two">${colorF('球褲', 'kits.*.shorts')}${colorF('褲頭與條紋', 'kits.*.shortsTrim')}${colorF('球襪', 'kits.*.socks')}${colorF('球襪環帶', 'kits.*.socksBand')}</div>
          ${optsF('球褲側條', 'kits.*.shortsStripe', OPT.shortsStripe)}
        </section>
      </div>
    </div>
    `;

    function sync() {
      root.querySelectorAll('[data-kind]').forEach(el => {
        const v = get(el.dataset.path);
        if (el.dataset.kind === 'opts') {
          el.querySelectorAll('.opt').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.val === v)); if (el.dataset.icon) b.querySelector('.ico').innerHTML = ICON[el.dataset.icon](b.dataset.val); });
        } else if (el.dataset.kind === 'color') {
          let hit = false; el.querySelectorAll('.sw[data-val]').forEach(b => { const on = b.dataset.val.toLowerCase() === String(v).toLowerCase(); hit = hit || on; b.setAttribute('aria-pressed', String(on)); });
          const cu = el.querySelector('.custom'); cu.classList.toggle('on', !hit); cu.style.setProperty('--c', v);
          const inp = cu.querySelector('input'); if (document.activeElement !== inp) inp.value = v;
          el.parentElement.querySelector('.hex').textContent = String(v).toUpperCase();
        } else if (el.dataset.kind === 'text') { if (document.activeElement !== el) el.value = v ?? ''; }
        else if (el.dataset.kind === 'toggle') el.checked = !!v;
      });
      $('[data-role=kitLabel]').textContent = KITS[st.active];
    }
    function render() {
      $('[data-role=crestBig]').innerHTML = crestInner(st);
      $('[data-role=kitBig]').innerHTML = kitInner(st, st.active, st.view);
      $('[data-role=capName]').textContent = st.school.name;
      $('[data-role=capSub]').textContent = [(st.school.short || '').toUpperCase(), st.school.est ? 'EST. ' + st.school.est : ''].filter(Boolean).join(' · ');
      $('[data-role=lineup]').innerHTML = Object.keys(KITS).map(k => `<button type="button" data-kit="${k}" aria-pressed="${k === st.active}"><svg viewBox="20 20 360 575" aria-hidden="true">${kitInner(st, k, 'front')}</svg><span>${KITS[k]}</span></button>`).join('');
      root.querySelectorAll('[data-role=kitTabs] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kit === st.active)));
      root.querySelectorAll('[data-role=viewTabs] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === st.view)));
    }
    function commitBox() {
      const dirty = sig(st) !== sig(committed);
      $('[data-role=commitBox]').innerHTML = !locked
        ? `<p class="small muted">隊服確定之前可以免費修改。確定之後，每次更改需花費 ${cost} 萬元。</p><button type="button" class="btn primary" data-role="commit">確定隊服</button>`
        : `<p class="small muted">${dirty ? `有尚未儲存的變更。儲存需花費 <b>${cost} 萬</b>（目前預算 ${budget} 萬）。` : `隊服已確定。之後每次更改需花費 ${cost} 萬元，目前預算 ${budget} 萬。`}</p>
           <div class="ks-actions"><button type="button" class="btn primary" data-role="commit" ${dirty && budget >= cost ? '' : 'disabled'}>儲存變更・花費 ${cost} 萬</button><button type="button" class="btn" data-role="discard" ${dirty ? '' : 'disabled'}>放棄變更</button></div>
           ${dirty && budget < cost ? '<p class="small bad-ink">預算不足，無法更改隊服。</p>' : ''}`;
    }
    function update() { render(); sync(); commitBox(); }

    root.addEventListener('click', e => {
      const pr = e.target.closest('.ks-preset');
      if (pr) { const p = clone(PRESETS[+pr.dataset.preset]); st.crest = p.crest; st.kits = p.kits; st.school.short = p.school.short; st.school.est = p.school.est; update(); return; }
      const kb = e.target.closest('[data-kit]'); if (kb) { st.active = kb.dataset.kit; update(); return; }
      const vb = e.target.closest('[data-view]'); if (vb) { st.view = vb.dataset.view; update(); return; }
      if (e.target.closest('[data-role=kitBig]')) { st.view = st.view === 'front' ? 'back' : 'front'; update(); return; }
      const role = e.target.closest('[data-role]') && e.target.closest('[data-role]').dataset.role;
      if (role === 'random') {
        const [p, s, t] = rpick(PALS), k = cur();
        Object.assign(k, { primary: p, secondary: s, trim: t, pattern: rpick(OPT.pattern)[0], collar: rpick(OPT.collar)[0] });
        const busy = ['stripes', 'hoops', 'halves', 'quarters', 'pinstripe'].includes(k.pattern);
        k.numColor = [s, t, '#ffffff', '#0b0b0c'].sort((a, b) => contrast(b, p) - contrast(a, p))[0];
        k.numStyle = busy && contrast(k.numColor, s) < 2.5 ? 'panel' : 'solid';
        const sw = Math.random() < .5; k.shorts = sw ? s : p; k.shortsTrim = sw ? p : s;
        const so = Math.random() < .6; k.socks = so ? p : s; k.socksBand = so ? s : p;
        update(); return;
      }
      if (role === 'reset') { const d = defaults(st.school.name); Object.assign(st, { crest: d.crest, kits: d.kits, school: d.school }); update(); toast && toast('已還原為預設的青葉綠'); return; }
      if (role === 'commit') { onCommit(); return; }
      if (role === 'discard') { onDiscard(); return; }
      const b = e.target.closest('.opt,.sw[data-val]'); if (!b) return;
      const holder = b.closest('[data-path]'); set(holder.dataset.path, b.dataset.val); update();
    });
    root.addEventListener('input', e => {
      const el = e.target;
      const holder = el.closest('[data-path]'); if (!holder || el.type === 'checkbox') return;
      set(holder.dataset.path, el.value); update();
    });
    root.addEventListener('change', e => {
      const el = e.target;
      if (el.type === 'checkbox') { set(el.dataset.path, el.checked); update(); }
    });
    update();
  }

  return { defaults, sig, crestSVG, kitSVG, teamDesign, teamCrest, mount, KITS };
})();
