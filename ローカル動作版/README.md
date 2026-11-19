# 実践DXクエスト（ローカル動作版）

公開版（https://jissen-dx-quest.azurewebsites.net）と同じ画面・同じデータを、自分のパソコンだけで動かすためのフォルダです。
Azure・MySQL・インターネット接続は使いません（画面の文字のフォント［Google Fonts］だけはネットから読みます。つながっていなくても、パソコンのフォントで表示されます）。

- 中身は公開版のシステム説明書 **第2.23版**（2026年11月19日）と同じです。
- データベースは MySQL の代わりに、このフォルダの `data/jissen_dx_quest.db`（SQLite のファイル）を使います。中身は公開版の MySQL と同じ8テーブル（登録人材 1,190名、参加企業 100社、クエスト 4件ほか）です。

## 必要なもの

- **Python 3.11 以上**（https://www.python.org/ ）。Windows で入れるときは「Add python.exe to PATH」にチェックを入れてください。
- 初回だけ、ライブラリ（FastAPI など）をダウンロードするためにインターネット接続が必要です。

## 動かし方

### Windows

1. このフォルダの **`起動.bat`** をダブルクリックします。
2. 初回だけ準備に1〜2分かかります（`.venv` フォルダが作られます）。
3. ブラウザで http://127.0.0.1:8000/ が開きます。開かないときは、自分でこのアドレスを開いてください。
4. 終了するときは、黒い画面で `Ctrl + C` を押すか、画面を閉じます。

### Mac・Linux

ターミナルでこのフォルダに移動し、`sh start.sh` を実行します。ブラウザで http://127.0.0.1:8000/ を開きます。

### 手で起動する場合

```
python -m venv .venv
.venv\Scripts\activate          （Mac・Linux は source .venv/bin/activate）
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000
```

## 画面

| アドレス | 画面 | 利用者 |
|---|---|---|
| http://127.0.0.1:8000/ | トップページ | ― |
| /admin/index.html | ① クエスト管理 | 事務局 |
| /admin/talents.html | ② DX人材データバンク | 事務局 |
| /company/index.html | ③ 自社人材の育成状況 | X社 人事部 |
| /company/skill.html | ③-2 スキルの詳細 | X社 人事部 |
| /company/quests.html | ④ クエスト一覧 | X社 人事部 |
| /api/health | データベースにつながるかの確認（`"status":"ok"` なら正常） | ― |

## フォルダの中身

```
ローカル動作版/
├── 起動.bat            Windows で起動する
├── start.sh            Mac・Linux で起動する
├── requirements.txt    必要な Python ライブラリ（FastAPI・Uvicorn・SQLAlchemy）
├── index.html          トップページ
├── admin/              事務局サイト（① ②）
├── company/            企業ポータル（③ ③-2 ④）
├── assets/             CSS・JavaScript と元データ（data*.js）
├── app/                バックエンド（FastAPI）。db.py だけ公開版と違い、SQLite を使う
├── data/
│   └── jissen_dx_quest.db   データベース（SQLite）
├── db/seed.py          data*.js からデータベースを作り直す
└── tools/              データを作るスクリプト（Node.js 用）
```

## 公開版との違い

| 項目 | 公開版 | ローカル動作版 |
|---|---|---|
| 動く場所 | Azure App Service | 自分のパソコン |
| データベース | Azure Database for MySQL（TLS で接続） | `data/jissen_dx_quest.db`（SQLite） |
| 接続情報（パスワード） | Azure のアプリケーション設定 | 不要 |
| 起動 | Gunicorn ＋ Uvicorn（2プロセス） | Uvicorn（1プロセス） |
| 画面・API・計算 | 同じ | 同じ |

## データを変えたいとき

`assets/data.js` などを書き換えたあと、このフォルダで次を実行するとデータベースを作り直します（**Node.js が必要**）。

```
.venv\Scripts\python -m db.seed
```

サーバーは読んだデータを5分間覚えているので、作り直したあとはサーバーを起動し直してください。
ここで変えたデータは、このパソコンの中だけに反映されます（公開版には影響しません）。
