"""実践DXクエスト：画面と API を1つのアプリで配信する（FastAPI）。

  /            … トップページ（index.html）
  /admin/      … 事務局サイト
  /company/    … 企業ポータル
  /assets/     … CSS・JavaScript（data*.js は配信しない。データは API から返す）
  /api/dq      … 画面用のデータ（window.DQ と同じ形）
  /api/health  … データベースに接続できるかの確認

起動（ローカル動作版）：python -m uvicorn app.main:app --port 8000（または 起動.bat）
"""
import logging
import time
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from .db import get_engine
from .repository import load_dq

ROOT = Path(__file__).resolve().parent.parent
CACHE_SECONDS = 300

log = logging.getLogger("dxquest")
app = FastAPI(title="実践DXクエスト API", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(GZipMiddleware, minimum_size=1000)

_cache: dict[str, tuple[float, dict]] = {}


@app.get("/api/health")
def health():
    try:
        with get_engine().connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "ok"}
    except Exception:
        log.exception("database health check failed")
        return JSONResponse({"status": "error", "database": "unreachable"}, status_code=503)


@app.get("/api/dq")
def get_dq(scope: Literal["base", "company", "all"] = Query("base")):
    hit = _cache.get(scope)
    if hit and time.monotonic() - hit[0] < CACHE_SECONDS:
        return hit[1]
    try:
        with get_engine().connect() as conn:
            data = load_dq(conn, scope)
    except Exception:
        log.exception("failed to load data (scope=%s)", scope)
        raise HTTPException(status_code=503, detail="データベースからデータを読み込めませんでした")
    _cache[scope] = (time.monotonic(), data)
    return data


class SiteFiles(StaticFiles):
    """画面のファイルを配信する。

    - Cache-Control: no-cache … ブラウザが毎回サーバーに更新を確認する（デプロイ後に古い JS が使われないように）
    - data*.js（MySQL に入れる元データ）は配信しない
    """

    async def get_response(self, path: str, scope):
        if Path(path).name.startswith("data") and path.endswith(".js"):
            raise HTTPException(status_code=404)
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache"
        return response


@app.get("/", include_in_schema=False)
@app.get("/index.html", include_in_schema=False)
def top():
    return FileResponse(ROOT / "index.html", headers={"Cache-Control": "no-cache"})


app.mount("/assets", SiteFiles(directory=ROOT / "assets"), name="assets")
app.mount("/admin", SiteFiles(directory=ROOT / "admin", html=True), name="admin")
app.mount("/company", SiteFiles(directory=ROOT / "company", html=True), name="company")
