// 実践DXクエスト：共通の計算と表示部品
(function () {
  const D = window.DQ;

  // 重要度 a〜d を比較用の数値にする（独自基準）。z（パーソナルスキル）は数値化しない
  const SC = { a: 4, b: 3, c: 2, d: 1 };
  const KEY = { 4: 'a', 3: 'b', 2: 'c', 1: 'd' };

  // 公式の凡例
  const LEVELS = {
    a: '高い実践力と専門性が必要',
    b: '一定の実践力と専門性が必要',
    c: '説明可能なレベルで理解が必要',
    d: '位置づけや関連性の理解が必要',
    z: '役割や状況に応じた実践力が必要（パーソナルスキル）'
  };

  // パーソナルスキル以外の61項目（個人評価の対象）
  const SCORED = D.items.filter((it) => D.subs[it[0]][0] !== 'パーソナルスキル');
  const PERSONAL = D.items.filter((it) => D.subs[it[0]][0] === 'パーソナルスキル');
  const SCORED_SUBS = D.subs.map((s, i) => i).filter((i) => D.subs[i][0] !== 'パーソナルスキル');

  // ロール（複数可）の公式重要度。複数なら項目ごとに高い方
  function reqOf(roles) {
    const list = Array.isArray(roles) ? roles : [roles];
    return SCORED.map((it) => Math.max.apply(null, list.map((r) => SC[it[2][r]])));
  }

  // 重点項目（a・b）のうち、評価が重要度以上の割合（%）
  function rateOf(lv, req) {
    const key = req.map((r, j) => j).filter((j) => req[j] >= 3);
    const met = key.filter((j) => SC[lv[j]] >= req[j]).length;
    return Math.round((100 * met) / key.length);
  }

  // 未達の重点項目の名前
  function gapsOf(lv, req) {
    return SCORED.filter((it, j) => req[j] >= 3 && SC[lv[j]] < req[j]).map((it) => it[1]);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function lv(k, opts) {
    const o = opts || {};
    if (!k) return '<span class="lv lv-none">—</span>';
    return '<span class="lv lv-' + k + (o.sm ? ' sm' : '') + (o.key ? ' key' : '') + '" title="' + esc(LEVELS[k]) + '">' + k + '</span>';
  }

  function legend(keys, title) {
    return '<div class="legend">' + (title ? '<strong>' + esc(title) + '</strong>' : '') +
      keys.map((k) => '<span>' + lv(k, { sm: true }) + esc(LEVELS[k].replace('（パーソナルスキル）', '')) + '</span>').join('') + '</div>';
  }

  function bar(pct, low) {
    return '<span class="bar' + (low ? ' low' : '') + '" aria-hidden="true"><span style="width:' + pct + '%"></span></span>';
  }

  function roleName(r) { return D.roles[r][0]; }
  function typeName(r) { return D.types[D.roles[r][1]]; }

  // クリックを data-act 属性で受ける
  function bind(root, handlers) {
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-act]');
      if (!el || !root.contains(el)) return;
      const fn = handlers[el.getAttribute('data-act')];
      if (fn) fn(el.getAttribute('data-val'), el);
    });
  }

  // サブカテゴリーごとの集計（レーダーチャート用）
  // req：重要度の数値（reqOf の結果）、now / pre：個人評価の文字列（pre は無い場合 null）
  // avg*：項目の平均水準（a=4〜d=1）、key / met*：重点項目（a・b）の数と達成数
  function subStats(req, now, pre) {
    const avg = (js, f) => Math.round((10 * js.reduce((s, j) => s + f(j), 0)) / js.length) / 10;
    return SCORED_SUBS.map((si) => {
      const js = SCORED.map((it, j) => j).filter((j) => SCORED[j][0] === si);
      const key = js.filter((j) => req[j] >= 3);
      const metNow = key.filter((j) => SC[now[j]] >= req[j]).length;
      const metPre = pre ? key.filter((j) => SC[pre[j]] >= req[j]).length : null;
      return {
        si, cat: D.subs[si][0], name: D.subs[si][1], n: js.length,
        avgReq: avg(js, (j) => req[j]), avgNow: avg(js, (j) => SC[now[j]]), avgPre: pre ? avg(js, (j) => SC[pre[j]]) : null,
        key: key.length, metNow, metPre,
        judge: key.length === 0 ? 'none' : metNow === key.length ? 'ok' : 'ng'
      };
    });
  }

  // レーダーチャート（SVG）。stats は subStats の結果、href(si) は各分類のリンク先
  // 目盛りは d=1〜a=4。ロールの要求（灰色の破線）・派遣前（橙）・現在（青緑）を重ねる
  function radar(stats, href, opts) {
    const o = opts || {};
    const W = 900, H = 540, cx = W / 2, cy = H / 2 + 4, R = 180;
    const n = stats.length;
    const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * (v / 4), cy + Math.sin(ang(i)) * R * (v / 4)];
    const poly = (vals) => vals.map((v, i) => pt(i, v).map((x) => x.toFixed(1)).join(',')).join(' ');
    let g = '';
    [1, 2, 3, 4].forEach((v) => {
      g += '<polygon points="' + poly(stats.map(() => v)) + '" fill="none" stroke="#DCE3E6" stroke-width="1"/>';
      const p = pt(0, v);
      g += '<text x="' + (p[0] + 6) + '" y="' + (p[1] + 4) + '" class="rd-tick">' + KEY[v] + '</text>';
    });
    stats.forEach((s, i) => {
      const p = pt(i, 4);
      g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="#DCE3E6" stroke-width="1"/>';
    });
    const series = [];
    series.push('<polygon points="' + poly(stats.map((s) => s.avgReq)) + '" fill="none" stroke="#7A8A93" stroke-width="2" stroke-dasharray="6 4"/>');
    if (o.pre) series.push('<polygon points="' + poly(stats.map((s) => s.avgPre)) + '" fill="none" stroke="#C47A1A" stroke-width="2"/>');
    series.push('<polygon points="' + poly(stats.map((s) => s.avgNow)) + '" fill="#0089A8" fill-opacity="0.16" stroke="#0089A8" stroke-width="2"/>');
    stats.forEach((s, i) => {
      const p = pt(i, s.avgNow);
      series.push('<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="#0089A8" stroke="#FFFFFF" stroke-width="2"><title>' +
        esc(s.name) + '：現在 ' + s.avgNow + (o.pre ? '／派遣前 ' + s.avgPre : '') + '／ロールの要求 ' + s.avgReq + '</title></circle>');
    });
    // 軸ラベル（クリックで詳細ページへ）
    const labels = stats.map((s, i) => {
      const p = pt(i, 4.32);
      const c = Math.cos(ang(i));
      const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
      const dy = Math.sin(ang(i)) < -0.9 ? -14 : Math.sin(ang(i)) > 0.9 ? 8 : -4;
      const jd = s.judge === 'none' ? '重点項目なし' : (s.judge === 'ok' ? '達成 ' : '未達 ') + s.metNow + '/' + s.key;
      return '<a href="' + esc(href(s.si)) + '" class="rd-link">' +
        '<title>' + esc(s.name) + 'の詳細項目を見る</title>' +
        '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '">' +
          '<tspan class="rd-name">' + esc(s.name) + '</tspan>' +
          '<tspan x="' + p[0].toFixed(1) + '" dy="16" class="rd-judge ' + s.judge + '">' + jd + '</tspan>' +
        '</text></a>';
    }).join('');
    return '<svg class="radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="サブカテゴリー別のスキル水準のレーダーチャート">' +
      g + series.join('') + labels + '</svg>';
  }

  window.DQX = { D, SC, KEY, LEVELS, SCORED, PERSONAL, SCORED_SUBS, reqOf, rateOf, gapsOf, esc, lv, legend, bar, roleName, typeName, bind, subStats, radar };
})();
