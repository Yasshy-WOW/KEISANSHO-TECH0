// ② 人材データバンク（事務局）
// タブ1「登録人材全体」：参加大企業すべての登録人材のスコア平均（レーダーチャート）
// タブ2「企業別」：売上と業種（東証の大分類10分類）で企業を選び、その企業の登録人材のスコア平均（レーダーチャート）
// スコアの集計規則は企業ポータル（③ 会社全体）と同じ（common.js の groupStats）
(function () {
  const { D, esc, bind, groupStats, radar } = window.DQX;

  const people = D.people;
  // 企業は業種（大分類の順）→ 売上高の大きい順に並べる
  const ENTS = D.ents.map((e) => Object.assign({}, e, { n: people.filter((p) => p.ent === e.id).length }))
    .sort((a, b) => a.sector - b.sector || b.revenue - a.revenue);
  const ALL = groupStats(people);
  const params = new URLSearchParams(location.search);
  const okBand = (v) => v !== null && D.revenueBands[Number(v)] ? v : 'all';
  const okSector = (v) => v !== null && D.sectors[Number(v)] ? v : 'all';
  // URL の ?tab=ent&band=売上区分の番号&sector=業種の番号 で、選んだ状態を開ける
  const state = { tab: params.get('tab') === 'ent' ? 'ent' : 'all', band: okBand(params.get('band')), sector: okSector(params.get('sector')) };
  function setUrl() {
    if (state.tab !== 'ent') { history.replaceState(null, '', location.pathname); return; }
    const q = new URLSearchParams({ tab: 'ent' });
    if (state.band !== 'all') q.set('band', state.band);
    if (state.sector !== 'all') q.set('sector', state.sector);
    history.replaceState(null, '', '?' + q.toString());
  }

  // 売上（億円）の表示：1兆円以上は「○.○兆円」、それ未満は「○,○○○億円」
  function yen(v) { return v >= 10000 ? (Math.round(v / 1000) / 10) + '兆円' : v.toLocaleString('ja-JP') + '億円'; }
  function inBand(e, b) { const r = D.revenueBands[b]; return e.revenue >= r[1] && (r[2] === null || e.revenue < r[2]); }
  function selected() {
    return ENTS.filter((e) => (state.band === 'all' || inBand(e, Number(state.band))) &&
      (state.sector === 'all' || e.sector === Number(state.sector)));
  }

  function head() {
    const tab = (id, label) => '<button type="button" role="tab" class="tabbtn" id="tab-' + id + '" aria-controls="panel"' +
      ' aria-selected="' + (state.tab === id) + '" tabindex="' + (state.tab === id ? 0 : -1) + '" data-act="tab" data-val="' + id + '">' + label + '</button>';
    return '<div class="stack" style="gap:4px"><h1>人材データバンク</h1></div>' +
      '<div class="tabbar" role="tablist" aria-label="表示の切り替え">' + tab('all', '登録人材全体') + tab('ent', '企業別') + '</div>';
  }

  // 凡例と注記（企業ポータルの会社全体と同じ書き方）
  function legend(cmp) {
    return '<div class="legend">' +
      (cmp ? '<span><svg class="lg" viewBox="0 0 28 12" aria-hidden="true"><line x1="1" y1="6" x2="27" y2="6" class="rd-req"/></svg>登録人材全体の平均（破線）</span>' : '') +
      '<span><svg class="lg" viewBox="0 0 28 12" aria-hidden="true"><line x1="1" y1="6" x2="27" y2="6" class="rd-now"/><circle cx="14" cy="6" r="4" class="rd-now-pt"/></svg>' + (cmp ? '選んだ企業の平均' : '登録人材全体の平均') + '（丸）</span>' +
      '<span class="muted">目盛り：d（内側）〜 a（外側）</span></div>';
  }
  const label = (s) => '平均 ' + s.avgNow.toFixed(1) + '｜最高点 ' + s.nTop + '/' + s.total + '名';

  // ---- タブ1：登録人材全体 ----
  function allPanel() {
    return '<section class="card lg stack" style="gap:12px">' +
      '<div class="between"><h2 style="font-size:18px">登録人材全体のスキル水準</h2></div>' +
      legend(false) +
      '<div class="radar-wrap">' + radar(ALL, null, { label, nowLabel: '登録人材全体の平均', noReq: true }) + '</div>' +
      '<div class="stack" style="gap:6px"><h3 class="title-ink">参加企業（' + ENTS.length + '社：東証の大分類' + D.sectors.length + '分類×' + Math.round(ENTS.length / D.sectors.length) + '社）</h3>' + entTable(ENTS) + '</div>' +
    '</section>';
  }

  function entTable(list) {
    // 行が多いときは高さを抑えてスクロール（見出し行は固定）
    return '<div class="scroll inner' + (list.length > 12 ? ' tall' : '') + '"><table style="min-width:560px"><thead><tr><th>企業</th><th>業種（東証の大分類）</th><th class="num">売上高</th><th class="num">登録人材</th></tr></thead><tbody>' +
      list.map((e) => '<tr><td class="strong">' + esc(e.id) + '</td><td>' + esc(D.sectors[e.sector]) + '</td><td class="num">' + yen(e.revenue) + '</td><td class="num">' + e.n + '名</td></tr>').join('') +
      '</tbody></table></div>';
  }

  // ---- タブ2：企業別 ----
  function entPanel() {
    const opt = (v, t, on) => '<option value="' + esc(v) + '"' + (on ? ' selected' : '') + '>' + esc(t) + '</option>';
    return '<div class="filters" role="search" aria-label="企業の選択">' +
        '<label class="fld"><span class="sub">売上</span><select id="f-band">' + opt('all', 'すべての売上', state.band === 'all') +
          D.revenueBands.map((b, i) => opt(String(i), b[0], state.band === String(i))).join('') + '</select></label>' +
        '<label class="fld"><span class="sub">業種（東証の大分類）</span><select id="f-sector">' + opt('all', 'すべての業種（10分類）', state.sector === 'all') +
          D.sectors.map((s, i) => opt(String(i), s, state.sector === String(i))).join('') + '</select></label>' +
      '</div><div id="ent-result"></div>';
  }

  function entResult() {
    const list = selected();
    if (!list.length) return '<section class="card"><p class="muted">条件に合う企業はありません。売上か業種の条件を変えてください。</p></section>';
    const ids = list.map((e) => e.id);
    const ps = people.filter((p) => ids.includes(p.ent));
    const stats = groupStats(ps).map((s, k) => Object.assign(s, { avgReq: ALL[k].avgNow }));
    // 企業名だけを表示する（業態の括弧書きは出さない。業種は表の列にある）
    const title = list.length === 1 ? list[0].id : list.length + '社';
    return '<section class="card lg stack" style="gap:12px" aria-label="選んだ企業のスキル水準">' +
      '<div class="between"><h2 style="font-size:18px">' + esc(title) + ' のスキル水準</h2></div>' +
      legend(true) +
      '<div class="radar-wrap">' + radar(stats, null, { label, nowLabel: '選んだ企業の平均', reqLabel: '登録人材全体の平均' }) + '</div>' +
      '<div class="stack" style="gap:6px"><h3 class="title-ink">該当企業（' + list.length + '社）</h3>' + entTable(list) + '</div>' +
    '</section>';
  }

  function render() {
    document.getElementById('app').innerHTML = head() +
      '<div id="panel" role="tabpanel" aria-labelledby="tab-' + state.tab + '" class="stack" style="gap:16px">' +
        (state.tab === 'all' ? allPanel() : entPanel()) + '</div>';
    if (state.tab === 'ent') document.getElementById('ent-result').innerHTML = entResult();
  }

  bind(document.body, {
    tab: (v) => {
      if (v === state.tab) return;
      state.tab = v; setUrl();
      render(); document.getElementById('tab-' + v).focus();
    }
  });
  // タブは左右キーでも切り替えられる
  document.body.addEventListener('keydown', (ev) => {
    if (!ev.target.matches || !ev.target.matches('[role="tab"]') || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
    ev.preventDefault();
    document.getElementById('tab-' + (state.tab === 'all' ? 'ent' : 'all')).click();
  });
  document.body.addEventListener('change', (ev) => {
    if (ev.target.id === 'f-band') state.band = ev.target.value;
    else if (ev.target.id === 'f-sector') state.sector = ev.target.value;
    else return;
    setUrl();
    document.getElementById('ent-result').innerHTML = entResult();
  });
  render();
})();
