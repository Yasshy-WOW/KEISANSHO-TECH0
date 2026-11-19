@echo off
chcp 65001 > nul
cd /d "%~dp0"

rem 初回だけ：Python の仮想環境を作り、必要なライブラリを入れる
if not exist ".venv\Scripts\python.exe" (
  echo [1/2] 初回の準備をしています（1〜2分かかります）...
  python -m venv .venv || (echo Python 3.11 以上を入れてください。 & pause & exit /b 1)
  ".venv\Scripts\python.exe" -m pip install -q -r requirements.txt || (echo ライブラリを入れられませんでした。 & pause & exit /b 1)
)

echo.
echo 実践DXクエスト（ローカル動作版）を起動します。
echo ブラウザで http://127.0.0.1:8000/ を開きます。終了するときは この画面で Ctrl+C を押してください。
echo.
start "" http://127.0.0.1:8000/
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
