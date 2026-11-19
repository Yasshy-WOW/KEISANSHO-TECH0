"""データベースへの接続（ローカル動作版）。

公開版は Azure Database for MySQL を使うが、ローカル動作版は
このフォルダの data/jissen_dx_quest.db（SQLite のファイル）を使う。
MySQL もネット接続も不要。

環境変数 DATABASE_URL を指定すると、そちらを使う（例：sqlite:///C:/work/other.db）。
"""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

DB_FILE = Path(__file__).resolve().parent.parent / "data" / "jissen_dx_quest.db"

_engine: Engine | None = None


def database_url() -> str:
    return os.getenv("DATABASE_URL") or "sqlite:///" + DB_FILE.as_posix()


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(database_url())
    return _engine
