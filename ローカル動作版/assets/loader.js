// API（/api/dq）から画面用のデータを読み込み、window.DQ に入れてから各画面のプログラムを読み込む
// 使い方：<script src="../assets/loader.js" data-scope="company" data-scripts="common.js,hr.js"></script>
//   data-scope   … base（data.js 相当）／company（＋X社の社員）／all（＋X社以外の人材）
//   data-scripts … assets フォルダの中で、データのあとに順番に読み込むファイル（カンマ区切り）
(function () {
  var me = document.currentScript;
  var assets = me.src.replace(/[^/]*$/, '');               // …/assets/
  var root = assets.replace(/assets\/$/, '');              // サイトのトップ
  var scope = me.getAttribute('data-scope') || 'base';
  var scripts = (me.getAttribute('data-scripts') || '').split(',').filter(Boolean);

  function fail() {
    var main = document.querySelector('main') || document.body;
    main.innerHTML = '<p class="sub" role="alert" style="padding:24px">データを読み込めませんでした。時間をおいてページを再読み込みしてください。</p>';
  }

  function loadNext() {
    var name = scripts.shift();
    if (!name) return;
    var s = document.createElement('script');
    s.src = assets + name.trim();
    s.onload = loadNext;
    s.onerror = fail;
    document.body.appendChild(s);
  }

  fetch(root + 'api/dq?scope=' + encodeURIComponent(scope), { headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      window.DQ = data;
      loadNext();
    })
    .catch(function (err) {
      console.error(err);
      fail();
    });
})();
