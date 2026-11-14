// ③-2 分類ごとのスキル項目の評価（大企業人事部）。レーダーチャートの分類をクリックすると開く
(function () {
  const { D, SC, SCORED, SCORED_SUBS, reqOf, esc, lv, legend, roleName, subStats } = window.DQX;

  const COMPANY = 'X社';
  const params = new URLSearchParams(location.search);
  const mine = D.people.filter((p) => p.ent === COMPANY);
  const e = mine.find((p) => p.id === params.get('id')) || mine[0];
  const sub = SCORED_SUBS.includes(Number(params.get('sub'))) ? Number(params.get('sub')) : SCORED_SUBS[0];
  const req = reqOf(e.role);
  const stats = subStats(req, e.lv, e.pre ? e.pre.lv : null);
  const s = stats.find((x) => x.si === sub);
  const link = (si) => 'skill.html?id=' + encodeURIComponent(e.id) + '&sub=' + si;

  const rows = SCORED.map((it, j) => ({ it, j })).filter((x) => x.it[0] === sub).map(({ it, j }) => {
    const pre = e.pre ? e.pre.lv[j] : null;
    const now = e.lv[j];
    const key = req[j] >= 3;
    return '<tr><td>' + esc(it[1]) + (key ? ' <span class="xs strong t-ok" style="border-radius:4px;padding:0 6px">重点</span>' : '') + '</td>' +
      '<td class="c">' + lv(it[2][e.role], { key }) + '</td>' +
      (e.pre ? '<td class="c">' + lv(pre) + '</td>' : '') + '<td class="c">' + lv(now) + '</td>' +
      '<td style="white-space:nowrap"><span class="small strong" style="color:' + (SC[now] >= req[j] ? 'var(--brand)' : 'var(--must)') + '">' + (SC[now] >= req[j] ? '達成' : '未達') + '</span>' +
        (pre && SC[now] > SC[pre] ? ' <span class="xs strong t-ok" style="border-radius:4px;padding:0 6px">向上</span>' : '') + '</td></tr>';
  }).join('');

  const jd = s.judge === 'none' ? '本人ロールの重点項目はありません'
    : (s.judge === 'ok' ? '達成' : '未達') + '（重点項目 ' + s.key + '件中 達成 ' + (e.pre ? s.metPre + '→' : '') + s.metNow + '件）';

  document.title = s.name + '｜' + e.name + '｜実践DXクエスト 企業ポータル';
  document.getElementById('who').textContent = COMPANY + ' 人事部';
  document.getElementById('app').innerHTML =
    '<a href="./?id=' + encodeURIComponent(e.id) + '" class="small">← ' + esc(e.name) + 'の育成状況に戻る</a>' +
    '<div class="stack" style="gap:4px"><span class="sub">' + esc(e.id) + '｜' + esc(e.name) + '｜' + esc(roleName(e.role)) + '</span>' +
      '<h1>' + esc(s.name) + ' <span class="small muted" style="font-weight:500">｜' + esc(s.cat) + '</span></h1></div>' +
    '<nav class="row" aria-label="分類の切り替え">' + stats.map((x) =>
      '<a class="pill" style="display:inline-flex;align-items:center;text-decoration:none" href="' + esc(link(x.si)) + '"' + (x.si === sub ? ' aria-current="page"' : '') + '>' + esc(x.name) + '</a>').join('') + '</nav>' +
    '<section class="card lg" aria-label="スキル項目ごとの評価">' +
      '<div class="between"><h2 style="font-size:18px">スキル項目ごとの評価' + (e.pre ? '（派遣前 → 現在）' : '') + '</h2>' +
        '<span class="tag ' + (s.judge === 'ok' ? 't-strong' : s.judge === 'ng' ? 't-warn' : 't-gray') + '">判定：' + esc(jd) + '</span></div>' +
      '<div class="scroll inner"><table style="min-width:600px"><thead><tr><th>スキル項目</th><th class="c small" style="font-weight:500">ロールの重要度<br>（公式）</th>' +
        (e.pre ? '<th class="c">派遣前</th>' : '') + '<th class="c">現在</th><th>判定</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<span class="sub">「重点」は本人ロールの重要度が a・b の項目です（枠で強調）。分類の判定は、重点項目をすべて達成しているかで決めます。</span>' +
      legend(['a', 'b', 'c', 'd'], '重要度（公式の凡例）／個人評価も同じ水準で判定') +
    '</section>';
})();
