// ③ 自社人材の育成状況（大企業人事部）
(function () {
  const { D, SC, SCORED, reqOf, rateOf, esc, roleName, bind, subStats, radar } = window.DQX;

  // ログイン企業（プロトタイプでは X社 固定）。自社の社員だけを表示する
  const COMPANY = 'X社';
  const threshold = D.rules.dispatchThreshold;
  const RESULT = { '成功': 't-strong', '未達': 't-warn', '実施中': 't-gray' };

  const emps = D.people.filter((p) => p.ent === COMPANY).map((p) => {
    const req = reqOf(p.role);
    return Object.assign({}, p, { req, rate: rateOf(p.lv, req), preRate: p.pre ? rateOf(p.pre.lv, req) : null });
  });
  const params = new URLSearchParams(location.search);
  const state = { sel: emps.some((e) => e.id === params.get('id')) ? params.get('id') : emps[0].id };

  // 派遣状況は「派遣完了」か「未派遣」の2つで表す
  function done(e) { return !!e.dispatch && e.dispatch.result !== '実施中'; }
  function statusOf(e) { return done(e) ? ['派遣完了', 't-ok'] : ['未派遣', 't-gray']; }
  function high(e) { return e.rate >= threshold; }

  function top() {
    const stats = [
      ['登録社員', emps.length, ''],
      ['派遣完了', emps.filter(done).length, ''],
      ['未派遣', emps.filter((e) => !done(e)).length, ''],
      ['派遣基準以上（充足度' + threshold + '%以上）', emps.filter(high).length, ' hi']
    ];
    return '<div class="stack" style="gap:4px"><h1>自社人材の育成状況</h1>' +
      '<span class="sub">実践DXクエストに登録した自社社員のアセスメント結果と、派遣によるスキルの変化（デジタルスキル標準 ver.2.0 のロール・共通スキルリスト準拠）</span></div>' +
      '<div class="stats">' + stats.map((s) => '<div class="stat' + s[2] + '"><div class="k">' + esc(s[0]) + '</div><div class="v">' + s[1] + '<small> 名</small></div></div>').join('') + '</div>' +
      '<section class="card rules" aria-label="判定ルール">' +
        '<div><strong>充足度</strong>（独自基準）：本人ロールの重点項目（公式の重要度 a・b）のうち、評価が重要度以上の項目の割合</div>' +
        '<div><strong>派遣基準</strong>（独自基準）：充足度 ' + threshold + '% 以上。基準以上の社員は名前を強調しています</div>' +
      '</section>';
  }

  function list() {
    return '<section class="scroll" aria-label="登録社員一覧"><table style="min-width:760px"><thead><tr>' +
      '<th>社員</th><th>ロール</th><th>充足度（派遣前 → 現在）</th><th>派遣状況</th></tr></thead><tbody>' +
      emps.map((e) => {
        const gain = e.pre ? e.rate - e.preRate : 0;
        const st = statusOf(e);
        return '<tr class="' + (e.id === state.sel ? 'sel' : '') + '">' +
          '<td><button type="button" class="linkbtn' + (high(e) ? ' hi' : '') + '" data-act="pick" data-val="' + e.id + '" aria-pressed="' + (e.id === state.sel) + '">' +
            '<span class="nm">' + esc(e.name) + (high(e) ? '<span class="hi-badge">派遣基準以上</span>' : '') + '</span>' +
            '<span class="sub">' + esc(e.dept) + '・' + esc(e.years) + '</span></button></td>' +
          '<td style="font-weight:500">' + esc(roleName(e.role)) + '</td>' +
          '<td><span class="muted">' + (e.pre ? e.preRate + '%' : '—') + '</span><span class="muted" aria-hidden="true"> → </span>' +
            '<strong style="font-size:15px">' + e.rate + '%</strong>' + (gain > 0 ? ' <span class="small strong title-ink">+' + gain + 'pt</span>' : '') + '</td>' +
          '<td><span class="tag ' + st[1] + '">' + st[0] + '</span></td></tr>';
      }).join('') +
      '</tbody></table></section>';
  }

  function detail() {
    const e = emps.find((x) => x.id === state.sel) || emps[0];
    const keyIdx = SCORED.map((it, j) => j).filter((j) => e.req[j] >= 3);
    const gaps = keyIdx.filter((j) => SC[e.lv[j]] < e.req[j]).map((j) => SCORED[j][1]);
    const stats = subStats(e.req, e.lv, e.pre ? e.pre.lv : null);
    const href = (si) => 'skill.html?id=' + encodeURIComponent(e.id) + '&sub=' + si;
    const metNow = keyIdx.length - gaps.length;
    const summary = e.pre
      ? '重点項目 ' + keyIdx.length + '件中 達成 ' + keyIdx.filter((j) => SC[e.pre.lv[j]] >= e.req[j]).length + '→' + metNow + '件'
      : '重点項目 ' + keyIdx.length + '件中 達成 ' + metNow + '件';
    const jdLabel = (s) => s.judge === 'none' ? '<span class="muted small">重点項目なし</span>'
      : '<span class="small strong" style="color:' + (s.judge === 'ok' ? 'var(--brand)' : 'var(--must)') + '">' + (s.judge === 'ok' ? '達成' : '未達') + '</span> <span class="small muted">' +
        (e.pre ? s.metPre + '→' : '') + s.metNow + '/' + s.key + '</span>';
    const table = '<div class="scroll inner"><table style="min-width:560px"><thead><tr><th>分類（サブカテゴリー）</th><th class="c small" style="font-weight:500">ロールの要求<br>（公式の平均）</th>' +
      (e.pre ? '<th class="c">派遣前</th>' : '') + '<th class="c">現在</th><th>判定（重点項目の達成）</th></tr></thead><tbody>' +
      stats.map((s) => '<tr><td><a href="' + esc(href(s.si)) + '">' + esc(s.name) + '</a> <span class="xs muted">｜' + esc(s.cat) + '</span></td>' +
        '<td class="c">' + s.avgReq.toFixed(1) + '</td>' + (e.pre ? '<td class="c">' + s.avgPre.toFixed(1) + '</td>' : '') +
        '<td class="c strong">' + s.avgNow.toFixed(1) + '</td><td>' + jdLabel(s) + '</td></tr>').join('') +
      '</tbody></table></div>';
    const d = e.dispatch;
    return '<section class="card lg" aria-label="社員の詳細" style="flex-direction:row;flex-wrap:wrap;gap:28px">' +
      '<div class="stack" style="flex:1 1 300px;gap:16px">' +
        '<div class="stack" style="gap:2px"><span class="sub">' + esc(e.id) + '</span><h2 style="font-size:22px"' + (high(e) ? ' class="hi-name"' : '') + '>' + esc(e.name) + '</h2><span style="color:var(--ink-2)">' + esc(e.dept) + '・' + esc(e.years) + '</span></div>' +
        '<dl class="kv">' +
          '<dt>ロール</dt><dd style="font-weight:500">' + esc(roleName(e.role)) + '</dd>' +
          '<dt>アセスメント</dt><dd>' + (e.pre ? '派遣前 ' + esc(e.pre.on) + '／派遣後 ' + esc(e.on) : esc(e.on)) + '</dd>' +
          '<dt>充足度</dt><dd class="strong">' + (e.pre ? e.preRate + '% → ' + e.rate + '%（+' + (e.rate - e.preRate) + 'pt）' : e.rate + '%') +
            ' <span class="small muted" style="font-weight:400">（派遣基準 ' + threshold + '%）</span></dd>' +
          '<dt>希望テーマ</dt><dd>' + esc(e.wish) + '</dd>' +
        '</dl>' +
        '<div class="stack"><h3 class="title-ink">派遣実績</h3>' +
          (done(e) ? '<div class="box stack" style="gap:6px">' +
                '<div class="between"><span class="sub">' + esc(d.quest) + '｜' + esc(d.period) + '</span><span class="tag ' + RESULT[d.result] + '">' + esc(d.result) + '</span></div>' +
                '<div class="strong">' + esc(d.title) + '</div><div class="sub">派遣先：' + esc(d.sme) + '</div>' +
                (d.feedback ? '<div class="soft" style="font-size:13px"><span class="sub">派遣先からの評価</span><br>' + esc(d.feedback) + '</div>' : '') +
              '</div>'
             : '<p class="muted">派遣実績はまだありません。</p>') +
        '</div>' +
        '<div class="stack"><h3 class="title-ink">次に伸ばす項目（未達の重点項目 ' + gaps.length + '件）</h3>' +
          '<div class="row" style="gap:6px">' + (gaps.length ? gaps.map((g) => '<span class="gap-chip md">' + esc(g) + '</span>').join('') : '<span class="small strong title-ink">なし</span>') + '</div></div>' +
      '</div>' +
      '<div class="stack" style="flex:2 1 600px;min-width:0;gap:12px">' +
        '<div class="between"><h3 style="font-size:16px">分類ごとのスキル水準' + (e.pre ? '（派遣前 → 現在）' : '') + '</h3><span class="sub">' + summary + '</span></div>' +
        '<div class="legend">' +
          '<span><span class="sw" style="border-top:2px dashed #7A8A93"></span>ロールの要求（公式の重要度）</span>' +
          (e.pre ? '<span><span class="sw" style="border-top:2px solid #C47A1A"></span>派遣前</span>' : '') +
          '<span><span class="sw" style="border-top:2px solid #0089A8;background:rgba(0,137,168,.16)"></span>現在</span>' +
          '<span class="muted">目盛り：d（内側）〜 a（外側）。各分類の項目の平均水準</span>' +
        '</div>' +
        '<div class="radar-wrap">' + radar(stats, href, { pre: !!e.pre }) + '</div>' +
        '<span class="sub">分類名をクリックすると、その分類のスキル項目ごとの評価を表示します。判定は、本人ロールの重点項目（重要度 a・b）を分類内ですべて達成しているかで決めます。</span>' +
        table +
        '<span class="sub">パーソナルスキル（リーダーシップ、コラボレーション、ゴール設定、創造的な問題解決、批判的思考、適応力）は公式の重要度が全ロール z（役割や状況に応じた実践力が必要）のため、点数化せず面談で確認します。</span>' +
      '</div>' +
    '</section>';
  }

  function render() {
    document.getElementById('app').innerHTML = top() + list() + detail();
  }

  document.getElementById('who').textContent = COMPANY + ' 人事部';
  bind(document.body, {
    pick: (v) => { state.sel = v; history.replaceState(null, '', '?id=' + encodeURIComponent(v)); render(); }
  });
  render();
})();
