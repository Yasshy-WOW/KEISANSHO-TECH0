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

  // 本人のロールはアセスメント結果から判定する（独自基準）。
  // 17ロールそれぞれで充足度を計算し、最も高いロールを本人のロールとする。
  // 同じ充足度なら達成した重点項目の数が多いロール、それも同じなら roles の順で先のロール
  function assessedRole(lv) {
    let best = null;
    D.roles.forEach((_, i) => {
      const req = reqOf(i);
      const met = req.filter((v, j) => v >= 3 && SC[lv[j]] >= v).length;
      const cand = { i, rate: rateOf(lv, req), met };
      if (!best || cand.rate > best.rate || (cand.rate === best.rate && cand.met > best.met)) best = cand;
    });
    return best.i;
  }
  // すべての画面で、データに入っている role ではなくアセスメント結果から判定したロールを使う
  D.people.forEach((p) => { p.role = assessedRole(p.lv); });

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

  // 集団（会社全体・人材データバンク全体・選んだ企業など）のスコア平均（独自基準）
  // 分類ごとに、各人の分類内の平均水準（a=4〜d=1）を対象者全員で平均する。ロールによる区別はしない。
  // nTop：分類内のすべての項目が最高評価 a（分類の平均4.0）の人数。total：母数（対象者の人数）
  function groupStats(people) {
    return SCORED_SUBS.map((si) => {
      const js = SCORED.map((it, j) => j).filter((j) => SCORED[j][0] === si);
      const per = people.map((p) => Math.round((10 * js.reduce((s, j) => s + SC[p.lv[j]], 0)) / js.length) / 10);
      return {
        si, cat: D.subs[si][0], name: D.subs[si][1], n: js.length,
        avgNow: people.length ? Math.round((10 * per.reduce((s, v) => s + v, 0)) / people.length) / 10 : 0,
        avgReq: null, avgPre: null,
        nTop: people.filter((p) => js.every((j) => p.lv[j] === 'a')).length,
        total: people.length
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
    // 色は CSS のクラスで指定（企業ポータルはデジタル庁ダッシュボードガイドブックの配色）。
    // 系列は色だけでなく線種・マーカーの形でも区別する：要求＝破線／派遣前＝実線＋四角／現在＝実線＋丸＋塗り
    let g = '';
    [1, 2, 3, 4].forEach((v) => {
      g += '<polygon points="' + poly(stats.map(() => v)) + '" class="rd-grid"/>';
      const p = pt(0, v);
      g += '<text x="' + (p[0] + 6) + '" y="' + (p[1] + 4) + '" class="rd-tick">' + KEY[v] + '</text>';
    });
    stats.forEach((s, i) => {
      const p = pt(i, 4);
      g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" class="rd-grid"/>';
    });
    const series = [];
    const tip = (s) => '<title>' + esc(s.name) + '：' + (o.nowLabel || '現在') + ' ' + s.avgNow.toFixed(1) + (o.pre ? '／派遣前 ' + s.avgPre.toFixed(1) : '') + (o.noReq ? '' : '／' + (o.reqLabel || 'ロールの要求') + ' ' + s.avgReq.toFixed(1)) + '</title>';
    // o.noReq：ロールの要求（破線）を描かない（会社全体のチャート用）
    if (!o.noReq) series.push('<polygon points="' + poly(stats.map((s) => s.avgReq)) + '" class="rd-req"/>');
    if (o.pre) {
      series.push('<polygon points="' + poly(stats.map((s) => s.avgPre)) + '" class="rd-pre"/>');
      stats.forEach((s, i) => {
        const p = pt(i, s.avgPre);
        series.push('<rect x="' + (p[0] - 4).toFixed(1) + '" y="' + (p[1] - 4).toFixed(1) + '" width="8" height="8" class="rd-pre-pt">' + tip(s) + '</rect>');
      });
    }
    series.push('<polygon points="' + poly(stats.map((s) => s.avgNow)) + '" class="rd-now"/>');
    stats.forEach((s, i) => {
      const p = pt(i, s.avgNow);
      series.push('<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" class="rd-now-pt">' + tip(s) + '</circle>');
    });
    // 軸ラベル（クリックで詳細ページへ）
    const labels = stats.map((s, i) => {
      const p = pt(i, 4.32);
      const c = Math.cos(ang(i));
      const anchor = Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end';
      const dy = Math.sin(ang(i)) < -0.9 ? -14 : Math.sin(ang(i)) > 0.9 ? 8 : -4;
      // o.label(s) があれば判定ラベルを差し替える（会社全体の集計など）。href が無ければリンクにしない
      const jd = o.label ? o.label(s) : s.judge === 'none' ? '重点項目なし' : (s.judge === 'ok' ? '達成 ' : '未達 ') + s.metNow + '/' + s.key;
      const text = '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + dy).toFixed(1) + '" text-anchor="' + anchor + '">' +
          '<tspan class="rd-name' + (href ? '' : ' plain') + '">' + esc(s.name) + '</tspan>' +
          '<tspan x="' + p[0].toFixed(1) + '" dy="16" class="rd-judge ' + (o.label ? 'info' : s.judge) + '">' + esc(jd) + '</tspan>' +
        '</text>';
      return href
        ? '<a href="' + esc(href(s.si)) + '" class="rd-link"><title>' + esc(s.name) + 'の詳細項目を見る</title>' + text + '</a>'
        : '<g>' + text + '</g>';
    }).join('');
    // 読み上げ用の要約（ガイドブック：グラフに代替テキストを付ける）
    const summary = 'サブカテゴリー別のスキル水準のレーダーチャート。' + stats.map((s) => s.name + ' ' + (o.nowLabel || '現在') + s.avgNow.toFixed(1) +
      (o.pre ? '（派遣前' + s.avgPre.toFixed(1) + '）' : '') + (o.noReq ? '' : '、' + (o.reqLabel || '要求') + s.avgReq.toFixed(1))).join('。') + '。目盛りは d=1 〜 a=4。';
    return '<svg class="radar" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(summary) + '">' +
      g + series.join('') + labels + '</svg>';
  }

  window.DQX = { D, SC, KEY, LEVELS, SCORED, PERSONAL, SCORED_SUBS, reqOf, rateOf, assessedRole, gapsOf, esc, lv, legend, bar, roleName, typeName, bind, subStats, groupStats, radar };
})();
