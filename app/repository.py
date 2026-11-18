"""データベースから window.DQ と同じ形のデータを組み立てる。"""
from sqlalchemy import select
from sqlalchemy.engine import Connection

from . import models as m

# 画面ごとに読み込む人材の範囲（今までの <script src="data*.js"> の読み込み方と同じ）
#   base    … data.js だけ（① クエスト管理）
#   company … data.js ＋ data-staff.js（企業ポータル）
#   all     … 3ファイルすべて（② DX人材データバンク）
SCOPES = {"base": 0, "company": 1, "all": 2}

SETTING_KEYS = ("rules", "sectors", "revenueBands", "meta", "selfQ")


def _drop_none(d: dict, keep: tuple[str, ...] = ()) -> dict:
    """値が None の項目を取り除く（元データで項目そのものが無かったもの）。keep に挙げた項目は null のまま残す。"""
    return {k: v for k, v in d.items() if v is not None or k in keep}


def load_dq(conn: Connection, scope: str) -> dict:
    max_source = SCOPES[scope]

    settings = {r.name: r.value for r in conn.execute(select(m.settings))}

    types = [r.name for r in conn.execute(select(m.talent_types).order_by(m.talent_types.c.id))]
    roles = [[r.name, r.type_id] for r in conn.execute(select(m.roles).order_by(m.roles.c.id))]
    subs = [[r.category, r.name] for r in conn.execute(select(m.skill_subcategories).order_by(m.skill_subcategories.c.id))]
    items = [[r.sub_id, r.name, r.importance] for r in conn.execute(select(m.skill_items).order_by(m.skill_items.c.id))]

    ents = [
        {"id": r.id, "label": r.label, "sector": r.sector_id, "revenue": r.revenue}
        for r in conn.execute(select(m.enterprises).order_by(m.enterprises.c.pos))
    ]

    quests = [
        _drop_none({
            "id": r.id, "company": r.company, "industry": r.industry, "size": r.size, "area": r.area,
            "period": r.period, "status": r.status, "title": r.title, "background": r.background,
            "goal": r.goal, "deliverables": r.deliverables, "hearing": r.hearing, "reasons": r.reasons,
            "slots": r.slots, "members": r.members, "cases": r.cases, "success": r.success,
        })
        for r in conn.execute(select(m.quests).order_by(m.quests.c.pos))
    ]

    people = [
        _drop_none({
            "id": r.id, "name": r.name, "ent": r.enterprise_id, "company": r.company, "dept": r.dept,
            "years": r.years, "role": r.role_id, "active": bool(r.active), "wish": r.wish,
            "career": r.career, "self": r.self_eval, "on": r.assessed_on, "lv": r.lv,
            "pre": r.pre, "dispatch": r.dispatch,
        }, keep=("pre", "dispatch"))
        for r in conn.execute(
            select(m.talents).where(m.talents.c.source <= max_source).order_by(m.talents.c.pos)
        )
    ]

    return {
        "rules": settings.get("rules"),
        "sectors": settings.get("sectors"),
        "revenueBands": settings.get("revenueBands"),
        "ents": ents,
        "meta": settings.get("meta"),
        "selfQ": settings.get("selfQ"),
        "types": types,
        "roles": roles,
        "subs": subs,
        "items": items,
        "quests": quests,
        "people": people,
    }
