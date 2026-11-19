// 登録人材のサンプルデータ生成（固定シードで再現可能）
// ・X社：既存5名＋追加195名＝200名 → assets/data-staff.js（企業ポータルとDX人材データバンクで読み込む）
// ・X社以外の99社：1社10名（Y社・Z社は既存の人を含めて10名）→ assets/data-others.js（DX人材データバンクだけで読み込む）
//   参加大企業は東証の大分類10分類×10社＝100社（data.js の ents）
const fs = require('fs');
const path = require('path');
// 使い方：site フォルダで `node tools/generate-staff.js` を実行すると、上の2ファイルを作り直す（固定シードなので毎回同じ結果）
const site = process.argv[2] || path.join(__dirname, "..");
global.window = {};
eval(fs.readFileSync(path.join(site, 'assets/data.js'), 'utf8'));
const D = window.DQ;

let seed = 20261116;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
// 評価（スキル）づくりには別の乱数列 rndS を使う。評価の作り方を変えても、氏名・部署・派遣実績などは変わらない
let seedS = 20261118;
const rndS = () => { seedS = (seedS * 1664525 + 1013904223) >>> 0; return seedS / 4294967296; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

const SC = { a: 4, b: 3, c: 2, d: 1 }, KEY = { 4: 'a', 3: 'b', 2: 'c', 1: 'd' };
const SCORED = D.items.filter((it) => D.subs[it[0]][0] !== 'パーソナルスキル');

const SEI = '佐藤 鈴木 高橋 田中 伊藤 渡辺 山本 中村 小林 加藤 吉田 山田 佐々木 山口 松本 井上 木村 林 斎藤 清水 山崎 森 池田 橋本 阿部 石川 山下 中島 石井 小川 前田 岡田 長谷川 藤田 後藤 近藤 村上 遠藤 青木 坂本 斉藤 福田 太田 西村 藤井 金子 岡本 藤原 中野 三浦 原田 中川 松田 竹内 小野 田村 中山 和田 石田 森田 上田 原 柴田 酒井 工藤 横山 宮崎 宮本 内田 高木 安藤 島田 谷口 大野 丸山 今井 河野 藤本 村田 武田 上野 杉山 増田 小山 大塚 平野 菅原 久保 松井 千葉 岩崎 桜井 野口 松尾 菊地 木下 野村 新井'.split(' ');
const MEI = '大輔 翔太 拓也 健太 直樹 和也 達也 雄太 亮 誠 悠斗 陽介 大樹 隆之 浩二 修 剛 学 智也 慎吾 健一 洋平 俊介 蓮 湊 颯太 美咲 陽子 由美 恵子 真由美 彩 愛 香織 麻衣 優子 千尋 奈々 結衣 さくら 明日香 理恵 舞 沙織 智子 葵 真理子 美穂 綾 遥 桃子 里奈 知美 菜摘 涼子 加奈子'.split(' ');

// 20部署：[部署名, 課の一覧, 候補ロール, 自己評価の職種区分, 職種, 希望テーマ]
const DEPTS = [
  ['経営企画部', ['経営企画課', '事業管理課'], [0, 1, 6], 0, '経営企画', ['製造業の業務プロセス改革', '中小企業の経営管理の高度化', '地域企業の事業計画づくり']],
  ['事業企画部', ['事業企画課', '新規事業課'], [0, 2, 3], 0, '経営企画', ['地域企業の新規事業立ち上げ', 'サブスクリプション型事業の立ち上げ']],
  ['営業本部', ['法人営業課', '販売推進課', '代理店営業課'], [1, 3, 6], 0, '営業', ['営業活動のデジタル化', '顧客管理の仕組みづくり']],
  ['営業企画部', ['営業企画課', '営業管理課'], [1, 6, 0], 0, '営業', ['営業データの活用', '販売管理の見える化']],
  ['マーケティング部', ['顧客分析課', 'デジタルマーケティング課'], [6, 5, 3], 0, 'マーケティング', ['小売業のデータ活用', 'ECサイトの集客改善', 'SNSを使った販路開拓']],
  ['広報部', ['広報課', 'ブランド推進課'], [5, 3, 4], 0, 'その他', ['中小企業の情報発信支援', 'Webサイトのリニューアル']],
  ['人事部', ['人事課', '人材開発課', '労務課'], [1, 2, 8], 0, '人事', ['中小企業の人事・労務のデジタル化', '社内のデジタル人材育成']],
  ['経理部', ['経理課', '財務課'], [1, 8, 6], 0, 'その他', ['経理業務のペーパーレス化', '会計データの活用']],
  ['法務部', ['法務課', 'コンプライアンス課'], [15, 1, 8], 0, 'その他', ['中小企業のセキュリティ体制づくり', '契約業務の電子化']],
  ['購買部', ['調達課', '購買管理課'], [1, 8, 9], 0, '生産管理・生産技術', ['受発注業務のデジタル化', '在庫管理の効率化']],
  ['物流部', ['物流企画課', '倉庫管理課'], [1, 9, 14], 0, '生産管理・生産技術', ['物流・倉庫業務の効率化', '配送管理のデジタル化']],
  ['生産技術部', ['生産技術課', '設備技術課'], [14, 1, 9], 0, '生産管理・生産技術', ['製造現場のIoT・データ活用', '設備保全の高度化']],
  ['製造部', ['第一工場 製造課', '第二工場 製造課', '生産管理課'], [14, 1, 0], 0, '生産管理・生産技術', ['製造現場のIoT・データ活用', '生産計画の効率化']],
  ['品質保証部', ['品質保証課', '品質管理課'], [7, 8, 1], 0, '生産管理・生産技術', ['品質データの分析・活用', '検査工程のデジタル化']],
  ['研究開発部', ['基盤技術課', '先行開発課'], [7, 14, 10], 1, 'その他', ['AI・データ分析の業務活用', '試作開発の効率化']],
  ['商品企画部', ['商品企画課', 'UXデザイン課'], [2, 4, 3], 1, 'デザイナー', ['Webサイト・アプリ開発', '観光・サービス業の顧客体験改善']],
  ['情報システム部', ['運用課', '開発課', '基幹システム課', 'データ基盤課'], [12, 9, 13, 10], 1, null, ['業務システムの開発・刷新', 'データ基盤の構築・整備', 'クラウド移行・業務システム刷新']],
  ['DX推進室', ['DX企画課', 'デジタル推進課'], [0, 2, 6, 11], 1, 'ディレクター', ['中小企業のDX推進', '観光・サービス業の顧客体験改善']],
  ['データ活用推進部', ['データ分析課', 'データ管理課'], [7, 6, 8, 9], 1, 'データエンジニア', ['小売業のデータ活用', 'データ基盤の構築・整備', 'AI・データ分析の業務活用']],
  ['セキュリティ統括部', ['セキュリティ企画課', 'セキュリティ運用課'], [15, 16, 13], 1, 'インフラエンジニア', ['中小企業のセキュリティ体制づくり', 'クラウド移行・業務システム刷新']]
];
const ROLE_JOB = { 9: 'データエンジニア', 10: 'データエンジニア', 11: 'ソフトウェアエンジニア', 12: 'ソフトウェアエンジニア', 13: 'インフラエンジニア', 16: 'インフラエンジニア' };

// 派遣実績（架空の中小企業クエスト）
const PAST = [
  ['Q-2025-021', 'K社（食品製造）', '製造日報のデジタル化', '2025年10月〜12月'],
  ['Q-2025-024', 'L社（小売）', '売上データの分析と販促改善', '2025年11月〜2026年1月'],
  ['Q-2026-002', 'M社（運送業）', '配車管理の効率化', '2026年1月〜3月'],
  ['Q-2026-004', 'N社（旅館）', '予約管理システムの導入', '2026年2月〜4月'],
  ['Q-2026-006', 'P社（金属加工）', '生産計画の見える化', '2026年3月〜5月'],
  ['Q-2026-008', 'R社（会計事務所）', '社内ネットワークのセキュリティ強化', '2026年4月〜6月']
];
const NOW = [
  ['Q-2026-016', 'S社（農業法人）', '出荷管理のクラウド化', '2026年10月〜12月'],
  ['Q-2026-017', 'T社（介護サービス）', '介護記録のデジタル化', '2026年11月〜2027年1月']
];
const FB_OK = ['課題の整理から現場への定着まで丁寧に進めてくれた。', '社員の声をよく聞き、無理のない仕組みにしてくれた。', '短期間で成果が見える形にしてくれ、社内の意識も変わった。', '専門的な内容を分かりやすく説明してくれて助かった。'];
const FB_NG = ['方針は固まったが、期間内に導入まで終わらなかった。', '現場との調整に時間がかかり、定着までは至らなかった。'];
const MONTHS = ['2026年5月', '2026年6月', '2026年7月', '2026年8月', '2026年9月', '2026年10月'];

// 個人評価（全員が61項目すべてのアセスメントを受けている前提）
// 水準 = BASE ＋ K_REQ ×（ロールの要求 − 2.5）＋ 本人の実力 ＋ 会社の傾向 ＋ 本人の得意・不得意 ＋ 項目ごとのばらつき
// 会社の傾向（X社＝電機メーカー）：技術・開発に強く、デザイン・データ活用・変革に弱い。分類（subs の番号）ごとの補正
const BASE = 2.1, K_REQ = 0.6, NOISE = 3.8; // BASE：水準の基準値。K_REQ：ロールの要求にどれだけ沿わせるか（1＝要求の高さに比例、0＝要求に関係なし）。NOISE：項目ごとのばらつきの幅
const CO = { 0: 1.4, 1: 1.0, 2: 0.2, 3: 0.5, 4: 0.4, 5: -2.4, 6: 0.3, 7: 0.7, 8: 2.4, 9: 0.6, 10: 0.8 };
const SUBS = Object.keys(CO).map(Number);
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rndS() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
function genLv(role, skill, co = CO) {
  // 本人の得意分類（2つ：+1）と不得意分類（3つ：−1、うち1つは−1.5）
  const s = shuffle(SUBS), my = {};
  my[s[0]] = 1; my[s[1]] = 1; my[s[2]] = -1; my[s[3]] = -1; my[s[4]] = -1.5;
  return SCORED.map((it) => {
    const r = SC[it[2][role]];
    const v = BASE + K_REQ * (r - 2.5) + skill + co[it[0]] + (my[it[0]] || 0) + (rndS() - 0.5) * NOISE;
    return KEY[Math.max(1, Math.min(4, Math.round(v)))];
  }).join('');
}
// 充足度が100%にならないよう（上限）、達成している重点項目を未達へ下げて最大95%前後に抑える
const reqOfRole = (role) => SCORED.map((it) => SC[it[2][role]]);
function rateOfLv(lv, req) {
  const key = req.map((r, j) => j).filter((j) => req[j] >= 3);
  return Math.round(100 * key.filter((j) => SC[lv[j]] >= req[j]).length / key.length);
}
function capLv(lv, role) {
  const req = reqOfRole(role), a = lv.split('');
  while (rateOfLv(a.join(''), req) > 95) {
    const met = req.map((r, j) => j).filter((j) => req[j] >= 3 && SC[a[j]] >= req[j]);
    const j = met[Math.floor(rndS() * met.length)];
    a[j] = KEY[req[j] - 1];
  }
  // 下限：充足度が10%未満にならないよう、未達の重点項目を要求の水準まで上げる
  while (rateOfLv(a.join(''), req) < 10) {
    const ng = req.map((r, j) => j).filter((j) => req[j] >= 3 && SC[a[j]] < req[j]);
    const j = ng[Math.floor(rndS() * ng.length)];
    a[j] = KEY[req[j]];
  }
  return a.join('');
}
// 派遣前の評価：現在より一部の重点項目が1段階低い
// 達成済みの重点項目を少なくとも1つは派遣前に未達へ戻し、派遣で充足度が上がった形にする
function lowerLv(lv, role) {
  const met = [];
  const out = lv.split('').map((k, j) => {
    const r = SC[SCORED[j][2][role]];
    if (r >= 3 && SC[k] >= r) met.push(j);
    return (r >= 3 && SC[k] > 1 && rndS() < 0.3) ? KEY[SC[k] - 1] : k;
  });
  const j = met.length ? met[Math.floor(rndS() * met.length)] : -1;
  if (j >= 0) out[j] = KEY[Math.max(1, SC[lv[j]] - 1)];
  return out.join('');
}

// 部署の人数：既存5名を含めて合計200名、各部署に最低1名以上
const existing = D.people.filter((p) => p.ent === 'X社');
const order = [];
DEPTS.forEach((d, i) => { if (!existing.some((p) => p.dept === d[0])) order.push(i); });
while (order.length < 200 - existing.length) order.push(Math.floor(rnd() * DEPTS.length));

const used = new Set(D.people.map((p) => p.name));
// 1人分のデータを作る。ent：会社、co：会社の傾向（分類ごとの補正）
function makePerson(d, id, ent, co) {
  let name;
  do { name = pick(SEI) + ' ' + pick(MEI); } while (used.has(name));
  used.add(name);
  const years = ri(1, 22);
  const hire = 2027 - years;
  const role = pick(d[2]);
  // 実力：年次が長いほど高め
  const skill = Math.max(-0.8, Math.min(1.2, (years - 9) / 14 + (rndS() - 0.45) * 1.0));
  const lv = capLv(genLv(role, skill, co), role);

  // 経歴（入社〜現在、最大3つ）
  const career = [];
  const moves = years <= 2 ? 1 : years <= 6 ? ri(1, 2) : ri(2, 3);
  const pts = [hire];
  for (let k = 1; k < moves; k++) pts.push(Math.min(2026, pts[k - 1] + ri(2, Math.max(2, Math.floor(years / moves) + 1))));
  pts.forEach((y, k) => {
    const last = k === moves - 1;
    const dept = last ? d : (rnd() < 0.5 ? d : pick(DEPTS));
    const title = !last ? '担当' : years >= 15 ? pick(['課長', '課長代理']) : years >= 7 ? '主任' : '担当';
    career.push({ from: y + '年' + (k === 0 ? 4 : pick([4, 10])) + '月', dept: dept[0] + ' ' + pick(dept[1]), title });
  });
  // 同じ年月が続かないよう整える
  for (let k = 1; k < career.length; k++) if (career[k].from <= career[k - 1].from && career[k].from.length === career[k - 1].from.length) career[k].from = (parseInt(career[k - 1].from) + 1) + '年4月';

  const on = pick(MONTHS);
  const p = {
    id,
    name,
    ent: ent.id,
    company: ent.label,
    dept: d[0],
    years: '入社' + years + '年目',
    role,
    active: false,
    wish: pick(d[5]),
    career
  };
  if (rnd() < 0.75) {
    const type = d[3];
    const job = d[4] || ROLE_JOB[role] || 'ソフトウェアエンジニア';
    p.self = { type, job, level: Math.max(1, Math.min(5, Math.round(1 + years / 6 + (rnd() - 0.3)))), on };
  }
  p.on = on;
  p.lv = lv;
  p.pre = null;
  p.dispatch = null;
  const x = rnd();
  if (x < 0.18) {
    const q = pick(PAST), ok = rnd() < 0.8;
    p.on = '2026年' + ri(7, 10) + '月';
    p.pre = { on: '2026年' + ri(1, 3) + '月', lv: lowerLv(lv, role) };
    p.dispatch = { quest: q[0], sme: q[1], title: q[2], period: q[3], result: ok ? '成功' : '未達', feedback: rnd() < 0.8 ? pick(ok ? FB_OK : FB_NG) : '' };
  } else if (x < 0.24) {
    const q = pick(NOW);
    p.active = true;
    p.dispatch = { quest: q[0], sme: q[1], title: q[2], period: q[3], result: '実施中', feedback: '' };
  }
  return p;
}
const X = D.ents.find((e) => e.id === 'X社');
const out = order.map((di, n) => makePerson(DEPTS[di], 'TB-' + String(1001 + n), X, CO));

// ---- ロールをアセスメント結果から判定する（画面の common.js の assessedRole と同じ規則） ----
// 上の生成では部署の候補ロールを「評価の作り方の基準」に使っただけ。本人のロールは、17ロールのうち充足度が最も高いロールとする。
// 名前・部署などの並びを変えないよう、ここからは別の乱数列（rnd2）を使う
let seed2 = 20261117;
const rnd2 = () => { seed2 = (seed2 * 1664525 + 1013904223) >>> 0; return seed2 / 4294967296; };
function bestRole(lv) {
  let best = null;
  D.roles.forEach((_, i) => {
    const req = reqOfRole(i);
    const met = req.filter((v, j) => v >= 3 && SC[lv[j]] >= v).length;
    const c = { i, rate: rateOfLv(lv, req), met };
    if (!best || c.rate > best.rate || (c.rate === best.rate && c.met > best.met)) best = c;
  });
  return best;
}
function judgeRole(p) {
  // どのロールで見ても充足度が95%を超えないよう、最も高いロールの達成済み重点項目を下げる
  const a = p.lv.split('');
  let b = bestRole(a.join(''));
  while (b.rate > 95) {
    const req = reqOfRole(b.i);
    const met = req.map((r, j) => j).filter((j) => req[j] >= 3 && SC[a[j]] >= req[j]);
    const j = met[Math.floor(rnd2() * met.length)];
    a[j] = KEY[req[j] - 1];
    b = bestRole(a.join(''));
  }
  p.lv = a.join('');
  p.role = b.i;
  // 派遣前の評価は、判定したロールの重点項目を基準に作り直す（派遣で充足度が必ず上がる形）
  if (p.pre) {
    const req = reqOfRole(p.role);
    const met = req.map((r, j) => j).filter((j) => req[j] >= 3 && SC[a[j]] >= req[j]);
    const pre = a.map((k, j) => (req[j] >= 3 && SC[k] > 1 && rnd2() < 0.3) ? KEY[SC[k] - 1] : k);
    if (met.length) { const j = met[Math.floor(rnd2() * met.length)]; pre[j] = KEY[req[j] - 1]; }
    p.pre.lv = pre.join('');
  }
}
out.forEach(judgeRole);

const body = '// X社（企業ポータルのログイン企業）の登録社員の追加サンプル（195名）。既存5名と合わせて200名・20部署\n' +
  '// 氏名・部署・評価はすべて架空のサンプルです。企業ポータル（company/）の画面だけで読み込みます\n' +
  '// role はアセスメント結果（lv）から判定した値（17ロールのうち充足度が最も高いロール）。tools/generate-staff.js で生成\n' +
  'window.DQ.people.push(\n' + out.map((p) => '  ' + JSON.stringify(p)).join(',\n') + '\n);\n';
fs.writeFileSync(path.join(site, 'assets/data-staff.js'), body);

// ---- X社以外の99社（1社10名）----
// 東証の大分類10分類を1社ずつ（X社＝製造業）。部署は各社の業種に合わせて候補を選び、会社の傾向（co）は業種のイメージで決めた架空の値
// X社のデータを変えないよう、ここからは乱数の種を改めて設定する
seed = 20261201; seedS = 20261202; seed2 = 20261203;
const OTHERS = {
  'U社': { depts: ['経営企画部', '営業本部', '製造部', '品質保証部', '物流部', '情報システム部'],
          co: { 0: 0.2, 1: -0.3, 2: 0.0, 3: -0.5, 4: -0.8, 5: -1.2, 6: -0.3, 7: -1.2, 8: -0.6, 9: -0.5, 10: -1.0 } },
  'V社': { depts: ['経営企画部', '研究開発部', '生産技術部', 'データ活用推進部', '法務部', '情報システム部'],
          co: { 0: 0.6, 1: -0.4, 2: 0.2, 3: -1.0, 4: 0.2, 5: 0.4, 6: 0.5, 7: -0.6, 8: 0.8, 9: 0.3, 10: -0.3 } },
  'W社': { depts: ['経営企画部', '事業企画部', '生産技術部', '購買部', 'DX推進室', '情報システム部'],
          co: { 0: 0.3, 1: 0.2, 2: 0.6, 3: 0.2, 4: -0.6, 5: -1.0, 6: -0.2, 7: -0.8, 8: 0.6, 9: 0.4, 10: -0.4 } },
  'Q社': { depts: ['経営企画部', '生産技術部', 'セキュリティ統括部', 'データ活用推進部', '情報システム部', '法務部'],
          co: { 0: 0.2, 1: -0.2, 2: 0.0, 3: -0.6, 4: 0.2, 5: 0.1, 6: 0.6, 7: 0.0, 8: 0.9, 9: 1.2, 10: 1.0 } },
  'J社': { depts: ['事業企画部', '商品企画部', '情報システム部', 'データ活用推進部', 'セキュリティ統括部', 'DX推進室'],
          co: { 0: 0.4, 1: 0.8, 2: 0.2, 3: 0.4, 4: 0.6, 5: 0.6, 6: 0.8, 7: 1.4, 8: 1.6, 9: 0.8, 10: 1.2 } },
  'Y社': { depts: ['営業企画部', '事業企画部', '経営企画部', '物流部', 'DX推進室', '経理部'],
          co: { 0: 1.2, 1: 0.6, 2: 0.9, 3: 0.0, 4: 0.4, 5: -0.6, 6: 0.2, 7: -0.9, 8: -0.3, 9: -0.2, 10: -0.8 } },
  'Z社': { depts: ['経営企画部', '情報システム部', 'セキュリティ統括部', 'データ活用推進部', '法務部', '営業企画部'],
          co: { 0: 0.6, 1: 0.2, 2: 0.3, 3: -0.4, 4: 0.8, 5: 0.5, 6: 0.9, 7: 0.2, 8: 0.0, 9: 1.4, 10: 1.0 } },
  'H社': { depts: ['事業企画部', '営業本部', 'マーケティング部', '経理部', '法務部', '商品企画部'],
          co: { 0: 0.6, 1: 0.5, 2: 0.2, 3: 0.6, 4: -0.4, 5: -1.0, 6: -0.4, 7: -1.0, 8: -0.5, 9: -0.3, 10: -0.8 } },
  'I社': { depts: ['マーケティング部', '商品企画部', '広報部', '事業企画部', 'データ活用推進部', 'DX推進室'],
          co: { 0: 0.5, 1: 1.0, 2: 0.4, 3: 1.4, 4: 0.9, 5: 0.3, 6: 0.2, 7: 0.2, 8: 0.2, 9: -0.4, 10: -0.6 } }
};
// 業種の代表企業（OTHERS の9社）以外の各社は、業種ごとの基本（SECTOR）をもとに、会社ごとの特徴を足して作る（第2.14版）。
//   ・得意分類2つ：+1.0〜+1.6（会社の「看板」になる強み）
//   ・苦手分類2つ：−1.0〜−1.6
//   ・そのほかの分類：±0.4 のばらつき
//   ・会社全体の水準：±0.3
// 製造業の基本は X社（電機）ほど極端にしない一般的な値。ほかの業種は代表企業（OTHERS）と同じ値・部署を使う
const SECTOR = {
  0: 'U社', 1: 'V社', 2: 'W社', 4: 'Q社', 5: 'J社', 6: 'Y社', 7: 'Z社', 8: 'H社', 9: 'I社',
  3: { depts: ['経営企画部', '生産技術部', '製造部', '品質保証部', '研究開発部', '情報システム部'],
       co: { 0: 0.3, 1: 0.2, 2: 0.0, 3: -0.3, 4: -0.2, 5: -0.3, 6: 0.2, 7: 0.3, 8: 0.8, 9: 0.2, 10: 0.1 } }
};
let seedC = 20261205;
const rndC = () => { seedC = (seedC * 1664525 + 1013904223) >>> 0; return seedC / 4294967296; };
const SPEC = {}; // 会社ごとの得意・苦手（確認用）
function cfgOf(e) {
  if (OTHERS[e.id]) return OTHERS[e.id];
  const b = typeof SECTOR[e.sector] === 'string' ? OTHERS[SECTOR[e.sector]] : SECTOR[e.sector];
  const subs = Object.keys(b.co).map(Number);
  for (let i = subs.length - 1; i > 0; i--) { const j = Math.floor(rndC() * (i + 1)); [subs[i], subs[j]] = [subs[j], subs[i]]; }
  const strong = subs.slice(0, 2), weak = subs.slice(2, 4);
  const level = (rndC() - 0.5) * 0.6;
  const co = {};
  Object.keys(b.co).map(Number).forEach((k) => {
    let d = (rndC() - 0.5) * 0.8;
    if (strong.includes(k)) d = 1.0 + rndC() * 0.6;
    if (weak.includes(k)) d = -(1.0 + rndC() * 0.6);
    co[k] = Math.round((b.co[k] + level + d) * 10) / 10;
  });
  SPEC[e.id] = { strong, weak };
  return { depts: b.depts, co };
}
const PER_ENT = 10;
let nextId = 2001;
const others = [];
D.ents.filter((e) => e.id !== 'X社').forEach((e) => {
  const cfg = cfgOf(e);
  const ds = cfg.depts.map((name) => DEPTS.find((d) => d[0] === name));
  const have = D.people.filter((p) => p.ent === e.id).length;
  for (let k = 0; k < PER_ENT - have; k++) {
    const p = makePerson(k < ds.length ? ds[k] : pick(ds), 'TB-' + String(nextId++), e, cfg.co);
    judgeRole(p);
    others.push(p);
  }
});
const bodyO = '// X社以外の参加大企業99社の登録人材のサンプル（1社10名。Y社・Z社は data.js の既存の人を含めて10名）\n' +
  '// 氏名・部署・評価・売上はすべて架空のサンプルです。事務局のDX人材データバンク（admin/talents.html）だけで読み込みます\n' +
  '// role はアセスメント結果（lv）から判定した値。tools/generate-staff.js で生成\n' +
  'window.DQ.people.push(\n' + others.map((p) => '  ' + JSON.stringify(p)).join(',\n') + '\n);\n';
fs.writeFileSync(path.join(site, 'assets/data-others.js'), bodyO);
console.log('others', others.length, 'companies', new Set(others.map((p) => p.ent)).size);

// 確認用の集計
const hist = {}; out.forEach((p) => { const r = rateOfLv(p.lv, reqOfRole(p.role)); const b = Math.floor(r / 10) * 10; hist[b] = (hist[b] || 0) + 1; }); console.log("hist", JSON.stringify(hist));
const all = existing.concat(out);
const req = (r) => SCORED.map((it) => SC[it[2][r]]);
const rate = (lv, q) => { const key = q.map((v, j) => j).filter((j) => q[j] >= 3); return Math.round(100 * key.filter((j) => SC[lv[j]] >= q[j]).length / key.length); };
const rates = all.map((p) => rate(p.lv, req(p.role)));
console.log('total', all.length, 'depts', new Set(all.map((p) => p.dept)).size);
console.log('>=85%', rates.filter((r) => r >= 85).length, 'avg', Math.round(rates.reduce((a, b) => a + b) / rates.length));
console.log('dispatch done', all.filter((p) => p.dispatch && p.dispatch.result !== '実施中').length, 'active', all.filter((p) => p.active).length);
