// ② 人材データバンク（事務局）
(function () {
  const { D, SC, SCORED, SCORED_SUBS, reqOf, rateOf, gapsOf, esc, bar, roleName, typeName, bind } = window.DQX;

  const threshold = D.rules.dispatchThreshold;
  const ENTS = Array.from(new Set(D.people.map((p) => p.ent)));
  // 需給と候補者の対象は、募集中・マッチング中のクエスト
  const OPEN = D.quests.filter((q) => q.status !== 'running');
  const state = { type: 'all', ent: 'all', qualified: false, quest: 0 };

  const people = D.people.map((p) => Object.assign({}, p, { rate: rateOf(p.lv, reqOf(p.role)) }));
  const available = people.filter((p) => !p.active && p.rate >= threshold);

  function statusOf(p) {
    if (p.active) return ['派遣中', 't-gray'];
    return p.rate >= threshold ? ['派遣可', 't-ok'] : ['基準未満', 't-warn'];
  }
  function tag(s, extra) { return '<span class="tag ' + s[1] + (extra ? ' ' + extra : '') + '">' + s[0] + '</span>'; }
  function pill(act, val, label, on) {
    return '<button type="button" class="pill" data-act="' + act + '" data-val="' + esc(val) + '" aria-pressed="' + on + '">' + esc(label) + '</button>';
  }

  function header() {
    return '<div class="between" style="align-items:flex-end">' +
      '<div class="stack" style="gap:4px"><h1>人材データバンク</h1><span class="sub">参加大企業の登録人材を横断して管理（デジタルスキル標準 ver.2.0 のロール・共通スキルリスト準拠）</span></div>' +
      '<div class="stats" style="grid-template-columns:repeat(3,minmax(130px,1fr))">' +
        '<div class="stat"><div class="k">登録人材（' + ENTS.length + '社）</div><div class="v">' + people.length + '<small> 名</small></div></div>' +
        '<div class="stat"><div class="k">派遣可能（充足度' + threshold + '%以上）</div><div class="v">' + available.length + '<small> 名</small></div></div>' +
        '<div class="stat"><div class="k">派遣中</div><div class="v">' + people.filter((p) => p.active).length + '<small> 名</small></div></div>' +
      '</div></div>' +
      '<section class="card rules" aria-label="算出ルール">' +
        '<div><strong>個人評価</strong>（独自基準）：スキル項目ごとに、公式の重要度 a〜d の定義に相当する水準かを評価</div>' +
        '<div><strong>充足度</strong>（独自基準）：本人ロールの重点項目（重要度 a・b）のうち、評価が重要度以上の項目の割合</div>' +
        '<div><strong>適合度</strong>（独自基準）：クエストの推薦ロールの重点項目のうち、評価が重要度以上の項目の割合</div>' +
      '</section>';
  }

  function supply() {
    const ids = D.roles.map((r, i) => i).filter((i) => OPEN.some((q) => q.slots.includes(i)) || people.some((p) => p.role === i));
    const cards = ids.map((i) => {
      const demand = OPEN.filter((q) => q.slots.includes(i)).length;
      const sup = available.filter((p) => p.role === i).length;
      const short = demand - sup;
      const badge = short > 0 ? ['不足 ' + short + '名', 't-warn'] : demand > 0 ? ['充足', 't-ok'] : ['募集なし', 't-gray'];
      return { i, demand, sup, short, badge };
    }).sort((a, b) => (b.short - a.short) || (b.demand - a.demand));
    return '<section class="card" aria-label="ロールごとの需給">' +
      '<div class="between"><h2>ロールごとの需給</h2><span class="sub">需要＝募集中・マッチング中のクエストの推薦ロール／供給＝そのロールで派遣可能な人材</span></div>' +
      '<div class="grid g-220">' + cards.map((c) =>
        '<div class="supply' + (c.short > 0 ? ' short' : '') + '">' +
          '<span class="stack" style="gap:0;line-height:1.4"><span class="xs muted">' + esc(typeName(c.i)) + '</span><strong style="font-size:13px">' + esc(roleName(c.i)) + '</strong></span>' +
          '<span class="nums"><span>需要 <strong>' + c.demand + '</strong></span><span>供給 <strong>' + c.sup + '</strong></span></span>' +
          '<span>' + tag(c.badge) + '</span>' +
        '</div>').join('') +
      '</div></section>';
  }

  function candidates() {
    const q = OPEN[state.quest];
    const tabs = OPEN.map((x, i) =>
      '<button type="button" class="tab" data-act="quest" data-val="' + i + '" aria-pressed="' + (i === state.quest) + '">' +
        '<span class="t1">' + esc(x.id) + '｜' + esc(x.company) + '｜' + (x.status === 'open' ? '募集中' : 'マッチング中') + '</span>' +
        '<span class="t2">' + esc(x.title) + '</span></button>').join('');
    const slots = q.slots.map((role) => {
      const req = reqOf(role);
      const cands = people.filter((p) => !p.active).map((p) => {
        const gaps = gapsOf(p.lv, req);
        return { p, fit: rateOf(p.lv, req), gaps };
      }).sort((a, b) => b.fit - a.fit).slice(0, 3);
      return '<div class="slot">' +
        '<div class="slot-h between"><span><span class="xs muted">推薦ロール｜' + esc(typeName(role)) + '</span><br><strong>' + esc(roleName(role)) + '</strong></span>' +
          '<span class="sub">重点項目 ' + req.filter((r) => r >= 3).length + '項目</span></div>' +
        cands.map((c, i) =>
          '<div class="cand"><span class="rk">' + (i + 1) + '</span>' +
            '<div class="stack" style="gap:4px;min-width:0">' +
              '<span><strong>' + esc(c.p.name) + '</strong> <span class="sub">' + esc(c.p.company) + '・' + esc(roleName(c.p.role)) + '</span></span>' +
              '<span class="row" style="gap:4px"><span class="xs muted">未達：</span>' +
                (c.gaps.length === 0 ? '<span class="xs strong title-ink">なし</span>'
                  : c.gaps.slice(0, 3).map((g) => '<span class="gap-chip">' + esc(g) + '</span>').join('') +
                    (c.gaps.length > 3 ? '<span class="xs muted">ほか' + (c.gaps.length - 3) + '項目</span>' : '')) +
              '</span>' +
            '</div>' +
            '<div class="stack" style="gap:2px"><span class="strong">適合度 ' + c.fit + '%</span>' + bar(c.fit) +
              '<span>' + tag(statusOf(c.p), 'xs') + '</span></div>' +
          '</div>').join('') +
      '</div>';
    }).join('');
    return '<section class="card" aria-label="クエスト別の候補者">' +
      '<div class="between"><h2>クエスト別の候補者</h2><span class="sub">推薦ロールごとに適合度の高い順。派遣中の人材は除外</span></div>' +
      '<div class="row" role="group" aria-label="クエストを選択">' + tabs + '</div>' +
      '<div class="grid g-420" style="gap:16px">' + slots + '</div></section>';
  }

  function list() {
    const filtered = people.filter((p) =>
      (state.type === 'all' || String(D.roles[p.role][1]) === state.type) &&
      (state.ent === 'all' || p.ent === state.ent) &&
      (!state.qualified || p.rate >= threshold));
    const cats = [];
    SCORED_SUBS.forEach((si) => { const c = D.subs[si][0]; const last = cats[cats.length - 1]; if (last && last.cat === c) last.span++; else cats.push({ cat: c, span: 1 }); });
    const edge = (k) => (k === 0 || D.subs[SCORED_SUBS[k]][0] !== D.subs[SCORED_SUBS[k - 1]][0]) ? 'bl' : 'bl-soft';
    const rows = filtered.map((p) => {
      const req = reqOf(p.role);
      const cells = SCORED_SUBS.map((si, k) => {
        const key = SCORED.map((it, j) => j).filter((j) => SCORED[j][0] === si && req[j] >= 3);
        if (key.length === 0) return '<td class="c ' + edge(k) + ' muted">—</td>';
        const met = key.filter((j) => SC[p.lv[j]] >= req[j]).length;
        const r = met / key.length;
        const cls = r === 1 ? 'r-full' : r >= 0.5 ? 'r-half' : 'r-low';
        return '<td class="c ' + edge(k) + '" style="padding:6px 4px"><span class="ratio ' + cls + '">' + met + '/' + key.length + '</span></td>';
      }).join('');
      return '<tr><td><div class="strong">' + esc(p.name) + '</div><div class="sub">' + esc(p.company) + '・' + esc(p.dept) + '</div></td>' +
        '<td><div style="font-weight:500">' + esc(roleName(p.role)) + '</div><div class="sub">' + esc(typeName(p.role)) + '</div></td>' + cells +
        '<td class="bl" style="min-width:110px"><div class="strong">' + p.rate + '%</div>' + bar(p.rate, p.rate < threshold).replace('class="bar', 'class="bar thin') + '</td>' +
        '<td>' + tag(statusOf(p)) + '</td></tr>';
    }).join('');
    return '<section class="stack" style="gap:12px" aria-label="登録人材一覧"><h2>登録人材一覧</h2>' +
      '<div class="card row" style="padding:14px 20px;gap:12px 20px;flex-direction:row">' +
        '<span class="strong" style="font-size:13px">人材類型</span><div class="row" role="group" aria-label="人材類型で絞り込み">' +
          pill('type', 'all', 'すべて', state.type === 'all') + D.types.map((t, i) => pill('type', String(i), t, state.type === String(i))).join('') + '</div>' +
        '<span class="strong" style="font-size:13px">所属企業</span><div class="row" role="group" aria-label="所属企業で絞り込み">' +
          pill('ent', 'all', 'すべて', state.ent === 'all') + ENTS.map((e) => pill('ent', e, e, state.ent === e)).join('') + '</div>' +
        '<button type="button" class="pill sq" style="margin-left:auto" data-act="qualified" aria-pressed="' + state.qualified + '">派遣基準以上のみ表示</button>' +
      '</div>' +
      '<span class="sub">サブカテゴリーの欄：本人ロールの重点項目（重要度 a・b）のうち、評価が重要度以上の項目数／重点項目数（重点項目がないサブカテゴリーは「—」）</span>' +
      '<div class="scroll"><table style="min-width:1240px"><thead>' +
        '<tr><th rowspan="2">人材</th><th rowspan="2">ロール（類型）</th>' +
          cats.map((c) => '<th colspan="' + c.span + '" class="c small bl">' + esc(c.cat) + '</th>').join('') +
          '<th rowspan="2" class="bl">充足度</th><th rowspan="2">状態</th></tr>' +
        '<tr>' + SCORED_SUBS.map((si, k) => '<th class="c ' + edge(k) + '" style="vertical-align:bottom;padding:8px 4px"><span class="vt">' + esc(D.subs[si][1]) + '</span></th>').join('') + '</tr>' +
      '</thead><tbody>' + rows + '</tbody></table>' +
      (filtered.length === 0 ? '<p class="muted" style="padding:24px">条件に合う人材がいません。</p>' : '') + '</div>' +
      '<div class="legend"><span><span class="ratio r-full">&nbsp;</span>すべて達成</span><span><span class="ratio r-half">&nbsp;</span>半数以上達成</span><span><span class="ratio r-low">&nbsp;</span>半数未満</span></div>' +
    '</section>';
  }

  function render() {
    document.getElementById('app').innerHTML = header() + supply() + candidates() + list();
  }

  bind(document.body, {
    quest: (v) => { state.quest = Number(v); render(); },
    type: (v) => { state.type = v; render(); },
    ent: (v) => { state.ent = v; render(); },
    qualified: () => { state.qualified = !state.qualified; render(); }
  });
  render();
})();
