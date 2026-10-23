/* 高校足球物語 — game engine (pure logic, no DOM) */
const Engine = (() => {
  let S = null;
  const setState = s => { S = s; if (S && S.players) { migrateTraits(); migrateWing(); migrateTactics(); migrateNumbers(); } };
  function migrateWing() {
    const fix = p => { if (p.a && p.a.wng == null) p.a.wng = p.pos === 'GK' ? 5 : Math.round(clamp((p.a.spd + p.a.pas + p.a.tec) / 3 + (p.pos === 'MF' ? 3 : p.pos === 'DF' ? -3 : 0), 5, 95)); };
    Object.values(S.players).forEach(fix); (S.prospects || []).forEach(fix);
  }
  const getState = () => S;

  // ---------- RNG (seeded, stored in state) ----------
  function rnd() {
    S.rs = (S.rs + 0x6D2B79F5) | 0;
    let t = S.rs;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function wpick(items, w) { const tot = w.reduce((s, x) => s + x, 0); let r = rnd() * tot; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; } return items[items.length - 1]; }

  // ---------- static data ----------
  const TYPES = {
    trad:    { label: '傳統強校',   rep: 82, budget: 900, fac: 82, base: 60, slots: 8 },
    sport:   { label: '體育重點校', rep: 64, budget: 650, fac: 76, base: 55, slots: 8 },
    public:  { label: '普通公立校', rep: 38, budget: 300, fac: 52, base: 45, slots: 8 },
    private: { label: '私立新興校', rep: 34, budget: 820, fac: 66, base: 47, slots: 8 },
  };
  const SCHOOLS = [
    ['帝陵学園', '帝陵', 'trad'], ['国見台高校', '国見台', 'trad'], ['北陵高校', '北陵', 'trad'], ['船橋学院', '船橋', 'trad'],
    ['野洲川高校', '野洲川', 'sport'], ['鹿島台高校', '鹿島台', 'sport'], ['星稜館高校', '星稜館', 'sport'], ['大津東高校', '大津東', 'sport'],
    ['富山北高校', '富山北', 'sport'], ['神村学院', '神村', 'sport'], ['尚志館高校', '尚志館', 'sport'], ['前橋商業高校', '前橋商', 'sport'],
    ['青葉高校', '青葉', 'public'], ['県立緑ヶ丘高校', '緑ヶ丘', 'public'], ['市立港南高校', '港南', 'public'], ['県立朝霧高校', '朝霧', 'public'],
    ['市立白鳥高校', '白鳥', 'public'], ['県立松風高校', '松風', 'public'], ['県立若竹高校', '若竹', 'public'], ['市立桜坂高校', '桜坂', 'public'],
    ['県立千早高校', '千早', 'public'], ['県立大和川高校', '大和川', 'public'], ['県立夕凪高校', '夕凪', 'public'], ['市立北斗高校', '北斗', 'public'],
    ['聖和学園', '聖和', 'private'], ['修徳学院', '修徳', 'private'], ['明星国際高校', '明星', 'private'], ['暁星学園', '暁星', 'private'],
    ['昌平学院', '昌平', 'private'], ['興国館高校', '興国館', 'private'], ['開智学園', '開智', 'private'], ['創志学院', '創志', 'private'],
  ];
  const MY_SCHOOL = 12; // 青葉高校, always starts in the second division
  const JHS = ['青葉中学', '緑ヶ丘中学', '港南中学', '朝霧中学', '桜坂中学', '北斗中学', '松風中学', '白鳥中学', '若竹中学', '千早中学', '大和川中学', '夕凪中学'];
  const SUR = ['佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤','吉田','山田','佐々木','山口','松本','井上','木村','林','斎藤','清水','山崎','森','池田','橋本','阿部','石川','山下','中島','石井','小川','前田','岡田','長谷川','藤田','後藤','近藤','村上','遠藤','青木','坂本','西村','福田','太田','三浦','藤井','岡本','松田','中川','中野','原田','小野','竹内','金子','和田','久保','大塚','千葉','荒木','柴田','宮崎','酒井','工藤','横山','宮本','内田','高木','安藤','谷口','大野','丸山','今井','河野','藤原','上田','杉山','村田','武田','増田','小島','小山','平野','大西','菅原','新井','桜井','松井','野口','千田','服部','樋口','秋山','永井','中山','石田','平田','本田','菊地','久保田','吉川','山内','松尾','大橋','島田','原','高田','熊谷','宮田','森田','西田','片山','北村','早川','望月','堀','関','浅野','大川','北川','辻','川口','吉村','川村','岩崎','野村','上野','杉本','河合','須藤','古川','水野','小松','堀内','飯田','内藤','大久保','星野','西川','福井','吉岡','宮下','岩田','矢野','桑原','小池','黒田','稲葉','三上','成田','戸田','細川','南','土屋','白石','江口','寺田','堤','二宮','根本','椎名','夏目','篠原','柳田','宇野','浜田','大谷','冨田','鎌田','栗原','川島','有村','葛西','鶴田','一ノ瀬','宇佐美','長友','香川','遠山','赤松','黒木','城田','氷室','雨宮','神崎','霧島','南雲'];
  const GIV = ['翔太','大輝','蓮','悠真','陽翔','颯太','湊','樹','大和','拓海','健太','優斗','蒼','悠斗','陸','海斗','隼人','大翔','瑛太','一輝','航','涼介','圭吾','智也','遼','慎吾','春樹','直樹','和也','亮','瞬','怜央','奏太','晴','大地','匠','誠','光','慶','将吾','翼','碧','響','新','楓','駿','侑','凌','元気','康平','朝陽','律','暖','碧斗','蒼空','陽向','湊斗','結翔','悠人','颯','大雅','朔','新太','煌','迅','凪','晃','透','尚','修','学','淳','聡','剛','豪','勇気','勇人','雄大','拓真','拓也','健斗','健吾','賢人','謙介','啓太','圭佑','恵太','光希','晃大','航平','浩二','浩輝','耕太','幸太郎','翔平','翔吾','翔馬','翔也','祥太','将太','将大','昂','隆之介','龍之介','龍','竜也','亮太','涼','遼平','諒','玲','怜','礼央','蓮斗','錬','太一','太陽','大夢','大悟','大貴','卓也','卓磨','達也','達樹','匠海','巧','智哉','知樹','直人','直哉','尚樹','秀人','秀斗','英寿','英太','洋平','陽介','洋輔','佑樹','佑真','祐介','裕太','雄斗','友哉','優','優真','優希','悠','悠希','悠太郎','泰成','泰介','康介','康太','恭平','京介','啓介','健二','健一郎','元','源太','弦','玄','虎太郎','虎之介','鉄平','哲也','徹','貴大','孝太','崇','真司','真也','慎之介','信','伸也','進','晋平','仁','壮真','壮太','創','想太','颯人','汰一','拓斗','篤','敦','淳平','純','俊','俊介','駿介','瞬介','順平','正樹','雅也','昌平','政宗','宗一郎','総司','惣介','楽','嵐','凱','冬馬','夏樹','秋人','春翔','千尋','一真','一平','二郎','三四郎','史也','文哉','紘一','航大'];

  const ATTRS = ['spd', 'sta', 'str', 'tec', 'pas', 'wng', 'sho', 'def', 'gk', 'men'];
  const OUTFIELD_ONLY = ['wng'];
  const hasAttr = (p, k) => p.pos === 'GK' ? !OUTFIELD_ONLY.includes(k) : k !== 'gk';
  const ATTR_LABEL = { spd: '速度', sta: '體能', str: '力量', tec: '控球', pas: '傳球', wng: '邊路', sho: '射門', def: '防守', gk: '守門', men: '定位球' };
  const POS_BIAS = {
    GK: { gk: 16, def: -6, sho: -26, tec: -12, pas: -6, spd: -6, wng: -40 },
    DF: { def: 11, str: 5, sho: -12, tec: -4, wng: -3, gk: -40 },
    MF: { pas: 10, tec: 6, sta: 5, sho: -3, def: -2, wng: 4, gk: -40 },
    FW: { sho: 12, spd: 7, tec: 4, def: -14, wng: 2, gk: -40 },
  };
  const CA_W = {
    GK: { gk: .7, str: .1, spd: .1, pas: .1 },
    DF: { def: .45, str: .2, spd: .15, pas: .07, sta: .08, wng: .05 },
    MF: { pas: .28, tec: .22, sta: .12, men: .08, def: .1, spd: .1, wng: .1 },
    FW: { sho: .35, spd: .18, tec: .18, str: .1, men: .05, sta: .07, wng: .07 },
  };
  const TRAITS = ['聖人', '領袖', '演員', '侵略', '冷靜', '情緒化', '自律', '鐵人', '玻璃', '大心臟', '天才', '散漫', '駑鈍', '逆風型', '低抗壓'];
  const TRAIT_W = [5, 4, 4, 6, 6, 5, 7, 5, 4, 4, 2, 6, 3, 4, 4];
  const TRAIT_DESC = {
    '聖人': '有體育精神：不會惡意傷人、不假摔、不和裁判吵架',
    '領袖': '身為隊長時，全隊能力 +1%',
    '演員': '喜歡假摔騙點球，每次試圖欺騙裁判有 10% 機率吃牌',
    '侵略': '犯規傾向高，小動作多，領牌機率增加',
    '冷靜': '犯規吃牌率極低',
    '情緒化': '吃牌率高，愛和隊友或對手吵架',
    '自律': '訓練效率 +2.5%',
    '鐵人': '不容易受傷，長年健康',
    '玻璃': '容易受傷（訓練與比賽）',
    '大心臟': '大賽（夏季大會、高校選手權）各項能力 +5%',
    '天才': '訓練效率 +5%，成長快速',
    '散漫': '訓練效率 −2.5%',
    '駑鈍': '訓練效率 −5%，成長緩慢',
    '逆風型': '球隊落後時，各項能力 +2.5%',
    '低抗壓': '球隊落後時，各項能力 −2.5%',
  };
  const OLD_TRAIT = { '勤奮': '自律', '玻璃心': '低抗壓', '大賽型': '大心臟', '愛玩': '散漫' };
  const TRAIN_EFF = { '自律': 1.025, '天才': 1.05, '散漫': 0.975, '駑鈍': 0.95 };
  const INJ_MULT = { '鐵人': 0.35, '玻璃': 2.2 };
  // fouls: how often a player commits one, chance it becomes a yellow, chance it is a straight red
  const FOUL_W = { '侵略': 2.6, '情緒化': 1.5, '聖人': 0.35, '冷靜': 0.6 };
  const CARD_MULT = { '侵略': 1.7, '情緒化': 2.0, '冷靜': 0.15, '聖人': 0.4 };
  const RED_MULT = { '侵略': 2.2, '情緒化': 1.5, '冷靜': 0.2, '聖人': 0 };
  const FORM_LV = ['極低', '低', '一般', '高', '極高'];
  const FORM_MOD = [-0.10, -0.05, 0, 0.05, 0.10];
  const formOf = p => (p.form ?? 2);
  const bumpForm = (p, d) => { p.form = clamp(formOf(p) + d, 0, 4); };
  const mine = (t, id) => !!(id && S.players[id] && S.players[id].team === t.id);
  function autoTaker(ids) { return ids.slice().sort((a, b) => S.players[b].a.men - S.players[a].a.men)[0]; }
  function pickTaker(side, kind) {
    const id = side.t.sp && side.t.sp[kind];
    if (mine(side.t, id) && side.on.includes(id)) return id;
    const field = side.on.filter((x, i) => side.pos[i] !== 'GK');
    return autoTaker(field.length ? field : side.on);
  }
  function autoCaptain(t) { const ps = squad(t).sort((a, b) => (b.trait === '領袖') - (a.trait === '領袖') || caOf(b) - caOf(a)); return ps[0] && ps[0].id; }
  function migrateTraits() { for (const id in S.players) { const p = S.players[id]; if (OLD_TRAIT[p.trait]) p.trait = OLD_TRAIT[p.trait]; } for (const p of S.prospects || []) if (OLD_TRAIT[p.trait]) p.trait = OLD_TRAIT[p.trait]; }
  function setNumber(pid, n) {
    const p = S.players[pid]; if (!p || p.team !== S.me || !(n >= 1 && n <= 99)) return '';
    const other = squad(S.teams[S.me]).find(q => q.num === n && q !== p);
    if (other) other.num = p.num;
    p.num = n;
    return other ? `${p.name} 換上 ${n} 號，${other.name} 改穿 ${other.num} 號。` : `${p.name} 改穿 ${n} 號。`;
  }
  function setInst(pid, v) { const t = S.teams[S.me]; t.inst = t.inst || {}; if (v) t.inst[pid] = v; else delete t.inst[pid]; return `${S.players[pid].name}：${INSTS[v || '']}`; }
  // older saves: give the other schools position-based shirt numbers
  function migrateNumbers() { if (S.numV2) return; for (const t of S.teams) if (t.id !== S.me) renumber(t, true); S.numV2 = true; }
  function migrateTactics() {
    const me = S.teams[S.me];
    if (me && me.train) me.train = me.train.map(m => MENUS[m] ? m : (OLD_MENU[m] || '休息'));
    for (const t of S.teams) {
      t.inst = t.inst || {};
      if (OLD_STYLE[t.tactic.style]) t.tactic.style = OLD_STYLE[t.tactic.style];
      if (!STYLES.includes(t.tactic.style)) t.tactic.style = '均衡';
      if (OLD_FORM[t.tactic.form]) { t.tactic.form = OLD_FORM[t.tactic.form]; t.xi = null; }
      if (!FORMS[t.tactic.form]) { t.tactic.form = '4-4-2'; t.xi = null; }
      delete t.tactic.ment;
      // familiarity used to be per style; it is now per formation
      if (Object.keys(t.fam || {}).some(k => !FORMS[k])) {
        const cur = Math.max(35, ...Object.values(t.fam || {}).filter(v => typeof v === 'number'));
        t.fam = {}; Object.keys(FORMS).forEach(f => t.fam[f] = f === t.tactic.form ? cur : 35);
      }
      Object.keys(FORMS).forEach(f => t.fam[f] = clamp(Math.round(t.fam[f] ?? FAM_MIN), FAM_MIN, FAM_MAX));
    }
  }
  function setRole(kind, pid) {
    const t = S.teams[S.me];
    if (kind === 'captain') { t.captain = pid || null; return pid ? `${S.players[pid].name} 擔任隊長。` : '取消隊長任命。'; }
    t.sp = t.sp || {}; t.sp[kind] = pid || null;
    const lb = { corner: '角球', fk: '任意球', pk: '點球' }[kind];
    return pid ? `${S.players[pid].name} 負責主罰${lb}。` : `${lb}改為自動指派。`;
  }
  const FORMS = { '4-4-2': [4, 4, 2], '4-3-3': [4, 3, 3], '3-5-2': [3, 5, 2], '5-3-2': [5, 3, 2], '5-4-1': [5, 4, 1], '4-5-1': [4, 5, 1] };
  // c = central midfield presence, w = width (wide players / wing-backs)
  const FORM_INFO = { '4-4-2': { c: 0.97, w: 1.03 }, '4-3-3': { c: 1.0, w: 1.06 }, '3-5-2': { c: 1.06, w: 0.97 }, '5-3-2': { c: 0.98, w: 0.98 }, '5-4-1': { c: 0.95, w: 1.0 }, '4-5-1': { c: 1.07, w: 1.0 } };
  const STYLES = ['均衡', '反擊', '邊路', '傳控', '壓迫'];
  const STYLE_DESC = {
    '均衡': '沒有特別偏向。',
    '反擊': '持球與主動進攻大幅減少；對方進攻失敗時，有較高機會快速反擊得分。',
    '邊路': '中路持球、進攻機會減少；兩翼持球、進攻機會增加。',
    '傳控': '中路持球、進攻機會增加；兩翼持球、進攻機會減少。',
    '壓迫': '體能消耗大；減少雙方進攻機會，犯規變多，對手獲得定位球的機會增加。',
  };
  const INSTS = { att: '趨向進攻', '': '一般', def: '趨向防守' };
  const OLD_STYLE = { '控球': '傳控', '長傳衝擊': '邊路', '防守反擊': '反擊', '高位逼搶': '壓迫' };
  const OLD_FORM = { '4-2-3-1': '4-5-1' };
  const MENUS = {
    '體能': { attrs: ['spd', 'sta', 'str'], cond: -7, inj: .004 },
    '技術': { attrs: ['pas', 'tec', 'sho'], cond: -4, inj: .0015 },
    '戰術': { attrs: ['men', 'def', 'gk'], cond: -3, inj: .001 },
    '分組對抗': { attrs: ATTRS, cond: -8, inj: .007, small: true, formUp: 0.08 },
    '休息': { attrs: [], cond: 13, inj: 0 },
  };
  const OLD_MENU = { '防守': '戰術', '自習': '休息' };
  const DAYS = ['週一', '週二', '週三', '週四', '週五'];
  const MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  // 40-week school year from April. League runs all year around the two tournaments.
  // Three tiers, double round robin. 10-team leagues play 18 rounds (Apr–Dec), the 12-team prefectural league 22 (Apr–Jan).
  const LEAGUE_WEEKS_22 = [2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 29, 30, 31, 32, 33];
  const LEAGUE_WEEKS_18 = [2, 3, 4, 10, 11, 12, 13, 15, 17, 18, 20, 22, 24, 26, 28, 29, 30, 32];
  const DIVS = {
    S: { key: 'S', name: '超級聯賽', short: '超級', size: 10, tier: 1, weeks: LEAGUE_WEEKS_18 },
    P: { key: 'P', name: '王子聯賽', short: '王子', size: 10, tier: 2, weeks: LEAGUE_WEEKS_18 },
    R: { key: 'R', name: '都道府縣聯賽', short: '都道府縣', size: 12, tier: 3, weeks: LEAGUE_WEEKS_22 },
  };
  const DIV_ORDER = ['S', 'P', 'R'];
  const LEAGUE_WEEKS = LEAGUE_WEEKS_22;
  const divName = d => (DIVS[d] || DIVS.R).name;
  const CUPS = {
    ih: { key: 'ih', name: '夏季大會', full: '夏季大會（Inter-High）地區預選', weeks: [5, 6, 7, 8, 9], draw: 4 },
    wc: { key: 'wc', name: '高校選手權', full: '冬季大會（高校選手權）地區預選', weeks: [19, 21, 23, 25, 27], draw: 18 },
  };
  const CUP_OF_WEEK = w => Object.values(CUPS).find(c => c.weeks.includes(w));
  const CUP_ROUNDS = ['32 強', '16 強', '8 強', '準決賽', '決賽'];
  const SEASON_LEN = 40;
  const RECRUIT_DEADLINE = 38;
  const monthOf = w => MONTHS[clamp(Math.floor((w - 1) * 12 / SEASON_LEN), 0, 11)];

  // ---------- players ----------
  function caOf(p, pos = p.pos) { const w = CA_W[pos]; let s = 0; for (const k in w) s += p.a[k] * w[k]; return s; }
  function genPlayer(pos, grade, base, opts = {}) {
    const target = base + (grade - 1) * 4 + gauss() * 7;
    const a = {};
    for (const k of ATTRS) a[k] = clamp(target + (POS_BIAS[pos][k] || 0) + gauss() * 8, 5, 95);
    if (pos === 'GK') a.wng = 5;
    const p = {
      id: 'p' + (S.nextId++), name: pick(SUR) + pick(GIV), pos, grade, a,
      trait: rnd() < 0.55 ? wpick(TRAITS, TRAIT_W) : null,
      cond: 100, form: wpick([0, 1, 2, 3, 4], [1, 2, 5, 2, 1]), inj: 0, susp: 0,
      apps: 0, goals: 0, assists: 0, rSum: 0, rN: 0, num: 0, hist: [],
    };
    const ca = caOf(p);
    p.pa = clamp(ca + (3 - grade) * 5 + 4 + rnd() * 22 + (opts.paBonus || 0) + (p.trait === '天才' ? 6 : p.trait === '駑鈍' ? -6 : 0), ca + 2, 95);
    // ability on the day he joined: players generated as 2nd/3rd years have already grown a few points a year
    p.start = Math.round(clamp(ca - (grade - 1) * (3 + rnd() * 2), 15, ca));
    return p;
  }
  const OFF_POS = 0.8; // playing out of position: every attribute −20%
  const posRating = (p, pos) => {
    if (pos === p.pos) return caOf(p);
    return caOf(p, pos) * OFF_POS;
  };
  const available = p => p.inj <= 0 && p.susp <= 0;
  const stars = pa => clamp(Math.round((pa - 40) / 11 * 2) / 2, 0.5, 5);

  // ---------- teams ----------
  function newGame(seed, teamIdx = MY_SCHOOL, coach = '') {
    S = { v: 1, rs: seed | 0 || 20261021, nextId: 1, year: 1, week: 1, me: teamIdx, teams: [], players: {}, log: [], results: [], fixtures: {}, cups: {}, event: null, live: null, phase: 'week', prospects: [], scoutPts: 0, flags: {}, history: [], growth: [], numV2: true };
    SCHOOLS.forEach(([name, short, type], i) => {
      const T = TYPES[type];
      const t = {
        id: i, name, short, type, rep: clamp(T.rep + ri(-6, 6), 10, 95), budget: T.budget, fac: T.fac + ri(-5, 5),
        hue: (i * 137) % 360, players: [], tactic: { form: pick(Object.keys(FORMS)), style: pick(STYLES) }, inst: {},
        fam: {}, xi: null, rivals: [],
      };
      initFam(t);
      S.teams.push(t);
      const base = T.base + ri(-3, 3);
      // every grade has 6–8 players, so squads are 18–24
      for (let g = 1; g <= 3; g++) for (const pos of gradePlan(ri(GRADE_MIN, GRADE_MAX))) addPlayer(t, genPlayer(pos, g, base));
      renumber(t, true);
    });
    // rivals: neighbours inside same type group
    S.teams.forEach(t => {
      const same = S.teams.filter(o => o.type === t.type && o.id !== t.id);
      t.rivals = [same[(t.id) % same.length].id, same[(t.id + 3) % same.length].id];
    });
    const me = S.teams[teamIdx];
    me.tactic.style = '均衡';
    me.train = ['技術', '體能', '戰術', '分組對抗', '休息'];
    // divisions by squad strength
    // 青葉 starts in the bottom tier; the rest are placed by strength: 10 / 10 / 11 + 青葉
    me.div = 'R';
    const order = S.teams.filter(t => t !== me).sort((x, y) => teamPower(y) - teamPower(x));
    order.forEach((t, i) => t.div = i < 10 ? 'S' : i < 20 ? 'P' : 'R');
    makeLeague();
    newProspects();
    S.scoutPts = scoutPerWeek();
    S.flags.principal = false;
    S.coach = coach;
    log(`${coach ? coach + ' ' : ''}教練上任${me.name}！本季從${divName(me.div)}出發，目標一路升上超級聯賽。`, 'big');
    return S;
  }
  const GRADE_MIN = 6, GRADE_MAX = 8;
  // positions for one grade: 1 GK, 2 DF, 2 MF, 1 FW, plus extras for a 7th or 8th player
  function gradePlan(n) { const out = ['GK', 'DF', 'DF', 'MF', 'MF', 'FW']; const extra = shuffle(['DF', 'MF', 'FW']); for (let i = 6; i < n; i++) out.push(extra[i - 6]); return out; }
  function addPlayer(t, p) { S.players[p.id] = p; t.players.push(p.id); p.team = t.id; }
  // shirt numbers by position, like real squads: the best players at each position wear the classic numbers
  const NUM_POOL = {
    GK: { core: [1], rest: [12, 21, 31, 41] },
    DF: { core: [2, 3, 4, 5, 6], rest: [13, 15, 22, 23, 24, 25, 26] },
    MF: { core: [7, 8, 14], rest: [16, 17, 18, 27, 28, 29, 32, 33] },
    FW: { core: [9, 10, 11, 19, 20], rest: [30, 34, 35, 36] },
  };
  // full: give every player a fresh number (other schools each new school year); otherwise only players without one
  function renumber(t, full) {
    const ps = t.players.map(id => S.players[id]);
    if (full) ps.forEach(p => { p.num = 0; });
    const used = new Set(ps.filter(p => p.num).map(p => p.num));
    const free = n => !used.has(n);
    for (const pos of ['GK', 'DF', 'MF', 'FW']) {
      const group = ps.filter(p => p.pos === pos && !p.num).sort((a, b) => caOf(b) - caOf(a));
      const core = shuffle(NUM_POOL[pos].core.filter(free)), rest = NUM_POOL[pos].rest.filter(free);
      if (pos === 'FW' && core.includes(10)) { core.splice(core.indexOf(10), 1); core.unshift(10); }  // the ace striker wears 10
      if (pos === 'GK' && core.includes(1)) { core.splice(core.indexOf(1), 1); core.unshift(1); }
      const order = full ? core.concat(rest) : rest.concat(core).sort((a, b) => a - b);
      for (const p of group) {
        let n = order.find(free);
        if (n == null) { n = 13; while (used.has(n)) n++; }
        p.num = n; used.add(n);
      }
    }
  }
  const squad = t => t.players.map(id => S.players[id]);
  function teamPower(t) {
    const xi = autoXI(t).map(id => S.players[id]);
    return xi.reduce((s, p, i) => s + posRating(p, slotPos(t, i)), 0) / 11;
  }
  // side of each slot, left to right as drawn on the pitch: 2 → L R, 3 → L C R, 4 → L C C R, 5 → L C C C R
  const LINE_SIDES = { 1: ['C'], 2: ['L', 'R'], 3: ['L', 'C', 'R'], 4: ['L', 'C', 'C', 'R'], 5: ['L', 'C', 'C', 'C', 'R'] };
  function slotSides(form) { const [d, m, f] = FORMS[form] || FORMS['4-4-2']; return ['C', ...LINE_SIDES[d], ...LINE_SIDES[m], ...LINE_SIDES[f]]; }
  // formation familiarity: two random formations start at 60, the rest at 30; floor 30, ceiling 100
  const FAM_MIN = 30, FAM_MAX = 100;
  function initFam(t) {
    const two = shuffle(Object.keys(FORMS).slice()).slice(0, 2);
    t.fam = {}; Object.keys(FORMS).forEach(f => t.fam[f] = two.includes(f) ? 60 : FAM_MIN);
    t.tactic.form = two[0];
  }
  // <50: −5%, 50–74: ±0, 75–99: +1%, 100: +2% to every player
  const famMod = v => v >= 100 ? 0.02 : v >= 75 ? 0.01 : v >= 50 ? 0 : -0.05;
  function weeklyFam(t) {
    // only weeks with a match count: the formation(s) played +5, the others −2; no match, no change
    if (!(t.weekForms || []).length) return;
    const used = new Set(t.weekForms);
    Object.keys(FORMS).forEach(f => t.fam[f] = clamp((t.fam[f] ?? FAM_MIN) + (used.has(f) ? 5 : -2), FAM_MIN, FAM_MAX));
    t.weekForms = [];
  }
  function slots(t) { const [d, m, f] = FORMS[t.tactic.form]; return ['GK', ...Array(d).fill('DF'), ...Array(m).fill('MF'), ...Array(f).fill('FW')]; }
  const slotPos = (t, i) => slots(t)[i];
  function autoXI(t, exclude = new Set()) {
    const ps = squad(t).filter(p => available(p) && !exclude.has(p.id));
    const sl = slots(t), used = new Set(), xi = [];
    // fill scarce slots first: GK, then by position
    const order = sl.map((pos, i) => i).sort((a, b) => (sl[a] === 'GK' ? -1 : 0) - (sl[b] === 'GK' ? -1 : 0));
    for (const i of order) {
      const pos = sl[i];
      let best = null, bv = -1;
      for (const p of ps) {
        if (used.has(p.id)) continue;
        const v = posRating(p, pos) * (0.7 + 0.3 * p.cond / 100) * (1 + FORM_MOD[formOf(p)]);
        if (v > bv) { bv = v; best = p; }
      }
      if (best) { used.add(best.id); xi[i] = best.id; }
    }
    return xi.filter(Boolean).length === 11 ? xi : padXI(t, xi, used);
  }
  function padXI(t, xi, used) {
    // squad too thin: allow injured players as last resort
    const rest = squad(t).filter(p => !used.has(p.id));
    for (let i = 0; i < 11; i++) if (!xi[i] && rest.length) { const p = rest.shift(); xi[i] = p.id; used.add(p.id); }
    return xi;
  }
  function validXI(t) {
    if (!t.xi || t.xi.length !== 11) return false;
    const seen = new Set();
    for (const id of t.xi) { const p = S.players[id]; if (!p || p.team !== t.id || !available(p) || seen.has(id)) return false; seen.add(id); }
    return true;
  }
  function ensureXI(t) { if (!validXI(t)) t.xi = autoXI(t); return t.xi; }

  // ---------- schedule ----------
  function roundRobin(ids) {
    const n = ids.length, arr = ids.slice(), rounds = [];
    for (let r = 0; r < n - 1; r++) {
      const ms = [];
      for (let i = 0; i < n / 2; i++) {
        const a = arr[i], b = arr[n - 1 - i];
        ms.push((r + i) % 2 ? [a, b] : [b, a]);
      }
      rounds.push(ms);
      arr.splice(1, 0, arr.pop());
    }
    return rounds;
  }
  function makeLeague() {
    S.fixtures = {};
    S.table = {};
    for (const div of DIV_ORDER) {
      const ids = shuffle(S.teams.filter(t => t.div === div).map(t => t.id));
      if (!ids.length) continue;
      const first = roundRobin(ids), second = first.map(ms => ms.map(([h, a]) => [a, h]));
      [...first, ...second].forEach((ms, r) => {
        const w = DIVS[div].weeks[r];
        (S.fixtures[w] = S.fixtures[w] || []).push(...ms.map(([h, a]) => ({ comp: DIVS[div].name, div, round: r + 1, h, a, hs: null, as: null })));
      });
      ids.forEach(id => S.table[id] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0, form: [] });
    }

    S.cups = {};
  }
  function standings(div) {
    return S.teams.filter(t => t.div === div).map(t => ({ t, ...S.table[t.id] }))
      .sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || y.t.rep - x.t.rep);
  }
  function drawCup(key) {
    const C = CUPS[key];
    // seeds 1–32 by tier then league position; seed 1 meets seed 32, and top seeds can only meet late
    const rank = DIV_ORDER.flatMap(d => standings(d).map(r => r.t.id));
    const pairs = [];
    for (let i = 0; i < 16; i++) pairs.push([rank[i], rank[31 - i]]);
    const order = [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10];
    S.cups[key] = { rounds: [order.map(i => ({ h: pairs[i][0], a: pairs[i][1], hs: null, as: null, pk: null, w: null }))] };
    S.fixtures[C.weeks[0]] = S.cups[key].rounds[0].map((m, i) => ({ comp: C.name, cup: key, cupRound: 0, idx: i, h: m.h, a: m.a, hs: null, as: null }));
    log(`${C.full}抽籤完成：32 校單場淘汰，平手直接 PK。`, 'big');
  }
  function advanceCup(key, r) {
    const C = CUPS[key], prev = S.cups[key].rounds[r];
    if (r + 1 >= CUP_ROUNDS.length) return;
    const next = [];
    for (let i = 0; i < prev.length; i += 2) next.push({ h: prev[i].w, a: prev[i + 1].w, hs: null, as: null, pk: null, w: null });
    S.cups[key].rounds[r + 1] = next;
    S.fixtures[C.weeks[r + 1]] = next.map((m, i) => ({ comp: C.name, cup: key, cupRound: r + 1, idx: i, h: m.h, a: m.a, hs: null, as: null }));
  }

  // ---------- match engine ----------
  const mix = (p, w) => { let s = 0; for (const k in w) s += p.a[k] * w[k]; return s; };
  function eff(p, side, posIdx) {
    const pos = side.pos[posIdx];
    const oop = pos === p.pos ? 1 : OFF_POS;
    return oop * (1 + FORM_MOD[formOf(p)]) * (0.72 + 0.28 * p.cond / 100) * (side.cup && p.trait === '大心臟' ? 1.05 : 1) * (side.behind ? (p.trait === '逆風型' ? 1.025 : p.trait === '低抗壓' ? 0.975 : 1) : 1);
  }
  // Ratings per channel. Each slot has a side (L/C/R); attacks down one flank meet the other team's opposite flank.
  function lineRatings(side) {
    const t = side.t, st = side.style, F = FORM_INFO[side.form] || FORM_INFO['4-4-2'], inst = t.inst || {};
    const sides = side.sides || slotSides(side.form);
    const pl = side.on.map((id, i) => ({ p: S.players[id], pos: side.pos[i], sd: sides[i] || 'C', e: eff(S.players[id], side, i), ins: inst[id] || '' }));
    const wavg = (list, w, wf) => { let s = 0, ws = 0; for (const x of list) { const k = wf ? wf(x) : 1; s += mix(x.p, w) * x.e * k; ws += k; } return ws ? s / ws : 20; };
    const aw = x => x.ins === 'att' ? 1.6 : x.ins === 'def' ? 0.5 : 1;
    const dw = x => x.ins === 'def' ? 1.6 : x.ins === 'att' ? 0.5 : 1;
    const outf = pl.filter(x => x.pos !== 'GK');
    const of = pos => pl.filter(x => x.pos === pos);
    const or = (a, b) => a.length ? a : b;
    const mids = or(of('MF'), outf), fws = or(of('FW'), outf), dfs = or(of('DF'), outf);
    const nAtt = pl.reduce((s, x) => s + ({ FW: 1, MF: 0.4, DF: 0.1, GK: 0 }[x.pos]) * aw(x), 0);
    const nDef = pl.reduce((s, x) => s + ({ DF: 1, MF: 0.4, FW: 0.1, GK: 0 }[x.pos]) * dw(x), 0);
    const cap = t.id === S.me ? t.captain : autoCaptain(t);
    const lead = mine(t, cap) && side.on.includes(cap) && S.players[cap].trait === '領袖' ? 1.01 : 1;
    const fam = 1 + famMod(t.fam[side.form] ?? FAM_MIN);
    const attK = 1 + 0.06 * (nAtt - 4), defK = 1 + 0.05 * (nDef - 5.8);
    // weight of a player for one flank: on that flank 1.6, central 0.6, other flank 0.15
    const near = (x, s) => x.sd === s ? 1.6 : x.sd === 'C' ? 0.6 : 0.15;
    const midC = wavg(or(mids.filter(x => x.sd === 'C'), mids), { pas: .4, tec: .35, sta: .25 }) * F.c * (1 + 0.04 * (of('MF').length - 4));
    const midSide = s => wavg(outf, { wng: .5, spd: .3, sta: .2 }, x => near(x, s) * (x.pos === 'MF' ? 1.2 : x.pos === 'DF' ? (x.ins === 'att' ? 1.3 : 0.6) : 1)) * F.w;
    let midL = midSide('L'), midR = midSide('R'), mC = midC;
    const attC = (wavg(fws, { sho: .5, tec: .35, str: .15 }, x => aw(x) * (x.sd === 'C' ? 1.4 : 1)) * 0.7 + wavg(mids, { sho: .35, tec: .4, pas: .25 }, x => aw(x) * (x.sd === 'C' ? 1.4 : 0.7)) * 0.3) * attK;
    const attSide = s => (wavg(fws, { sho: .4, str: .3, spd: .3 }, x => aw(x) * near(x, s)) * 0.55 + wavg(outf, { wng: .7, spd: .3 }, x => aw(x) * near(x, s) * (x.pos === 'GK' ? 0 : 1)) * 0.45) * attK;
    const defC = (wavg(dfs, { def: .55, str: .25, spd: .2 }, x => dw(x) * (x.sd === 'C' ? 1.4 : 0.8)) * 0.8 + wavg(mids, { def: .6, sta: .4 }, x => dw(x) * (x.sd === 'C' ? 1.3 : 0.8)) * 0.2) * defK;
    const defSide = s => (wavg(dfs, { def: .5, spd: .3, str: .2 }, x => dw(x) * near(x, s)) * 0.75 + wavg(outf.filter(x => x.pos !== 'DF'), { def: .5, sta: .3, spd: .2 }, x => dw(x) * near(x, s)) * 0.25) * defK;
    let attL = attSide('L'), attR = attSide('R'), defL = defSide('L'), defR = defSide('R');
    if (st === '傳控') { mC *= 1.07; midL *= 0.88; midR *= 0.88; }
    if (st === '邊路') { midL *= 1.07; midR *= 1.07; mC *= 0.88; }
    if (st === '反擊') { mC *= 0.85; midL *= 0.85; midR *= 0.85; }
    if (st === '壓迫') { mC *= 1.09; midL *= 1.09; midR *= 1.09; }
    const dK = st === '反擊' ? 1.05 : 1;
    const gk = wavg(or(of('GK'), [pl[0]]), { gk: 1 });
    const man = side.red ? 1 - 0.08 * side.red : 1;
    const k = fam * lead * man * (side.home ? 1.03 : 1);
    const o = { midC: mC, midL, midR, attC, attL, attR, defC: defC * dK, defL: defL * dK, defR: defR * dK };
    for (const key in o) o[key] *= k;
    o.mid = (o.midC * 2 + o.midL + o.midR) / 4;
    o.att = (o.attC + o.attL + o.attR) / 3;
    o.def = (o.defC + o.defL + o.defR) / 3;
    o.gk = gk * man;
    return o;
  }
  function makeSide(t, home, cup) {
    const isMe = t.id === S.me;
    const xi = isMe ? ensureXI(t).slice() : autoXI(t);
    const sl = slots(t);
    const bench = squad(t).filter(p => available(p) && !xi.includes(p.id)).sort((a, b) => caOf(b) - caOf(a)).slice(0, 9).map(p => p.id);
    t.weekForms = (t.weekForms || []).concat(t.tactic.form);
    return { sides: slotSides(t.tactic.form), start: xi.slice(), startPos: sl.slice(), passes: 0, passOk: 0, offsides: 0, cards: [], subsLog: [], t, home, cup, on: xi, pos: sl.slice(), bench, style: t.tactic.style, form: t.tactic.form, subs: 5, red: 0, goals: 0, shots: 0, sot: 0, poss: 0, corners: 0, fouls: 0, yc: 0, used: new Set(xi), ratings: {}, scorers: [] };
  }
  function createMatch(fx) {
    const H = S.teams[fx.h], A = S.teams[fx.a];
    const cup = !!fx.cup;
    const m = { fx, seg: 0, min: 0, cup, sides: [makeSide(H, true, cup), makeSide(A, false, cup)], feed: [], done: false, pk: null, rival: H.rivals.includes(A.id) || A.rivals.includes(H.id) };
    for (const s of m.sides) for (const id of s.on) s.ratings[id] = 6.0;
    if (!cup && S.table && S.table[H.id]) { const tab = standings(H.div); m.rankBefore = [tab.findIndex(r => r.t.id === H.id) + 1, tab.findIndex(r => r.t.id === A.id) + 1]; }
    m.mine = H.id === S.me || A.id === S.me;
    broadcastSetup(m);
    if (m.mine) opening(m);
    else m.feed.push({ min: 0, kind: 'info', text: `${H.short} vs ${A.short}` });
    return m;
  }
  const nm = id => S.players[id].name;
  // ---- lanes: every slot plays on the left, centre or right; attacks down one lane meet the other side's mirrored lane ----
  const laneOf = (s, id) => ((s.sides || slotSides(s.form))[s.on.indexOf(id)]) || 'C';
  const mirror = ch => ch === 'L' ? 'R' : ch === 'R' ? 'L' : 'C';
  const laneWord = ch => ch === 'L' ? '左' : ch === 'R' ? '右' : '中';
  // how involved a player in lane sd is in play down channel ch (players rarely cover the far side)
  const laneW = (sd, ch) => !ch ? 1 : sd === ch ? 3 : (sd === 'C' || ch === 'C') ? 1 : 0.25;
  const ATT_W = { GK: 0, DF: 0.6, MF: 2, FW: 1.5 }, DEF_W = { GK: 0, DF: 2.5, MF: 1.1, FW: 0.2 };
  function zonePick(s, ch, posW, excl = []) {
    const ids = s.on.filter(id => !excl.includes(id));
    if (!ids.length) return s.on[0];
    const w = ids.map(id => laneW(laneOf(s, id), ch) * (posW[s.pos[s.on.indexOf(id)]] ?? 1));
    return w.some(x => x > 0) ? wpick(ids, w) : pick(ids);
  }
  // who shoots: forwards first; for a wide attack the box (centre) and the near side, for a central one the centre
  const shootLane = (sd, ch) => !ch ? 1 : ch === 'C' ? (sd === 'C' ? 1.6 : 0.7) : sd === ch ? 1.3 : sd === 'C' ? 1.5 : 0.6;
  function pickShooter(side, ch) {
    const ids = side.on, w = ids.map((id, i) => { const p = S.players[id]; const pos = side.pos[i]; return (pos === 'FW' ? 3 : pos === 'MF' ? 1.4 : pos === 'DF' ? 0.35 : 0) * (p.a.sho / 50) ** 2 * (p.cond > 30 ? 1 : 0.6) * shootLane(laneOf(side, id), ch); });
    return wpick(ids, w);
  }
  function pickPasser(side, not, wide, ch) {
    const ids = side.on.filter(id => id !== not), w = ids.map(id => { const i = side.on.indexOf(id), pos = side.pos[i]; return (pos === 'MF' ? 2.5 : pos === 'FW' ? 1.5 : pos === 'DF' ? 0.6 : 0.05) * (((wide ? S.players[id].a.pas * 0.3 + S.players[id].a.wng * 0.7 : S.players[id].a.pas * 0.8 + S.players[id].a.wng * 0.2)) / 50) ** 2 * laneW(laneOf(side, id), ch); });
    return wpick(ids, w);
  }
  // the analyst only speaks in our own matches
  const analyst = (m, p, text) => { if (m.mine && rnd() < p) say(m, '球評', typeof text === 'function' ? text() : text); };
  const gkOf = side => side.on[side.pos.indexOf('GK')] || side.on[0];
  const T = {
    build: ['{t} 在中場耐心倒腳，尋找空檔。', '{p} 拿球轉身，帶球推進到對方半場。', '{t} 連續短傳，對手追著球跑。', '{p} 一記長傳轉移，把球甩到另一側。'],
    press: ['{t} 前場壓迫逼出失誤，{p} 搶下球權！', '{p} 積極上搶，{o} 被迫回傳。'],
    wide: ['{p} 沿邊路推進，準備傳中。', '{t} 把球轉到邊路，{p} 下底。', '{p} 在邊線附近一對一突破。'],
    cross: ['{a} 邊路傳中，{p} 在門前包抄——', '{a} 下底倒三角，{p} 跟進起腳——', '{a} 起球找頭，{p} 高高躍起——'],
    counter: ['快速反擊！{a} 斷球後直接長傳，{p} 一路狂奔——', '{t} 抓住對手壓上的空檔反擊，{p} 帶球殺到禁區——'],
    chanceHalf: ['{p} 禁區外起腳——', '{p} 接應回做，嘗試遠射——', '角球開出，{p} 頭球攻門——'],
    chanceGood: ['{a} 送出直塞，{p} 在禁區內起腳——', '{a} 底線傳中，{p} 包抄搶點——', '{p} 連過兩人殺進禁區——'],
    chance1v1: ['{a} 一腳穿透防線！{p} 形成單刀——', '{p} 偷襲身後成功，面對門將——'],
    goal: ['球進了！！{p} 破門，{a} 助攻！', '漂亮！{p} 冷靜推射得手！', '球網晃動！{p} 為 {t} 取得進球！'],
    goalSolo: ['球進了！！{p} 個人能力打開局面！', '{p} 一腳世界波，球直掛死角！'],
    save: ['被門將 {g} 撲出底線！', '{g} 反應神速，單掌托出！', '{g} 穩穩抱住。'],
    miss: ['可惜偏出立柱。', '球打高了。', '擦著橫樑飛出！', '被後衛 {d} 拚死擋出！'],
    foul: ['{p} 從背後鏟倒對手，吃到黃牌！', '{p} 拉扯對手球衣，被出示黃牌。', '{p} 戰術犯規阻止反擊，黃牌！'],
    red: ['{p} 惡意犯規，裁判直接出示紅牌！{t} 少一人作戰！'],
    inj: ['{p} 倒地不起，看起來傷得不輕……'],
    corner: ['{t} 獲得角球，{k} 開出，{p} 搶點頭槌——', '角球！{k} 傳到後點，{p} 高高躍起——'],
    fk: ['禁區前沿任意球，{k} 站到球前——', '{t} 獲得危險位置的任意球，{k} 直接主罰——'],
    cornerGoal: ['球進了！！{p} 頭球破門，{k} 的角球精準到位！'],
    fkGoal: ['球進了！！{k} 的任意球繞過人牆，直入死角！'],
    pk: ['禁區內犯規！裁判判罰點球，{k} 站上罰球點——'],
    pkGoal: ['球進了！！{k} 冷靜罰進點球！', '{k} 騙過門將，點球命中！'],
    pkMiss: ['被 {g} 撲出來了！點球沒進！', '{k} 的點球打中門柱彈出！'],
    spMiss: ['被防守方解圍。', '球稍稍高出橫樑。', '門將 {g} 穩穩沒收。'],
  };
  const fill = (s, o) => s.replace(/\{(\w)\}/g, (_, k) => o[k] ?? '');
  const snap = m => m.sides ? [m.sides[0].goals, m.sides[1].goals] : [0, 0];
  function line(m, kind, text) { m.feed.push({ min: m.min, kind, text, sc: snap(m) }); }
  // match clock: every separate event takes its own minute, so two goals never share a minute.
  // A crowded spell spills into the next minutes; past 45 / 90 it becomes stoppage time (45+1, 90+2).
  function ev(m) {
    const end = m.seg <= 9 ? 45 : 90, segEnd = m.seg * 5;
    let next = m.cur + 1;
    if (next < segEnd && rnd() < 0.35) next++;
    m.cur = next;
    m.min = m.cur > 45 && m.seg <= 9 ? 45 + (m.cur - 45) / 100 : m.cur;
    return m.min;
  }
  const minLabel = x => x == null || x === 0 ? '' : x > 45 && x < 46 ? `45+${Math.round((x - 45) * 100)}` : x > 90 ? `90+${x - 90}` : String(x);
  // ---------- broadcast commentary: 主播 (play-by-play) and 球評 (analyst) ----------
  // Openings, calls and closings change with the competition: league, 夏季大會 (Inter-High) and 高校選手權 (winter).
  const say = (m, spk, text, kind = 'talk') => m.feed.push({ min: m.min, kind, text, spk, sc: snap(m) });
  const STYLE_TALK = {
    '傳控': '一如既往要靠傳控在中路一腳一腳推進',
    '反擊': '會先退守，等對手壓上後用速度打反擊',
    '邊路': '會大量利用兩翼，邊路傳中會很多',
    '壓迫': '從前場就開始逼搶，但這種打法很吃體力，下半場要特別注意',
    '均衡': '攻守平衡，沒有明顯的弱點',
  };
  function keyPlayers(s) {
    const ps = s.on.map(id => S.players[id]);
    const by = pos => ps.filter(p => p.pos === pos).sort((a, b) => caOf(b) - caOf(a))[0];
    return { ace: by('FW') || by('MF'), core: by('MF'), gk: by('GK'), cap: s.t.id === S.me ? S.players[s.t.captain] : null };
  }
  // "10 號隊長 山田" style reference; roles are added now and then so it does not get repetitive
  function tagOf(m, side, id, team) {
    const p = S.players[id]; if (!p) return '';
    if (team) return `${side.t.short} 的 ${tagOf(m, side, id)}`;
    const k = side.keys || {};
    let role = '';
    if (rnd() < 0.55) role = k.cap && k.cap.id === id ? '隊長' : k.ace && k.ace.id === id ? '王牌前鋒' : k.core && k.core.id === id ? '中場核心' : '';
    return `${p.num} 號${role ? role + ' ' : ''}${p.name}`;
  }
  function broadcastSetup(m) {
    const [H, A] = m.sides, fx = m.fx, cup = fx.cup, r = fx.cupRound;
    S.analyst = S.analyst || pick(['佐藤', '田中', '中村', '小林', '高橋']) + '老師';
    const final = cup && r === 4, semi = cup && r === 3;
    const venue = !cup ? `${H.t.name}球場`
      : cup === 'ih' ? (r >= 3 ? '青嵐縣營陸上競技場' : '青嵐縣營運動公園第二球場')
      : (final ? '青嵐縣立綜合運動公園陸上競技場' : r >= 2 ? '青嵐縣立綜合運動公園球技場' : '青嵐市民球技場');
    const crowd = Math.round((!cup ? 200 + H.t.rep * 8 : (cup === 'ih' ? [800, 1200, 2000, 3500, 6000] : [1500, 2500, 4000, 8000, 15000])[r]) * (0.9 + rnd() * 0.2) / 10) * 10;
    m.ctx = { cup, r, final, semi, venue, crowd, wcEd: 104 + S.year, ihEd: 74 + S.year, roundName: cup ? CUP_ROUNDS[r] : '', analyst: S.analyst };
    for (const s of m.sides) s.keys = keyPlayers(s);
  }
  function coachLine(m) {
    if (!S.coach) return;
    const me = m.sides.find(s => s.t.id === S.me); if (!me) return;
    const c = m.ctx;
    if (c.final) say(m, '主播', `鏡頭帶到 ${me.t.short} 的場邊，${S.coach} 教練雙手抱胸，神情凝重。帶領這支球隊走到決賽，今天他要完成最後一塊拼圖。`);
    else if (c.cup || m.rival || rnd() < 0.35) say(m, '主播', pick([`坐鎮 ${me.t.short} 場邊的是 ${S.coach} 教練。`, `${me.t.short} 的 ${S.coach} 教練在賽前最後一次把球員叫到身邊，交代戰術。`, `${S.coach} 教練今天會拿出什麼樣的佈局？`]));
  }
  function opening(m) {
    const [H, A] = m.sides, c = m.ctx, an = c.analyst, h = H.t.short, a = A.t.short;
    const look = `${h} 今天排出 ${H.form}，${STYLE_TALK[H.style]}；${a} 則是 ${A.form}，${STYLE_TALK[A.style]}。`;
    const watch = () => { const kh = H.keys.ace, ka = A.keys.ace; return kh && ka ? `兩隊要注意的人：${h} 的 ${kh.num} 號 ${kh.name}，以及 ${a} 的 ${ka.num} 號 ${ka.name}。` : ''; };
    if (!c.cup) {
      const D = DIVS[H.t.div] || DIVS.R, n = D.size, rounds = (n - 1) * 2;
      say(m, '主播', `觀眾朋友大家好，這裡是${c.venue}。${D.name}第 ${m.fx.round} 輪，由主場的 ${h} 迎戰 ${a}。`);
      if (m.rankBefore && m.fx.round > 1) {
        const [hr, ar] = m.rankBefore;
        let note = '';
        if (m.fx.round >= rounds / 2) {
          if (D.key !== 'R' && Math.max(hr, ar) >= n - 2) note = '這場比賽直接關係到保級，輸不起！';
          else if (D.key !== 'S' && Math.min(hr, ar) <= 3) note = '升級之路走到這裡，每一分都容不得閃失。';
          else if (Math.min(hr, ar) === 1) note = D.key === 'S' ? '榜首球隊登場，超級聯賽的冠軍爭奪戰持續升溫。' : '榜首球隊登場，冠軍爭奪戰持續升溫。';
        }
        say(m, '主播', `賽前 ${h} 排名第 ${hr}，${a} 排名第 ${ar}。${note}`);
      }
      if (m.rival) say(m, '主播', '這也是兩校之間的宿敵之戰，看台上的應援聲從賽前就沒停過！');
      say(m, '球評', look);
      coachLine(m);
      say(m, '主播', '主審鳴哨，比賽開始！', 'whistle');
      return;
    }
    if (c.cup === 'ih') {
      if (c.final) {
        say(m, '主播', `觀眾朋友，大家午安！歡迎來到${c.venue}——第 ${c.ihEd} 回全國高等學校總合體育大會足球競技，青嵐地區預選，最後的決賽！`);
        say(m, '主播', `32 所高校在這個夏天輪番倒下，今天站在草皮上的，只剩下 ${h} 與 ${a}。贏的一方，將代表青嵐地區前進全國 Inter-High！`);
        say(m, '主播', `現場湧入了 ${c.crowd.toLocaleString()} 名觀眾，氣溫超過 34 度。${an}，您怎麼看這場決賽？`);
        say(m, '球評', `在這種高溫下，體力分配會是勝負關鍵。${look}${watch()}`);
      } else {
        say(m, '主播', `盛夏的${c.venue}，場邊氣溫超過 ${32 + Math.floor(rnd() * 4)} 度。歡迎收看夏季大會（Inter-High）青嵐地區預選${c.roundName}，${h} 對 ${a}！`);
        say(m, '主播', '夏季大會是一場接著一場的單淘汰，沒有敗部、也沒有明天。全國大會的門票，整個青嵐地區只有一張。');
        if (c.semi) say(m, '主播', `距離決賽只差一步！現場有 ${c.crowd.toLocaleString()} 名觀眾。`);
        else say(m, '主播', '對兩隊的三年級來說，這可能是最後一個夏天——輸了，就只剩冬天的選手權。');
        say(m, '球評', look + (H.style === '壓迫' || A.style === '壓迫' ? '這麼熱的天氣打壓迫，下半場體力會是大問題。' : ''));
      }
      if (m.rival) say(m, '主播', '而且這是宿敵之戰！在淘汰賽遇上老對手，兩隊都不想在這裡倒下！');
      coachLine(m);
      say(m, '主播', '主審鳴哨，比賽開始！', 'whistle');
      return;
    }
    // 高校選手權 (winter)
    if (c.final) {
      say(m, '主播', `觀眾朋友，大家下午好！歡迎收看第 ${c.wcEd} 屆全國高等學校足球選手權大會——青嵐地區預選，最後的決賽！這裡是${c.venue}！`);
      say(m, '主播', '青嵐地區 32 所高校，經歷了無情殘酷的單淘汰預賽，今天，只有站上這片草皮的兩支球隊，有資格爭奪那張通往國立競技場的門票！');
      say(m, '主播', `對於隊上的三年級選手來說，這是一場絕對不能輸、也沒有下一次的終極之戰！輸了，高中熱血生涯就在此謝幕；贏了，就能帶著全隊的夢想站上全國舞台！${an}，今天現場湧入了超過 ${c.crowd.toLocaleString()} 名觀眾，您怎麼看這場一戰定生死的對決？`);
      say(m, '球評', `是的，現場的氣氛非常震撼，這就是高校足球的魔力。${look}在這種高壓的舞台，誰能克服緊張、發揮出平時的判斷，將是開局的勝負手。`);
      const w = watch(); if (w) say(m, '球評', w);
    } else if (c.semi) {
      say(m, '主播', `距離全國大會只差兩步！歡迎來到${c.venue}，高校選手權青嵐地區預選準決賽，${h} 對 ${a}！`);
      say(m, '主播', `現場有 ${c.crowd.toLocaleString()} 名觀眾。贏的一方晉級決賽；輸的一方，三年級的冬天就在今天結束。`);
      say(m, '球評', look + watch());
    } else {
      say(m, '主播', `寒風吹過${c.venue}。歡迎收看第 ${c.wcEd} 屆全國高等學校足球選手權大會青嵐地區預選${c.roundName}，${h} 對 ${a}。`);
      say(m, '主播', '對大多數三年級選手來說，冬季選手權就是高中足球的最後舞台。這場比賽輸了，就是引退。');
      say(m, '球評', look);
    }
    if (m.rival) say(m, '主播', '而且這是宿敵之戰！在選手權遇上老對手，誰都不想把三年級的最後一場比賽輸給他們！');
    coachLine(m);
    say(m, '主播', c.final ? '主審鳴哨——決賽，開始！' : '主審鳴哨，比賽開始！', 'whistle');
  }
  // the line that follows a goal: equaliser, winner, comeback, breaking the deadlock
  function goalContext(m, side) {
    const [H, A] = m.sides, other = side === H ? A : H, g = side.goals, o = other.goals, t = side.t.short, min = m.min;
    const before = g - 1;
    if (min >= 85 && g === o) return `讀秒扳平！！！我的天啊！${m.ctx.venue}徹底沸騰了！${m.cup ? '比賽很可能要被拖進 PK 大戰！' : ''}`;
    if (min >= 85 && g === o + 1 && before === o) return `絕殺！！！就在最後時刻！${t} 很可能就靠這一球決定勝負！`;
    if (before < o && g > o) return `逆轉！！！${t} 把比分反超了！`;
    if (g + o === 1 && min >= 60) return `僵局終於被打破！苦戰了 ${min} 分鐘，${t} 先馳得點！`;
    if (g === o) return `${t} 扳平比分！比賽回到原點！`;
    if (g - o >= 3) return `比分差距拉開到 ${g - o} 球，這場比賽大局底定。`;
    return '';
  }
  function scoreLine(m) { const [H, A] = m.sides; return `${H.t.short} ${H.goals} 比 ${A.goals} ${A.t.short}`; }
  function announceGoal(m, side, scorer, ast, how) {
    const sp = S.players[scorer];
    const call = how === 'header' || how === 'cross' ? `頂進去了！！！${tagOf(m, side, scorer)} 頭球破門！`
      : how === 'fk' ? `進了！！！球繞過人牆，直掛死角！${sp.name} 的任意球！`
      : how === 'pk' ? `罰進了！！！${sp.name} 冷靜騙過門將！`
      : how === 'cutback' ? `進了！！！${tagOf(m, side, scorer)} 門前包抄得手！球直接撞進網窩！`
      : how === 'long' ? `進了！！！${sp.name} 一腳世界波！球從三十米外直接飛進球門！`
      : pick([`進了！！！球從門將胯下穿過去了！！！${tagOf(m, side, scorer)} 為 ${side.t.short} 破門！`, `進了！！！球網晃動！${tagOf(m, side, scorer)} 得分！`]);
    say(m, '主播', `${call}　${scoreLine(m)}`, 'goal');
    const ctx = goalContext(m, side);
    if (ctx) say(m, '主播', ctx, 'goal');
    if (m.mine && rnd() < 0.7) {
      const a = ast ? S.players[ast] : null;
      say(m, '球評', how === 'header' ? `${a ? a.name + ' 的角球落點完美，' : ''}${sp.name} 的起跳時機無可挑剔。`
        : how === 'cross' ? `${a ? a.name + ' 的傳中又快又準，' : ''}${sp.name} 起跳搶在後衛前面，這一頂就是差別。`
        : how === 'cutback' ? `${a ? a.name + ' 下底之後沒有急著傳，' : ''}${sp.name} 從後點殺到，時機完美。`
        : how === 'fk' || how === 'long' ? `這種球門將也沒辦法，${sp.name} 的腳法實在太漂亮了。`
        : how === 'pk' ? '十二碼前的心理戰，射手贏了。'
        : a ? pick([`這個進球太關鍵了。${a.name} 的觀察非常敏銳，而 ${sp.name} 在對方防守到位前做出了最果斷的判斷！`, `${a.name} 那一腳傳球就是教科書，${sp.name} 的跑位也恰到好處。`, `漂亮的配合！${a.name} 和 ${sp.name} 之間的默契，是三年一起練出來的。`])
        : `${sp.name} 的個人能力展現得淋漓盡致，這就是決定戰局氣勢的一擊！`);
    }
  }
  // build-up + shot + outcome for open-play chances
  // descriptive play for possessions that do not end in a shot
  const FLOW = {
    build: [
      '{t} 從後場慢慢組織，{p} 回傳給 {q}，尋找縱向傳球的空檔。',
      '{p} 在中圈附近轉身擺脫 {o}，一腳斜傳轉移到{s}路。',
      '{t} 連續短傳十幾腳，{o} 追著球跑了半天卻碰不到球。',
      '{p} 帶球推進到前場三十米，抬頭觀察——{q} 正在前插！',
      '{p} 和 {q} 在中路做了兩次撞牆配合，{t} 慢慢壓進對方半場。',
      '{p} 的分球打到{s}路空檔，{q} 接球後繼續往前推。',
      '{p} 在禁區弧頂附近拿球，被 {o} 貼身緊逼，只好回做給 {q}。',
      '{t} 的中場把節奏放慢，{p} 一邊控球一邊指揮隊友拉開站位。',
    ],
    wide: [
      '{p} 沿著{s}邊線狂奔，{o} 被甩開半個身位！',
      '{p} 在{s}路一對一面對 {o}，一個假動作——晃過去了！',
      '{t} 把球轉移到{s}路，{p} 帶球下底，傳中被 {o} 頂了出去。',
      '{p} 在{s}路和 {q} 打出二過一，突破到底線附近！',
      '{q} 套邊插上，{p} 把球送到他腳下，{t} 在{s}路形成人數優勢。',
      '{p} 在{s}路連續變向，{o} 死死跟住，不讓他轉身。',
    ],
    press: [
      '{t} 前場壓迫逼出失誤，{p} 搶下球權！',
      '{p} 積極上搶，{o} 被迫大腳解圍。',
      '{t} 三人合圍，把 {o} 困在邊線，球權易手！',
    ],
    counterWait: [
      '{t} 收縮在本方半場，等待對手犯錯。',
      '{t} 的防線退得很深，{p} 一直盯著前場的空檔。',
    ],
    stopped: [
      '{o} 一次漂亮的鏟斷，化解了 {t} 的攻勢。',
      '{o} 讀到了傳球路線，攔截成功！',
      '{p} 的直塞稍微大了一點，被門將 {g} 出擊沒收。',
      '{t} 的傳中太靠近門將，被 {g} 穩穩抱住。',
    ],
  };
  function attackFlow(m, as, ds, wing, flank, ending, cast) {
    const ch = wing ? (flank || pick(['L', 'R'])) : 'C';
    const p = (cast && cast.p) || zonePick(as, ch, ATT_W), q = (cast && cast.q) || zonePick(as, ch, ATT_W, [p]);
    const o = (cast && cast.o) || zonePick(ds, mirror(ch), DEF_W);
    const set = ending ? FLOW.stopped : as.style === '壓迫' && rnd() < 0.4 ? FLOW.press : as.style === '反擊' && rnd() < 0.4 ? FLOW.counterWait : wing ? FLOW.wide : FLOW.build;
    const s = wing ? laneWord(ch) : pick(['左', '右']);
    const tpl = pick(set);
    // name the team when the line would not say who is attacking
    const text = tpl.replace(/\{t\}/g, as.t.short).replace(/\{p\}/, tagOf(m, as, p, !tpl.includes('{t}'))).replace(/\{p\}/g, tagOf(m, as, p)).replace(/\{q\}/g, tagOf(m, as, q)).replace(/\{o\}/g, nm(o)).replace(/\{g\}/g, nm(gkOf(ds))).replace(/\{s\}/g, s);
    say(m, '主播', text, 'flow');
    return o;
  }
  function callChance(m, as, ds, shooter, passer, q, kind, head, ch) {
    // a lead-in describing how the move started, played in the same lane by the players involved
    if (rnd() < 0.45 && kind !== 'counter') attackFlow(m, as, ds, ch && ch !== 'C', ch, false, { p: passer || zonePick(as, ch, ATT_W, [shooter]), q: passer ? shooter : null });
    const p = tagOf(m, as, shooter), a = passer ? tagOf(m, as, passer, true) : '';
    const pt = tagOf(m, as, shooter, true);
    const sideWord = ch === 'L' || ch === 'R' ? laneWord(ch) : pick(['左', '右']);
    const d1 = nm(zonePick(ds, mirror(ch || 'C'), DEF_W)), d2 = nm(zonePick(ds, 'C', { GK: 0, DF: 3, MF: 0.8, FW: 0 }));
    let build;
    if (kind === 'counter') build = `${as.t.short} 在後場斷球！${passer ? tagOf(m, as, passer) : '後衛'} 直接起長傳——這是一記非常精準的長傳！找到了前場插上的 ${p}！`;
    else if (kind === 'cross' && passer) build = head ? pick([`${a} 從${sideWord}邊起球找頭——${p} 高高躍起！`, `${a} 在${sideWord}路傳出高球，${p} 在人群中起跳爭頂！`])
      : pick([`${a} 在${sideWord}路突破，下底倒三角——${p} 在門前包抄！`, `${a} 從${sideWord}邊傳出地面球，${p} 插上迎球！`]);
    else if (q === 2) build = passer ? pick([`${a} 一記直塞穿透 ${d1} 和 ${d2} 之間的空檔！${p} 形成單刀！`, `${a} 長傳找到前插的 ${p}！${S.players[shooter].name} 卸球！非常漂亮的停球！他晃過了 ${d2}！機會來了！`]) : pick([`${pt} 甩開 ${d1} 的貼防，偷襲身後成功！單刀面對門將！`, `${pt} 搶在 ${d2} 前面碰到球，直接殺向球門！`]);
    else if (q === 1) build = passer ? pick([`${a} 和 ${p} 打出撞牆配合，${d1} 被晃在身後，殺進禁區！`, `${a} 送出直塞，${p} 在禁區內拿球——${d2} 撲上來了！`]) : pick([`${pt} 晃過 ${d1}，再甩開 ${d2}，連過兩人殺進禁區！`, `${pt} 從${ch === 'C' ? '中路' : sideWord + '路'}強行突破 ${d1}，硬是擠進了禁區！`]);
    else build = pick([`${pt} 在禁區外拉開角度——`, `${pt} 在 ${d1} 面前稍微調整了一步——`]);
    say(m, '主播', build, 'chance');
    if (head) say(m, '主播', pick(['甩頭攻門！！！', '頭槌！！！', '魚躍衝頂！！！']), 'chance');
    else if (kind === 'cross' && passer) say(m, '主播', pick(['迎球推射！！！', '包抄搶射！！！', '凌空墊射！！！']), 'chance');
    else if (q >= 1 || kind === 'counter') say(m, '主播', pick(['起腳打門！！！', '打門！！！', '右腳抽射！！！', '左腳推射！！！']), 'chance');
    else say(m, '主播', pick(['一腳低射——', '起腳遠射——', '弧線球！——']), 'chance');
  }
  function callSave(m, ds, q, big) {
    const g = S.players[gkOf(ds)];
    say(m, '主播', big ? `球在空中劃出一道弧線！守門員 ${g.name} 飛身撲救——有沒有——？擋出來了！！！` : pick([`被 ${g.name} 穩穩沒收。`, `${g.name} 反應神速，單掌托出底線！`]), 'save');
  }
  function callMiss(m, ds, big, ch) {
    const blocker = nm(zonePick(ds, mirror(ch || 'C'), { GK: 0, DF: 3, MF: 1, FW: 0.1 }));
    say(m, '主播', big ? pick(['啊——！擦著立柱偏出！差一點點！', '打中橫樑彈出！！！運氣站在防守方這邊！']) : pick(['球打高了。', '可惜偏出。', `被 ${blocker} 拚死擋出！`]), 'miss');
  }
  function halfTime(m) {
    const [H, A] = m.sides, an = m.ctx.analyst;
    say(m, '主播', `上半場結束！${scoreLine(m)}。`, 'half');
    const ph = Math.round(H.poss / 9 * 100), dom = ph >= 50 ? H : A, pct = Math.max(ph, 100 - ph);
    const diff = H.goals - A.goals;
    const lead = diff === 0 ? '雙方都還沒找到破門的方法，下半場的換人會很關鍵。' : `${(diff > 0 ? A : H).t.short} 必須在下半場做出調整。`;
    say(m, '球評', `上半場 ${dom.t.short} 控球 ${pct}%，射門 ${H.shots} 比 ${A.shots}。${lead}${(H.style === '壓迫' || A.style === '壓迫') ? '打壓迫的一方下半場體力會是考驗。' : ''}`);
  }
  // the analyst reads the game: possession, shots, the lane where one side is on top, fatigue, style
  function analysis(m) {
    const [H, A] = m.sides, segs = Math.max(1, m.seg - 1);
    const ph = Math.round(H.poss / segs * 100), dom = ph >= 50 ? H : A, pct = Math.max(ph, 100 - ph);
    const rH = lineRatings(H), rA = lineRatings(A);
    const lanes = [];
    for (const [a, d, ra, rd] of [[H, A, rH, rA], [A, H, rA, rH]]) {
      lanes.push({ a, d, ch: 'C', v: ra.attC / rd.defC });
      lanes.push({ a, d, ch: 'L', v: ra.attL / rd.defR });
      lanes.push({ a, d, ch: 'R', v: ra.attR / rd.defL });
    }
    const best = lanes.sort((x, y) => y.v - x.v)[0];
    const tired = s => s.on.filter((id, i) => s.pos[i] !== 'GK' && S.players[id].cond < 60).length;
    const opts = [
      () => pct >= 56 ? `目前 ${dom.t.short} 控球 ${pct}%，比賽節奏完全掌握在他們手上。` : `兩隊控球大致五五波，誰能先在中場站穩，誰就能掌握主動。`,
      () => `射門數 ${H.shots} 比 ${A.shots}，${H.shots === A.shots ? '雙方都還在試探。' : `${(H.shots > A.shots ? H : A).t.short} 創造的機會比較多。`}`,
      () => best.v > 1.08 ? `我注意到 ${best.a.t.short} 的${laneWord(best.ch)}路${best.ch === 'C' ? '' : '進攻'}明顯壓過 ${best.d.t.short} 的${laneWord(mirror(best.ch))}路防守，可以多往這邊打。` : `兩隊各條線的實力很接近，要靠個人能力來打破平衡。`,
    ];
    if (m.seg >= 12) for (const s of m.sides) if (tired(s) >= 3) opts.push(() => `${s.t.short} 已經有 ${tired(s)} 名球員體力明顯下滑，${s.subs > 0 ? '換人的時機到了。' : '可惜換人名額已經用完。'}`);
    for (const s of m.sides) if (s.style === '壓迫') opts.push(() => `${s.t.short} 的高位壓迫很有效，但這種踢法非常耗體力，後段要注意。`);
    for (const s of m.sides) if (s.style === '反擊') opts.push(() => `${s.t.short} 把陣線收得很深，就等對手壓上來之後打身後。`);
    for (const s of m.sides) if (s.red) opts.push(() => `少一個人之後，${s.t.short} 的防守空間被拉得很開。`);
    say(m, '球評', pick(opts)());
  }
  function lateTension(m) {
    const [H, A] = m.sides, d = H.goals - A.goals;
    if (d === 0) say(m, '主播', `比賽來到第 ${m.min} 分鐘！雙方依然是 ${H.goals} 比 ${A.goals} 僵持！僵局會在哪裡被打破？${m.cup ? '再這樣下去就要進入 PK 大戰了！' : ''}`);
    else if (Math.abs(d) === 1) {
      const lead = d > 0 ? H : A, trail = d > 0 ? A : H;
      say(m, '主播', `只剩最後幾分鐘！${lead.t.short} 領先一球，${trail.t.short} 全力壓上！${m.cup ? `${trail.t.short} 的三年級們，還沒有放棄！` : ''}`);
    }
  }
  function nextRoundName(m) { return m.ctx.r + 1 < CUP_ROUNDS.length ? CUP_ROUNDS[m.ctx.r + 1] : ''; }
  function closing(m) {
    const [H, A] = m.sides, c = m.ctx;
    if (m.pk) say(m, '主播', `PK 大戰結束！${H.t.short} ${m.pk[0]} 比 ${m.pk[1]} ${A.t.short}！`, 'end');
    else {
      say(m, '主播', '（三聲長哨：嗶———— 嗶———— 嗶————！）', 'whistle');
      say(m, '主播', `比賽結束！全場比賽結束！${scoreLine(m)}！`, 'end');
    }
    const res = H.goals - A.goals || (m.pk ? m.pk[0] - m.pk[1] : 0);
    const W = res > 0 ? H : res < 0 ? A : null, L = W ? (W === H ? A : H) : null;
    let best = null, bv = 0; m.sides.forEach(s => s.used.forEach(id => { if ((s.ratings[id] || 0) > bv) { bv = s.ratings[id]; best = id; } }));
    const mvp = best && S.players[best];
    if (!c.cup) {
      if (W) say(m, '主播', `${W.t.short} 拿下寶貴的三分！${m.rival ? '宿敵戰的勝利，對士氣的意義不只三分。' : ''}`);
      else say(m, '主播', '雙方握手言和，各取一分。');
      if (mvp) say(m, '球評', `今天表現最好的是 ${mvp.name}，評分 ${bv.toFixed(1)}。`);
      return;
    }
    const compName = c.cup === 'ih' ? '夏季大會（Inter-High）青嵐地區預選' : '高校選手權青嵐地區預選';
    if (c.final) {
      say(m, '主播', `${W.t.short} 最終${m.pk ? '在 PK 大戰中' : `以 ${Math.max(H.goals, A.goals)} 比 ${Math.min(H.goals, A.goals)} `}擊敗 ${L.t.short}，奪得${compName}的冠軍！他們拿到了前往全國大會的門票！他們做到了！`);
      if (S.coach && W.t.id === S.me) say(m, '主播', `${W.t.short} 的球員們衝向場邊，把 ${S.coach} 教練高高拋向空中！一次、兩次、三次！`);
      say(m, '主播', `隨著終場哨聲響起，場上呈現了截然不同的兩幅畫面。${W.t.short} 的球員在草地上狂歡、流下喜悅的淚水；而 ${L.t.short} 的三年級隊員們則紛紛跪倒在草皮上，放聲大哭。${c.cup === 'wc' ? '他們的冬天、他們的高中足球生涯，在這一刻畫上了句點。' : '他們的夏天，在這一刻畫上了句點。'}`);
      say(m, '主播', `但是，現場 ${c.crowd.toLocaleString()} 名觀眾把最熱烈的掌聲送給了雙方。這不只是勝負，更是永不言棄的信仰。${L.t.short} 稍後將回到那間「最後的更衣室」，教練會為他們上最後一課，而這段經歷，將成為他們受用一生的寶物。`);
      if (mvp) say(m, '球評', `今天的最佳球員是 ${mvp.name}（評分 ${bv.toFixed(1)}）。但我想，場上每一位球員都值得被記住。`);
      say(m, '主播', `感謝兩支球隊為我們奉獻了這場燃盡青春的白熱化激戰。恭喜 ${W.t.short}！也向所有拚盡全力的球兒們致敬！感謝您的收看，我們${c.cup === 'wc' ? '明年選手權' : '冬天的選手權'}再見！`);
      return;
    }
    say(m, '主播', `${W.t.short} ${m.pk ? '在 PK 大戰中勝出，' : ''}晉級${nextRoundName(m)}！`);
    if (c.cup === 'wc') say(m, '主播', `而 ${L.t.short} 的三年級選手跪倒在草皮上……他們的冬天、他們的高中足球生涯，在這一刻畫上了句點。稍後他們將回到「最後的更衣室」，聽教練上最後一課。`);
    else say(m, '主播', `${L.t.short} 的夏天結束了。三年級們抹去淚水——他們還有冬天的選手權可以拚。`);
    if (mvp && m.mine) say(m, '球評', `今天表現最好的是 ${mvp.name}，評分 ${bv.toFixed(1)}。`);
  }
  function callShootout(m, rounds) {
    say(m, '主播', '九十分鐘戰成平手！比賽將以 PK 大戰決定勝負！兩隊球員手牽著手站在中圈……', 'half');
    rounds.forEach((r, i) => {
      const h = S.players[r.h], a = S.players[r.a];
      say(m, '主播', `第 ${i + 1} 輪：${m.sides[0].t.short} ${h ? h.name : ''} ${r.hs ? '罰進！' : '被撲出！！！'}　${m.sides[1].t.short} ${a ? a.name : ''} ${r.as == null ? '' : r.as ? '罰進！' : '被撲出！！！'}`, r.hs && (r.as ?? true) ? 'talk' : 'chance');
    });
  }
  function step(m, verbose = true) {
    if (m.done) return;
    m.seg++;
    // the clock never runs backwards; the second half restarts at 46
    m.cur = m.seg === 10 ? 45 : Math.max(m.cur || 0, (m.seg - 1) * 5);
    m.min = m.cur;
    if (m.seg === 17 && verbose && m.mine) { ev(m); lateTension(m); }
    if ([4, 7, 12, 15].includes(m.seg) && verbose && m.mine && rnd() < 0.8) { ev(m); analysis(m); }
    const [H, A] = m.sides;
    // fatigue (壓迫 burns much more stamina; players told to attack run a bit more)
    for (const s of m.sides) for (const id of s.on) { const p = S.players[id]; p.cond = Math.max(5, p.cond - (1.55 - p.a.sta / 100) * (s.style === '壓迫' ? 1.4 : 1) * ((s.t.inst || {})[id] === 'att' ? 1.08 : 1)); }
    H.behind = H.goals < A.goals; A.behind = A.goals < H.goals;
    const rH = lineRatings(H), rA = lineRatings(A);
    // which channel this phase is played in: 邊路 pulls play wide, 傳控 pulls it central
    const wideP = s => s.style === '邊路' ? 0.72 : s.style === '傳控' ? 0.28 : 0.5;
    const wing = rnd() < (wideP(H) + wideP(A)) / 2;
    const flank = rnd() < 0.5 ? 'L' : 'R', opp = flank === 'L' ? 'R' : 'L'; // H's left flank faces A's right flank
    const mH = wing ? rH['mid' + flank] : rH.midC, mA = wing ? rA['mid' + opp] : rA.midC;
    const pH = mH ** 3.5 / (mH ** 3.5 + mA ** 3.5);
    H.poss += pH; A.poss += 1 - pH;
    // passes: about 45 per five minutes, split by possession; style and passing quality change the volume and accuracy
    for (const [s, o, share] of [[H, A, pH], [A, H, 1 - pH]]) {
      const ids = s.on.filter((id, i) => s.pos[i] !== 'GK');
      const pq = ids.reduce((a, id) => a + S.players[id].a.pas * 0.6 + S.players[id].a.tec * 0.4, 0) / Math.max(1, ids.length);
      const vol = { '傳控': 1.2, '反擊': 0.8, '邊路': 0.95, '壓迫': 1, '均衡': 1 }[s.style] || 1;
      const n = Math.round(45 * share * vol * (0.85 + rnd() * 0.3));
      const acc = clamp(0.62 + (pq - 40) / 140 + share * 0.08 - (o.style === '壓迫' ? 0.05 : 0) + (s.style === '傳控' ? 0.02 : s.style === '反擊' ? -0.03 : 0), 0.55, 0.94);
      s.passes += n; s.passOk += Math.round(n * acc);
    }
    const atk = rnd() < pH ? 0 : 1, as = m.sides[atk], ds = m.sides[1 - atk], ra = atk ? rA : rH, rd = atk ? rH : rA;
    const af = atk === 0 ? flank : opp, df = af === 'L' ? 'R' : 'L';
    // offside: forwards running in behind get caught more often against a 壓迫 (high) line
    if (rnd() < 0.13 * (as.style === '反擊' ? 1.4 : 1) * (ds.style === '壓迫' ? 1.4 : 1)) {
      as.offsides++;
      const fw = as.on.filter((id, i) => as.pos[i] === 'FW');
      if (verbose && fw.length) { ev(m); line(m, 'flow', `${nm(pick(fw))} 越位在先，進攻被吹停。`); }
    }
    const ratio = (wing ? ra['att' + af] / rd['def' + df] : ra.attC / rd.defC);
    ev(m);
    let chanceP = 0.245 * ratio ** 2.2;
    if (as.style === '反擊') chanceP *= 0.6;
    if (as.style === '傳控') chanceP *= wing ? 0.8 : 1.1;
    if (as.style === '邊路') chanceP *= wing ? 1.1 : 0.8;
    if (H.style === '壓迫') chanceP *= 0.85;
    if (A.style === '壓迫') chanceP *= 0.85;
    chanceP = clamp(chanceP, 0.04, 0.62);
    let scored = false;
    const ch = wing ? af : 'C';
    if (rnd() < chanceP) {
      const qr = rnd() * ratio * (as.style === '壓迫' ? 1.15 : 1);
      scored = shoot(m, as, ds, rd, qr > 0.82 ? 2 : qr > 0.42 ? 1 : 0, wing ? 'cross' : null, verbose, ch);
    } else if (wing && rnd() < headerP(as, ds, af)) {
      scored = header(m, as, ds, rd, af, verbose);
    } else if (wing && rnd() < 0.3) {
      as.corners++;
      if (verbose) { const o = attackFlow(m, as, ds, true, af); say(m, '主播', `${pick([`被 ${nm(o)} 頂出底線，`, '傳中打在後衛身上出界，', ''])}${as.t.short} 獲得角球！`, 'flow'); }
    } else if (verbose && rnd() < 0.85) {
      // the attack is stopped: usually by a defender from the lane it was played in
      attackFlow(m, as, ds, wing, af);
      if (rnd() < 0.5) {
        const o = attackFlow(m, as, ds, wing, af, true);
        analyst(m, 0.18, () => pick([`${nm(o)} 的位置感很好，提前一步就讀到了這個傳球。`, `${ds.t.short} 的${laneWord(mirror(ch))}路防守很紮實，${as.t.short} 從這一側一直打不開局面。`, `${as.t.short} 這波進攻人數不夠，${nm(o)} 一個人就把它化解了。`, `這是很聰明的防守，${nm(o)} 沒有急著出腳，等對手自己把球帶出來。`]));
      }
    }
    // background volume: speculative long shots, everyday fouls (only the stats; cards are handled below)
    for (const [s, o, n] of [[as, ds, (rnd() < 0.6 ? 1 : 0) + (rnd() < 0.25 ? 1 : 0)], [ds, as, rnd() < 0.15 ? 1 : 0]]) {
      for (let k = 0; k < n; k++) {
        const sh = pickShooter(s), sp = S.players[sh], og = S.players[gkOf(o)];
        s.shots++;
        const on = rnd() < 0.3;
        if (on) s.sot++;
        const lg = on && rnd() < clamp(0.05 * (sp.a.sho / Math.max(30, og.a.gk)), 0.01, 0.1), told = verbose && rnd() < 0.3;
        if (lg || told) ev(m);
        if (lg) {
          s.goals++; sp.goals++; s.ratings[sh] = (s.ratings[sh] || 6) + 1.2; s.scorers.push({ min: m.min, id: sh, ast: null });
          if (verbose) say(m, '主播', `${tagOf(m, s, sh, true)} 在三十米外拿球……他要直接起腳嗎？——起腳打門！！！`, 'chance');
          announceGoal(m, s, sh, null, 'long');
        } else {
          if (rnd() < 0.25) s.corners++;
          if (told) say(m, '主播', on ? `${s.t.short} 的 ${sp.name} 遠射，被門將 ${og.name} 沒收。` : pick([`${s.t.short} 的 ${sp.name} 遠射，球偏離目標。`, `${s.t.short} 的 ${sp.name} 嘗試遠射，球飛上看台。`]), 'flow');
        }
      }
    }
    for (const s of m.sides) if (rnd() < 0.55 * (s.style === '壓迫' ? 1.3 : 1)) s.fouls++;
    // 反擊: when the attack fails, the defending side may break quickly
    if (!scored && ds.style === '反擊') {
      const pc = clamp(0.14 * (wavgSpeed(ds) / Math.max(20, wavgSpeed(as))) ** 1.5, 0.06, 0.28);
      if (rnd() < pc) ev(m), shoot(m, ds, as, ra, rnd() < 0.45 ? 2 : 1, 'counter', verbose, 'C');
    }
    // set pieces: corners and free kicks, decided by the taker's 定位球
    const pressH = H.style === '壓迫', pressA = A.style === '壓迫';
    if (rnd() < 0.2 * (pressH || pressA ? 1.25 : 1)) {
      const si = rnd() < clamp(pH - (pressH ? 0.12 : 0) + (pressA ? 0.12 : 0), 0.1, 0.9) ? 0 : 1, r = rnd();
      ev(m); setPiece(m, m.sides[si], m.sides[1 - si], r < 0.6 ? 'corner' : r < 0.92 ? 'fk' : 'pk', verbose, si === 0 ? rA : rH);
    }
    // fouls / cards: personality decides who fouls and how the referee reacts
    if (rnd() < 0.3 * (pressH || pressA ? 1.3 : 1)) {
      const s = m.sides[rnd() < (pressH ? 1.7 : 1) / ((pressH ? 1.7 : 1) + (pressA ? 1.7 : 1)) ? 0 : 1], cand = s.on.filter((id, i) => s.pos[i] !== 'GK');
      // a player already on a yellow holds back: far fewer fouls, and the ones he commits are less reckless
      const booked = id => (s.ycards || {})[id] > 0;
      const fid = wpick(cand, cand.map(id => (FOUL_W[S.players[id].trait] || 1) * (booked(id) ? 0.3 : 1)));
      const tr = S.players[fid].trait, careful = booked(fid) ? 0.5 : 1;
      s.fouls++;
      if (rnd() < 0.004 * (RED_MULT[tr] ?? 1) * careful) { ev(m); sendOff(m, s, fid, T.red[0]); }
      else if (rnd() < 0.55 * (CARD_MULT[tr] ?? 1) * careful) { ev(m); book(m, s, fid, pick(T.foul), verbose); }
    }
    for (const s of m.sides) {
      const other = m.sides[1 - m.sides.indexOf(s)];
      for (const id of s.on.slice()) {
        const p = S.players[id]; if (!s.on.includes(id)) continue;
        // 演員: dives to win a free kick or penalty, 10% of attempts end in a yellow card
        if (p.trait === '演員' && s.pos[s.on.indexOf(id)] !== 'GK' && rnd() < 0.03 * ((s.ycards || {})[id] ? 0.25 : 1) && ev(m)) {
          if (rnd() < 0.1) book(m, s, id, `${p.name} 假摔被裁判識破！`, true);
          else if (rnd() < 0.3) { const pkk = rnd() < 0.35; line(m, 'chance', `${p.name} 在${pkk ? '禁區內' : '禁區前'}倒地，裁判${pkk ? '判罰點球' : '判給任意球'}！`); setPiece(m, s, other, pkk ? 'pk' : 'fk', verbose, s === H ? rA : rH); }
          else if (verbose) line(m, 'flow', `${p.name} 倒地要求犯規，裁判示意比賽繼續。`);
        }
        // 情緒化: arguments with referee, teammates or opponents
        const onYellow = (s.ycards || {})[id] > 0;
        if (p.trait === '情緒化' && rnd() < 0.02 * (onYellow ? 0.4 : 1) && ev(m)) {
          const tgt = pick(['裁判', '隊友', '對手']);
          if (rnd() < (tgt === '隊友' ? 0.15 : 0.4) * (onYellow ? 0.3 : 1)) book(m, s, id, `${p.name} 和${tgt}激烈爭執，被出示黃牌！`, true);
          else if (verbose) line(m, 'flow', `${p.name} 和${tgt}起了口角。`);
        }
      }
    }
    for (const s of m.sides) {
      const injP = s.style === '壓迫' ? 0.012 : 0.008;
      if (rnd() < injP) {
        const id = wpick(s.on, s.on.map(x => INJ_MULT[S.players[x].trait] || 1)); const p = S.players[id];
        ev(m); p.inj = ri(1, 4) + (p.trait === '玻璃' ? 1 : 0);
        line(m, 'inj', fill(T.inj[0], { p: p.name }) + `（預估休養 ${p.inj} 週）`);
        s.injured = (s.injured || []).concat(id);
        if (s.t.id !== S.me || !verbose) autoSub(m, s, id, true);
        else s.needSub = id;
      }
    }
    // AI tactical subs
    for (const s of m.sides) if (s.t.id !== S.me || !verbose) aiManage(m, s);
    if (m.seg === 9) { m.min = Math.max(45, m.min); if (verbose && m.mine) halfTime(m); else line(m, 'half', `中場休息　${H.t.short} ${H.goals} : ${A.goals} ${A.t.short}`); }
    if (m.seg >= 18) finish(m);
  }
  function wavgSpeed(side) { const ids = side.on.filter((id, i) => side.pos[i] !== 'GK'); return ids.reduce((s, id) => s + S.players[id].a.spd, 0) / Math.max(1, ids.length); }
  // heading: strength (jumping) 50%, shooting 35%, speed 15%
  const headSkill = p => p.a.str * 0.5 + p.a.sho * 0.35 + p.a.spd * 0.15;
  const aerialDef = side => { const d = side.on.filter((id, i) => side.pos[i] === 'DF'), ids = d.length ? d : side.on.filter((id, i) => side.pos[i] !== 'GK');
    return ids.reduce((s, id) => s + S.players[id].a.def * 0.5 + S.players[id].a.str * 0.5, 0) / Math.max(1, ids.length); };
  const pickHeader = (side, not) => { const ids = side.on.filter((id, i) => id !== not && side.pos[i] !== 'GK');
    return wpick(ids, ids.map(id => ({ FW: 3, MF: 1.2, DF: 0.5 }[side.pos[side.on.indexOf(id)]] || 0.5) * (headSkill(S.players[id]) / 50) ** 2)); };
  // chance that a wide attack that produced nothing else still ends in a cross and a header
  function headerP(as, ds) {
    const fw = as.on.filter((id, i) => as.pos[i] !== 'GK').map(id => headSkill(S.players[id])).sort((a, b) => b - a).slice(0, 2);
    const air = fw.reduce((a, b) => a + b, 0) / Math.max(1, fw.length);
    const wq = as.on.filter((id, i) => as.pos[i] !== 'GK').map(id => S.players[id].a.wng).sort((a, b) => b - a)[0] || 40;
    return clamp(0.14 * (wq / 55) ** 0.8 * (air / Math.max(20, aerialDef(ds))) ** 1.5 * (as.style === '邊路' ? 1.2 : as.style === '傳控' ? 0.8 : 1), 0.04, 0.35);
  }
  function header(m, as, ds, rd, af, verbose) {
    const crosser = pickPasser(as, null, true), hid = pickHeader(as, crosser);
    if (!hid) return false;
    const c = S.players[crosser], h = S.players[hid];
    const hs = headSkill(h) * (0.75 + 0.25 * h.cond / 100) * (1 + (c.a.wng - 55) / 250);
    const pGoal = clamp(0.24 * hs / (hs + rd.gk) * (1 + (headSkill(h) - aerialDef(ds)) / 200), 0.03, 0.3);
    as.shots++; as.heads = (as.heads || 0) + 1;
    if (verbose) say(m, '主播', pick([`${tagOf(m, as, crosser, true)} 在${af === 'L' ? '左' : '右'}路起球找頭——${tagOf(m, as, hid)} 高高躍起！頭球攻門！`, `${tagOf(m, as, crosser, true)} 下底傳中，${tagOf(m, as, hid)} 在人群中搶點頭槌！`, `${tagOf(m, as, crosser, true)} 傳出弧線球，${tagOf(m, as, hid)} 甩頭攻門！`]), 'chance');
    const onT = rnd() < 0.42;
    if (onT && rnd() < pGoal / 0.42) {
      as.goals++; as.sot++; as.headGoals = (as.headGoals || 0) + 1;
      h.goals++; c.assists++;
      as.ratings[hid] = (as.ratings[hid] || 6) + 1.0; as.ratings[crosser] = (as.ratings[crosser] || 6) + 0.5;
      ds.ratings[gkOf(ds)] = (ds.ratings[gkOf(ds)] || 6) - 0.35;
      as.scorers.push({ min: m.min, id: hid, ast: crosser });
      announceGoal(m, as, hid, crosser, 'cross');
      return true;
    }
    if (onT) { as.sot++; ds.ratings[gkOf(ds)] = (ds.ratings[gkOf(ds)] || 6) + 0.3; if (verbose) callSave(m, ds, 1, false); if (rnd() < 0.4) as.corners++; }
    else if (verbose) say(m, '主播', pick(['球頂高了！', '頭球偏出立柱！', `被 ${S.players[pickHeader(ds) || gkOf(ds)].name} 搶先一步頂了出去。`, '頂偏了，球從橫樑上飛出底線。']), 'miss');
    return false;
  }
  function shoot(m, as, ds, rd, q, kind, verbose, ch) {
    const [H, A] = m.sides;
    const shooter = pickShooter(as, ch), passer = kind === 'counter' || rnd() < 0.7 ? pickPasser(as, shooter, kind === 'cross', ch) : null;
    const base = [0.17, 0.38, 0.58][q] * (kind === 'counter' ? 1.15 : 1);
    const sp = S.players[shooter], g = S.players[gkOf(ds)];
    const sk = (kind === 'cross' ? sp.a.sho * 0.6 + sp.a.str * 0.4 : sp.a.sho) * (0.75 + 0.25 * sp.cond / 100);
    const pGoal = clamp(base * 2 * sk / (sk + rd.gk), 0.03, 0.8);
    const tpl = kind === 'counter' ? T.counter : kind === 'cross' && passer && q > 0 ? T.cross : q === 2 ? T.chance1v1 : q === 1 ? T.chanceGood : T.chanceHalf;
    // a cross is met either with the head or, for low balls and cut-backs, with the foot
    const isHead = !!(kind === 'cross' && passer && rnd() < 0.4);
    if (verbose) callChance(m, as, ds, shooter, passer, q, kind, isHead, ch);
    as.shots++;
    if (isHead) as.heads = (as.heads || 0) + 1;
    const onT = rnd() < 0.45 + q * 0.15;
    if (onT && rnd() < pGoal / (0.45 + q * 0.15)) {
      as.goals++; as.sot++; if (isHead) as.headGoals = (as.headGoals || 0) + 1;
      sp.goals++; if (passer) S.players[passer].assists++;
      as.ratings[shooter] = (as.ratings[shooter] || 6) + 1.0;
      if (passer) as.ratings[passer] = (as.ratings[passer] || 6) + 0.5;
      ds.ratings[gkOf(ds)] = (ds.ratings[gkOf(ds)] || 6) - 0.35;
      as.scorers.push({ min: m.min, id: shooter, ast: passer });
      announceGoal(m, as, shooter, passer, isHead ? 'cross' : kind === 'cross' && passer ? 'cutback' : null);
      return true;
    }
    if (onT) {
      as.sot++;
      ds.ratings[gkOf(ds)] = (ds.ratings[gkOf(ds)] || 6) + 0.3;
      if (verbose) {
        callSave(m, ds, q, q >= 1 || kind === 'counter');
        analyst(m, q >= 1 ? 0.4 : 0.15, () => pick([`${g.name} 這次撲救非常關鍵，站位和反應都無可挑剔。`, `${sp.name} 的射門其實已經很刁了，只能說 ${g.name} 今天狀態太好。`, `${g.name} 出擊的時機抓得很準，把 ${sp.name} 的射門角度封得很小。`, `${ds.t.short} 要感謝門將，不然這球就丟了。`]));
      }
      if (rnd() < 0.4) as.corners++;
    } else if (verbose) {
      callMiss(m, ds, q >= 1 || kind === 'counter', ch);
      if (q >= 1 || kind === 'counter') analyst(m, 0.45, () => pick([`這球 ${sp.name} 應該要處理得更好，這種機會不會一直有。`, passer ? `可惜了 ${nm(passer)} 那一腳傳球，已經把機會送到 ${sp.name} 腳下了。` : `${sp.name} 前面做得很好，就差最後那一下。`, `${sp.name} 有點太急了，其實還有時間再調整一步。`, `角度不算大，但 ${sp.name} 選擇直接打門也不算錯，只是運氣差了一點。`]));
    }
    return false;
  }
  function setPiece(m, sp, sd, kind, verbose, rdef) {
    const [H, A] = m.sides;
    const field = sp.on.filter((id, i) => sp.pos[i] !== 'GK');
    if (field.length < 2) return;

    const taker = pickTaker(sp, kind);
    const tk = S.players[taker], g = S.players[gkOf(sd)];
    let scorer = taker, ast = null, pG;
    if (kind === 'corner') {
      const heads = field.filter(id => id !== taker);
      scorer = wpick(heads, heads.map(id => (headSkill(S.players[id]) / 50) ** 2));
      ast = taker; sp.corners++; sp.heads = (sp.heads || 0) + 1;
      pG = clamp(0.13 + (tk.a.men - 50) / 300 + (headSkill(S.players[scorer]) - aerialDef(sd)) / 600, 0.03, 0.28);
    } else if (kind === 'fk') pG = clamp(0.12 + (tk.a.men - g.a.gk) / 260, 0.03, 0.25);
    else pG = clamp(0.74 + (tk.a.men + tk.a.sho - 2 * g.a.gk) / 400, 0.55, 0.9);
    sp.shots++;
    if (kind === 'pk' || verbose) say(m, '主播', kind === 'corner' ? `${sp.t.short} 的角球！${tk.name} 把球送向後點——${tagOf(m, sp, scorer)} 高高躍起頭槌轟門！！！` : kind === 'fk' ? `${sp.t.short} 在禁區前沿獲得任意球。${tagOf(m, sp, taker)} 站到球前……起腳！！！` : `裁判指向罰球點！${sp.t.short} 獲得點球！${tagOf(m, sp, taker)} 站上十二碼……全場屏息……`, kind === 'pk' ? 'card' : 'chance');
    if (rnd() < pG) {
      sp.goals++; sp.sot++; if (kind === 'corner') sp.headGoals = (sp.headGoals || 0) + 1;
      S.players[scorer].goals++; if (ast) S.players[ast].assists++;
      sp.ratings[scorer] = (sp.ratings[scorer] || 6) + (kind === 'pk' ? 0.6 : 1.0);
      if (ast) sp.ratings[ast] = (sp.ratings[ast] || 6) + 0.5;
      sp.scorers.push({ min: m.min, id: scorer, ast });
      announceGoal(m, sp, scorer, ast, kind === 'corner' ? 'header' : kind);
    } else {
      if (kind !== 'corner' && rnd() < 0.6) sp.sot++;
      if (kind === 'pk') { sd.ratings[gkOf(sd)] = (sd.ratings[gkOf(sd)] || 6) + 0.8; sp.ratings[taker] = (sp.ratings[taker] || 6) - 0.6; }
      if (kind === 'pk' || verbose) say(m, '主播', kind === 'pk' ? pick([`被 ${g.name} 撲出來了！！！點球沒進！`, `${tk.name} 的點球打中門柱彈出！！！`]) : kind === 'corner' ? pick(['球頂高了！', `被 ${g.name} 沒收。`, '防守方解圍。']) : pick(['球稍稍高出橫樑！', `${g.name} 飛身把球撲出！`, '打在人牆上彈出。']), 'miss');
    }
  }
  function book(m, s, id, text, show) {
    s.yc++; s.ycards = s.ycards || {};
    s.ycards[id] = (s.ycards[id] || 0) + 1;
    s.ratings[id] = (s.ratings[id] || 6) - 0.3;
    s.cards.push({ min: m.min, id, type: s.ycards[id] >= 2 ? 'y2' : 'y' });
    if (s.ycards[id] >= 2) return sendOff(m, s, id, '{p} 累積兩張黃牌，被罰下場！{t} 少一人作戰！', true);
    if (show) {
      line(m, 'card', fill(text, { p: nm(id) }));
      analyst(m, 0.4, () => pick([`這張黃牌之後，${nm(id)} 接下來的防守就要收著點了。`, `裁判的尺度很一致，這腳確實犯規在先。`, `${nm(id)} 背了黃牌，${s.t.short} 的教練可能要考慮換人了。`, `這個犯規是戰術性的，阻止了對手的反擊，黃牌算是代價。`]));
    }
  }
  function sendOff(m, s, id, text, second) {
    const i = s.on.indexOf(id); if (i < 0) return;
    if (!second) s.cards.push({ min: m.min, id, type: 'r' });
    s.on.splice(i, 1); s.pos.splice(i, 1); if (s.sides) s.sides.splice(i, 1); s.red++;
    S.players[id].susp = 2; s.ratings[id] = (s.ratings[id] || 6) - 1.5;
    if (s.needSub === id) s.needSub = null;
    line(m, 'red', fill(text, { p: nm(id), t: s.t.short }));
  }
  function doSub(m, s, outId, inId) {
    const i = s.on.indexOf(outId);
    if (i < 0 || s.subs <= 0 || !s.bench.includes(inId)) return false;
    s.on[i] = inId; s.bench = s.bench.filter(x => x !== inId); s.subs--; s.used.add(inId);
    s.subsLog.push({ min: m.min, in: inId, out: outId });
    s.ratings[inId] = s.ratings[inId] || 6;
    if (s.needSub === outId) s.needSub = null;
    line(m, 'sub', `${s.t.short} 換人：${nm(inId)} 上，${nm(outId)} 下。`);
    return true;
  }
  function autoSub(m, s, outId) {
    const i = s.on.indexOf(outId); if (i < 0) return;
    const pos = s.pos[i];
    const cand = s.bench.map(id => S.players[id]).sort((a, b) => posRating(b, pos) - posRating(a, pos))[0];
    if (cand && s.subs > 0) doSub(m, s, outId, cand.id);
  }
  // AI coaches: plan 2–4 changes, usually from the hour mark, sometimes at half-time; take off the most tired,
  // a booked player, or the weakest performer; chasing a game brings on a forward, protecting a lead a defender
  function aiManage(m, s) {
    if (s.subs <= 0 || !s.bench.length) return;
    if (!s.aiPlan) { const k = ri(2, 4), slots = shuffle([10, 12, 13, 14, 14, 15, 15, 16, 16, 17]).slice(0, k); s.aiPlan = slots; }
    const due = s.aiPlan.filter(x => x === m.seg).length;
    if (!due) return;
    const other = m.sides[1 - m.sides.indexOf(s)], diff = s.goals - other.goals;
    const field = s.on.filter((id, i) => s.pos[i] !== 'GK');
    let done = 0;
    for (let k = 0; k < due && s.subs > 0 && s.bench.length; k++) {
      const score = id => { const p = S.players[id], r = s.ratings[id] || 6; return (100 - p.cond) * 1.2 + ((s.ycards || {})[id] ? 18 : 0) + (6.5 - r) * 12 + rnd() * 10; };
      const outId = field.filter(id => s.on.includes(id)).sort((a, b) => score(b) - score(a))[0];
      if (!outId) break;
      const i = s.on.indexOf(outId), pos = s.pos[i], p = S.players[outId];
      // chasing: an attacker for a midfielder; protecting a lead late: a defender
      let want = pos;
      if (diff < 0 && m.seg >= 13 && pos === 'MF' && s.bench.some(id => S.players[id].pos === 'FW')) want = 'FW';
      if (diff > 0 && m.seg >= 15 && pos !== 'DF' && s.bench.some(id => S.players[id].pos === 'DF')) want = 'DF';
      const cand = s.bench.map(id => S.players[id]).sort((a, b) => (b.pos === want) - (a.pos === want) || posRating(b, pos) - posRating(a, pos))[0];
      if (!cand) break;
      if (!done) ev(m);
      const reason = (s.ycards || {})[outId] ? 'card' : p.cond < 70 ? 'tired' : want !== pos ? (diff < 0 ? 'chase' : 'protect') : 'form';
      if (doSub(m, s, outId, cand.id)) {
        done++;
        analyst(m, 0.55, () => ({
          card: `${p.name} 背著黃牌，${s.t.short} 的教練不想冒險，先把他換下來。`,
          tired: `${p.name} 的體力已經見底了，換上 ${cand.name} 是很合理的調整。`,
          chase: `${s.t.short} 換上前鋒 ${cand.name}，看得出來他們要全力搶分了。`,
          protect: `換上後衛 ${cand.name}，${s.t.short} 想要守住這個領先。`,
          form: `${p.name} 今天的表現不太理想，${s.t.short} 換上 ${cand.name} 來改變一下節奏。`,
        })[reason]);
      }
    }
  }
  function finish(m) {
    const [H, A] = m.sides;
    m.min = Math.max(90, m.min);
    const tie = m.cup && H.goals === A.goals;
    if (tie) {
      if (m.mine) { say(m, '主播', '（長哨響起）九十分鐘結束！', 'whistle'); say(m, '主播', `${scoreLine(m)}，平手！`, 'end'); }
      const kick = s => { const ids = s.on.slice().sort((a, b) => (S.players[b].a.sho + S.players[b].a.men) - (S.players[a].a.sho + S.players[a].a.men)); const d = s.t.sp && s.t.sp.pk; if (mine(s.t, d) && ids.includes(d)) { ids.splice(ids.indexOf(d), 1); ids.unshift(d); } return ids; };
      const kh = kick(H), ka = kick(A); let sh = 0, sa = 0, i = 0;
      const gH = S.players[gkOf(H)], gA = S.players[gkOf(A)], rounds = [];
      const shot = (id, g) => { const p = S.players[id]; return rnd() < clamp(0.74 + (p.a.sho + p.a.men - 2 * g.a.gk) / 300, .5, .92); };
      while (i < 5 || sh === sa) {
        const r = { h: kh[i % kh.length], a: ka[i % ka.length] };
        r.hs = shot(r.h, gA); if (r.hs) sh++;
        // stop early when the away side can no longer catch up
        // stop as soon as one side can no longer be caught
        if (i < 5 && (sh > sa + (5 - i) || sa > sh + (4 - i))) { r.as = null; rounds.push(r); break; }
        r.as = shot(r.a, gH); if (r.as) sa++;
        rounds.push(r); i++;
        if (i > 30) break;
        if (i < 5 && (sh > sa + (5 - i) || sa > sh + (5 - i))) break;
      }
      m.pk = [sh, sa];
      if (m.mine) callShootout(m, rounds);
    }
    if (m.mine) closing(m);
    else line(m, 'end', `全場比賽結束！${H.t.short} ${H.goals} : ${A.goals} ${A.t.short}${m.pk ? `（PK ${m.pk[0]}:${m.pk[1]}）` : ''}`);
    m.done = true;
  }
  function playQuick(fx) { const m = createMatch(fx); while (!m.done) step(m, false); applyResult(m); return m; }

  function applyResult(m) {
    const [H, A] = m.sides, fx = m.fx;
    fx.hs = H.goals; fx.as = A.goals; if (m.pk) fx.pk = m.pk;
    const res = H.goals > A.goals ? 1 : H.goals < A.goals ? -1 : (m.pk ? (m.pk[0] > m.pk[1] ? 1 : -1) : 0);
    // ratings & player stats
    m.sides.forEach((s, si) => {
      const r = si === 0 ? res : -res;
      const ga = si === 0 ? A.goals : H.goals;
      for (const id of s.used) {
        const p = S.players[id]; if (!p) continue;
        p.apps++;
        let rt = (s.ratings[id] || 6) + r * 0.4 + gauss() * 0.45;
        if (s.pos[s.on.indexOf(id)] === 'DF' && ga === 0) rt += 0.4;
        rt = clamp(rt, 4, 10); s.ratings[id] = rt;
        p.rSum += rt; p.rN++;
        if (r > 0 && m.rival && rnd() < 0.3) bumpForm(p, 1);
        if (rt >= 7.6 && rnd() < 0.45) p.form = Math.min(4, formOf(p) + 1);
        if (rt <= 5.4 && rnd() < 0.45) p.form = Math.max(0, formOf(p) - 1);
        if (s.t.id === S.me) grow(p, 'match');
      }
      // fatigue persists on squad
    });
    if (!m.cup) {
      const th = S.table[H.t.id], ta = S.table[A.t.id];
      th.p++; ta.p++; th.gf += H.goals; th.ga += A.goals; ta.gf += A.goals; ta.ga += H.goals;
      if (res > 0) { th.w++; th.pts += 3; ta.l++; th.form.push('W'); ta.form.push('L'); }
      else if (res < 0) { ta.w++; ta.pts += 3; th.l++; th.form.push('L'); ta.form.push('W'); }
      else { th.d++; ta.d++; th.pts++; ta.pts++; th.form.push('D'); ta.form.push('D'); }
    } else {
      const cm = S.cups[fx.cup].rounds[fx.cupRound][fx.idx];
      cm.hs = H.goals; cm.as = A.goals; cm.pk = m.pk; cm.w = res > 0 ? H.t.id : A.t.id;
    }
    // MVP
    let best = null, bv = 0; m.sides.forEach(s => s.used.forEach(id => { if (s.ratings[id] > bv) { bv = s.ratings[id]; best = id; } }));
    m.mvp = best;
    if (H.t.id === S.me || A.t.id === S.me) {
      const mine = H.t.id === S.me ? H : A, other = mine === H ? A : H;
      const r = mine === H ? res : -res;
      S.results.push({ week: S.week, comp: fx.comp, round: m.cup ? CUP_ROUNDS[fx.cupRound] : '第 ' + fx.round + ' 輪', opp: other.t.id, home: mine === H, gf: mine.goals, ga: other.goals, pk: m.pk ? (mine === H ? m.pk : [m.pk[1], m.pk[0]]) : null, r });
      log(`${fx.comp}${m.cup ? ' ' + CUP_ROUNDS[fx.cupRound] : ''}：${H.t.short} ${H.goals}:${A.goals} ${A.t.short}${m.pk ? `（PK ${m.pk[0]}:${m.pk[1]}）` : ''}　${r > 0 ? '勝' : r < 0 ? '敗' : '和'}`, r > 0 ? 'good' : r < 0 ? 'bad' : '');
    }
  }

  // ---------- growth & training ----------
  function growthMult(p, t) {
    const gap = p.pa - caOf(p);
    let g = clamp(gap / 14, 0.04, 1.5) * [0, 1.2, 1.0, 0.8][p.grade] * (0.7 + t.fac / 220);
    g *= TRAIN_EFF[p.trait] || 1;
    if (p.trait === '天才') g *= 1.1; if (p.trait === '駑鈍') g *= 0.9;
    if (p.flags && p.flags.lessTraining) g *= 0.7;
    return g;
  }
  function grow(p, kind, attrs, amount) {
    const t = S.teams[p.team], g = growthMult(p, t);
    const before = caOf(p);
    if (kind === 'match') { for (const k of ATTRS) if (hasAttr(p, k)) p.a[k] = clamp(p.a[k] + 0.05 * g, 1, 99); }
    else for (let k of attrs) {
      if (p.pos === 'GK' && k === 'wng') k = 'gk';
      if (p.pos !== 'GK' && k === 'gk') continue;
      let x = amount * g;
      p.a[k] = clamp(p.a[k] + x, 1, 99);
    }
    return caOf(p) - before;
  }
  function updateForm(p) {
    const f = formOf(p);
    const swing = 0.32;
    if (rnd() < swing) {
      const up = clamp(0.5 + (2 - f) * 0.12, 0.1, 0.9);
      p.form = clamp(f + (rnd() < up ? 1 : -1), 0, 4);
    } else p.form = f;
  }
  function weekTraining() {
    const t = S.teams[S.me], plan = t.train, inj = [];
    for (const p of squad(t)) {
      p.cond = Math.min(100, p.cond + 16);
      if (p.inj > 0) { p.inj--; p.cond = Math.min(100, p.cond + 6); updateForm(p); continue; }
      const before = caOf(p);
      for (const menu of plan) {
        const M = MENUS[menu];
        const amt = M.small ? 0.018 : 0.06;
        if (M.attrs.length) grow(p, 'train', M.attrs, amt);
        p.cond = clamp(p.cond + M.cond, 5, 100);
        if (M.formUp && rnd() < M.formUp) bumpForm(p, 1);
        if (M.inj && rnd() < M.inj * (p.cond < 40 ? 2.5 : 1) * (INJ_MULT[p.trait] || 1)) { p.inj = ri(1, 3); inj.push(p); }
      }
      p.lastGain = caOf(p) - before;
      updateForm(p);
    }
    if (inj.length) log(`訓練中受傷：${inj.map(p => p.name).join('、')}`, 'bad');
    const sumGain = squad(t).reduce((s, p) => s + (p.lastGain || 0), 0);
    S.growth.push(+sumGain.toFixed(2));
  }
  function aiWeek() {
    for (const t of S.teams) {
      if (t.id === S.me) continue;
      for (const p of squad(t)) {
        p.cond = Math.min(100, p.cond + 22);
        if (p.inj > 0) p.inj--;
        updateForm(p);
        const g = growthMult(p, t);
        for (const k of ATTRS) if (hasAttr(p, k)) p.a[k] = clamp(p.a[k] + 0.06 * g, 1, 99);
      }
    }
  }
  function tickSuspensions(teamIds) {
    for (const id of teamIds) for (const p of squad(S.teams[id])) if (p.susp > 0) p.susp--;
  }

  // ---------- recruitment ----------
  // scouting happens in the first week of each month: 4 points, unused points do not carry over
  const SCOUT_PTS = 4;
  const firstWeekOfMonth = w => w === 1 || monthOf(w) !== monthOf(w - 1);
  const nextScoutWeek = w => { for (let x = w + 1; x <= SEASON_LEN; x++) if (firstWeekOfMonth(x)) return x; return null; };
  function scoutPerWeek() { return firstWeekOfMonth(S.week) ? SCOUT_PTS : 0; }
  function newProspects() {
    S.prospects = [];
    const pos = ['GK', 'GK', 'GK', 'GK', ...Array(12).fill('DF'), ...Array(14).fill('MF'), ...Array(12).fill('FW')];
    const me = S.teams[S.me];
    for (const ps of pos) {
      const base = 37 + ri(0, 16) + (rnd() < 0.12 ? 8 : 0);
      const p = genPlayer(ps, 1, base, { paBonus: ri(0, 12) });
      delete S.players[p.id];
      p.grade = 0; p.from = pick(JHS); p.know = rnd() < 0.35 ? 1 : 0; p.interest = clamp(Math.round(me.rep * 0.35 + ri(5, 30)), 5, 80);
      p.offer = false; p.schol = 0; p.visitedWeek = -1;
      S.prospects.push(p);
    }
  }
  function scout(id, action) {
    const p = S.prospects.find(x => x.id === id); if (!p || S.week > RECRUIT_DEADLINE) return '招生季已結束。';
    if (action === 'watch') {
      if (p.know >= 3) return '已經完全掌握這位球員。';
      if (!firstWeekOfMonth(S.week)) return '球探只在每個月的第一週出動。';
      if (S.scoutPts < 1) return '這個月的球探點數用完了。';
      S.scoutPts -= 1; p.know++; return `觀察 ${p.name}：報告更新。`;
    }
    if (action === 'visit') {
      if (!firstWeekOfMonth(S.week)) return '球探只在每個月的第一週出動。';
      if (S.scoutPts < 2) return '親訪需要 2 點球探點數。';
      if (p.visitedWeek === S.week) return '本週已經拜訪過他了。';
      S.scoutPts -= 2; p.visitedWeek = S.week; p.interest = clamp(p.interest + ri(14, 24), 0, 100);
      if (p.know < 1) p.know = 1;
      return `親自拜訪 ${p.name}，他對我們的興趣提高了。`;
    }
    return '';
  }
  function setOffer(id, on, schol) {
    const p = S.prospects.find(x => x.id === id); const me = S.teams[S.me];
    if (!p) return '';
    const cnt = S.prospects.filter(x => x.offer && x.id !== id).length;
    if (on && cnt >= TYPES[me.type].slots) return `推薦名額已滿（${TYPES[me.type].slots} 名）。`;
    p.offer = on; p.schol = on ? schol : 0;
    return on ? `已向 ${p.name} 提出入學邀請${schol ? `（獎學金 ${schol === 2 ? '全額' : '半額'}）` : ''}。` : `撤回對 ${p.name} 的邀請。`;
  }
  const scholCost = s => s === 2 ? 60 : s === 1 ? 30 : 0;
  function resolveRecruiting() {
    const me = S.teams[S.me];
    const signed = [], lost = [];
    const ais = S.teams.filter(t => t.id !== S.me);
    S.aiSigned = {};
    const sorted = S.prospects.slice().sort((a, b) => caOf(b) - caOf(a));
    for (const p of sorted) {
      const suitors = shuffle(ais.slice()).slice(0, 3).sort((a, b) => b.rep - a.rep);
      const aiBest = suitors.map(t => ({ t, s: t.rep * 0.45 + 28 + (t.type === 'private' ? 10 : 0) + rnd() * 18 })).sort((a, b) => b.s - a.s)[0];
      if (p.offer) {
        const mine = me.rep * 0.45 + p.interest * 0.6 + p.schol * 13 + rnd() * 18;
        if (mine >= aiBest.s && me.budget >= scholCost(p.schol)) { me.budget -= scholCost(p.schol); signed.push(p); continue; }
        lost.push({ p, to: aiBest.t });
      }
      const open = suitors.map(t => t).sort((a, b) => b.rep - a.rep).find(t => ((S.aiSigned[t.id] || []).length < GRADE_MAX));
      const dest = (S.aiSigned[aiBest.t.id] || []).length < GRADE_MAX ? aiBest.t : open;
      if (dest) (S.aiSigned[dest.id] = S.aiSigned[dest.id] || []).push(p);
    }
    S.signed = signed; S.recruitSeen = false;
    return { signed, lost };
  }

  // ---------- events ----------
  function maybeEvent() {
    const w = S.week, me = S.teams[S.me], sq = squad(me);
    if (w === 3 && !S.flags.principalAsked) {
      S.flags.principalAsked = true;
      return { id: 'principal', title: '校長的期望', text: '校長把你叫進辦公室：「今年冬天的高校選手權，能不能至少打進四強？達成的話，明年體育預算加碼。」', choices: [{ k: 'yes', label: '接下目標', hint: '打進四強：預算 +150 萬；失敗：名聲 −5' }, { k: 'no', label: '委婉推辭', hint: '不會有影響' }] };
    }
    if (w === 22 && !S.flags.festival) {
      S.flags.festival = true;
      return { id: 'festival', title: '文化祭', text: '下週是校慶文化祭，球員們想去班上的攤位幫忙。', choices: [{ k: 'yes', label: '全隊放假一天', hint: '體力 +10、部分球員狀態上升' }, { k: 'no', label: '照常訓練', hint: '部分球員狀態下滑' }] };
    }
    if (rnd() > 0.3) return null;
    const pool = [];
    const mfs = sq.filter(p => p.pos !== 'GK' && p.grade >= 2 && available(p));
    if (mfs.length >= 2) pool.push('conflict');
    const pro = sq.filter(p => p.grade === 3 && caOf(p) >= 62 && !(p.flags && p.flags.proScouted));
    if (pro.length) pool.push('pro');
    const playful = sq.filter(p => p.trait === '散漫');
    if (playful.length) pool.push('skip');
    pool.push('pain', 'mentor', 'slump');
    const k = pick(pool);
    if (k === 'conflict') {
      const hot = mfs.filter(p => p.trait === '情緒化' || p.trait === '侵略');
      const a = hot.length ? pick(hot) : pick(mfs), b = pick(mfs.filter(p => p !== a));
      return { id: k, title: '隊內衝突', text: `${a.name}（${a.pos}）和 ${b.name}（${b.pos}）為了上場時間在更衣室吵了起來。`, data: { a: a.id, b: b.id }, choices: [{ k: 'talk', label: '分別私下談話', hint: '化解衝突，不影響狀態' }, { k: 'rotate', label: '公開宣布輪替', hint: '能力較低者狀態下降一級' }, { k: 'ignore', label: '不介入', hint: '兩人各有一半機率狀態下降' }] };
    }
    if (k === 'pro') {
      const p = pick(pro);
      return { id: k, title: '職業隊球探來訪', text: `職業球隊的球探想看看高三的 ${p.name}，問你願不願意幫忙推薦。`, data: { p: p.id }, choices: [{ k: 'yes', label: '大力推薦', hint: '球員狀態上升一級、學校名聲 +2' }, { k: 'no', label: '希望他先專心比賽', hint: '球員狀態下降一級' }] };
    }
    if (k === 'skip') {
      const p = pick(playful);
      return { id: k, title: '翹掉練習', text: `${p.name} 又沒來練球，有人看到他在電玩店。`, data: { p: p.id }, choices: [{ k: 'strict', label: '嚴厲處分', hint: '狀態回升一級' }, { k: 'soft', label: '找他聊聊', hint: '一半機率他會改過（失去「愛玩」）' }] };
    }
    if (k === 'pain') {
      const p = pick(sq.filter(available).length ? sq.filter(available) : sq);
      return { id: k, title: '隱隱作痛', text: `${p.name} 說大腿後側有點緊，但想繼續練。`, data: { p: p.id }, choices: [{ k: 'rest', label: '休息一週', hint: '缺陣 1 週' }, { k: 'go', label: '讓他繼續', hint: '四成機率拉傷，休養 4 週' }] };
    }
    if (k === 'slump') {
      const cand = sq.filter(p => formOf(p) <= 1 && available(p));
      if (!cand.length) return null;
      const p = pick(cand);
      return { id: k, title: '陷入低潮', text: `${p.name} 最近狀態${FORM_LV[formOf(p)]}，練球時心不在焉。`, data: { p: p.id }, choices: [{ k: 'talk', label: '單獨談心', hint: '七成機率狀態回升一級' }, { k: 'bench', label: '先放板凳讓他沉澱', hint: '狀態回到一般' }] };
    }
    const seniors = sq.filter(p => p.grade === 3), juniors = sq.filter(p => p.grade === 1);
    if (!seniors.length || !juniors.length) return null;
    const s = pick(seniors), j = pick(juniors);
    return { id: 'mentor', title: '學長帶學弟', text: `高三的 ${s.name} 主動留下來，教高一的 ${j.name} 練基本功。`, data: { s: s.id, j: j.id }, choices: [{ k: 'ok', label: '好好鼓勵他們', hint: `${j.name} 的${ATTR_LABEL[CA_W[j.pos] ? Object.keys(CA_W[j.pos])[0] : 'tec']}提升` }] };
  }
  function resolveEvent(choice) {
    const e = S.event; if (!e) return '';
    if (e.data && Object.values(e.data).some(v => typeof v === 'string' && v[0] === 'p' && !S.players[v])) { S.event = null; return ''; }
    const P = id => S.players[id], me = S.teams[S.me];
    let msg = '';
    switch (e.id) {
      case 'principal': S.flags.principal = choice === 'yes'; msg = choice === 'yes' ? '目標：高校選手權四強。' : '校長點點頭，沒有多說什麼。'; break;
      case 'festival':
        if (choice === 'yes') { squad(me).forEach(p => { p.cond = Math.min(100, p.cond + 10); if (rnd() < 0.3) p.form = Math.min(4, formOf(p) + 1); }); msg = '文化祭玩得很開心，大家精神都好了起來。'; }
        else { squad(me).forEach(p => { if (rnd() < 0.2) bumpForm(p, -1); }); msg = '球員們有點失望。'; }
        break;
      case 'conflict': {
        const a = P(e.data.a), b = P(e.data.b);
        if (choice === 'talk') { msg = '兩人把話說開了。'; }
        else if (choice === 'rotate') { const lo = caOf(a) < caOf(b) ? a : b; bumpForm(lo, -1); msg = `${lo.name} 對結果不太服氣。`; }
        else { if (rnd() < 0.5) bumpForm(a, -1); if (rnd() < 0.5) bumpForm(b, -1); msg = '更衣室氣氛很僵。'; }
        break; }
      case 'pro': { const p = P(e.data.p); p.flags = { ...(p.flags || {}), proScouted: true };
        if (choice === 'yes') { bumpForm(p, 1); me.rep = Math.min(95, me.rep + 2); msg = `${p.name} 得到職業隊青睞，學校名聲上升。`; }
        else { bumpForm(p, -1); msg = `${p.name} 有點失落。`; } break; }
      case 'skip': { const p = P(e.data.p);
        if (choice === 'strict') { p.form = Math.min(4, formOf(p) + 1); msg = `${p.name} 被罰跑操場 20 圈，之後練球認真多了。`; }
        else if (rnd() < 0.5) { p.trait = null; msg = `${p.name} 答應會認真練球，「散漫」人格消失了。`; }
        else msg = `${p.name} 嘴上答應，下週還是不見人影。`; break; }
      case 'pain': { const p = P(e.data.p);
        if (choice === 'rest') { p.inj = Math.max(p.inj, 1); msg = `${p.name} 休養一週。`; }
        else if (rnd() < 0.4) { p.inj = 4; msg = `糟糕，${p.name} 拉傷了，要休 4 週。`; }
        else msg = `${p.name} 沒事，繼續練。`; break; }
      case 'slump': { const p = P(e.data.p);
        if (choice === 'talk') { if (rnd() < 0.7) { p.form = Math.min(4, formOf(p) + 1); msg = `${p.name} 把心事說出來，狀態回升到「${FORM_LV[p.form]}」。`; } else msg = `${p.name} 還是悶悶不樂。`; }
        else { p.form = 2; msg = `${p.name} 冷靜了一陣子，狀態回到一般。`; } break; }
      case 'mentor': { const j = P(e.data.j); const k = Object.keys(CA_W[j.pos])[0]; j.a[k] = Math.min(99, j.a[k] + 2.5); j.form = Math.min(4, formOf(j) + 1); msg = `${j.name} 的${ATTR_LABEL[k]}進步了，狀態也跟著變好。`; break; }
    }
    log(`【${e.title}】${msg}`);
    S.event = null;
    return msg;
  }

  // ---------- week flow ----------
  function log(text, kind = '') { S.log.unshift({ year: S.year, week: S.week, text, kind }); if (S.log.length > 120) S.log.pop(); }
  function myFixture(w = S.week) { return (S.fixtures[w] || []).find(f => f.h === S.me || f.a === S.me) || null; }
  // Phase 1: training, events, AI matches. Returns {match} if the player has a live match.
  function beginWeek() {
    if (S.phase !== 'week') return null;
    const w = S.week;
    for (const C of Object.values(CUPS)) if (w === C.draw) drawCup(C.key);
    weekTraining();
    aiWeek();
    const fxs = S.fixtures[w] || [];
    const mine = myFixture(w);
    const teamsPlaying = new Set();
    for (const f of fxs) { if (f === mine) continue; playQuick(f); teamsPlaying.add(f.h); teamsPlaying.add(f.a); }
    if (mine) {
      S.live = createMatch(mine);
      S.phase = 'match';
      return S.live;
    }
    endWeek(teamsPlaying);
    return null;
  }
  function finishLive() {
    const m = S.live; if (!m || !m.done) return;
    applyResult(m);
    S.lastMatch = summarize(m);
    S.live = null; S.phase = 'week';
    const set = new Set();
    for (const f of S.fixtures[S.week] || []) { set.add(f.h); set.add(f.a); }
    endWeek(set);
  }
  function summarize(m) {
    const rankAfter = m.rankBefore ? (() => { const tab = standings(S.teams[m.fx.h].div); return [tab.findIndex(r => r.t.id === m.fx.h) + 1, tab.findIndex(r => r.t.id === m.fx.a) + 1]; })() : null;
    return { fx: { ...m.fx }, rival: m.rival, rankBefore: m.rankBefore || null, rankAfter, sides: m.sides.map(s => ({ id: s.t.id, goals: s.goals, shots: s.shots, sot: s.sot, heads: s.heads || 0, headGoals: s.headGoals || 0, poss: s.poss, passes: s.passes, passOk: s.passOk, fouls: s.fouls, yc: s.yc, red: s.red, offsides: s.offsides, corners: s.corners, ratings: { ...s.ratings }, scorers: s.scorers.slice(), used: [...s.used], start: s.start, startPos: s.startPos, form: s.form, style: s.style, cards: s.cards, subsLog: s.subsLog })), pk: m.pk, mvp: m.mvp, feed: m.feed.slice() };
  }
  function endWeek(playedIds) {
    for (const t of S.teams) weeklyFam(t);
    tickSuspensions([...playedIds]);
    const w = S.week;
    const C = CUP_OF_WEEK(w);
    if (C && S.cups[C.key]) {
      const cupR = C.weeks.indexOf(w);
      advanceCup(C.key, cupR);
      const r = S.cups[C.key].rounds[cupR];
      const mine = r.find(x => x.h === S.me || x.a === S.me);
      if (mine && mine.w !== S.me) log(`${C.name}止步${CUP_ROUNDS[cupR]}。`, 'bad');
      if (cupR === 4) { const champ = S.teams[r[0].w]; log(`${C.full}冠軍：${champ.name}！`, 'big'); }
    }
    for (const d of DIV_ORDER) if (w === DIVS[d].weeks.at(-1)) log(`${DIVS[d].name}冠軍：${standings(d)[0].t.name}！`, 'big');
    if (w === RECRUIT_DEADLINE) {
      const { signed, lost } = resolveRecruiting();
      S.recruitResult = { signed: signed.map(p => p.name + '（' + p.pos + '）'), lost: lost.map(x => `${x.p.name} → ${x.to.short}`) };
      log(`招生結果：${signed.length ? '簽下 ' + signed.map(p => p.name).join('、') : '沒有簽下任何人'}${lost.length ? `；${lost.length} 人選擇他校` : ''}。`, signed.length ? 'good' : 'bad');
    }
    S.event = w < SEASON_LEN ? maybeEvent() : null;
    S.week++;
    S.scoutPts = scoutPerWeek();
    if (S.week > SEASON_LEN) { S.phase = 'season'; S.seasonSummary = seasonSummary(); }
  }

  function cupResultOf(id, key = 'wc') {
    const cup = S.cups && S.cups[key];
    if (!cup) return '—';
    let reached = '32 強';
    cup.rounds.forEach((r, i) => { const m = r.find(x => x.h === id || x.a === id); if (m) reached = m.w === id && i === 4 ? '冠軍' : m.w && m.w !== id ? (i === 4 ? '亞軍' : CUP_ROUNDS[i]) : CUP_ROUNDS[i]; });
    return reached;
  }
  // what a graduating third-year does next; better players are more likely to keep playing
  const PATHS = {
    abroad: { label: '國外職業隊邀約', cls: 'abroad' },
    football: { label: '踢大學或本地聯賽', cls: 'football' },
    study: { label: '升學，好好讀書', cls: 'study' },
    work: { label: '轉換跑道投入工作', cls: 'work' },
  };
  function graduatePath(p, career) {
    const ca = caOf(p), avg = career.rN ? career.rSum / career.rN : 6;
    const w = {
      abroad: Math.max(0, ca - 66) * 1.4 + (p.flags && p.flags.proScouted ? 6 : 0) + Math.max(0, avg - 7) * 8,
      football: Math.max(0, ca - 44) * 1.2 + 4,
      study: 9 + (['自律', '冷靜', '聖人'].includes(p.trait) ? 6 : 0),
      work: 7 + (['散漫', '駑鈍'].includes(p.trait) ? 6 : 0),
    };
    const key = wpick(Object.keys(w), Object.values(w));
    const uni = pick(['青嵐體育大學', '東都大學', '北陵大學', '南海學院大學', '關東國際大學', '明修館大學']);
    const detail = {
      abroad: pick([`收到德國第四級聯賽球隊的試訓邀約，畢業後將出國挑戰職業足球。`, `葡萄牙二級聯賽的球探相中了他，三月底就要飛往里斯本。`, `與泰國聯賽球隊簽下第一份職業合約。`, `獲得澳洲 A 聯賽球隊的青年隊邀約，決定出國闖蕩。`, `比利時乙級聯賽的球隊提出邀約，他說：「想在歐洲證明自己。」`]),
      football: pick([`進入${uni}體育學系，繼續在大學聯賽踢球。`, `拿到${uni}的足球推薦入學資格。`, `加入地區社會人聯賽的球隊，一邊工作一邊踢球。`, `進入${uni}，目標是四年後成為職業選手。`]),
      study: pick([`考上${uni}經濟學系，決定好好讀書。`, `考上${uni}法學部，說要成為律師。`, `進入${uni}理工學部，研究機器人。`, `考上國立大學教育學部，想成為老師，將來回來帶足球部。`, `進入${uni}醫學部，開始漫長的讀書生活。`]),
      work: pick([`回到家裡的拉麵店幫忙，說以後店裡的電視只轉足球。`, `考進消防學校，準備成為消防員。`, `進入地方的汽車工廠工作。`, `去料理學校學做壽司，夢想開自己的店。`, `報考警察學校，想守護這座城市。`, `在農會工作，接手家裡的稻田。`]),
    }[key];
    return { path: key, pathLabel: PATHS[key].label, detail };
  }
  function seasonSummary() {
    const me = S.teams[S.me];
    const tab = standings(me.div), pos = tab.findIndex(r => r.t.id === S.me) + 1;
    const cup = cupResultOf(S.me, 'wc'), ih = cupResultOf(S.me, 'ih');
    const grads = squad(me).filter(p => p.grade === 3).sort((a, b) => caOf(b) - caOf(a));
    const out = grads.map(p => {
      const c = (p.hist || []).reduce((s, h) => ({ apps: s.apps + h.apps, goals: s.goals + h.goals, assists: s.assists + h.assists, rSum: s.rSum + h.rSum, rN: s.rN + h.rN }), { apps: p.apps, goals: p.goals, assists: p.assists, rSum: p.rSum, rN: p.rN });
      return { name: p.name, num: p.num, pos: p.pos, trait: p.trait, captain: me.captain === p.id, apps: c.apps, goals: c.goals, assists: c.assists, rating: c.rN ? c.rSum / c.rN : null, ca: Math.round(caOf(p)), start: p.start, ...graduatePath(p, c) };
    });
    S.alumni = (S.alumni || []).concat(out.map(g => ({ year: S.year, name: g.name, pos: g.pos, path: g.path, detail: g.detail })));
    return { year: S.year, div: me.div, pos, cup, ih, grads: out, signed: (S.signed || []).map(p => p.name + '（' + p.pos + '）') };
  }
  function nextSeason() {
    if (S.phase !== 'season') return;
    const me = S.teams[S.me];
    const sum = S.seasonSummary;
    // reputation
    for (const t of S.teams) {
      const tab = standings(t.div), pos = tab.findIndex(r => r.t.id === t.id) + 1;
      const bonus = { '冠軍': 14, '亞軍': 9, '準決賽': 6, '8 強': 3 };
      const target = ({ S: 78 - pos * 2.5, P: 55 - pos * 1.8, R: 38 - pos * 1.3 }[t.div] ?? 38 - pos) + (bonus[cupResultOf(t.id, 'wc')] || 0) + (bonus[cupResultOf(t.id, 'ih')] || 0) * 0.7;
      t.rep = clamp(Math.round(t.rep * 0.7 + target * 0.3), 10, 95);
    }
    if (S.flags.principal) {
      const ok = ['冠軍', '亞軍', '準決賽'].includes(cupResultOf(S.me, 'wc'));
      if (ok) me.budget += 150; else me.rep = Math.max(10, me.rep - 5);
    }
    // promotion / relegation
    const tabs = {}; DIV_ORDER.forEach(d => tabs[d] = standings(d)); const A = tabs.S;
    // top two go up, bottom two go down (the prefectural league has nowhere lower to go)
    const up = [], down = [];
    for (let k = 0; k < DIV_ORDER.length - 1; k++) {
      const hi = DIV_ORDER[k], lo = DIV_ORDER[k + 1];
      const dn = tabs[hi].slice(-2).map(r => r.t), upp = tabs[lo].slice(0, 2).map(r => r.t);
      dn.forEach(t => { t.div = lo; down.push(t); }); upp.forEach(t => { t.div = hi; up.push(t); });
    }
    S.history.push({ year: S.year, div: sum.div, pos: sum.pos, cup: sum.cup, ih: sum.ih, champA: A[0].t.short, champCup: S.cups.wc && S.cups.wc.rounds[4] ? S.teams[S.cups.wc.rounds[4][0].w].short : '—', champIH: S.cups.ih && S.cups.ih.rounds[4] ? S.teams[S.cups.ih.rounds[4][0].w].short : '—', up: up.map(t => t.short), down: down.map(t => t.short) });
    // graduation & ageing
    for (const t of S.teams) {
      for (const p of squad(t)) {
        if (p.grade === 3) { delete S.players[p.id]; t.players = t.players.filter(id => id !== p.id); continue; }
        p.hist = p.hist || [];
        p.hist.push({ year: S.year, grade: p.grade, team: t.short, div: t.div, apps: p.apps, goals: p.goals, assists: p.assists, rSum: p.rSum, rN: p.rN });
        p.grade++; p.apps = 0; p.goals = 0; p.assists = 0; p.rSum = 0; p.rN = 0; p.inj = 0; p.susp = 0; p.cond = 100; // keeps his shirt number
      }
      const T = TYPES[t.type];
      const incoming = (t.id === S.me ? (S.signed || []) : (S.aiSigned && S.aiSigned[t.id]) || []).slice(0, GRADE_MAX);
      for (const p of incoming) { const q = { ...p, grade: 1, team: t.id }; delete q.know; delete q.interest; delete q.offer; delete q.schol; delete q.from; delete q.visitedWeek; q.start = Math.round(caOf(q)); addPlayer(t, q); }
      // club tryouts top the new first-years up to 6–8 (never past 8), and keep at least 2 goalkeepers
      const need = pos => squad(t).filter(p => p.pos === pos).length;
      const firsts = () => squad(t).filter(p => p.grade === 1).length;
      const base = t.id === S.me ? T.base - 9 : T.base - 3 + (t.rep - 50) * 0.08;
      const target = Math.max(firsts(), t.id === S.me ? GRADE_MIN : ri(GRADE_MIN, GRADE_MAX - 1));
      const walk = pos => { const gem = t.id === S.me && rnd() < 0.08; addPlayer(t, genPlayer(pos, 1, base + (gem ? 8 : 0), { paBonus: gem ? 15 : 0 })); };
      if (need('GK') < 2 && firsts() < GRADE_MAX) walk('GK');
      while (firsts() < target) {
        const counts = { GK: need('GK') < 3 && !squad(t).some(p => p.grade === 1 && p.pos === 'GK') ? 0 : 9, DF: need('DF') / 7, MF: need('MF') / 7, FW: need('FW') / 5 };
        walk(Object.keys(counts).sort((a, b) => counts[a] - counts[b])[0]);
      }
      t.budget = TYPES[t.type].budget + Math.round(t.rep * 3) + (t.id === S.me && S.flags.principal && ['冠軍', '亞軍', '準決賽'].includes(sum.cup) ? 150 : 0);
      renumber(t, t.id !== S.me);
      t.xi = null;
      if (t.id !== S.me && rnd() < 0.25) { t.tactic.style = pick(STYLES); t.tactic.form = rnd() < 0.7 ? Object.keys(FORMS).sort((a, b) => t.fam[b] - t.fam[a])[0] : pick(Object.keys(FORMS)); }
    }
    S.year++; S.week = 1; S.results = []; S.signed = []; S.aiSigned = {}; S.recruitResult = null; S.lastMatch = null; S.growth = [];
    S.flags = { principal: false }; S.event = null;
    makeLeague();
    newProspects();
    S.scoutPts = scoutPerWeek();
    S.phase = 'week';
    log(`第 ${S.year} 學年開始！${divName(me.div)}，${squad(me).filter(p => p.grade === 1).length} 名新生入隊。`, 'big');
    if (me.captain && !mine(me, me.captain)) { me.captain = null; log('隊長已經畢業，記得在「戰術」頁任命新隊長。'); }
    if (me.sp) for (const k in me.sp) if (me.sp[k] && !mine(me, me.sp[k])) me.sp[k] = null;
    if (up.includes(me)) log(`恭喜！升上${divName(me.div)}！`, 'good');
    if (down.includes(me)) log(`降入${divName(me.div)}，明年捲土重來。`, 'bad');
  }

  // ---------- helpers for UI ----------
  function teamLines(t) {
    const side = { t, home: false, cup: false, on: ensureXI(t), pos: slots(t), style: t.tactic.style, form: t.tactic.form, red: 0 };
    return lineRatings(side);
  }
  function aiPredict(t) { const side = { t, home: false, cup: false, on: autoXI(t), pos: slots(t), style: t.tactic.style, form: t.tactic.form, red: 0 }; return lineRatings(side); }

  return {
    minLabel, setState, getState, newGame, beginWeek, step, finishLive, doSub, resolveEvent, scout, setOffer, nextSeason, playQuick, createMatch, applyResult,
    summarize, setNumber, setRole, autoTaker, caOf, posRating, stars, squad, slots, autoXI, ensureXI, validXI, standings, myFixture, teamLines, aiPredict, monthOf, cupResultOf, scholCost, teamPower,
    PATHS, famMod, firstWeekOfMonth, nextScoutWeek, SCOUT_PTS, hasAttr, TYPES, SCHOOLS, MY_SCHOOL, ATTRS, ATTR_LABEL, FORMS, STYLES, STYLE_DESC, INSTS, setInst, MENUS, DAYS, TRAITS, TRAIT_DESC, autoCaptain, LEAGUE_WEEKS, DIVS, DIV_ORDER, divName, CUPS, CUP_ROUNDS, FORM_LV, FORM_MOD, formOf, SEASON_LEN, RECRUIT_DEADLINE, available,
  };
})();
if (typeof module !== 'undefined') module.exports = Engine;
