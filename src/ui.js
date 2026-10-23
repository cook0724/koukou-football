/* 高校足球物語 — interface */
(() => {
  const E = Engine;
  const SAVE = 'hsfc-save-v4';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ui = { tab: 'home', sel: null, slot: null, speed: 1, timer: null, paused: false, posFilter: 'ALL', toast: null, startPick: null };
  let S = null;

  // ---------- persistence ----------
  function saveSort() { try { localStorage.setItem('hsfc-sort', JSON.stringify([ui.sortKey, ui.sortDir])); } catch (e) {} }
  try { const s = JSON.parse(localStorage.getItem('hsfc-sort') || 'null'); if (s) { ui.sortKey = s[0]; ui.sortDir = s[1]; } } catch (e) {}
  function save() { if (!S || S.phase === 'match') return; try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) {} }
  function loadSave() { try { const s = localStorage.getItem(SAVE); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function wipe() { try { localStorage.removeItem(SAVE); } catch (e) {} }

  // ---------- small helpers ----------
  const T = id => S.teams[id];
  const me = () => S.teams[S.me];
  const r0 = x => Math.round(x);
  const starStr = v => { let s = '<span class="st" aria-label="' + v + ' 星">'; for (let i = 1; i <= 5; i++) s += `<i class="${v >= i ? 'f' : v >= i - 0.5 ? 'h' : 'e'}">★</i>`; return s + '</span>'; };
  const myKit = () => { if (!S.kit) S.kit = Kit.defaults(me().name); S.kit.school.name = me().name; return S.kit; };
  const chip = t => t.id === S.me ? `<span class="crest kc" title="${esc(t.name)}">${Kit.crestSVG(myKit())}</span>` : `<span class="crest kc" title="${esc(t.name)}">${Kit.crestSVG(Kit.teamCrest(t))}</span>`;
  // home / away / GK kit thumbnail for a team in a given match
  const kitThumb = (t, key) => { const d = t.id === S.me ? myKit() : Kit.teamDesign(t); return `<span class="kthumb" title="${Kit.KITS[key]}球衣">${Kit.kitSVG(d, key, 'front', {})}</span>`; };
  const tname = t => `${chip(t)}<span>${esc(t.short)}</span>`;
  const bar = (v, max = 100, cls = '') => `<span class="bar ${cls}"><i style="width:${Math.max(2, Math.min(100, v / max * 100))}%"></i></span>`;
  const condCls = v => v >= 70 ? 'good' : v >= 45 ? 'warn' : 'bad';
  const FORM_ARROW = ['↓', '↘', '→', '↗', '↑'];
  const formBadge = (p, label = true) => { const f = E.formOf(p); return `<span class="fm f${f}" title="狀態${E.FORM_LV[f]}（${E.FORM_MOD[f] > 0 ? '+' : ''}${Math.round(E.FORM_MOD[f] * 100)}%）"><i>${FORM_ARROW[f]}</i>${label ? E.FORM_LV[f] : ''}</span>`; };
  const isCap = p => me() && me().captain === p.id;
  const capBadge = p => isCap(p) ? '<span class="cap" title="隊長">C</span>' : '';
  const roleTags = p => { const sp = (me() && me().sp) || {}; return [['corner', '角'], ['fk', '任'], ['pk', '點']].filter(([k]) => sp[k] === p.id).map(([, l]) => `<span class="rk" title="指定主罰">${l}</span>`).join(''); };
  const traitTag = p => p.trait ? `<span class="tag trait" title="${esc(E.TRAIT_DESC[p.trait])}">${p.trait}</span>` : '<span class="muted small">無</span>';
  const LINE_ROWS = [['中場', 'mid'], ['右路進攻', 'attR'], ['左路進攻', 'attL'], ['右路防守', 'defR'], ['左路防守', 'defL'], ['門將', 'gk']];
  const instBadge = p => { const v = (me().inst || {})[p.id]; return v === 'att' ? '<span class="ins att" title="趨向進攻">攻</span>' : v === 'def' ? '<span class="ins def" title="趨向防守">守</span>' : ''; };
  const POS_ORDER = { GK: 0, DF: 1, MF: 2, FW: 3 };
  const SORTS = {
    num: { label: '背號', dir: 1, v: p => p.num },
    pos: { label: '位置', dir: 1, v: p => POS_ORDER[p.pos] * 1000 - E.caOf(p) },
    ca: { label: '能力', dir: -1, v: p => E.caOf(p) },
    pa: { label: '潛力', dir: -1, v: p => p.pa },
    form: { label: '狀態', dir: -1, v: p => E.formOf(p) },
    grade: { label: '年級', dir: -1, v: p => p.grade },
    cond: { label: '體力', dir: -1, v: p => p.cond },
    apps: { label: '出賽', dir: -1, v: p => p.apps },
    goals: { label: '進球', dir: -1, v: p => p.goals },
    assists: { label: '助攻', dir: -1, v: p => p.assists },
    rating: { label: '評分', dir: -1, v: p => p.rN ? p.rSum / p.rN : 0 },
  };
  // one commentary line: minute, speaker (主播 / 球評) and text
  const feedLi = (f, typing) => `<li class="f-${f.kind}${f.spk ? ' spk-' + (f.spk === '球評' ? 'an' : 'pbp') : ''}${typing ? ' typing' : ''}"><span class="num muted">${f.min ? E.minLabel(f.min) + "'" : ''}</span><span>${f.spk ? `<b class="spk">${f.spk}</b>` : ''}${typing ? `<span id="typing-text">${esc(f.text.slice(0, Math.max(0, ui.typed)))}</span><i class="caret"></i>` : esc(f.text)}</span></li>`;
  const famTier = v => { const m = E.famMod(v); return m > 0 ? `全員能力 +${Math.round(m * 100)}%` : m < 0 ? '全員能力 −5%' : '全員能力 ±0%'; };
  const gradeLabel = g => ['國三', '高一', '高二', '高三'][g];
  function toast(msg) {
    if (!msg) return;
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(ui.toast); ui.toast = setTimeout(() => el.hidden = true, 2600);
  }
  function status(p) {
    if (p.inj > 0) return `<span class="tag bad">傷 ${p.inj}週</span>`;
    if (p.susp > 0) return `<span class="tag bad">禁賽 ${p.susp}</span>`;
    return '';
  }

  // ---------- start screen ----------
  function renderStart() {
    $('#app').style.removeProperty('--h');
    const saved = loadSave();
    const hue = (E.MY_SCHOOL * 137) % 360;
    $('#app').innerHTML = `
    <section class="start" style="--h:${hue}">
      <header class="start-head">
        
        <h1 class="display">高校足球物語</h1>
        <p class="lede">你是縣立青葉高校足球部新上任的總教練。球隊在最底層的都道府縣聯賽載浮載沉，三年一屆，球員來了又走。招對人、練對方法、排對戰術，從都道府縣聯賽一路升上王子聯賽、超級聯賽，再把青葉帶上地區之巔。</p>
        <div class="school-card"><span class="crest kc big">${Kit.crestSVG(saved && saved.kit ? saved.kit : Kit.defaults('青葉高校'))}</span><div><b class="school-name">青葉高校</b><div class="muted small">普通公立校・都道府縣聯賽・預算有限</div></div></div>
        ${saved ? `<div class="resume"><button class="btn primary" data-act="resume">繼續執教・${saved.coach ? esc(saved.coach) + ' 教練・' : ''}第 ${saved.year} 學年 ${E.monthOf(saved.week)}</button></div>` : ''}
        <form class="coach-form" id="coach-form">
          <label for="coach-name">總教練姓名</label>
          <div class="coach-row"><input id="coach-name" name="coach" type="text" maxlength="12" autocomplete="off" value="${esc(ui.coachDraft || '')}">
          <button class="btn ${saved ? 'ghost' : 'primary big'}" type="submit">${saved ? '以新教練重新開始' : '開始第一學年'}</button></div>
          <p class="coach-err small" id="coach-err" hidden>請輸入教練的名字。</p>
        </form>
      </header>
    </section>`;
  }

  // ---------- main shell ----------
  const TABS = [['home', '總覽'], ['squad', '球員'], ['train', '訓練'], ['tactics', '戰術'], ['recruit', '招生'], ['fixtures', '賽程'], ['table', '積分榜'], ['kit', '隊服']];
  function render() {
    if (!S) return renderStart();
    const t = me();
    const tab = E.standings(t.div), pos = tab.findIndex(r => r.t.id === t.id) + 1;
    const nxt = nextMatch();
    $('#app').style.setProperty('--h', t.hue);
    $('#app').innerHTML = `
      <header class="top" style="--h:${t.hue}">
        <div class="top-inner">
          <div class="who">${chip(t)}<div><div class="school-title">${esc(t.name)}</div><div class="muted small">${S.coach ? `總教練 ${esc(S.coach)}・` : ''}${E.TYPES[t.type].label}・名聲 ${t.rep}・預算 ${t.budget} 萬</div></div></div>
          <div class="when"><div class="cal"><span class="cal-y">第 ${S.year} 學年</span><span class="cal-m">${E.monthOf(S.week)}</span><span class="cal-w">第 ${Math.min(S.week, E.SEASON_LEN)} / ${E.SEASON_LEN} 週</span></div>
            <div class="small muted">${E.divName(t.div)} 第 ${pos} 名</div></div>
        </div>
        <nav class="tabs" role="tablist">${TABS.map(([k, l]) => `<button role="tab" aria-selected="${ui.tab === k}" class="tab ${ui.tab === k ? 'on' : ''}" data-act="tab" data-k="${k}">${l}${k === 'recruit' && S.week <= E.RECRUIT_DEADLINE && S.scoutPts > 0 ? `<span class="pip">${S.scoutPts}</span>` : ''}</button>`).join('')}</nav>
      </header>
      <main class="main">${({ home: vHome, squad: vSquad, train: vTrain, tactics: vTactics, recruit: vRecruit, fixtures: vFixtures, table: vTable, kit: vKit })[ui.tab]()}</main>
      <footer class="advance">
        <div class="advance-inner">
          <div class="next">${nxt ? `<span class="muted small">本週</span> ${nxt}` : `<span class="muted small">本週沒有比賽</span>${S.week <= E.SEASON_LEN ? weekNote() : ''}`}${scoutTag()}</div>
          <button class="btn primary big" data-act="advance">${S.phase === 'season' ? '查看學年總結' : myFix() ? '進入比賽' : '推進一週'}</button>
        </div>
      </footer>
      ${S.event && !(ui.showReport && S.lastMatch) ? vEvent() : ''}
      ${S.phase === 'season' && ui.showSeason ? vSeason() : ''}
      ${ui.sel ? vPlayer() : ''}
      ${S.recruitResult && !S.recruitSeen && !S.event ? vRecruitResult() : ''}
      ${ui.showReport && S.lastMatch ? vReport() : ''}`;
    if (ui.tab === 'kit') mountKit();
  }
  function vKit() { return `<div class="kit-head"><h2>隊服工房</h2><p class="muted small">設計${esc(me().name)}的隊徽與主場、客場、門將球衣。預覽以總教練的名字和 10 號呈現。隊徽會出現在遊戲各處，球衣會在賽前名單上亮相。</p></div><div id="kitroot" class="kitstudio"></div>`; }
  const KIT_COST = 5;
  function mountKit() {
    const root = document.getElementById('kitroot'); if (!root) return;
    const kit = myKit();
    if (!ui.kitDraft) ui.kitDraft = JSON.parse(JSON.stringify(kit));
    const d = ui.kitDraft;
    d.school.name = me().name; d.player = { name: S.coach || '', number: '10' }; kit.player = d.player;
    Kit.mount(root, d, { toast, committed: kit, locked: !!kit.locked, cost: KIT_COST, budget: me().budget,
      onCommit: () => {
        const paid = !!kit.locked;
        if (paid) { if (Kit.sig(d) === Kit.sig(kit)) return; if (me().budget < KIT_COST) { toast('預算不足，無法更改隊服。'); return; } me().budget -= KIT_COST; }
        S.kit = JSON.parse(JSON.stringify(d)); S.kit.locked = true; ui.kitDraft = null;
        save(); render(); toast(paid ? `隊服已更新，花費 ${KIT_COST} 萬元。` : '隊服已確定！之後更改每次需花費 5 萬元。');
      },
      onDiscard: () => { ui.kitDraft = null; render(); toast('已放棄變更。'); } });
  }

  const myFix = () => S.week <= E.SEASON_LEN ? E.myFixture(S.week) : null;
  const scoutTag = () => E.firstWeekOfMonth(S.week) && S.week <= E.RECRUIT_DEADLINE && S.scoutPts > 0 ? `<span class="tag good" title="到「招生」頁使用球探點數">球探出動週・剩 ${S.scoutPts} 點</span>` : '';
  function weekNote() {
    const w = S.week;
    for (const C of Object.values(E.CUPS)) if (w === C.draw) return `<span class="tag">${C.name}抽籤</span>`;
    for (const C of Object.values(E.CUPS)) if (w >= C.weeks[0] && w <= C.weeks.at(-1)) return `<span class="tag">${C.full}期間</span>`;
    if (w === E.RECRUIT_DEADLINE) return `<span class="tag warn">招生截止</span>`;
    if (w >= 14 && w <= 17) return `<span class="tag">暑假</span>`;
    return '';
  }
  function nextMatch() {
    const f = myFix(); if (!f) return '';
    const home = f.h === S.me, opp = T(home ? f.a : f.h);
    return `<b>${f.cup ? f.comp + ' ' + E.CUP_ROUNDS[f.cupRound] : f.comp + ' 第 ' + f.round + ' 輪'}</b>　${home ? '主場' : '客場'} vs ${tname(opp)}${me().rivals.includes(opp.id) ? '<span class="tag hot">宿敵</span>' : ''}`;
  }

  // ---------- overview ----------
  function lineCompare(a, b) {
    const rows = LINE_ROWS;
    return `<div class="duel">${rows.map(([l, k]) => {
      const x = a[k], y = b[k], tot = x + y;
      return `<div class="duel-row"><span class="num">${r0(x)}</span><span class="duel-bar"><i class="mine" style="width:${x / tot * 100}%"></i><i class="theirs" style="width:${y / tot * 100}%"></i></span><span class="num">${r0(y)}</span><span class="duel-l">${l}</span></div>`; }).join('')}</div>`;
  }
  function vHome() {
    const t = me(), f = myFix();
    let card = '';
    if (f) {
      const opp = T(f.h === S.me ? f.a : f.h);
      card = `<section class="card match-card">
        <div class="card-k">下一場比賽・${E.monthOf(S.week)}</div>
        <div class="vs"><div class="vs-side">${chip(t)}<b>${esc(t.short)}</b></div><div class="vs-mid">VS</div><div class="vs-side">${chip(opp)}<b>${esc(opp.short)}</b></div></div>
        <div class="muted small center">對手：${esc(opp.tactic.form)}・${esc(opp.tactic.style)}　｜　我方：${esc(t.tactic.form)}・${esc(t.tactic.style)}</div>
        ${lineCompare(E.teamLines(t), E.aiPredict(opp))}
        <div class="legend small"><span><i class="sw mine"></i>我方</span><span><i class="sw theirs"></i>${esc(opp.short)}</span></div>
      </section>`;
    } else {
      card = `<section class="card match-card"><div class="card-k">本週</div><p class="lede-sm">沒有正式比賽。${S.week >= 13 && S.week <= 16 ? '暑假是拉高訓練強度的好時機。' : S.week > 30 && S.week <= E.RECRUIT_DEADLINE ? '招生季進入最後衝刺，記得去「招生」頁面提出邀請。' : '專心訓練，調整陣容。'}</p>${lineCompare(E.teamLines(t), avgLines(t.div))}<div class="legend small"><span><i class="sw mine"></i>我方</span><span><i class="sw theirs"></i>${E.DIVS[t.div].short}平均</span></div></section>`;
    }
    const recent = S.results.slice(-6).reverse();
    const sq = E.squad(t);
    const hurt = sq.filter(p => p.inj > 0 || p.susp > 0);
    const tired = sq.filter(p => p.cond < 50 && p.inj <= 0);
    return `<div class="grid-home">
      ${card}
      <section class="card">
        <div class="card-k">近況</div>
        ${recent.length ? `<ul class="results">${recent.map(r => `<li><span class="res ${r.r > 0 ? 'w' : r.r < 0 ? 'l' : 'd'}">${r.r > 0 ? '勝' : r.r < 0 ? '敗' : '和'}</span><span class="score num">${r.gf}:${r.ga}${r.pk ? `<small> PK${r.pk[0]}:${r.pk[1]}</small>` : ''}</span><span>${r.home ? 'vs' : '@'} ${tname(T(r.opp))}</span><span class="muted small">${esc(r.comp)} ${esc(r.round)}</span></li>`).join('')}</ul>` : '<p class="muted">還沒有正式比賽。</p>'}
        ${S.lastMatch ? `<button class="btn ghost sm" data-act="report">上一場賽後報告</button>` : ''}
      </section>
      <section class="card">
        <div class="card-k">隊伍狀態</div>
        <div class="stat-row"><div><b class="num">${sq.length}</b><span class="muted small">名球員</span></div><div><b class="num">${hurt.length}</b><span class="muted small">傷停／禁賽</span></div><div><b class="num">${tired.length}</b><span class="muted small">體力偏低</span></div><div><b class="num">${sq.filter(p => E.formOf(p) >= 3).length}</b><span class="muted small">狀態高以上</span></div><div><b class="num">${sq.filter(p => E.formOf(p) <= 1).length}</b><span class="muted small">狀態低迷</span></div></div>
        ${hurt.length ? `<p class="small">${hurt.map(p => `${esc(p.name)} ${status(p)}`).join('　')}</p>` : ''}
        ${S.flags.principal ? '<p class="small"><span class="tag warn">校長目標</span> 高校選手權打進四強</p>' : ''}
      </section>
      <section class="card news">
        <div class="card-k">隊務日誌</div>
        <ul class="log">${S.log.slice(0, 14).map(l => `<li class="${l.kind}"><span class="muted small num">Y${l.year}・W${l.week}</span><span>${esc(l.text)}</span></li>`).join('')}</ul>
      </section>
    </div>`;
  }
  function avgLines(div) {
    const ts = S.teams.filter(t => t.div === div && t.id !== S.me).map(t => E.aiPredict(t));
    const o = { mid: 0, attR: 0, attL: 0, defR: 0, defL: 0, gk: 0 };
    ts.forEach(x => { for (const k in o) o[k] += x[k] / ts.length; });
    return o;
  }

  // ---------- squad ----------
  function vSquad() {
    const t = me();
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const key = SORTS[ui.sortKey] ? ui.sortKey : 'pos', dir = ui.sortDir || SORTS[key].dir;
    const ps = E.squad(t).filter(p => ui.posFilter === 'ALL' || p.pos === ui.posFilter)
      .sort((a, b) => (SORTS[key].v(a) - SORTS[key].v(b)) * dir || order[a.pos] - order[b.pos] || a.num - b.num);
    const th = (k, label, cls = '') => `<th class="${cls}"><button class="sort ${key === k ? 'on' : ''}" data-act="sort" data-k="${k}" aria-label="依${label}排序">${label}${key === k ? (dir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`;
    const xi = new Set(E.validXI(t) ? t.xi : []);
    return `<section class="card wide">
      <div class="row-between"><div class="card-k">球員名單・${E.squad(t).length} 人</div>
        <div class="sort-bar"><label for="sort-sel" class="small muted">排序</label><select id="sort-sel" data-act="sortsel">${Object.entries(SORTS).map(([k, s]) => `<option value="${k}" ${key === k ? 'selected' : ''}>${s.label}</option>`).join('')}</select>
          <button class="btn sm" data-act="sortdir" aria-label="切換升降冪">${dir > 0 ? '小→大' : '大→小'}</button>
          <div class="seg">${['ALL', 'GK', 'DF', 'MF', 'FW'].map(k => `<button class="${ui.posFilter === k ? 'on' : ''}" data-act="pf" data-k="${k}">${k === 'ALL' ? '全部' : k}</button>`).join('')}</div></div></div>
      <div class="scroll-x"><table class="tbl players">
        <thead><tr>${th('num', '#')}<th>姓名</th>${th('pos', '位置')}${th('grade', '年級')}${th('ca', '能力', 'r')}${th('pa', '潛力')}${th('form', '狀態')}${th('cond', '體力')}${th('apps', '出賽', 'r')}${th('goals', '進球', 'r')}${th('assists', '助攻', 'r')}${th('rating', '評分', 'r')}<th>人格</th><th></th></tr></thead>
        <tbody>${ps.map(p => `<tr data-act="player" data-id="${p.id}" class="${xi.has(p.id) ? 'xi' : ''}">
          <td class="num muted">${p.num}</td><td><b>${esc(p.name)}</b>${capBadge(p)}${roleTags(p)}</td><td><span class="pos ${p.pos}">${p.pos}</span></td><td>${gradeLabel(p.grade)}</td>
          <td class="r num"><b>${r0(E.caOf(p))}</b>${p.lastGain > 0.05 ? `<small class="up">+${p.lastGain.toFixed(1)}</small>` : ''}</td>
          <td class="stars">${starStr(E.stars(p.pa))}</td>
          <td>${formBadge(p)}</td><td>${bar(p.cond, 100, condCls(p.cond))}</td>
          <td class="r num">${p.apps}</td><td class="r num">${p.goals}</td><td class="r num">${p.assists}</td><td class="r num">${p.rN ? (p.rSum / p.rN).toFixed(1) : '—'}</td>
          <td>${traitTag(p)}</td><td>${status(p)}</td></tr>`).join('')}</tbody>
      </table></div>
      <p class="muted small">底色標示目前的先發 11 人。狀態影響比賽中的全部能力：極低 −10%、低 −5%、一般 ±0、高 +5%、極高 +10%，每週會隨比賽表現與隊內事件變動。</p>
    </section>`;
  }
  function vPlayer() {
    const p = S.players[ui.sel] || S.prospects.find(x => x.id === ui.sel);
    if (!p) { ui.sel = null; return ''; }
    const isPros = p.grade === 0;
    const k = isPros ? p.know : 3;
    const attrs = E.ATTRS.filter(a => a !== 'gk').map(a => p.pos === 'GK' && a === 'wng' ? 'gk' : a); // GK shows 守門 in the 邊路 slot
    const ca = E.caOf(p);
    const fuzz = [99, 10, 5, 0][k];
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(p.name)}"><div class="sheet">
      <button class="x" data-act="close" aria-label="關閉">×</button>
      <div class="ph"><span class="pos big ${p.pos}">${p.pos}</span><div><h3 class="display h3">${esc(p.name)}</h3><div class="muted small">${isPros ? esc(p.from) + '・國三' : '#' + p.num + '・' + gradeLabel(p.grade)}${k >= 2 ? `・人格 ${p.trait ? `<span class="tag trait">${p.trait}</span> <span class="small">${E.TRAIT_DESC[p.trait]}</span>` : '無'}` : ''}</div></div></div>
      <div class="kv"><div><span class="muted small">能力</span><b class="num">${k === 0 ? '??' : fuzz ? `${r0(ca - fuzz)}–${r0(ca + fuzz)}` : r0(ca)}</b></div><div><span class="muted small">潛力</span><b class="stars">${k >= 2 ? starStr(E.stars(p.pa)) : '？'}</b></div>${isPros ? '' : `<div><span class="muted small">入學時</span><b class="num">${p.start}</b></div><div><span class="muted small">狀態</span><b>${formBadge(p)}</b></div><div><span class="muted small">出賽／進球／助攻</span><b class="num">${p.apps}／${p.goals}／${p.assists}</b></div><div><span class="muted small">平均評分</span><b class="num">${p.rN ? (p.rSum / p.rN).toFixed(2) : '—'}</b></div>`}</div>
      <div class="attrs">${attrs.map(a => { const v = p.a[a]; return `<div class="attr"><span>${E.ATTR_LABEL[a]}</span>${k >= 2 ? bar(v, 99, 'attr-bar') : bar(0, 99)}<b class="num">${k >= 3 ? r0(v) : k === 2 ? `${r0(v - 4)}–${r0(v + 4)}` : '?'}</b></div>`; }).join('')}</div>
      ${isPros ? '' : (() => {
        const rows = (p.hist || []).map(h => ({ ...h, label: `第 ${h.year} 學年` })).concat([{ label: `第 ${S.year} 學年（本季）`, grade: p.grade, apps: p.apps, goals: p.goals, assists: p.assists, rSum: p.rSum, rN: p.rN }]);
        const tot = rows.reduce((t, r) => ({ apps: t.apps + r.apps, goals: t.goals + r.goals, assists: t.assists + r.assists, rSum: t.rSum + r.rSum, rN: t.rN + r.rN }), { apps: 0, goals: 0, assists: 0, rSum: 0, rN: 0 });
        const avg = r => r.rN ? (r.rSum / r.rN).toFixed(2) : '—';
        return `<div class="card-k" style="margin-top:12px">歷年成績</div><div class="scroll-x"><table class="tbl hist"><thead><tr><th>學年</th><th>年級</th><th class="r">出賽</th><th class="r">進球</th><th class="r">助攻</th><th class="r">平均評分</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.label}</td><td>${gradeLabel(r.grade)}</td><td class="r num">${r.apps}</td><td class="r num">${r.goals}</td><td class="r num">${r.assists}</td><td class="r num">${avg(r)}</td></tr>`).join('')}${rows.length > 1 ? `<tr class="tot"><td colspan="2"><b>合計</b></td><td class="r num"><b>${tot.apps}</b></td><td class="r num"><b>${tot.goals}</b></td><td class="r num"><b>${tot.assists}</b></td><td class="r num"><b>${avg(tot)}</b></td></tr>` : ''}</tbody></table></div>`;
      })()}
      ${isPros ? '' : `<div class="kv small"><div><span class="muted">體力</span>${bar(p.cond, 100, condCls(p.cond))}</div></div>
      ${p.team === S.me ? `<div class="roles"><label class="lbl" for="num-${p.id}">背號</label><select id="num-${p.id}" data-act="num" data-id="${p.id}">${Array.from({ length: 99 }, (_, i) => i + 1).map(n => { const h = E.squad(me()).find(q => q.num === n && q !== p); return `<option value="${n}" ${p.num === n ? 'selected' : ''}>${n}${h ? '（' + esc(h.name) + '，互換）' : ''}</option>`; }).join('')}</select>
        <button class="btn sm ${isCap(p) ? 'primary' : ''}" data-act="makecap" data-id="${p.id}">${isCap(p) ? '現任隊長' : '任命為隊長'}</button></div>` : ''}
      <p class="small muted">各位置適性：${['GK', 'DF', 'MF', 'FW'].map(pos => `${pos} ${r0(E.posRating(p, pos))}`).join('・')}</p>`}
    </div></div>`;
  }

  // ---------- training ----------
  function vTrain() {
    const t = me();
    const plan = t.train;
    const net = 16 + plan.reduce((s, m) => s + E.MENUS[m].cond, 0);
    const risk = plan.reduce((s, m) => s + E.MENUS[m].inj, 0);
    const focus = {}; plan.forEach(m => E.MENUS[m].attrs.forEach(a => focus[a] = (focus[a] || 0) + (E.MENUS[m].small ? 0.15 : 1)));
    const top = E.squad(t).filter(p => p.lastGain > 0).sort((a, b) => b.lastGain - a.lastGain).slice(0, 5);
    const menuNote = { '體能': '速度・體能・力量上升', '技術': '傳球・控球・射門上升', '戰術': '定位球・防守・守門上升', '分組對抗': '全能力小幅上升，狀態可能變好', '休息': '恢復體力' };
    return `<div class="grid-two">
      <section class="card wide">
        <div class="card-k">本週訓練菜單</div>
        <div class="week-plan">${E.DAYS.map((d, i) => `<div class="day"><div class="day-h">${d}</div>
          ${Object.keys(E.MENUS).map(m => `<button class="menu ${plan[i] === m ? 'on' : ''}" data-act="menu" data-i="${i}" data-m="${m}">${m}</button>`).join('')}</div>`).join('')}</div>
        <div class="stat-row">
          <div><b class="num ${net < 0 ? 'neg' : ''}">${net > 0 ? '+' : ''}${net}</b><span class="muted small">每週體力淨變化</span></div>
          <div><b>${risk >= 0.012 ? '<span class="tag bad">高</span>' : risk >= 0.006 ? '<span class="tag warn">中</span>' : '<span class="tag good">低</span>'}</b><span class="muted small">受傷風險</span></div>
          <div><b>${Object.entries(focus).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([a]) => E.ATTR_LABEL[a]).join('・') || '—'}</b><span class="muted small">主要成長</span></div>
        </div>
        <p class="muted small">比賽本身會消耗約 25 點體力。賽前一兩天排「休息」，比賽時球員狀態比較好。</p>
      </section>
      <section class="card">
        <div class="card-k">菜單說明</div>
        <dl class="defs">${Object.keys(E.MENUS).map(m => `<div><dt>${m}</dt><dd>${menuNote[m]}</dd></div>`).join('')}</dl>
      </section>
      <section class="card">
        <div class="card-k">陣型熟練度</div>
        ${Object.keys(E.FORMS).map(f => `<div class="attr"><span>${f}</span>${bar(t.fam[f] || 0, 100, (t.fam[f] || 0) >= 75 ? 'good' : (t.fam[f] || 0) < 50 ? 'bad' : 'neutral')}<b class="num">${r0(t.fam[f] || 0)}</b></div>`).join('')}
        <p class="muted small">49 以下全員能力 −5%・50–74 ±0%・75–99 +1%・100 +2%</p>
      </section>
    </div>`;
  }

  // ---------- tactics ----------
  function vTactics() {
    const t = me();
    const xi = E.ensureXI(t);
    const sl = E.slots(t);
    const rows = { FW: [], MF: [], DF: [], GK: [] };
    sl.forEach((pos, i) => rows[pos].push(i));
    const xiSet = new Set(xi);
    const bench = E.squad(t).filter(p => !xiSet.has(p.id)).sort((a, b) => E.caOf(b) - E.caOf(a));
    const slotHtml = i => { const p = S.players[xi[i]]; const pos = sl[i]; const r = E.posRating(p, pos); const off = p.pos !== pos;
      return `<button class="slot ${ui.slot === i ? 'on' : ''} ${off ? 'off' : ''}" data-act="slot" data-i="${i}"><span class="slot-num num">${p.num}</span><span class="slot-name">${capBadge(p)}<span class="tipname" data-tip="${p.id}" data-pos="${pos}">${esc(p.name)}</span>${instBadge(p)}</span><span class="slot-meta"><span class="pos ${pos}">${pos}</span> <b class="num">${r0(r)}</b> ${formBadge(p, false)}</span>${bar(p.cond, 100, condCls(p.cond))}</button>`; };
    const L = E.teamLines(t);
    return `<div class="grid-tac">
      <section class="card">
        <div class="card-k">陣型與戰術風格</div>
        <label class="lbl" for="sel-form">陣型</label>
        <div class="seg wrap" id="sel-form">${Object.keys(E.FORMS).map(f => `<button class="${t.tactic.form === f ? 'on' : ''}" data-act="form" data-k="${f}">${f}</button>`).join('')}</div>
        <label class="lbl" for="sel-style">戰術風格</label>
        <div class="seg wrap" id="sel-style">${E.STYLES.map(s => `<button class="${t.tactic.style === s ? 'on' : ''}" data-act="style" data-k="${s}">${s}</button>`).join('')}</div>
        <div class="beats small"><b>${t.tactic.style}</b>：${E.STYLE_DESC[t.tactic.style]}</div>
        <div class="card-k" style="margin-top:14px">目前陣容實力</div>
        ${LINE_ROWS.map(([l, k]) => `<div class="attr"><span>${l}</span>${bar(L[k], 90)}<b class="num">${r0(L[k])}</b></div>`).join('')}
        <p class="muted small">${t.tactic.form} 陣型熟練度 ${r0(t.fam[t.tactic.form] || 0)}（${famTier(t.fam[t.tactic.form] || 0)}）。有比賽的那一週，出賽用的陣型 +5、其他陣型 −2（最低 30）；沒有比賽的週不變。</p>
        <div class="card-k" style="margin-top:14px">隊長與定位球</div>
        ${roleSelect(t, 'captain', '隊長')}${roleSelect(t, 'corner', '角球')}${roleSelect(t, 'fk', '任意球')}${roleSelect(t, 'pk', '點球')}
        <p class="muted small">隊長具「領袖」人格時，在場上全隊能力 +1%。主罰者不在場上時，由場上定位球最高的球員代罰。</p>
      </section>
      <section class="card pitch-card">
        <div class="row-between"><div class="card-k">先發陣容</div><button class="btn ghost sm" data-act="autoxi">自動排最佳陣容</button></div>
        <div class="pitch" aria-label="球場陣型">${['FW', 'MF', 'DF', 'GK'].map(pos => rows[pos].length ? `<div class="prow">${rows[pos].map(slotHtml).join('')}</div>` : '').join('')}</div>
        ${ui.slot != null ? (() => { const p = S.players[xi[ui.slot]]; const v = (t.inst || {})[p.id] || ''; return `<div class="inst-row"><span><b>${esc(p.name)}</b> 的趨向</span><div class="seg">${Object.entries(E.INSTS).map(([k, l]) => `<button class="${v === k ? 'on' : ''}" data-act="inst" data-id="${p.id}" data-k="${k}">${l}</button>`).join('')}</div></div>`; })() : ''}
        <p class="muted small">${ui.slot != null ? `已選 ${sl[ui.slot]} 位置：設定趨向，或從右側點一位球員換上、點另一個場上位置互換。` : '點場上位置可設定球員趨向進攻或防守，或再點右側替補換人。紅框代表非本職位置（能力打折）。'}</p>
        <p class="muted small">趨向進攻：更多參與進攻、跑動稍多，防守貢獻減少。趨向防守則相反。</p>
      </section>
      <section class="card bench-card">
        <div class="card-k">替補與其他球員</div>
        <ul class="bench">${bench.map(p => `<li><button class="benchp" data-act="benchp" data-id="${p.id}" ${!E.available(p) ? 'aria-disabled="true"' : ''}><span class="pos ${p.pos}">${p.pos}</span><span class="b-name"><span class="tipname" data-tip="${p.id}" data-pos="${ui.slot != null ? sl[ui.slot] : p.pos}">${esc(p.name)}</span> ${formBadge(p, false)}</span><b class="num">${r0(ui.slot != null ? E.posRating(p, sl[ui.slot]) : E.caOf(p))}</b>${bar(p.cond, 100, condCls(p.cond))}${status(p)}</button></li>`).join('')}</ul>
      </section>
    </div>`;
  }

  function roleSelect(t, kind, label) {
    const cur = kind === 'captain' ? t.captain : (t.sp || {})[kind];
    const ps = E.squad(t).slice().sort(kind === 'captain' ? (a, b) => E.caOf(b) - E.caOf(a) : (a, b) => b.a.men - a.a.men);
    const xi = new Set(E.ensureXI(t));
    const auto = kind === 'captain' ? null : S.players[E.autoTaker(t.xi.filter((id, i) => E.slots(t)[i] !== 'GK'))];
    return `<div class="role-row"><label for="role-${kind}">${label}</label><select id="role-${kind}" data-act="setrole" data-k="${kind}">
      <option value="">${kind === 'captain' ? '未任命' : `自動（${auto ? esc(auto.name) : '—'}）`}</option>
      ${ps.map(p => `<option value="${p.id}" ${cur === p.id ? 'selected' : ''}>#${p.num} ${esc(p.name)}・${kind === 'captain' ? '能力 ' + r0(E.caOf(p)) + (p.trait === '領袖' ? '・領袖' : '') : '定位球 ' + r0(p.a.men)}${xi.has(p.id) ? '' : '（替補）'}</option>`).join('')}
    </select></div>`;
  }

  // ---------- recruit ----------
  function vRecruit() {
    const t = me();
    const slotsN = E.TYPES[t.type].slots;
    const offers = S.prospects.filter(p => p.offer);
    const cost = offers.reduce((s, p) => s + E.scholCost(p.schol), 0);
    const closed = S.week > E.RECRUIT_DEADLINE;
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const list = S.prospects.filter(p => ui.posFilter === 'ALL' || p.pos === ui.posFilter)
      .sort((a, b) => (b.offer - a.offer) || (b.know - a.know) || order[a.pos] - order[b.pos]);
    const caTxt = p => { const c = E.caOf(p), f = [0, 10, 5, 0][p.know]; return p.know === 0 ? '??' : f ? `${r0(c - f)}–${r0(c + f)}` : r0(c); };
    return `<section class="card wide">
      <div class="recruit-head">
        <div><div class="card-k">國三球員・招生</div><p class="small muted">${closed ? '今年的招生已經結束，新生會在下一學年 4 月入隊。' : `第 ${E.RECRUIT_DEADLINE} 週（3 月）各校公布錄取名單。觀察讓報告更準確，親訪提高對方的興趣。球探只在每個月的第一週出動，每月 4 點，用不完不會累積。`}</p></div>
        <div class="stat-row tight">
          <div><b class="num">${S.scoutPts}</b><span class="muted small">${E.firstWeekOfMonth(S.week) ? '本月球探點數' : `下次出動：${E.nextScoutWeek(S.week) ? E.monthOf(E.nextScoutWeek(S.week)) + '第一週' : '—'}`}</span></div>
          <div><b class="num">${offers.length}/${slotsN}</b><span class="muted small">推薦名額</span></div>
          <div><b class="num">${cost}</b><span class="muted small">獎學金（萬，預算 ${t.budget}）</span></div>
        </div>
      </div>
      <div class="seg">${['ALL', 'GK', 'DF', 'MF', 'FW'].map(k => `<button class="${ui.posFilter === k ? 'on' : ''}" data-act="pf" data-k="${k}">${k === 'ALL' ? '全部' : k}</button>`).join('')}</div>
      <div class="scroll-x"><table class="tbl pros">
        <thead><tr><th>姓名</th><th>位置</th><th>國中</th><th class="r">能力</th><th>潛力</th><th>報告</th><th>對本校興趣</th><th>行動</th><th>入學邀請</th></tr></thead>
        <tbody>${list.map(p => `<tr class="${p.offer ? 'xi' : ''}">
          <td><button class="link" data-act="player" data-id="${p.id}"><b>${esc(p.name)}</b></button></td><td><span class="pos ${p.pos}">${p.pos}</span></td><td class="small">${esc(p.from)}</td>
          <td class="r num">${caTxt(p)}</td><td class="stars">${p.know >= 2 ? starStr(E.stars(p.pa)) : '？'}</td>
          <td><span class="know">${[0, 1, 2].map(i => `<i class="${p.know > i ? 'on' : ''}"></i>`).join('')}</span></td>
          <td>${bar(p.interest, 100, p.interest >= 60 ? 'good' : p.interest >= 35 ? 'warn' : 'bad')}</td>
          <td><div class="acts">${closed ? '' : `<button class="btn sm" data-act="watch" data-id="${p.id}" ${p.know >= 3 || S.scoutPts < 1 ? 'disabled' : ''}>觀察 1</button><button class="btn sm" data-act="visit" data-id="${p.id}" ${S.scoutPts < 2 || p.visitedWeek === S.week ? 'disabled' : ''}>親訪 2</button>`}</div></td>
          <td><div class="acts">${closed ? (p.offer ? '已邀請' : '') : `<select id="schol-${p.id}" data-act="schol" data-id="${p.id}" aria-label="獎學金"><option value="0" ${p.schol === 0 ? 'selected' : ''}>無獎學金</option><option value="1" ${p.schol === 1 ? 'selected' : ''}>半額 30萬</option><option value="2" ${p.schol === 2 ? 'selected' : ''}>全額 60萬</option></select><button class="btn sm ${p.offer ? 'primary' : ''}" data-act="offer" data-id="${p.id}">${p.offer ? '已邀請' : '邀請'}</button>`}</div></td>
        </tr>`).join('')}</tbody></table></div>
    </section>`;
  }
  function vRecruitResult() {
    const r = S.recruitResult;
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="招生結果"><div class="sheet">
      <h3 class="display h3">招生放榜</h3>
      ${r.signed.length ? `<p>確定入學（下一學年 4 月入隊）：</p><ul class="plain">${r.signed.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p>今年沒有球員選擇本校。下學年會從一般生的入社測驗補人。</p>'}
      ${r.lost.length ? `<p class="small muted">選擇他校：${r.lost.map(esc).join('、')}</p>` : ''}
      <button class="btn primary" data-act="recruitok">知道了</button>
    </div></div>`;
  }

  // ---------- fixtures & table ----------
  function bracket(key) {
    const C = E.CUPS[key], cup = S.cups && S.cups[key];
    if (!cup) return `<p class="muted small">第 ${C.draw} 週（${E.monthOf(C.draw)}）依三級聯賽的排名排出 1–32 號種子，1 號對 32 號，強隊在後段才會相遇。賽程：${C.weeks.map(w => E.monthOf(w)).filter((m, i, a) => a.indexOf(m) === i).join('、')}。</p>`;
    return `<div class="scroll-x"><div class="bracket">${cup.rounds.map((r, i) => `<div class="b-col"><div class="b-h">${E.CUP_ROUNDS[i]}・${E.monthOf(C.weeks[i])}</div>${r.map(m => `<div class="b-m ${m.h === S.me || m.a === S.me ? 'mine' : ''}">${[['h', 'hs'], ['a', 'as']].map(([k, s]) => `<div class="b-t ${m.w === m[k] ? 'win' : ''}">${tname(T(m[k]))}<span class="num">${m[s] ?? ''}${m.pk && m.w === m[k] ? '*' : ''}</span></div>`).join('')}</div>`).join('')}</div>`).join('')}</div></div>`;
  }
  function vFixtures() {
    const rows = [];
    for (let w = 1; w <= E.SEASON_LEN; w++) {
      const f = (S.fixtures[w] || []).find(x => x.h === S.me || x.a === S.me);
      if (f) { rows.push([w, f]); continue; }
      const C = Object.values(E.CUPS).find(c => c.weeks.includes(w));
      if (C && !(S.cups && S.cups[C.key])) rows.push([w, { tbd: true, comp: C.name, cupRound: C.weeks.indexOf(w) }]);
    }
    const label = f => f.cup || f.tbd ? `<span class="comp ${f.comp === '夏季大會' ? 'ih' : 'wc'}">${f.comp}</span> ${E.CUP_ROUNDS[f.cupRound]}` : `<span class="comp lg">聯賽</span> 第 ${f.round} 輪`;
    return `<div class="grid-two">
      <section class="card">
        <div class="card-k">本季賽程</div>
        <div class="scroll-x"><table class="tbl"><thead><tr><th>週</th><th>月</th><th>賽事</th><th>對手</th><th class="r">比分</th></tr></thead>
        <tbody>${rows.map(([w, f]) => { if (f.tbd) return `<tr class="${w === S.week ? 'now' : ''}"><td class="num">${w}</td><td>${E.monthOf(w)}</td><td class="small">${label(f)}</td><td class="muted small">抽籤後公布</td><td class="r num">—</td></tr>`;
          const home = f.h === S.me, opp = T(home ? f.a : f.h); const done = f.hs != null; const gf = home ? f.hs : f.as, ga = home ? f.as : f.hs;
          const res = !done ? '' : gf > ga || (f.pk && (home ? f.pk[0] > f.pk[1] : f.pk[1] > f.pk[0])) ? 'w' : gf < ga || f.pk ? 'l' : 'd';
          return `<tr class="${w === S.week ? 'now' : ''}"><td class="num">${w}</td><td>${E.monthOf(w)}</td><td class="small">${label(f)}</td><td>${home ? '' : '@ '}${tname(opp)}</td><td class="r num">${done ? `<span class="res ${res}">${gf}:${ga}${f.pk ? '*' : ''}</span>` : '—'}</td></tr>`; }).join('')}</tbody></table></div>
        <p class="muted small">高校聯賽全年進行；兩大盃賽期間聯賽暫停或隔週進行。* 為 PK 大戰。</p>
      </section>
      <div class="stack">
        <section class="card"><div class="card-k">${E.CUPS.ih.full}・5–6 月</div>${bracket('ih')}</section>
        <section class="card"><div class="card-k">${E.CUPS.wc.full}・9–11 月</div>${bracket('wc')}</section>
      </div>
      ${S.history.length ? `<section class="card wide"><div class="card-k">歷年成績</div><div class="scroll-x"><table class="tbl"><thead><tr><th>學年</th><th>聯賽</th><th>夏季大會</th><th>高校選手權</th><th>超級聯賽冠軍</th><th>夏季大會冠軍</th><th>高校選手權冠軍</th></tr></thead><tbody>${S.history.map(h => `<tr><td>第 ${h.year} 年</td><td>${E.divName(h.div)} 第 ${h.pos} 名</td><td>${esc(h.ih || '—')}</td><td>${esc(h.cup)}</td><td>${esc(h.champA)}</td><td>${esc(h.champIH || '—')}</td><td>${esc(h.champCup)}</td></tr>`).join('')}</tbody></table></div></section>` : ''}
    </div>`;
  }
  function vTable() {
    const one = div => {
      const D = E.DIVS[div], rows = E.standings(div), n = rows.length;
      const canUp = div !== 'S', canDown = div !== 'R';
      const above = E.DIV_ORDER[E.DIV_ORDER.indexOf(div) - 1], below = E.DIV_ORDER[E.DIV_ORDER.indexOf(div) + 1];
      return `<section class="card ${div === me().div ? 'mine-div' : ''}"><div class="card-k">${D.name}・${D.size} 隊・主客雙循環 ${(D.size - 1) * 2} 輪</div><div class="scroll-x"><table class="tbl standings">
        <thead><tr><th>#</th><th>學校</th><th class="r">賽</th><th class="r">勝</th><th class="r">和</th><th class="r">負</th><th class="r">得失</th><th class="r">積分</th><th>近況</th></tr></thead>
        <tbody>${rows.map((r, i) => `<tr class="${r.t.id === S.me ? 'mine' : ''} ${canDown && i >= n - 2 ? 'zone-down' : ''} ${canUp && i < 2 ? 'zone-up' : ''}"><td class="num">${i + 1}</td><td>${tname(r.t)}</td><td class="r num">${r.p}</td><td class="r num">${r.w}</td><td class="r num">${r.d}</td><td class="r num">${r.l}</td><td class="r num">${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td class="r num"><b>${r.pts}</b></td><td><span class="form">${r.form.slice(-5).map(f => `<i class="${f}"></i>`).join('')}</span></td></tr>`).join('')}</tbody></table></div>
        <p class="muted small">${[canUp ? `前 2 名升上${E.divName(above)}` : '', canDown ? `最後 2 名降入${E.divName(below)}` : ''].filter(Boolean).join('；')}。</p></section>`;
    };
    const mineDiv = me().div;
    return `<div class="stack">${E.DIV_ORDER.map(one).join('')}</div>`;
  }


  // ---------- event & season modals ----------
  function vEvent() {
    const e = S.event;
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(e.title)}"><div class="sheet event">
      <div class="card-k">${E.monthOf(S.week)}・校園事件</div>
      <h3 class="display h3">${esc(e.title)}</h3>
      <p>${esc(e.text)}</p>
      <div class="choices">${e.choices.map(c => `<button class="choice" data-act="choose" data-k="${c.k}"><b>${esc(c.label)}</b><span class="small muted">${esc(c.hint)}</span></button>`).join('')}</div>
    </div></div>`;
  }
  function vSeason() {
    const s = S.seasonSummary;
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="學年總結"><div class="sheet wide-sheet">
      <div class="card-k">第 ${s.year} 學年・總結</div>
      <h3 class="display h3">${E.divName(s.div)}第 ${s.pos} 名</h3>
      <p class="small">夏季大會：${esc(s.ih || '—')}　｜　高校選手權：${esc(s.cup)}</p>
      <p class="small">${s.div !== 'S' && s.pos <= 2 ? `升上${E.divName(E.DIV_ORDER[E.DIV_ORDER.indexOf(s.div) - 1])}！` : s.div !== 'R' && s.pos > E.DIVS[s.div].size - 2 ? `這一季要降到${E.divName(E.DIV_ORDER[E.DIV_ORDER.indexOf(s.div) + 1])}了。` : '明年繼續努力。'}</p>
      <div class="ceremony">
        <div class="cer-h"><span class="display">畢業典禮</span><span class="muted small">三月，校園裡的櫻花開了。今年有 ${s.grads.length} 名三年級從足球部畢業。</span></div>
        <div class="grad-grid">${s.grads.map(g => `<article class="grad">
          <div class="grad-top"><span class="pos ${g.pos}">${g.pos}</span><b class="grad-name">${esc(g.name)}</b><span class="muted small">#${g.num}${g.captain ? '・隊長' : ''}${g.trait ? '・' + g.trait : ''}</span></div>
          <div class="grad-stats"><div><b class="num">${g.apps}</b><span>出賽</span></div><div><b class="num">${g.goals}</b><span>進球</span></div><div><b class="num">${g.assists}</b><span>助攻</span></div><div><b class="num">${g.rating ? g.rating.toFixed(2) : '—'}</b><span>平均評分</span></div><div><b class="num">${g.start}→${g.ca}</b><span>能力 <span class="up">+${g.ca - g.start}</span></span></div></div>
          <div class="grad-path ${g.path}"><span class="path-tag">${esc(g.pathLabel)}</span><span>${esc(g.detail)}</span></div>
        </article>`).join('')}</div>
      </div>
      <p class="small">新生入隊：${s.signed.length ? s.signed.map(esc).join('、') : '沒有招到推薦生'}，其餘名額由入社測驗補足。</p>
      <button class="btn primary big" data-act="nextseason">進入第 ${s.year + 1} 學年</button>
    </div></div>`;
  }
  const STAT_ROWS = [
    ['射門次數', s => s.shots, 1], ['射正次數', s => s.sot, 1], ['頭球攻門', s => s.heads || 0, 1], ['控球率', s => Math.round(s.poss / 18 * 100), 1, '%'],
    ['傳球數', s => s.passes || 0, 1], ['傳球成功率', s => s.passes ? Math.round(s.passOk / s.passes * 100) : 0, 1, '%'],
    ['犯規次數', s => s.fouls || 0, -1], ['黃牌數', s => s.yc || 0, -1], ['紅牌數', s => s.red || 0, -1],
    ['越位次數', s => s.offsides || 0, -1], ['角球次數', s => s.corners || 0, 1],
  ];
  function statsTable(h, a) {
    // possession must add to 100
    const ph = Math.round(h.poss / 18 * 100);
    const val = (row, s, other) => row[0] === '控球率' ? (s === h ? ph : 100 - ph) : row[1](s);
    return `<div class="stat-card">
      <div class="stat-row stat-head"><span>${chip(T(h.id))}</span><span>隊伍統計資料</span><span>${chip(T(a.id))}</span></div>
      ${STAT_ROWS.map(row => { const x = val(row, h), y = val(row, a), better = x === y ? 0 : (x > y ? 1 : -1) * row[2], u = row[3] || '';
        return `<div class="stat-row"><span><b class="pill ${better > 0 ? 'l' : ''} num">${x}${u}</b></span><span>${row[0]}</span><span><b class="pill ${better < 0 ? 'r' : ''} num">${y}${u}</b></span></div>`; }).join('')}
    </div>`;
  }
  function rankBadge(before, after) {
    if (!before || !after) return '';
    const cls = after < before ? 'up' : after > before ? 'down' : 'same';
    return `<span class="rank ${cls}">${after < before ? '↑' : after > before ? '↓' : '–'} 第${after}</span>`;
  }
  function vReport() {
    const L = S.lastMatch; const [h, a] = L.sides; const mine = h.id === S.me ? h : a;
    const tab = ui.reportTab || 'stats';
    const pn = id => S.players[id] ? esc(S.players[id].name) : '（已畢業）';
    const scorers = s => s.scorers.map(g => `<li>${pn(g.id)} ${E.minLabel(g.min)}'</li>`).join('');
    const comp = L.fx.cup ? `${L.fx.comp}・地區預選 ${E.CUP_ROUNDS[L.fx.cupRound]}` : `${L.fx.comp}・第 ${L.fx.round} 輪`;
    const lineup = s => {
      const g = {}, as = {}; s.scorers.forEach(x => { g[x.id] = (g[x.id] || 0) + 1; if (x.ast) as[x.ast] = (as[x.ast] || 0) + 1; });
      const cardOf = id => s.cards.filter(c => c.id === id).map(c => `<i class="card-ic ${c.type === 'y' ? 'y' : 'r'}" title="${c.type === 'y' ? '黃牌' : c.type === 'y2' ? '兩黃變一紅' : '紅牌'} ${E.minLabel(c.min)}'"></i>`).join('');
      const subIn = id => s.subsLog.find(x => x.in === id), subOut = id => s.subsLog.find(x => x.out === id);
      const row = (id, pos) => { const p = S.players[id]; const r = s.ratings[id]; const o = subOut(id), n = subIn(id);
        return `<li><span class="num muted">${p ? p.num : ''}</span><span class="pos ${pos}">${pos}</span><span class="ln">${pn(id)}${L.mvp === id ? ' <span class="mvp">MVP</span>' : ''}${g[id] ? ` <span class="ev">⚽${g[id] > 1 ? '×' + g[id] : ''}</span>` : ''}${as[id] ? ` <span class="ev ast">助${as[id] > 1 ? '×' + as[id] : ''}</span>` : ''}${cardOf(id)}${o ? ` <span class="ev out">↓${E.minLabel(o.min)}'</span>` : ''}${n ? ` <span class="ev in">↑${E.minLabel(n.min)}'</span>` : ''}</span><b class="num rt ${r >= 7.5 ? 'hi' : r < 6 ? 'lo' : ''}">${r != null ? r.toFixed(1) : '—'}</b></li>`; };
      const starters = s.start.map((id, i) => row(id, s.startPos[i])).join('');
      const subs = s.subsLog.map(x => row(x.in, S.players[x.in] ? S.players[x.in].pos : '')).join('');
      return `<div class="lu"><div class="lu-h">${tname(T(s.id))}<span class="muted small">${esc(s.form || '')}・${esc(s.style || '')}</span></div><ul class="lu-list">${starters}</ul>${subs ? `<div class="lu-sub muted small">替補上場</div><ul class="lu-list">${subs}</ul>` : ''}</div>`;
    };
    // key events only: kick-off, goals, cards, substitutions, half-time and full-time
    const mv = x => x > 45 && x < 46 ? 45 + (x - 45) : x;
    const evs = [];
    [h, a].forEach((s, si) => {
      s.scorers.forEach(g => evs.push({ min: g.min, si, ic: '⚽', cls: 'goal', t: `${pn(g.id)}${g.ast ? `<span class="muted small">（助攻 ${pn(g.ast)}）</span>` : ''}` }));
      s.cards.forEach(c => evs.push({ min: c.min, si, ic: `<i class="card-ic ${c.type === 'y' ? 'y' : 'r'}"></i>`, cls: 'bk', t: `${pn(c.id)}${c.type === 'y2' ? '<span class="muted small">（兩黃變一紅）</span>' : c.type === 'r' ? '<span class="muted small">（紅牌）</span>' : ''}` }));
      s.subsLog.forEach(x => evs.push({ min: x.min, si, ic: '⇄', cls: 'sub', t: `<span class="ev in">↑</span>${pn(x.in)} <span class="ev out">↓</span>${pn(x.out)}` }));
    });
    evs.sort((x, y) => mv(x.min) - mv(y.min) || (x.cls === 'goal') - (y.cls === 'goal'));
    // running score after each goal, and the half-time score
    let sc = [0, 0];
    evs.forEach(x => { if (x.cls === 'goal') { sc[x.si]++; x.sc = sc.slice(); } });
    const ht = [h, a].map(s => s.scorers.filter(g => mv(g.min) <= 45.5).length);
    const evLi = x => `<li class="kev ${x.si ? 'away' : 'home'} ${x.cls}"><span class="kev-m num">${E.minLabel(x.min)}'</span><span class="kev-ic">${x.ic}</span><span class="kev-t">${x.t}${x.sc ? ` <b class="num kev-sc">${x.sc[0]}-${x.sc[1]}</b>` : ''}</span></li>`;
    const mark = (label, s) => `<li class="kev mark"><span>${label}</span>${s != null ? `<b class="num">${s}</b>` : ''}</li>`;
    const timeline = `<ol class="kev-list">${mark('開賽')}${evs.filter(x => mv(x.min) <= 45.5).map(evLi).join('')}${mark('中場', `${ht[0]}-${ht[1]}`)}${evs.filter(x => mv(x.min) > 45.5).map(evLi).join('')}${mark('終場', `${h.goals}-${a.goals}`)}${L.pk ? mark('PK 大戰', `${L.pk[0]}-${L.pk[1]}`) : ''}</ol>`;
    return `<div class="modal" role="dialog" aria-modal="true" aria-label="賽後報告"><div class="sheet report">
      <button class="x" data-act="closereport" aria-label="關閉">×</button>
      <div class="rp-k">${esc(comp)}${L.rival ? '・宿敵戰' : ''}</div>
      <div class="rp-head">
        <div class="rp-team">${chip(T(h.id))}<b>${esc(T(h.id).short)}</b>${rankBadge(L.rankBefore && L.rankBefore[0], L.rankAfter && L.rankAfter[0])}</div>
        <div class="rp-score num">${h.goals}<span>-</span>${a.goals}${L.pk ? `<small>PK ${L.pk[0]}-${L.pk[1]}</small>` : ''}</div>
        <div class="rp-team">${chip(T(a.id))}<b>${esc(T(a.id).short)}</b>${rankBadge(L.rankBefore && L.rankBefore[1], L.rankAfter && L.rankAfter[1])}</div>
      </div>
      ${h.scorers.length || a.scorers.length ? `<div class="rp-goals"><ul>${scorers(h)}</ul><span class="ball" aria-hidden="true">⚽</span><ul class="r">${scorers(a)}</ul></div>` : ''}
      <div class="rtabs" role="tablist">${[['feed', '賽況'], ['lineup', '陣容'], ['stats', '數據']].map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" class="${tab === k ? 'on' : ''}" data-act="rtab" data-k="${k}">${l}</button>`).join('')}</div>
      <div class="rp-body">
        ${tab === 'stats' ? statsTable(h, a) : tab === 'lineup' ? `<div class="lu-grid">${lineup(h)}${lineup(a)}</div>` :
          timeline}
      </div>
      <div class="rp-foot"><button class="btn primary" data-act="closereport">返回</button></div>
    </div></div>`;
  }

  // ---------- live match ----------
  function renderMatch() {
    const m = S.live; if (!m) return;
    const [H, A] = m.sides; const mine = H.t.id === S.me ? H : A;
    // what the viewer has seen so far: the commentary is typed out line by line and the board follows it
    const drained = ui.shown >= m.feed.length && ui.typed < 0;
    const seen = m.feed.slice(0, ui.shown);
    const lastSc = [...seen].reverse().find(f => f.sc), sc = lastSc ? lastSc.sc : [0, 0];
    const lastMin = [...seen].reverse().find(f => f.min), clockMin = drained ? m.min : lastMin ? lastMin.min : 0;
    const lastSeen = seen[seen.length - 1];
    const clockTxt = m.done && drained ? '終場' : lastSeen && lastSeen.kind === 'half' && /上半場結束|中場休息/.test(lastSeen.text) ? '中場' : (E.minLabel(clockMin) || '0') + "'";
    const pct = Math.min(100, (clockMin > 45 && clockMin < 46 ? 45 : clockMin) / 90 * 100);
    $('#app').style.setProperty('--h', mine.t.hue);
    const typingLine = ui.typed >= 0 ? m.feed[ui.shown] : null;
    $('#app').innerHTML = `<section class="match" style="--h:${mine.t.hue}">
      <header class="board">
        <div class="board-k">${m.cup ? esc(m.fx.comp) + '・地區預選 ' + E.CUP_ROUNDS[m.fx.cupRound] : esc(m.fx.comp) + '・第 ' + m.fx.round + ' 輪'}${m.rival ? '・宿敵戰' : ''}</div>
        <div class="board-score"><div class="bs">${chip(H.t)}<span>${esc(H.t.short)}</span></div><div class="bs-num num">${sc[0]}<span>:</span>${sc[1]}</div><div class="bs right"><span>${esc(A.t.short)}</span>${chip(A.t)}</div></div>
        <div class="clock"><span class="num">${clockTxt}</span><span class="track"><i style="width:${pct}%"></i><b style="left:50%"></b></span></div>
      </header>
      <div class="match-body">
        <div class="match-left">${!m.done && (!ui.kicked || ui.paused) ? planBoard(m, mine) : ''}${!ui.kicked ? preMatch(m) : `<ol class="feed" id="live-feed">${seen.map(f => feedLi(f)).join('')}${typingLine ? feedLi(typingLine, true) : ''}</ol>`}</div>
        <aside class="cmd">
          ${m.done && drained ? matchDone(m, mine) : commandPanel(m, mine)}
        </aside>
      </div>
    </section>`;
    scrollFeed();
  }
  // starting line-ups shown before kick-off
  function preMatch(m) {
    const col = s => {
      const isMe = s.t.id === S.me;
      const row = (id, pos) => { const p = S.players[id]; return `<li><span class="num muted">${p.num}</span><span class="pos ${pos}">${pos}</span><span class="ln"><span class="tipname" data-tip="${p.id}" data-pos="${pos}">${esc(p.name)}</span>${isMe ? capBadge(p) + instBadge(p) : ''}${pos !== p.pos ? ' <span class="tag bad">非本職</span>' : ''}</span>${formBadge(p, false)}<b class="num">${r0(E.posRating(p, pos))}</b></li>`; };
      const ca = s.on.reduce((x, id, i) => x + E.posRating(S.players[id], s.pos[i]), 0) / s.on.length;
      return `<div class="lu">
        <div class="lu-h"><span class="lu-t">${tname(s.t)}</span><span class="lu-kits">${kitThumb(s.t, s === m.sides[0] ? 'home' : 'away')}${kitThumb(s.t, 'gk')}</span><span class="muted small">${esc(s.form)}・${esc(s.style)}</span></div>
        <div class="lu-meta small muted">先發平均能力 <b class="num">${r0(ca)}</b></div>
        <ul class="lu-list pre">${s.on.map((id, i) => row(id, s.pos[i])).join('')}</ul>
        <div class="lu-sub muted small">替補</div>
        <ul class="lu-list pre">${s.bench.map(id => row(id, S.players[id].pos)).join('') || '<li class="muted small">無</li>'}</ul>
      </div>`;
    };
    return `<section class="prematch"><div class="pm-h"><b>先發名單</b><span class="muted small">按「開始比賽」開球；開賽前可在上方戰術板調整先發、位置與趨向</span></div><div class="lu-grid">${col(m.sides[0])}${col(m.sides[1])}</div></section>`;
  }
  function scrollFeed() { const f = document.getElementById('live-feed'); if (f) f.scrollTop = f.scrollHeight; }
  // ---------- in-match planning board: changes are drafted here and only applied on 確定 ----------
  const plan = mine => ui.plan || (ui.plan = { on: mine.on.slice(), style: mine.style, inst: Object.assign({}, mine.t.inst || {}) });
  const planIns = (m, mine) => m.seg === 0 ? [] : plan(mine).on.filter(id => !mine.on.includes(id));
  const planDirty = mine => { if (!ui.plan) return false; const P = ui.plan, cur = mine.t.inst || {};
    return P.style !== mine.style || P.on.some((id, i) => id !== mine.on[i]) || Object.keys({ ...P.inst, ...cur }).some(k => (P.inst[k] || '') !== (cur[k] || '')); };
  function planBoard(m, mine) {
    const P = plan(mine), pre = m.seg === 0;
    const rows = { FW: [], MF: [], DF: [], GK: [] };
    mine.pos.forEach((pos, i) => rows[pos].push(i));
    const ins = planIns(m, mine), over = ins.length > mine.subs;
    const ib = id => P.inst[id] === 'att' ? '<span class="ins att">攻</span>' : P.inst[id] === 'def' ? '<span class="ins def">守</span>' : '';
    const slotHtml = i => { const p = S.players[P.on[i]], pos = mine.pos[i], isNew = !pre && !mine.on.includes(p.id), moved = !isNew && mine.on[i] !== p.id;
      return `<button class="slot ${ui.slot === i ? 'on' : ''} ${p.pos !== pos ? 'off' : ''} ${isNew ? 'new' : ''} ${mine.needSub === p.id ? 'hurt' : ''}" data-act="pslot" data-i="${i}"><span class="slot-num num">${p.num}</span><span class="slot-name">${capBadge(p)}<span class="tipname" data-tip="${p.id}" data-pos="${pos}">${esc(p.name)}</span>${ib(p.id)}</span><span class="slot-meta"><span class="pos ${pos}">${pos}</span> <b class="num">${r0(E.posRating(p, pos))}</b> ${isNew ? '<span class="tag good">換上</span>' : moved ? '<span class="tag">換位</span>' : mine.needSub === p.id ? '<span class="tag bad">受傷</span>' : formBadge(p, false)}</span>${bar(p.cond, 100, condCls(p.cond))}</button>`; };
    const pool = [...mine.on, ...mine.bench].filter(id => !P.on.includes(id));
    const selPos = ui.slot != null ? mine.pos[ui.slot] : null;
    const sel = ui.slot != null ? S.players[P.on[ui.slot]] : null;
    return `<section class="card planboard">
      <div class="row-between"><div class="card-k">戰術板${pre ? '・先發調整' : ''}</div><span class="small ${over ? 'bad-ink' : 'muted'}">${pre ? '開賽前調整不佔換人名額' : `規劃換人 ${ins.length}・剩餘名額 ${mine.subs}`}</span></div>
      <div class="plan-grid">
        <div class="pitch" aria-label="場上陣型">${['FW', 'MF', 'DF', 'GK'].map(pos => rows[pos].length ? `<div class="prow">${rows[pos].map(slotHtml).join('')}</div>` : '').join('')}</div>
        <div class="plan-bench"><div class="card-k">${pre ? '替補' : '可換上的球員'}</div>
          <ul class="bench">${pool.map(id => { const p = S.players[id], off = mine.on.includes(id); return `<li><button class="benchp" data-act="pbench" data-id="${id}"><span class="pos ${p.pos}">${p.pos}</span><span class="b-name"><span class="tipname" data-tip="${id}" data-pos="${selPos || p.pos}">${esc(p.name)}</span> ${off && !pre ? '<span class="tag">將換下</span>' : formBadge(p, false)}</span><b class="num">${r0(selPos ? E.posRating(p, selPos) : E.caOf(p))}</b>${bar(p.cond, 100, condCls(p.cond))}</button></li>`; }).join('') || '<li class="muted small">沒有可用的替補</li>'}</ul>
        </div>
      </div>
      ${sel && mine.pos[ui.slot] !== 'GK' ? `<div class="inst-row"><span><b>${esc(sel.name)}</b> 的趨向</span><div class="seg">${Object.entries(E.INSTS).map(([k, l]) => `<button class="${(P.inst[sel.id] || '') === k ? 'on' : ''}" data-act="pinst" data-id="${sel.id}" data-k="${k}">${l}</button>`).join('')}</div></div>` : ''}
      <p class="muted small">${ui.slot != null ? `已選 ${selPos} 位置：點右側球員換上，或點另一個場上位置互換。` : '點場上位置，再點右側球員換人，或點另一個位置互換。所有調整都只是規劃，按「確定」後才生效，反覆調整不會消耗換人名額。'}</p>
      ${over ? `<p class="small bad-ink">規劃的換人超過剩餘名額（${mine.subs}），請減少換人。</p>` : ''}
    </section>`;
  }
  function applyPlan(m, s) {
    const P = ui.plan; if (!P) return true;
    const outs = s.on.filter(id => !P.on.includes(id)), ins = P.on.filter(id => !s.on.includes(id));
    if (m.seg === 0) { s.bench = s.bench.filter(id => !ins.includes(id)).concat(outs); s.on = P.on.slice(); s.start = s.on.slice(); s.used = new Set(s.on); }
    else { if (ins.length > s.subs) return false; outs.forEach((o, k) => E.doSub(m, s, o, ins[k])); s.on = P.on.slice(); }
    s.style = P.style;
    const cur = s.t.inst || {};
    for (const k of new Set([...Object.keys(P.inst), ...Object.keys(cur)])) if ((P.inst[k] || '') !== (cur[k] || '')) E.setInst(k, P.inst[k] || '');
    s.needSub = null; ui.plan = null; ui.slot = null; return true;
  }
  function commandPanel(m, mine) {
    const paused = ui.paused || !ui.kicked, pre = !ui.kicked;
    const P = paused ? plan(mine) : null, dirty = planDirty(mine);
    const over = paused && planIns(m, mine).length > mine.subs;
    const out = mine.on.map((id, i) => ({ p: S.players[id], pos: mine.pos[i] }));
    return `<div class="ctl">
        ${paused ? `<button class="btn primary" data-act="mplay" ${over ? 'disabled' : ''}>${pre ? (dirty ? '確定陣容並開賽' : '開始比賽') : dirty ? '確定並繼續比賽' : '繼續比賽'}</button>${dirty ? '<button class="btn ghost sm" data-act="preset">還原規劃</button>' : ''}`
               : '<button class="btn primary" data-act="mplay">暫停指揮</button>'}
      </div>
      ${mine.needSub ? `<p class="tag bad block">${esc(S.players[mine.needSub].name)} 受傷，請在戰術板上換人</p>` : ''}
      ${paused ? `<div class="card-k">戰術風格</div>
        <div class="seg wrap">${E.STYLES.map(s => `<button class="${P.style === s ? 'on' : ''}" data-act="pstyle" data-k="${s}">${s}</button>`).join('')}</div>
        <p class="small muted">${E.STYLE_DESC[P.style]}</p>
        <p class="small muted">${pre ? '開賽前可在戰術板上調整先發、位置與趨向。' : `換人名額剩 ${mine.subs} 次。在戰術板上規劃換人、換位與趨向，按「確定」才會生效。`}</p>`
      : `<div class="card-k">戰術風格</div><p class="small"><b>${mine.style}</b>：<span class="muted">${E.STYLE_DESC[mine.style]}</span></p>
        <p class="small muted">想換人或調整戰術，請先按「暫停指揮」。換人名額剩 ${mine.subs} 次。</p>
        <div class="card-k">場上球員・體力</div>
        <ul class="plain tight onfield">${out.map(({ p, pos }) => `<li><span><span class="pos ${pos}">${pos}</span> ${esc(p.name)} ${formBadge(p, false)}</span><span class="mi">${bar(p.cond, 100, condCls(p.cond))}</span></li>`).join('')}</ul>`}`;
  }
  function matchDone(m, mine) {
    const other = m.sides[1 - m.sides.indexOf(mine)];
    const win = mine.goals > other.goals || (m.pk && (mine === m.sides[0] ? m.pk[0] > m.pk[1] : m.pk[1] > m.pk[0]));
    const draw = mine.goals === other.goals && !m.pk;
    return `<div class="done ${win ? 'w' : draw ? 'd' : 'l'}"><div class="display done-h">${win ? '勝利！' : draw ? '握手言和' : '飲恨落敗'}</div>
      ${statsTable(m.sides[0].t ? { ...m.sides[0], id: m.sides[0].t.id } : m.sides[0], m.sides[1].t ? { ...m.sides[1], id: m.sides[1].t.id } : m.sides[1])}
      <button class="btn primary big" data-act="mend">返回球隊</button></div>`;
  }
  // live match loop (every 40 ms): type the next commentary character; when everything is shown, play the next five minutes
  const TYPE_MS = 55;
  function tick() {
    const m = S.live; if (!m) return stopTimer();
    if (!ui.kicked || ui.paused) return;
    const fast = window.__hsfcFast, now = Date.now();
    if (ui.typed >= 0) {
      const f = m.feed[ui.shown];
      ui.typed += fast ? 1e4 : 1;
      if (ui.typed >= f.text.length) {
        ui.typed = -1; ui.shown++;
        ui.holdUntil = fast ? 0 : now + (f.kind === 'goal' ? 1800 : f.kind === 'red' || f.kind === 'card' ? 1100 : 800);
        renderMatch();
      } else { const el = document.getElementById('typing-text'); if (el) { el.textContent = f.text.slice(0, ui.typed); scrollFeed(); } }
      return;
    }
    if (now < ui.holdUntil) return;
    if (ui.shown < m.feed.length) { ui.typed = 0; renderMatch(); return; }
    if (ui.pendingPause) { ui.pendingPause = false; ui.paused = true; renderMatch(); return; }
    if (m.done) { if (!ui.doneShown) { ui.doneShown = true; renderMatch(); } return; }
    if (now < ui.nextStep) return;
    E.step(m, true);
    const mine = m.sides.find(s => s.t.id === S.me);
    if (m.seg === 9 || mine.needSub) ui.pendingPause = true;
    ui.nextStep = fast ? 0 : now + 1200;
    if (ui.shown >= m.feed.length) renderMatch();
  }
  function startTimer() { stopTimer(); ui.timer = setInterval(tick, TYPE_MS); }
  function stopTimer() { if (ui.timer) clearInterval(ui.timer); ui.timer = null; }

  function startGame() {
    const inp = document.getElementById('coach-name');
    const name = (inp ? inp.value : '').trim().slice(0, 12);
    if (!name) { const err = document.getElementById('coach-err'); if (err) err.hidden = false; if (inp) inp.focus(); return; }
    S = E.newGame((Date.now() & 0xffffff) | 1, undefined, name); ui.tab = 'home'; ui.kitDraft = null; ui.coachDraft = ''; save(); render();
  }
  document.addEventListener('submit', e => { if (e.target.id === 'coach-form') { e.preventDefault(); startGame(); } });
  document.addEventListener('input', e => { if (e.target.id === 'coach-name') { ui.coachDraft = e.target.value; const err = document.getElementById('coach-err'); if (err) err.hidden = true; } });
  // ---------- actions ----------
  function act(a, el) {
    const d = el.dataset;
    switch (a) {
      case 'begin': startGame(); return;
      case 'resume': S = loadSave(); if (!S) return renderStart(); E.setState(S); ui.tab = 'home'; ui.kitDraft = null; render(); return;
      case 'wipe': wipe(); renderStart(); return;
      case 'tab': ui.tab = d.k; ui.slot = null; ui.posFilter = 'ALL'; render(); window.scrollTo(0, 0); return;
      case 'pf': ui.posFilter = d.k; render(); return;
      case 'sort': if (ui.sortKey === d.k) ui.sortDir = -(ui.sortDir || SORTS[d.k].dir); else { ui.sortKey = d.k; ui.sortDir = SORTS[d.k].dir; } saveSort(); render(); return;
      case 'sortdir': { const k = SORTS[ui.sortKey] ? ui.sortKey : 'pos'; ui.sortKey = k; ui.sortDir = -(ui.sortDir || SORTS[k].dir); saveSort(); render(); return; }
      case 'player': ui.sel = d.id; render(); return;
      case 'close': ui.sel = null; render(); return;
      case 'menu': me().train[+d.i] = d.m; save(); render(); return;
      case 'form': me().tactic.form = d.k; me().xi = null; ui.slot = null; save(); render(); return;
      case 'style': me().tactic.style = d.k; save(); render(); return;
      case 'inst': toast(E.setInst(d.id, d.k)); save(); render(); return;
      case 'makecap': toast(E.setRole('captain', isCap(S.players[d.id]) ? null : d.id)); save(); render(); return;
      case 'autoxi': me().xi = E.autoXI(me()); ui.slot = null; save(); render(); return;
      case 'slot': {
        const i = +d.i, t = me();
        if (ui.slot == null) ui.slot = i;
        else if (ui.slot === i) ui.slot = null;
        else { [t.xi[ui.slot], t.xi[i]] = [t.xi[i], t.xi[ui.slot]]; ui.slot = null; save(); }
        render(); return; }
      case 'benchp': {
        if (el.getAttribute('aria-disabled') === 'true' && ui.slot != null) { toast('這位球員目前受傷或禁賽，不能上場。'); return; }
        if (ui.slot == null) { ui.sel = d.id; render(); return; }
        me().xi[ui.slot] = d.id; ui.slot = null; save(); render(); return; }
      case 'watch': case 'visit': toast(E.scout(d.id, a)); save(); render(); return;
      case 'offer': { const p = S.prospects.find(x => x.id === d.id); const sel = document.getElementById('schol-' + d.id); toast(E.setOffer(d.id, !p.offer, sel ? +sel.value : 0)); save(); render(); return; }
      case 'choose': toast(E.resolveEvent(d.k)); save(); render(); return;
      case 'recruitok': S.recruitSeen = true; save(); render(); return;
      case 'report': ui.showReport = true; render(); return;
      case 'rtab': ui.reportTab = d.k; render(); return;
      case 'closereport': ui.showReport = false; render(); return;
      case 'advance': {
        if (S.event) { toast('請先處理校園事件。'); return; }
        if (S.phase === 'season') { ui.showSeason = true; render(); return; }
        const m = E.beginWeek();
        if (m) { ui.paused = true; ui.plan = null; ui.slot = null; ui.kicked = false; ui.shown = 0; ui.typed = -1; ui.holdUntil = 0; ui.nextStep = 0; ui.pendingPause = false; ui.doneShown = false; renderMatch(); startTimer(); window.scrollTo(0, 0); return; }
        save(); render(); return; }
      case 'nextseason': E.nextSeason(); ui.showSeason = false; ui.tab = 'home'; save(); render(); return;
      case 'mplay': { const m = S.live, s = m.sides.find(x => x.t.id === S.me);
        if (ui.paused || !ui.kicked) { if (!applyPlan(m, s)) { toast('規劃的換人超過剩餘名額。'); return; } ui.paused = false; ui.kicked = true; s.needSub = null; }
        else { ui.paused = true; ui.plan = null; ui.slot = null; }
        renderMatch(); return; }
      case 'pslot': { const P = plan(S.live.sides.find(x => x.t.id === S.me)), i = +d.i;
        if (ui.slot == null) ui.slot = i; else if (ui.slot === i) ui.slot = null; else { [P.on[ui.slot], P.on[i]] = [P.on[i], P.on[ui.slot]]; ui.slot = null; }
        renderMatch(); return; }
      case 'pbench': { if (ui.slot == null) { toast('先點選要換下的場上位置。'); return; } const P = plan(S.live.sides.find(x => x.t.id === S.me)); P.on[ui.slot] = d.id; ui.slot = null; renderMatch(); return; }
      case 'pinst': { const P = plan(S.live.sides.find(x => x.t.id === S.me)); if (d.k) P.inst[d.id] = d.k; else delete P.inst[d.id]; renderMatch(); return; }
      case 'pstyle': plan(S.live.sides.find(x => x.t.id === S.me)).style = d.k; renderMatch(); return;
      case 'preset': ui.plan = null; ui.slot = null; renderMatch(); return;
      case 'mend': stopTimer(); E.finishLive(); ui.showReport = true; save(); render(); window.scrollTo(0, 0); return;
    }
  }
  // ability card on hover / click of a player name in the tactics panel
  function tipHtml(p, pos) {
    const keys = E.ATTRS.filter(a => a !== 'gk').map(a => p.pos === 'GK' && a === 'wng' ? 'gk' : a);
    const off = pos && pos !== p.pos;
    return `<div class="tip-h"><span class="pos ${p.pos}">${p.pos}</span><b>${esc(p.name)}</b><span class="muted small">#${p.num}・${gradeLabel(p.grade)}</span></div>
      <div class="tip-kv"><span>能力 <b class="num">${r0(E.caOf(p))}</b></span>${off ? `<span class="neg">擔任 ${pos} <b class="num">${r0(E.posRating(p, pos))}</b>（−20%）</span>` : ''}<span>${formBadge(p)}</span><span>體力 <b class="num">${r0(p.cond)}</b></span></div>
      <div class="tip-attrs">${keys.map(k => `<span>${E.ATTR_LABEL[k]}</span><b class="num">${r0(p.a[k] * (off ? 0.8 : 1))}</b>`).join('')}</div>
      <div class="tip-f small">${p.trait ? `人格 <b>${p.trait}</b>：${esc(E.TRAIT_DESC[p.trait])}` : '人格：無'}${off ? '<br><span class="neg">非本職位置，能力以 80% 計算</span>' : ''}</div>`;
  }
  let tipPinned = null;
  function showTip(el) {
    const p = S && S.players[el.dataset.tip]; const box = $('#tip'); if (!p || !box) return;
    box.innerHTML = tipHtml(p, el.dataset.pos); box.hidden = false;
    const r = el.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
    let x = r.left + r.width / 2 - w / 2, y = r.bottom + 8;
    if (y + h > innerHeight - 8) y = r.top - h - 8;
    x = Math.max(8, Math.min(x, innerWidth - w - 8)); y = Math.max(8, y);
    box.style.left = x + 'px'; box.style.top = y + 'px';
  }
  function hideTip() { const box = $('#tip'); if (box) box.hidden = true; tipPinned = null; }
  document.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (el && !tipPinned) showTip(el); });
  document.addEventListener('mouseout', e => { const el = e.target.closest('[data-tip]'); if (el && !tipPinned && !(e.relatedTarget && el.contains(e.relatedTarget))) $('#tip').hidden = true; });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-tip]');
    if (t) {
      // on the pitch, clicking a name both selects the slot and shows the card; on the bench it only shows the card
      const inSlot = !!t.closest('.slot');
      if (!inSlot) { e.preventDefault(); e.stopPropagation(); }
      const id = t.dataset.tip;
      if (tipPinned === id && !inSlot) hideTip(); else { showTip(t); tipPinned = id; if (inSlot) setTimeout(() => { const n = document.querySelector(`.slot [data-tip="${id}"]`); if (n) showTip(n); }, 0); }
      return;
    }
    if (tipPinned && !e.target.closest('#tip')) hideTip();
  }, true);
  window.addEventListener('scroll', () => { if ($('#tip') && !$('#tip').hidden) hideTip(); }, { passive: true });
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'SELECT') return;
    act(el.dataset.act, el);
  });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.dataset.act === 'sortsel') { ui.sortKey = el.value; ui.sortDir = SORTS[el.value].dir; saveSort(); render(); return; }
    if (el.dataset.act === 'num') { toast(E.setNumber(el.dataset.id, +el.value)); save(); render(); return; }
    if (el.dataset.act === 'setrole') { toast(E.setRole(el.dataset.k, el.value || null)); save(); render(); return; }
    if (el.dataset.act === 'schol') { const p = S.prospects.find(x => x.id === el.dataset.id); if (p && p.offer) { p.schol = +el.value; save(); } }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && (ui.sel || ui.showReport)) { ui.sel = null; ui.showReport = false; render(); } });

  // ---------- boot ----------
  renderStart();
})();
