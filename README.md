# 実践DXクエスト（プロトタイプ）

大企業でDXに関わりたい社員を中小企業の課題（クエスト）に派遣し、実践を通じてDX人材を育てる「実践DXクエスト」の画面プロトタイプです。スキルはデジタルスキル標準 ver.2.0（IPA）のロールと共通スキルリストで管理します。

> 画面に出てくる企業名・人名・評価・数値は、すべて説明用の架空データです。

## 見かた

画面のデータは、バックエンド（Python / FastAPI）が MySQL から読んで返します。HTML をブラウザで直接開くだけでは表示されないので、サーバーを起動してください。

- 公開先（Azure App Service）：https://jissen-dx-quest.azurewebsites.net
- 構成とデプロイの手順：[デプロイ計画.md](デプロイ計画.md)

### 手元で動かす

Python 3.11 と Node.js が必要です。

```
pip install -r requirements.txt
copy .env.example .env        # .env に DB の接続情報を書く（GitHub には上がりません）
python -m db.seed             # assets/data*.js の内容をデータベースに入れる（初回とデータを変えたとき）
uvicorn app.main:app --reload # http://localhost:8000 を開く
```

MySQL を使わずに確認するときは、`.env` に `DATABASE_URL=sqlite:///local.db` と書くと SQLite を使います。

### API

| URL | 内容 |
|---|---|
| `/api/dq?scope=base` | マスタ・クエスト・従来の登録人材（① クエスト管理） |
| `/api/dq?scope=company` | 上に加えて X社の社員（企業ポータル） |
| `/api/dq?scope=all` | すべての登録人材（② DX人材データバンク） |
| `/api/health` | データベースに接続できるかの確認 |
| `/api/docs` | API の説明（自動生成） |

## 画面

| 入口 | 画面 | 利用者 |
|---|---|---|
| `admin/index.html` | ① クエスト管理（課題と必要スキル） | 事務局 |
| `admin/talents.html` | ② DX人材データバンク（登録人材全体／企業別のタブ、レーダーチャート） | 事務局 |
| `company/index.html` | ③ 自社人材の育成状況（会社全体／従業員のタブ、レーダーチャート） | 大企業の人事部 |
| `company/skill.html` | ③-2 分類ごとのスキル項目の評価 | 大企業の人事部 |
| `company/quests.html` | ④ クエスト一覧（大企業向け） | 大企業の人事部 |

## ファイル構成

```
index.html     トップページ
admin/         事務局サイト
company/       企業ポータル（大企業人事部）
app/           バックエンド（FastAPI）。画面と API を配信する
db/seed.py     data*.js の内容を MySQL に入れるスクリプト
requirements.txt  Python のライブラリ
assets/
  loader.js    API からデータを読み込んで画面のプログラムを動かす
  data.js      マスタとサンプルデータ（MySQL に入れる元データ。書き換えたら `python -m db.seed` を実行すると画面に反映）
  data-staff.js X社の追加社員195名（企業ポータルとDX人材データバンクで読み込む）
  data-others.js X社以外の99社の登録人材（DX人材データバンクだけで読み込む。参加大企業は東証の大分類10分類×10社）
  common.js    共通の計算と表示部品
  style.css    見た目
  その他       各画面の処理
tools/
  generate-staff.js  data-staff.js と data-others.js を作り直すスクリプト（`node tools/generate-staff.js`、Node.js が必要）
  export-json.js     data*.js を JSON にする（db/seed.py が使う）
```

画面では外部ライブラリを使っていません（フォントのみ Google Fonts）。
