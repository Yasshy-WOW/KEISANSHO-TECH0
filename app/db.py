"""MySQL（Azure Database for MySQL）への接続。

接続情報は環境変数から読む。
  DB_HOST, DB_PORT（省略時 3306）, DB_NAME, DB_USER, DB_PASSWORD
  DB_SSL_CA … SSL のルート証明書のパス（省略時は certifi の証明書を使う）
  DATABASE_URL … 指定すると上の設定より優先する（例：手元の確認用に sqlite:///local.db）
"""
import os
from urllib.parse import quote_plus

import certifi
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

load_dotenv()

_engine: Engine | None = None


def database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    missing = [k for k in ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD") if not os.getenv(k)]
    if missing:
        raise RuntimeError("環境変数が設定されていません: " + ", ".join(missing))
    return "mysql+pymysql://{user}:{pw}@{host}:{port}/{db}?charset=utf8mb4".format(
        user=quote_plus(os.environ["DB_USER"]),
        pw=quote_plus(os.environ["DB_PASSWORD"]),
        host=os.environ["DB_HOST"],
        port=os.getenv("DB_PORT", "3306"),
        db=os.environ["DB_NAME"],
    )


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        url = database_url()
        if url.startswith("mysql"):
            # Azure の MySQL は SSL 接続が必須（require_secure_transport=ON）
            ca = os.getenv("DB_SSL_CA") or certifi.where()
            _engine = create_engine(
                url,
                connect_args={"ssl": {"ca": ca}},
                pool_pre_ping=True,
                pool_recycle=280,
            )
        else:
            _engine = create_engine(url)
    return _engine
