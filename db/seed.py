"""assets/data*.js の内容をデータベースに入れる（テーブルを作り直して全件入れ直す）。

使い方（Product フォルダで実行。Node.js が必要）：
  python -m db.seed            … .env の DB_* で指定した MySQL に入れる
  python -m db.seed --yes      … 確認なしで実行する

接続先は app/db.py と同じ環境変数で決まる（DATABASE_URL を指定すると、そちらが優先）。
このスクリプトが消して作り直すのは、app/models.py に定義したテーブルだけ。
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from sqlalchemy import insert

from app import models as m
from app.db import get_engine

ROOT = Path(__file__).resolve().parent.parent
# 他の班のデータベースには絶対に書き込まない
FORBIDDEN_DATABASES = {"lens_noug", "mysql", "sys", "information_schema", "performance_schema"}


def export_dq() -> dict:
    out = subprocess.run(
        ["node", str(ROOT / "tools" / "export-json.js"), str(ROOT)],
        check=True, capture_output=True,
    )
    return json.loads(out.stdout.decode("utf-8"))


def rows(dq: dict) -> dict:
    return {
        m.settings: [{"name": k, "value": dq[k]} for k in ("rules", "sectors", "revenueBands", "meta", "selfQ")],
        m.talent_types: [{"id": i, "name": n} for i, n in enumerate(dq["types"])],
        m.roles: [{"id": i, "name": n, "type_id": t} for i, (n, t) in enumerate(dq["roles"])],
        m.skill_subcategories: [{"id": i, "category": c, "name": n} for i, (c, n) in enumerate(dq["subs"])],
        m.skill_items: [{"id": i, "sub_id": s, "name": n, "importance": imp} for i, (s, n, imp) in enumerate(dq["items"])],
        m.enterprises: [
            {"id": e["id"], "pos": i, "label": e["label"], "sector_id": e["sector"], "revenue": e["revenue"]}
            for i, e in enumerate(dq["ents"])
        ],
        m.quests: [
            {"pos": i, **{k: q.get(k) for k in (
                "id", "company", "industry", "size", "area", "period", "status", "title", "background",
                "goal", "deliverables", "hearing", "reasons", "slots", "members", "cases", "success")}}
            for i, q in enumerate(dq["quests"])
        ],
        m.talents: [
            {
                "id": p["id"], "pos": i, "source": p["__source"], "name": p["name"], "enterprise_id": p["ent"],
                "company": p["company"], "dept": p["dept"], "years": p["years"], "role_id": p["role"],
                "active": p["active"], "wish": p["wish"], "career": p.get("career"), "self_eval": p.get("self"),
                "assessed_on": p["on"], "lv": p["lv"], "pre": p.get("pre"), "dispatch": p.get("dispatch"),
            }
            for i, p in enumerate(dq["people"])
        ],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--yes", action="store_true", help="確認なしで実行する")
    args = ap.parse_args()

    engine = get_engine()
    db_name = engine.url.database or ""
    if Path(db_name).stem.lower() in FORBIDDEN_DATABASES:
        sys.exit(f"データベース {db_name} には書き込めません（他の班・システム用）。")

    target = engine.url.render_as_string(hide_password=True)
    if not args.yes:
        ans = input(f"{target} のテーブル（{', '.join(t.name for t in m.metadata.sorted_tables)}）を作り直します。よろしいですか？ [y/N] ")
        if ans.strip().lower() != "y":
            sys.exit("中止しました。")

    data = rows(export_dq())
    with engine.begin() as conn:
        m.metadata.drop_all(conn)
        m.metadata.create_all(conn)
        for table, values in data.items():
            if values:
                conn.execute(insert(table), values)
            print(f"  {table.name}: {len(values)} 件")
    print("完了しました。")


if __name__ == "__main__":
    main()
