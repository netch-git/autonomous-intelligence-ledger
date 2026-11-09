# antigravity プロジェクト総合管理台帳 (40-Day Project Ledger)

> **Google ドライブ (`G:/マイドライブ/antigravity`) で40日近くにわたって蓄積・開発されてきた全プロジェクト資産・日次自律手帳ログ・学術論文・IDM・デザイン・パイプラインを統合管理・点検する電子帳票Webアプリケーション**

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Inference](https://img.shields.io/badge/Gemini_API-3.8_Flash_(0_Yen)-blue?style=flat-square)](https://aistudio.google.com)
[![Icons](https://img.shields.io/badge/Icons-Google_Fonts_Material_Symbols-4285F4?style=flat-square)](https://fonts.google.com/icons)
[![Style](https://img.shields.io/badge/Form_Style-JIS_X_0901_Compliant-1e293b?style=flat-square)](style.css)
[![Edge CDN](https://img.shields.io/badge/Cloudflare_Pages-Ready-F38020?style=flat-square)](https://autonomous-intelligence-ledger.pages.dev)

---

## 1. 概要 (Overview)

本システムは、Google ドライブの `antigravity` ワークスペース（`G:/マイドライブ/antigravity`）において約40日間にわたり開発・自律運用されてきたすべてのプロジェクト資産、日次手帳ログ、学術論文、分析スクリプトを、日本の公的ビジネス帳票・監査調書の様式で一覧・点検・管理するための**自動更新型・統合電子帳票Webアプリケーション**です。

### 規程・設計ガイドライン
- **絵文字完全排除（NO-EMOJI POLICY）**: 業務・資産管理調書としての品格と視認性を保つため、システム全体において絵文字を一切排除し、100% **Google Fonts Material Symbols Outlined** のベクターアイコンを採用しています。
- **公的帳票・稟議書様式美**: 電子検印・承認印（起票 / AI推論 / Git同期 / 公開承認の4連印影）、JIS規格連動様式番号、決定論的SHA-256監査ハッシュを標準装備。
- **A4横帳票印刷・PDF出力完全対応 (`@media print`)**: ブラウザの印刷ダイアログ (`Ctrl+P` / `Cmd+P`) から、ヘッダー、印鑑、明細テーブル、署名欄がA4横（Landscape）用紙に収まる専用CSSを完備。
- **0円枠完全防護（Token & Cost Governance）**: すべての自律推論は Google AI Studio の無料APIキー枠（Gemini 3.8 Flash）で完結させ、Vertex AIの有料課金を恒久的に遮断（`ALLOW_PAID_VERTEX=0`）しています。

---

## 2. 管理対象プロジェクト資産 (Managed Workspace Assets)

本台帳には、以下の40日間にわたる全資産が収録されています。

| 管理番号 | 資産区分 | プロジェクト名 / 概要 | 成果物・参照先 |
| :--- | :--- | :--- | :--- |
| **PROJ-TECHO-PAGES** | 中核開発基盤 | **AIエージェント自律手帳** (431日分ログ・直近40日集中稼働) | `apps/chronicle_site/` ([公開サイト](https://world-pulse-chronicle.pages.dev)) |
| **PROJ-PAPER-MONOGRAPH** | 学術リサーチ | **生成AI認知的拒絶・非検知性工学 論文** (Salubra 1931色彩) | `docs/`, `site/index.html` (118KBモノグラフ) |
| **PROJ-IDM-RESEARCH** | 学術リサーチ | **IDM DX大規模意識調査 二元配置ANOVA論文** | `IDM/`, `netch-git/idm-dx-research-paper` |
| **PROJ-AESTHETICS-LAB** | デザイン・UI | **AESTHETICS LAB & Webデザイン早見帳** | `design/`, `apps/web_design_catalog.html` |
| **PROJ-GAS-ONEPLATFORM** | Workspace | **GAS & Google One Platform 共通API基盤・深夜配信** | `googleworkspace/`, `gas-one-platform-spec` |
| **PROJ-COST-GOVERNANCE** | コスト統制 | **AI Studio 0円防護・自律パイプライン基盤** | `.env`, `GEMINI.md` (第4章), `scripts/` |
| **FORM-DAY-20261108〜** | 40日間手帳調書 | **第1日〜第40日 デイリー開発・ライフログ調書** (40件) | `apps/chronicle_site/techo_daily_logs.json` |

---

## 3. 外部連携リンク集 (External Links & Portals)

| リソース | 役割 | URL |
| :--- | :--- | :--- |
| **本管理台帳 Webアプリ** | 40日間プロジェクト総合管理帳票 | [autonomous-intelligence-ledger.pages.dev](https://autonomous-intelligence-ledger.pages.dev) |
| **本台帳 GitHub リポジトリ** | 台帳ソースコード・構成管理 | [netch-git/autonomous-intelligence-ledger](https://github.com/netch-git/autonomous-intelligence-ledger) |
| **公開中の自律手帳サイト** | デイリークロニクル本番サイト | [world-pulse-chronicle.pages.dev](https://world-pulse-chronicle.pages.dev) |
| **Google AI Studio** | Gemini 3.8 Flash 推論環境 | [aistudio.google.com](https://aistudio.google.com) |

---

## 4. デプロイ手順 (Deployment Guide)

### 方法 A: Cloudflare Pages への直接デプロイ (Wrangler CLI)

Windows環境の場合:
```cmd
deploy_to_cloudflare.bat
```

Linux / macOS環境の場合:
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法 B: GitHub Actions による自動デプロイ

リポジトリの `main` ブランチにプッシュするだけで、`.github/workflows/deploy.yml` が自動起動し、Cloudflare Pages (`autonomous-intelligence-ledger`) へ最新の台帳がデプロイされます。

---

## 5. ライセンス (License)

MIT License. Copyright (c) 2026 Antigravity Workspace Governor.
