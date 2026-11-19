"""テーブル定義（SQLAlchemy Core）。

assets/data*.js の window.DQ の構造に合わせている。
入れ子になった項目（経歴、成果物の一覧など）は JSON 型の列に入れる。
pos 列は元データの並び順。画面は配列の順番に依存するので、取り出すときは pos 順に並べる。
"""
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    Integer,
    MetaData,
    SmallInteger,
    String,
    Table,
    Text,
)

metadata = MetaData()

# JSON の None を SQL の NULL として保存する（「項目が無い」と区別するため）
NJSON = JSON(none_as_null=True)

# ルール・業種・売上区分・自己評価の設問・更新日など（名前と値の組）
settings = Table(
    "settings", metadata,
    Column("name", String(50), primary_key=True),
    Column("value", NJSON, nullable=False),
    mysql_charset="utf8mb4",
)

# 人材類型（6）
talent_types = Table(
    "talent_types", metadata,
    Column("id", Integer, primary_key=True, autoincrement=False),
    Column("name", String(100), nullable=False),
    mysql_charset="utf8mb4",
)

# ロール（17）
roles = Table(
    "roles", metadata,
    Column("id", Integer, primary_key=True, autoincrement=False),
    Column("name", String(100), nullable=False),
    Column("type_id", Integer, nullable=False),
    mysql_charset="utf8mb4",
)

# サブカテゴリー（13）
skill_subcategories = Table(
    "skill_subcategories", metadata,
    Column("id", Integer, primary_key=True, autoincrement=False),
    Column("category", String(100), nullable=False),
    Column("name", String(100), nullable=False),
    mysql_charset="utf8mb4",
)

# スキル項目（67）。importance はロールごとの重要度（ロールの番号順に a〜d・z を並べた文字列）
skill_items = Table(
    "skill_items", metadata,
    Column("id", Integer, primary_key=True, autoincrement=False),
    Column("sub_id", Integer, nullable=False),
    Column("name", String(200), nullable=False),
    Column("importance", String(40), nullable=False),
    mysql_charset="utf8mb4",
)

# 参加大企業（100）
enterprises = Table(
    "enterprises", metadata,
    Column("id", String(20), primary_key=True),
    Column("pos", Integer, nullable=False, index=True),
    Column("label", String(100), nullable=False),
    Column("sector_id", Integer, nullable=False),
    Column("revenue", Integer, nullable=False),
    mysql_charset="utf8mb4",
)

# クエスト
quests = Table(
    "quests", metadata,
    Column("id", String(20), primary_key=True),
    Column("pos", Integer, nullable=False, index=True),
    Column("company", String(100), nullable=False),
    Column("industry", String(100), nullable=False),
    Column("size", String(100), nullable=False),
    Column("area", String(50), nullable=False),
    Column("period", String(100), nullable=False),
    Column("status", String(20), nullable=False),
    Column("title", String(200), nullable=False),
    Column("background", Text, nullable=False),
    Column("goal", Text, nullable=False),
    Column("deliverables", NJSON, nullable=False),
    Column("hearing", Text, nullable=False),
    Column("reasons", NJSON, nullable=False),
    Column("slots", NJSON, nullable=False),
    Column("members", NJSON),
    Column("cases", Integer, nullable=False),
    Column("success", Integer, nullable=False),
    mysql_charset="utf8mb4",
)

# 登録人材
# source：0 = data.js（従来の人材）、1 = data-staff.js（X社の追加社員）、2 = data-others.js（X社以外）
talents = Table(
    "talents", metadata,
    Column("id", String(20), primary_key=True),
    Column("pos", Integer, nullable=False, index=True),
    Column("source", SmallInteger, nullable=False, index=True),
    Column("name", String(100), nullable=False),
    Column("enterprise_id", String(20), nullable=False),
    Column("company", String(100), nullable=False),
    Column("dept", String(100), nullable=False),
    Column("years", String(50), nullable=False),
    Column("role_id", Integer, nullable=False),
    Column("active", Boolean, nullable=False),
    Column("wish", String(200), nullable=False),
    Column("career", NJSON),
    Column("self_eval", NJSON),
    Column("assessed_on", String(50), nullable=False),
    Column("lv", String(100), nullable=False),
    Column("pre", NJSON),
    Column("dispatch", NJSON),
    mysql_charset="utf8mb4",
)
