#!/bin/sh
# 実践DXクエスト（ローカル動作版）を起動する（Mac・Linux 用）。Windows は 起動.bat を使う
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  echo "初回の準備をしています（1〜2分かかります）..."
  python3 -m venv .venv && .venv/bin/python -m pip install -q -r requirements.txt || exit 1
fi
echo "ブラウザで http://127.0.0.1:8000/ を開いてください。終了は Ctrl+C"
exec .venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
