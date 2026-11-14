// 実践DXクエスト：マスタとサンプルデータ
// スキル体系：デジタルスキル標準 ver.2.0（IPA）の人材類型・ロール・共通スキルリスト・スキルマッピング
// 企業名・人名・評価はすべて架空のサンプルです。dx_quest_dummy.db と同じ内容です。
window.DQ = {
  rules: { dispatchThreshold: 85 },
  types: ["ビジネスアーキテクト", "デザイナー", "データサイエンティスト", "データマネジメント", "ソフトウェアエンジニア", "サイバーセキュリティ"],
  roles: [
    ["ビジネスアーキテクト", 0],
    ["ビジネスアナリスト", 0],
    ["プロダクトマネージャー", 0],
    ["サービスデザイナー", 1],
    ["ＵＸ／ＵＩデザイナー", 1],
    ["コミュニケーションデザイナー", 1],
    ["データビジネスストラテジスト", 2],
    ["データサイエンスプロフェッショナル", 2],
    ["データスチュワード", 3],
    ["データエンジニア", 3],
    ["データアーキテクト", 3],
    ["フロントエンドエンジニア", 4],
    ["バックエンドエンジニア", 4],
    ["クラウドエンジニア／ＳＲＥ", 4],
    ["フィジカルコンピューティングエンジニア", 4],
    ["サイバーセキュリティマネージャー", 5],
    ["サイバーセキュリティエンジニア", 5]
  ],
  subs: [
    ["ビジネス変革", "戦略の理解とアーキテクチャ設計"],
    ["ビジネス変革", "プロダクトのマネジメント"],
    ["ビジネス変革", "変革活動のマネジメント"],
    ["ビジネス変革", "デザイン"],
    ["データ整備・活用", "データ・AIの戦略的活用"],
    ["データ整備・活用", "AI・データサイエンス"],
    ["データ整備・活用", "データマネジメント"],
    ["テクノロジー", "ソフトウェア開発"],
    ["テクノロジー", "デジタルテクノロジー"],
    ["セキュリティ", "セキュリティマネジメント"],
    ["セキュリティ", "セキュリティ技術"],
    ["パーソナルスキル", "ヒューマンスキル"],
    ["パーソナルスキル", "コンセプチュアルスキル"]
  ],
  // [サブカテゴリー, スキル項目, 17ロールの重要度（roles の順）]
  items: [
    [0, "ビジネス環境と経営戦略の理解", 'aaaabbbcbdcddddbc'],
    [0, "事業戦略の策定とマネジメント", 'abbaccbccdcddddcc'],
    [0, "変革テーマ／事業単位の組織成熟度・ケイパビリティの検討", 'abbbccbcbdcddddbc'],
    [0, "ビジネスとエンタープライズのアーキテクチャ設計", 'abccddcdccbcbddbc'],
    [0, "ビジネス価値定義／投資対効果の試算と意思決定支援", 'abbbccbcbccddddbc'],
    [1, "要求の分析とマネジメント", 'bababcbcccbbcccbc'],
    [1, "プロダクトビジョン／ロードマップ策定", 'baaabccdcdccccccc'],
    [1, "プロダクト成果指標の設計と運用", 'baaaccbcccccccccc'],
    [1, "プロダクトスコープと優先順位のマネジメント", 'baaabccdcdccccccc'],
    [1, "仮説検証・学習サイクル設計", 'baaabbbccdcccccbc'],
    [1, "マーケティング", 'cbaababccdcdddddd'],
    [1, "技術的制約・アーキテクチャを踏まえたプロダクト判断", 'baaabcbccbbbbbbbb'],
    [2, "アーキテクチャマネジメント＆ガバナンス", 'abbccccdccbcccccc'],
    [2, "プロダクトライフサイクルマネジメント", 'bbaabccdccccccccc'],
    [2, "プログラム／プロジェクトマネジメント", 'baabbccdcccbbbccc'],
    [2, "リスク＆コンプライアンス", 'bbbbbcbcbccccccbb'],
    [2, "チェンジマネジメント", 'babbdcbcbccddddcd'],
    [2, "ビジネスモデリングとコラボレーション", 'aaaaaabcccccdddcd'],
    [2, "デザインの考え方を用いた組織のマネジメント", 'bbbabbbcbcccccccc'],
    [3, "顧客・ユーザー/ステークホルダー理解", 'aaaaaabcbccccdccd'],
    [3, "価値発見・定義", 'bbaaaabcbccccdccd'],
    [3, "デジタルプロダクト設計", 'bbbaabcdcdcbddccd'],
    [3, "検証（顧客・ユーザー視点）", 'bbbaaabccccbdcdcd'],
    [3, "クリエイティブディレクション", 'dddbbacddddcddddd'],
    [3, "デザイン制作実務", 'dddcbbdddddcddddd'],
    [3, "ファシリテーション（共創設計）", 'bbbaaabccdccddccd'],
    [3, "体験価値ガバナンス", 'ccbaaabccdccddccd'],
    [3, "デザインプロセスマネジメント", 'cccaabcdcdccddccd'],
    [4, "データ・AI理解・活用", 'bbbbcbabbbbbbbbbc'],
    [4, "データ・AI技術・社会動向の洞察", 'bbbbccabcbbbbbbbb'],
    [4, "データ・AI活用戦略設計", 'bbbbccacccbbccbbc'],
    [4, "データ・AI活用業務の設計・事業実装・運用", 'ccccccabbbbbccbdd'],
    [4, "ガバナンス体制の構築・運用", 'bcccccabbcbbbbbbc'],
    [4, "AI実装・運用", 'dddcccbacccbbbbcc'],
    [5, "数理統計・多変量解析・データ可視化", 'ddddddbaccccccccc'],
    [5, "機械学習・深層学習", 'ddddddcacccbbbbcc'],
    [6, "データ関連法令などの理解やルール整備と遵守の推進", 'bbbbccbbaaacbccbc'],
    [6, "データマネジメントの定着とデータ活用の推進", 'bbbcccbcabbcbdddd'],
    [6, "データの品質・安全性向上", 'ccccccccaabcccccc'],
    [6, "データエンジニアリング（設計・収集・統合・提供）", 'cccccccbcaacbcccc'],
    [6, "データマネジメントの仕組みの設計と改善", 'bcccccbccbacbcccc'],
    [6, "データ基盤の設計・実装・運用", 'ccccccccdbccabccb'],
    [7, "コンピュータサイエンス", 'cccdddcbdccaaabcb'],
    [7, "チーム開発", 'dbadbccbdccaabbdb'],
    [7, "ソフトウェア設計手法", 'cbbdbdccddbaabbcb'],
    [7, "ソフトウェア開発プロセス", 'cbbdbdccdccaabbdb'],
    [7, "Webアプリケーション基本技術", 'ddcdbcddddcaabbdb'],
    [7, "フロントエンドシステム開発", 'ddcdbcdddddabbbdb'],
    [7, "バックエンドシステム開発", 'ddddccddddcbabbdb'],
    [7, "クラウドインフラ活用", 'ddddccdddccbaabba'],
    [7, "SREプロセス", 'dcbdcccdddcbbabca'],
    [7, "サービス活用", 'ccbdccccdcccbcccb'],
    [8, "フィジカルコンピューティング", 'cccbcccbdddcccacb'],
    [8, "その他先端技術", 'dddcccccdcccccccb'],
    [8, "テクノロジートレンド", 'bbbcccbcccccccccc'],
    [9, "セキュリティ体制構築・運営", 'ccccdccdcdcccddac'],
    [9, "セキュリティマネジメント", 'bbbcddcccccccccab'],
    [9, "インシデント対応と事業継続", 'bbbdddcccccccccab'],
    [9, "プライバシー保護", 'bbbcccbbbbbccccab'],
    [10, "セキュア設計・開発・構築", 'dccccccddddbbbbba'],
    [10, "セキュリティ運用・保守・監視", 'dddccccdcccccacba'],
    [11, "リーダーシップ", 'zzzzzzzzzzzzzzzzz'],
    [11, "コラボレーション", 'zzzzzzzzzzzzzzzzz'],
    [12, "ゴール設定", 'zzzzzzzzzzzzzzzzz'],
    [12, "創造的な問題解決", 'zzzzzzzzzzzzzzzzz'],
    [12, "批判的思考", 'zzzzzzzzzzzzzzzzz'],
    [12, "適応力", 'zzzzzzzzzzzzzzzzz']
  ],
  // slots：事務局がヒアリングをもとに推薦するロール（reasons と同じ順）
  // members：このクエストに派遣中・派遣予定の人材 [人材ID, 状態]
  quests: [
    {
      "id": "Q-2027-001",
      "company": "田中工務店(株)",
      "industry": "金属加工業",
      "size": "従業員45名",
      "area": "愛知県",
      "period": "2026年11月〜2027年1月（週2日）",
      "status": "running",
      "title": "受注〜生産計画のデジタル化による納期回答の迅速化",
      "background": "受注情報と生産計画をExcelと紙の指示書で管理しており、納期回答に平均2日かかっている。生産計画の作成が担当者1名に集中し、属人化している。",
      "goal": "受注から生産計画・進捗までを一元管理し、納期回答を当日中に行える状態にする。",
      "deliverables": [
        "現状業務フロー図と改善後の業務フロー",
        "生産計画ダッシュボードのプロトタイプ",
        "運用定着までの移行計画"
      ],
      "hearing": "社長と生産管理担当者にヒアリング。納期回答の遅れで失注が出ており、計画担当者の退職リスクも心配している。まず業務の流れを整理し、受注・生産データを一か所に集めたい。",
      "reasons": [
        "業務フローを可視化し、改善後の業務と移行計画を現場と一緒に描ける人が必要",
        "Excel・紙に散らばった受注／生産データを整理し、ダッシュボードの土台をつくる人が必要"
      ],
      "slots": [
        1,
        9
      ],
      "members": [["TB-0001", "派遣中"]],
      "cases": 12,
      "success": 9
    },
    {
      "id": "Q-2027-002",
      "company": "B社",
      "industry": "食品スーパー（3店舗）",
      "size": "従業員80名",
      "area": "静岡県",
      "period": "2027年2月〜4月（週2日）",
      "status": "matching",
      "title": "POSデータを活用した需要予測による廃棄ロス削減",
      "background": "発注量は各店舗の担当者の経験に頼っており、生鮮品の廃棄ロスが大きい。POSデータは蓄積されているが活用できていない。",
      "goal": "POSデータと天候などの外部データを用いた需要予測で発注量を最適化し、廃棄ロスを減らす。",
      "deliverables": [
        "主要20品目の需要予測モデル",
        "店舗担当者向けの発注支援シート",
        "効果検証レポート"
      ],
      "hearing": "店長会議でヒアリング。廃棄ロスを減らしたいが、予測の結果を店舗担当者が使いこなせるかを不安に感じている。まずは効果が大きい品目から始めたい。",
      "reasons": [
        "廃棄ロス削減の目標と効果検証の進め方を決め、店舗の発注業務に落とし込める人が必要",
        "POSデータと天候データから需要予測モデルをつくり、精度を確かめられる人が必要"
      ],
      "slots": [
        6,
        7
      ],
      "cases": 6,
      "success": 4
    },
    {
      "id": "Q-2027-003",
      "company": "C社",
      "industry": "旅館業",
      "size": "従業員25名",
      "area": "長野県",
      "period": "2027年1月〜4月（週1日）",
      "status": "open",
      "title": "予約・顧客情報の一元化とリピーター集客の仕組みづくり",
      "background": "予約が電話・宿泊予約サイト・自社サイトに分散し、台帳への転記ミスが起きている。リピーターの情報も活用できていない。",
      "goal": "予約と顧客情報を一元化し、リピーター向けの集客施策を自社で回せる体制をつくる。",
      "deliverables": [
        "宿泊前〜宿泊後のカスタマージャーニーマップ",
        "予約一元管理ツールの導入・設定",
        "自社サイトの改善案"
      ],
      "hearing": "女将と予約担当者にヒアリング。転記ミスによるダブルブッキングを防ぎたい。常連客との関係を大事にしたく、自社サイトから直接予約してもらえる仕組みにしたい。",
      "reasons": [
        "宿泊客の体験を宿泊前から宿泊後まで整理し、リピーター施策を設計できる人が必要",
        "予約一元管理ツールの設定と、自社サイトの予約導線を改善できる人が必要"
      ],
      "slots": [
        3,
        11
      ],
      "cases": 3,
      "success": 2
    },
    {
      "id": "Q-2026-014",
      "company": "D社",
      "industry": "建設業",
      "size": "従業員60名",
      "area": "福岡県",
      "period": "2026年10月〜12月（週2日）",
      "status": "running",
      "title": "現場写真・日報のクラウド化と情報セキュリティの整備",
      "background": "現場写真や日報を個人のスマートフォンやUSBメモリで受け渡しており、紛失・情報漏えいのリスクがある。事務所での集計にも時間がかかっている。",
      "goal": "現場情報をクラウドで安全に共有し、事務所での集計作業を減らす。",
      "deliverables": [
        "クラウドサービスの選定と導入",
        "情報セキュリティ基本方針と運用ルール",
        "現場向け操作マニュアル"
      ],
      "hearing": "社長と現場監督にヒアリング。スマートフォンの紛失で写真データが消えたことがあり、取引先から情報管理の体制も問われている。現場の負担は増やしたくない。",
      "reasons": [
        "現場で無理なく使えるクラウドサービスを選定・導入できる人が必要",
        "情報セキュリティの基本方針と運用ルールを、会社の規模に合わせてつくれる人が必要"
      ],
      "slots": [
        13,
        15
      ],
      "members": [["TB-0005", "派遣中"], ["TB-0006", "派遣中"]],
      "cases": 8,
      "success": 6
    }
  ],
  // lv / pre.lv：個人評価（独自基準）。パーソナルスキルを除く61項目を items の順に a〜d
  people: [
    {
      "id": "TB-0001",
      "name": "Aさん",
      "ent": "X社",
      "company": "X社（電機）",
      "dept": "経営企画部",
      "years": "入社8年目",
      "role": 0,
      "active": true,
      "wish": "製造業の業務プロセス改革",
      "on": "2026年9月",
      "lv": "aaaaabbbbbcbaaaaaaabcbbddbccbbbcbdddcccccccdccdddddccdbcbbbdd",
      "pre": {
        "on": "2026年3月",
        "lv": "aaaaacbbbbcbabbbbabbcccddcccbbbcbdddcccccccdccdddddccdbcbbbdd"
      },
      "dispatch": {
        "quest": "Q-2026-009",
        "sme": "E社（精密部品製造）",
        "title": "部品在庫の見える化",
        "period": "2026年4月〜6月",
        "result": "成功",
        "feedback": "業務フローの整理から現場への定着まで主導してくれた。現場からの信頼も厚かった。"
      }
    },
    {
      "id": "TB-0002",
      "name": "Bさん",
      "ent": "X社",
      "company": "X社（電機）",
      "dept": "情報システム部",
      "years": "入社6年目",
      "role": 9,
      "active": false,
      "wish": "データ基盤の構築・整備",
      "on": "2026年9月",
      "lv": "dddcccdcdddbcccccccccdcdddddccccccbbabaabbccdcdddcdcdccdccbdc",
      "pre": {
        "on": "2026年3月",
        "lv": "dddcccdcdddbcccccccccdcdddddccccccccbbaabbccdcdddcdcdccdccbdc"
      },
      "dispatch": {
        "quest": "Q-2026-009",
        "sme": "E社（精密部品製造）",
        "title": "部品在庫の見える化",
        "period": "2026年4月〜6月",
        "result": "成功",
        "feedback": "散らばっていた在庫データを整理し、短期間で見える化を実現してくれた。"
      }
    },
    {
      "id": "TB-0003",
      "name": "Cさん",
      "ent": "Y社",
      "company": "Y社（総合商社）",
      "dept": "営業企画部",
      "years": "入社10年目",
      "role": 2,
      "active": false,
      "wish": "地域企業の新規事業立ち上げ",
      "on": "2026年10月",
      "lv": "abbcbbaaaaaacbbccbcbbccddbbcbbbccdddbbcccccabbccddbbcdbcbbbcd",
      "pre": null,
      "dispatch": null
    },
    {
      "id": "TB-0004",
      "name": "Dさん",
      "ent": "Y社",
      "company": "Y社（総合商社）",
      "dept": "DX推進室",
      "years": "入社5年目",
      "role": 3,
      "active": false,
      "wish": "観光・サービス業の顧客体験改善",
      "on": "2026年8月",
      "lv": "aabcbbbbbbbacabbbaaaaaabcaaabbbcccddbcccccddddddddddbccccdccc",
      "pre": null,
      "dispatch": {
        "quest": "Q-2026-011",
        "sme": "F社（美容室）",
        "title": "来店予約フローの改善",
        "period": "2026年5月〜7月",
        "result": "成功",
        "feedback": ""
      }
    },
    {
      "id": "TB-0005",
      "name": "Eさん",
      "ent": "Z社",
      "company": "Z社（金融）",
      "dept": "システム開発部",
      "years": "入社7年目",
      "role": 13,
      "active": true,
      "wish": "クラウド移行・業務システム刷新",
      "on": "2026年7月",
      "lv": "dddddcccccdbccbcddcdddcdddddbbccbbcbcdcccbbbbbbbbaaccccdccccb",
      "pre": null,
      "dispatch": {
        "quest": "Q-2026-014",
        "sme": "D社（建設業）",
        "title": "現場写真・日報のクラウド化",
        "period": "2026年10月〜12月",
        "result": "実施中",
        "feedback": ""
      }
    },
    {
      "id": "TB-0006",
      "name": "Fさん",
      "ent": "Z社",
      "company": "Z社（金融）",
      "dept": "リスク管理部",
      "years": "入社9年目",
      "role": 15,
      "active": true,
      "wish": "中小企業のセキュリティ体制づくり",
      "on": "2026年7月",
      "lv": "cccbbbcccbdbcccccccccccddcccbbbdbcccbdcccccdcddddbcccccaaaacc",
      "pre": null,
      "dispatch": {
        "quest": "Q-2026-014",
        "sme": "D社（建設業）",
        "title": "現場写真・日報のクラウド化",
        "period": "2026年10月〜12月",
        "result": "実施中",
        "feedback": ""
      }
    },
    {
      "id": "TB-0007",
      "name": "Gさん",
      "ent": "X社",
      "company": "X社（電機）",
      "dept": "マーケティング部",
      "years": "入社4年目",
      "role": 6,
      "active": false,
      "wish": "小売業のデータ活用",
      "on": "2026年10月",
      "lv": "ccccbbcbcbbbcccbbbbbbcbcdbbcbbbbbcccbbccbcccccddddccccbcccbcc",
      "pre": null,
      "dispatch": null
    },
    {
      "id": "TB-0008",
      "name": "Hさん",
      "ent": "Z社",
      "company": "Z社（金融）",
      "dept": "商品開発部",
      "years": "入社3年目",
      "role": 11,
      "active": false,
      "wish": "Webサイト・アプリ開発",
      "on": "2026年10月",
      "lv": "dddcdbccccdbccbcdccccbbcccccbbbbbbcbccccccbbbbbbcccccccccccbc",
      "pre": null,
      "dispatch": null
    },
    {
      "id": "TB-0009",
      "name": "Iさん",
      "ent": "X社",
      "company": "X社（電機）",
      "dept": "生産技術部",
      "years": "入社6年目",
      "role": 1,
      "active": false,
      "wish": "製造現場のIoT・データ活用",
      "on": "2026年10月",
      "lv": "abbbbbbbbbcbccbbaababbbddbccaaabbcddbbcccccbbbddddcccdbcbbbcd",
      "pre": null,
      "dispatch": null
    },
    {
      "id": "TB-0010",
      "name": "Jさん",
      "ent": "X社",
      "company": "X社（電機）",
      "dept": "情報システム部",
      "years": "入社5年目",
      "role": 12,
      "active": false,
      "wish": "業務システムの開発・刷新",
      "on": "2026年7月",
      "lv": "dddbdcccccdbccbcddcccdddddddbbccbbcbbbcbbabbbbbcbabbcccccccbc",
      "pre": {
        "on": "2026年3月",
        "lv": "dddbdcccccdbccbcddcccdddddddbbccbbcbbbcbbabbbbbcbbcbcccccccbc"
      },
      "dispatch": {
        "quest": "Q-2026-010",
        "sme": "G社（卸売業）",
        "title": "受発注システムの改修",
        "period": "2026年4月〜6月",
        "result": "未達",
        "feedback": "改修方針は固まったが、期間内にテストまで終わらなかった。関係者との調整に課題が残った。"
      }
    }
  ]
};
