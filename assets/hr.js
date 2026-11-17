// ③ 自社人材の育成状況（大企業人事部）
// タブ1「会社全体」：登録社員全員のスキル水準のレーダーチャート
// タブ2「従業員」：従業員の一覧と、選択した従業員のスキルのレーダーチャート
(function () {
  const { D, reqOf, rateOf, esc, roleName, bind, subStats, groupStats, radar } = window.DQX;

  // ログイン企業（プロトタイプでは X社 固定）。自社の社員だけを表示する
  const COMPANY = 'X社';

  const emps = D.people.filter((p) => p.ent === COMPANY).map((p) => {
    const req = reqOf(p.role);
    return Object.assign({}, p, {
      req, rate: rateOf(p.lv, req), preRate: p.pre ? rateOf(p.pre.lv, req) : null,
      stats: subStats(req, p.lv, p.pre ? p.pre.lv : null)
    });
  });
  const params = new URLSearchParams(location.search);
  const hasId = emps.some((e) => e.id === params.get('id'));
  const state = {
    // 分類の詳細ページ（skill.html）から戻ったときは従業員タブを開く
    tab: hasId || params.get('tab') === 'emp' ? 'emp' : 'all',
    sel: hasId ? params.get('id') : emps[0].id,
    dept: 'all', q: ''
  };
  // 部署の一覧（絞り込み用）。社員数の多い順
  const DEPTS = Array.from(new Set(emps.map((e) => e.dept)))
    .map((d) => [d, emps.filter((e) => e.dept === d).length]).sort((a, b) => b[1] - a[1]);

  // 派遣状況は「派遣完了」か「未派遣」の2つで表す
  function done(e) { return !!e.dispatch && e.dispatch.result !== '実施中'; }
  function statusOf(e) { return done(e) ? ['派遣完了', 't-ok'] : ['未派遣', 't-gray']; }
  function rateText(e) {
    return e.pre ? e.preRate + '% → ' + e.rate + '%（' + (e.rate - e.preRate >= 0 ? '+' : '') + (e.rate - e.preRate) + 'pt）' : e.rate + '%';
  }

  function head() {
    const tab = (id, label) => '<button type="button" role="tab" class="tabbtn" id="tab-' + id + '" aria-controls="panel"' +
      ' aria-selected="' + (state.tab === id) + '" tabindex="' + (state.tab === id ? 0 : -1) + '" data-act="tab" data-val="' + id + '">' + label + '</button>';
    return '<div class="stack" style="gap:4px"><h1>自社人材の育成状況</h1></div>' +
      '<div class="tabbar" role="tablist" aria-label="表示の切り替え">' +
        tab('all', '会社全体') + tab('emp', '従業員') +
      '</div>';
  }

  function legend(pre, nowLabel, noReq) {
    return '<div class="legend">' +
      (noReq ? '' : '<span><svg class="lg" viewBox="0 0 28 12" aria-hidden="true"><line x1="1" y1="6" x2="27" y2="6" class="rd-req"/></svg>ロールの要求（公式の重要度・破線）</span>') +
      (pre ? '<span><svg class="lg" viewBox="0 0 28 12" aria-hidden="true"><line x1="1" y1="6" x2="27" y2="6" class="rd-pre"/><rect x="10" y="2" width="8" height="8" class="rd-pre-pt"/></svg>派遣前（四角）</span>' : '') +
      '<span><svg class="lg" viewBox="0 0 28 12" aria-hidden="true"><line x1="1" y1="6" x2="27" y2="6" class="rd-now"/><circle cx="14" cy="6" r="4" class="rd-now-pt"/></svg>' + nowLabel + '（丸）</span>' +
    '</div>';
  }

  // ---- タブ1：会社全体 ----
  // 全員がデジタルスキル標準の全項目のアセスメントを受けている前提で、ロールに関係なく全社員を同じ物差しで集計する。
  // 分類ごとに、各社員の分類内の平均水準（a=4〜d=1）を全社員で平均する
  // あわせて、分類内の全項目が最高評価 a（平均4.0）の社員数（最高点の人数）を数える。母数は登録社員全員
  // 集計の規則は common.js の groupStats（事務局の人材データバンクと共通）
  function companyStats() { return groupStats(emps); }

  function companyPanel() {
    const stats = companyStats();
    const label = (s) => '平均 ' + s.avgNow.toFixed(1) + '｜最高点 ' + s.nTop + '/' + emps.length + '名';
    return '<section class="card lg stack" style="gap:12px">' +
      '<div class="between"><h2 style="font-size:18px">会社全体のスキル水準</h2></div>' +
      legend(false, '全社員の平均', true) +
      '<div class="radar-wrap">' + radar(stats, null, { label, nowLabel: '全社員の平均', noReq: true }) + '</div>' +
    '</section>';
  }

  // ---- タブ2：従業員 ----
  function shown() {
    const q = state.q.trim().replace(/\s+/g, '');
    return emps.filter((e) => (state.dept === 'all' || e.dept === state.dept) &&
      (!q || e.name.replace(/\s+/g, '').includes(q) || e.id.includes(q)));
  }

  function filters() {
    return '<div class="filters" role="search" aria-label="従業員の絞り込み">' +
      '<label class="fld"><span class="sub">部署</span><select id="f-dept">' +
        '<option value="all">すべての部署（' + DEPTS.length + '部署）</option>' +
        DEPTS.map((d) => '<option value="' + esc(d[0]) + '"' + (state.dept === d[0] ? ' selected' : '') + '>' + esc(d[0]) + '（' + d[1] + '名）</option>').join('') +
      '</select></label>' +
      '<label class="fld"><span class="sub">氏名・社員ID</span><input id="f-q" type="search" value="' + esc(state.q) + '" placeholder="例：佐藤、TB-1001" autocomplete="off"></label>' +
      '<span class="sub" id="f-count" aria-live="polite"></span>' +
    '</div>';
  }

  function list() {
    const rows = shown();
    const cnt = document.getElementById('f-count');
    if (cnt) cnt.textContent = '該当 ' + rows.length + '名 / 登録 ' + emps.length + '名';
    if (!rows.length) return '<section class="card"><p class="muted">条件に合う従業員はいません。</p></section>';
    return '<section class="scroll tall" aria-label="従業員一覧"><table style="min-width:760px"><thead><tr>' +
      '<th>氏名</th><th>部署</th><th>ロール<span class="xs muted" style="font-weight:400">（アセスメント判定）</span></th><th class="num">充足度（派遣前 → 現在）</th><th>派遣状況</th></tr></thead><tbody>' +
      rows.map((e) => {
        const gain = e.pre ? e.rate - e.preRate : 0;
        const st = statusOf(e);
        return '<tr class="' + (e.id === state.sel ? 'sel' : '') + '">' +
          '<td><button type="button" class="linkbtn" data-act="pick" data-val="' + e.id + '" aria-pressed="' + (e.id === state.sel) + '">' +
            '<span class="nm">' + esc(e.name) + '</span></button></td>' +
          '<td>' + esc(e.dept) + '</td>' +
          '<td style="font-weight:500">' + esc(roleName(e.role)) + '</td>' +
          '<td class="num">' + (e.pre ? '<span class="muted">' + e.preRate + '%</span><span class="muted" aria-hidden="true"> → </span>' : '') +
            '<strong style="font-size:15px">' + e.rate + '%</strong>' +
            (e.pre ? '<span class="delta">' + (gain >= 0 ? '+' : '') + gain + 'pt</span>' : '') + '</td>' +
          '<td><span class="tag ' + st[1] + '">' + st[0] + '</span></td></tr>';
      }).join('') +
      '</tbody></table></section>';
  }

  function empRadar() {
    const e = emps.find((x) => x.id === state.sel) || emps[0];
    const href = (si) => 'skill.html?id=' + encodeURIComponent(e.id) + '&sub=' + si;
    return '<section class="card lg stack" style="gap:12px" aria-label="選択した従業員のスキル">' +
      '<div class="between" style="align-items:flex-end"><div class="stack" style="gap:2px">' +
        '<span class="sub">' + esc(e.id) + '｜' + esc(e.dept) + '｜' + esc(roleName(e.role)) + '</span>' +
        '<h2 style="font-size:20px">' + esc(e.name) + ' のスキル' + (e.pre ? '（派遣前 → 現在）' : '') + '</h2></div>' +
        '<span class="sub">充足度 <strong style="color:var(--ink)">' + rateText(e) + '</strong></span></div>' +
      legend(!!e.pre, '現在') +
      '<div class="radar-wrap">' + radar(e.stats, href, { pre: !!e.pre }) + '</div>' +
    '</section>';
  }

  function empPanel() {
    return filters() + '<div id="emp-list"></div><div id="emp-detail"></div>';
  }

  // 絞り込みの入力欄を作り直さないよう、一覧と詳細だけを描き直す
  function renderList() { document.getElementById('emp-list').innerHTML = list(); }
  function renderDetail() { document.getElementById('emp-detail').innerHTML = empRadar(); }
  function render() {
    document.getElementById('app').innerHTML = head() +
      '<div id="panel" role="tabpanel" aria-labelledby="tab-' + state.tab + '" class="stack" style="gap:16px">' +
        (state.tab === 'all' ? companyPanel() : empPanel()) + '</div>';
    if (state.tab === 'emp') { renderList(); renderDetail(); }
  }
  function setUrl() {
    history.replaceState(null, '', state.tab === 'emp' ? '?tab=emp&id=' + encodeURIComponent(state.sel) : location.pathname);
  }

  document.getElementById('who').textContent = COMPANY + ' 人事部';
  bind(document.body, {
    tab: (v) => { if (v === state.tab) return; state.tab = v; setUrl(); render(); document.getElementById('tab-' + v).focus(); },
    pick: (v) => {
      state.sel = v; setUrl();
      renderList(); renderDetail();
      document.getElementById('emp-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  // タブは左右キーでも切り替えられる
  document.body.addEventListener('keydown', (ev) => {
    if (!ev.target.matches || !ev.target.matches('[role="tab"]') || (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft')) return;
    ev.preventDefault();
    document.getElementById('tab-' + (state.tab === 'all' ? 'emp' : 'all')).click();
  });
  document.body.addEventListener('change', (ev) => { if (ev.target.id === 'f-dept') { state.dept = ev.target.value; renderList(); } });
  document.body.addEventListener('input', (ev) => { if (ev.target.id === 'f-q') { state.q = ev.target.value; renderList(); } });
  render();
  // 選択中の従業員が一覧の中で見えるようにする
  if (hasId) { const cur = document.querySelector('#emp-list tr.sel'); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
})();
