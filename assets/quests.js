// ① クエスト管理（事務局）
(function () {
  const { D, SC, KEY, SCORED, PERSONAL, SCORED_SUBS, esc, lv, legend, roleName, typeName, bind } = window.DQX;

  const STATUS = {
    open: ['募集中', 't-warn'],
    matching: ['マッチング中', 't-ok'],
    running: ['実施中', 't-gray']
  };
  const state = { sel: 0, all: false };

  function renderList() {
    document.getElementById('qcount').textContent = D.quests.length + '件';
    document.getElementById('qlist').innerHTML = D.quests.map((q, i) =>
      '<button type="button" class="qitem" data-act="pick" data-val="' + i + '" aria-pressed="' + (i === state.sel) + '">' +
        '<span class="between" style="width:100%;align-items:center"><span class="sub">' + esc(q.company) + '｜' + esc(q.industry) + '</span>' +
        '<span class="tag xs ' + STATUS[q.status][1] + '">' + STATUS[q.status][0] + '</span></span>' +
        '<span class="strong">' + esc(q.title) + '</span>' +
      '</button>'
    ).join('');
  }

  function renderDetail() {
    const q = D.quests[state.sel];
    // 必要スキル＝推薦ロールの公式重要度（項目ごとに高い方）
    const rows = SCORED.map((it) => {
      const need = KEY[Math.max.apply(null, q.slots.map((r) => SC[it[2][r]]))];
      return { sub: it[0], name: it[1], roles: q.slots.map((r) => it[2][r]), need };
    });
    const counts = ['a', 'b', 'c', 'd'].map((k) => ({ k, n: rows.filter((r) => r.need === k).length }));
    const groups = SCORED_SUBS.map((si) => {
      const mine = rows.filter((r) => r.sub === si);
      const ab = mine.filter((r) => SC[r.need] >= 3);
      return { cat: D.subs[si][0], sub: D.subs[si][1], ab: ab.length, total: mine.length, items: state.all ? mine : ab };
    }).filter((g) => g.items.length > 0);

    const head = q.slots.map((r) => '<th class="c small" style="font-weight:500;width:130px">' + esc(roleName(r)) + '<br><span class="muted">（公式の重要度）</span></th>').join('');
    const body = groups.map((g) =>
      '<tr class="grp"><th colspan="' + (q.slots.length + 2) + '" scope="rowgroup">' + esc(g.sub) +
        ' <span class="small muted" style="font-weight:500">｜' + esc(g.cat) + '｜重点項目（a・b）' + g.ab + '／' + g.total + '</span></th></tr>' +
      g.items.map((r) =>
        '<tr><td>' + esc(r.name) + '</td>' + r.roles.map((k) => '<td class="c">' + lv(k) + '</td>').join('') +
        '<td class="c">' + lv(r.need, { key: SC[r.need] >= 3 }) + '</td></tr>'
      ).join('')
    ).join('');

    document.getElementById('detail').innerHTML =
      '<article class="card lg">' +
        '<div class="between" style="align-items:flex-start">' +
          '<div class="stack" style="gap:4px"><span class="muted" style="font-size:13px">' + esc(q.id) + '｜' + esc(q.company) + '</span><h1>' + esc(q.title) + '</h1></div>' +
          '<span class="tag ' + STATUS[q.status][1] + '">' + STATUS[q.status][0] + '</span>' +
        '</div>' +
        '<dl class="meta">' +
          ['業種', q.industry, '規模', q.size, '所在地', q.area, '派遣期間', q.period].reduce((h, v, i, a) => i % 2 ? h : h + '<div class="soft"><dt>' + esc(v) + '</dt><dd>' + esc(a[i + 1]) + '</dd></div>', '') +
        '</dl>' +
        '<div class="grid g-260" style="gap:20px">' +
          '<div class="stack" style="gap:6px"><h3 class="title-ink">現状と背景</h3><p>' + esc(q.background) + '</p></div>' +
          '<div class="stack" style="gap:6px"><h3 class="title-ink">本当に解決したい課題（ゴール）</h3><p>' + esc(q.goal) + '</p></div>' +
        '</div>' +
        '<div class="stack"><h3 class="title-ink row">成果物 <span class="t-must">必須</span></h3>' +
          '<ol style="padding-left:20px">' + q.deliverables.map((d) => '<li>' + esc(d) + '</li>').join('') + '</ol></div>' +
        '<div class="stack"><h3 class="title-ink">事務局からの推薦ロール</h3>' +
          '<div class="soft" style="font-size:13px"><span class="sub">事務局のヒアリング</span><br>' + esc(q.hearing) + '</div>' +
          '<div class="grid g-260">' + q.slots.map((r, i) =>
            '<div class="box stack" style="gap:4px"><span class="xs muted">類型：' + esc(typeName(r)) + '</span><strong>' + esc(roleName(r)) + '</strong>' +
              '<span class="small" style="color:var(--ink-2)">' + esc(q.reasons[i]) + '</span></div>').join('') +
        '</div></div>' +
      '</article>' +

      '<article class="card lg">' +
        '<div class="between" style="align-items:flex-start">' +
          '<div class="stack" style="gap:4px;flex:1 1 360px"><h2 style="font-size:18px">必要なスキル</h2>' +
            '<span class="sub">デジタルスキル標準 ver.2.0 の共通スキルリスト（5カテゴリー・13サブカテゴリー・67項目）。推薦ロールの公式スキルマッピングの重要度をそのまま使い、ロールが複数の場合は項目ごとに高い方を採用しています。</span></div>' +
          '<div class="soft stack" style="gap:2px;flex:0 1 320px"><span class="sub">実績データ</span>' +
            '<span style="font-weight:500">類似クエスト ' + q.cases + '件（成功 ' + q.success + '件）</span>' +
            '<span class="sub">成功事例が蓄積されたら、必要スキルの補正に使う予定です（現在は補正なし）。</span></div>' +
        '</div>' +
        '<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px">' +
          counts.map((c) => '<div class="box row" style="gap:10px;padding:8px 12px">' + lv(c.k) +
            '<span class="stack" style="gap:0;line-height:1.3"><strong style="font-size:18px">' + c.n + '<span class="small" style="font-weight:500"> 項目</span></strong><span class="xs muted">' + esc(window.DQX.LEVELS[c.k]) + '</span></span></div>').join('') +
        '</div>' +
        '<div class="row"><span class="strong" style="font-size:13px">表示</span>' +
          '<button type="button" class="pill" data-act="mode" data-val="ab" aria-pressed="' + !state.all + '">重点項目（a・b）のみ</button>' +
          '<button type="button" class="pill" data-act="mode" data-val="all" aria-pressed="' + state.all + '">すべての項目（61項目）</button></div>' +
        '<div class="scroll inner"><table style="min-width:720px"><thead><tr><th>スキル項目</th>' + head + '<th class="c" style="width:110px">必要スキル</th></tr></thead><tbody>' + body + '</tbody></table></div>' +
        '<div class="box stack"><h3>パーソナルスキル <span class="small muted" style="font-weight:500">｜全ロール共通の重要度 z：役割や状況に応じた実践力が必要</span></h3>' +
          '<div class="row">' + PERSONAL.map((it) => '<span class="row box" style="gap:6px;padding:4px 10px;font-size:13px">' + lv('z', { sm: true }) + esc(it[1]) + '<span class="xs muted">（' + esc(D.subs[it[0]][1]) + '）</span></span>').join('') + '</div>' +
          '<span class="sub">点数化はせず、選考の面談で確認します（本プロジェクトの運用）。</span></div>' +
        legend(['a', 'b', 'c', 'd', 'z'], '重要度（公式の凡例）') +
      '</article>';
  }

  function render() { renderList(); renderDetail(); }

  bind(document.body, {
    pick: (v) => { state.sel = Number(v); render(); },
    mode: (v) => { state.all = v === 'all'; renderDetail(); }
  });
  render();
})();
