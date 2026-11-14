// ④ クエスト一覧（大企業向け）
// 必要スキルは表示しない。ロールは事務局がヒアリングをもとに推薦したものを表示する
// 中小企業の企業名は、自社の社員が派遣中・派遣予定のクエストだけ表示する
(function () {
  const { D, esc, roleName, typeName, bind } = window.DQX;

  const COMPANY = 'X社';
  const STATUS = {
    open: ['募集中', 't-warn'],
    matching: ['マッチング中', 't-ok'],
    running: ['実施中', 't-gray']
  };
  const person = (id) => D.people.find((p) => p.id === id);
  // 自社の社員でこのクエストに関わる人 [人材, 状態]
  const ownMembers = (q) => (q.members || []).map((m) => [person(m[0]), m[1]]).filter((m) => m[0] && m[0].ent === COMPANY);
  const nameOf = (q) => ownMembers(q).length ? q.company : '企業名非公開';
  const state = { sel: 0 };

  function renderList() {
    document.getElementById('qcount').textContent = D.quests.length + '件';
    document.getElementById('qlist').innerHTML = D.quests.map((q, i) => {
      const own = ownMembers(q).length > 0;
      return '<button type="button" class="qitem" data-act="pick" data-val="' + i + '" aria-pressed="' + (i === state.sel) + '">' +
        '<span class="between" style="width:100%;align-items:center"><span class="sub">' +
          (own ? '<strong style="color:var(--ink)">' + esc(q.company) + '</strong>' : esc(nameOf(q))) + '｜' + esc(q.industry) + '・' + esc(q.area) + '</span>' +
          '<span class="tag xs ' + STATUS[q.status][1] + '">' + STATUS[q.status][0] + '</span></span>' +
        '<span class="strong">' + esc(q.title) + '</span>' +
        (own ? '<span><span class="tag xs t-strong">自社社員が参加</span></span>' : '') +
      '</button>';
    }).join('');
  }

  function renderDetail() {
    const q = D.quests[state.sel];
    const own = ownMembers(q);
    document.getElementById('detail').innerHTML =
      '<article class="card lg">' +
        '<div class="between" style="align-items:flex-start">' +
          '<div class="stack" style="gap:4px"><span class="muted" style="font-size:13px">' + esc(q.id) + '｜' + esc(nameOf(q)) + '</span><h1>' + esc(q.title) + '</h1></div>' +
          '<span class="tag ' + STATUS[q.status][1] + '">' + STATUS[q.status][0] + '</span>' +
        '</div>' +
        (own.length ? '<div class="judge ok"><span class="small" style="color:var(--ink-2)">自社から参加する社員</span>' +
            '<strong>' + own.map((m) => esc(m[0].name) + '（' + esc(m[1]) + '）').join('、') + '</strong>' +
            '<span class="small" style="color:var(--ink-2)">自社の社員が参加するため、派遣先の企業名（' + esc(q.company) + '）を表示しています。</span></div>'
          : '') +
        '<dl class="meta">' +
          ['企業名', nameOf(q), '業種', q.industry, '規模', q.size, '所在地', q.area, '派遣期間', q.period].reduce((h, v, i, a) => i % 2 ? h : h + '<div class="soft"><dt>' + esc(v) + '</dt><dd>' + esc(a[i + 1]) + '</dd></div>', '') +
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
          '</div>' +
          '<span class="sub">ロールはデジタルスキル標準 ver.2.0 のものです。中小企業の悩みを事務局がヒアリングし、課題の解決に向くロールを推薦しています。</span>' +
        '</div>' +
      '</article>';
  }

  function render() { renderList(); renderDetail(); }

  document.getElementById('who').textContent = COMPANY + ' 人事部';
  bind(document.body, {
    pick: (v) => { state.sel = Number(v); render(); }
  });
  render();
})();
