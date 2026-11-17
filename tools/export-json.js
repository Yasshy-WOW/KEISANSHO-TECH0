// assets/data.js・data-staff.js・data-others.js を読み込み、MySQL に入れるための JSON を標準出力に書き出す
// 使い方：node tools/export-json.js > dq.json（db/seed.py が自動で呼び出すので、ふだんは直接使わなくてよい）
// 人材には、どのファイルから来たかを source（0 = data.js、1 = data-staff.js、2 = data-others.js）として付ける
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.argv[2] || path.join(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);

const files = ['data.js', 'data-staff.js', 'data-others.js'];
const ends = [];
for (const f of files) {
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', f), 'utf8'), ctx, { filename: f });
  ends.push(ctx.window.DQ.people.length);
}

const D = ctx.window.DQ;
D.people.forEach((p, i) => {
  p.__source = ends.findIndex((end) => i < end);
});
process.stdout.write(JSON.stringify(D));
