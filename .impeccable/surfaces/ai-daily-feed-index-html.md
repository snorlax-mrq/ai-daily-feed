---
version: 1
slug: "ai-daily-feed-index-html"
primary_target: "ai-daily-feed/index.html"
related_targets: ["ai-daily-feed/d/2026-10-21.html"]
---

Surface: AI 每日新聞檔案站（靜態 HTML，GitHub Pages 子路徑部署）— index.html（館藏目錄＋最新一期）與每日頁 d/YYYY-MM-DD.html
Mode: Read。讀者問題：「今天 AI 大廠官方發布了什麼？之前某天發布了什麼？」
Audience: 站點擁有者本人；每天 07:00 自 Discord 摘要點入。Job: 30 秒掃完當日重點、點入官方原文、按月回溯歷史。
Proof/content: digests/*.md 的真實資料（英文標題＋原摘要，勿改寫）；介面文字台灣繁體中文。
Constraints: 深淺色切換（跟隨系統＋手動覆蓋＋localStorage 記憶＋無閃爍）；相對連結（Pages 子路徑）；無框架無依賴；產出由 build-site.ts 每日全量重建。

## Direction contract

THESIS: 每日公告檔案館——把 AI 大廠官方發布當成每天歸檔一次的館藏：一天一組抽屜卡片、一家公司一張卡，拒絕新聞聚合站的即時瀑布流、icon+標題+文字的同尺寸卡片格陣列與儀表板感。

OWN-WORLD: 中性檔案紙 ground（灰骨白，非暖奶油）與紙白卡片、1px 髮絲線、索引卡橫線底紋、鋼印紅日期章為唯一強調色；深色模式＝夜間檔案室（深灰 cabinet 與暗卡片、章紅提亮）。字體聲音：Archivo 為標籤/標題/統計（小型大寫、字距 0.12em），Source Serif 4 為閱讀正文；tab 形狀的公司標籤從卡片上緣突出；簽名元素＝輕微旋轉的紅色日期章。

STORY: 讀者從 Discord 連結進入每日頁 → 第一屏即見日期與第一張公司卡片 → 掃完各公司公告、點原文 → 頁尾/目錄按月回溯任何一天 → 需要原始資料時開該日 Markdown。相信這裡只收官方第一手來源。

FIRST VIEWPORT: 細黏頂欄（館名 wordmark、前/後日箭頭、深淺色切換）；日期 H1（Archivo 700，約 44px）＋旋轉紅章「N 則公告」＋「M 個來源」統計行；其下第一張公司卡片（tab 分隔標籤＋逐條公告：標題連結＋日期＋襯線摘要＋外連箭頭）。簽名互動＝載入時紅章「蓋章」一次（scale 1.12→1，0.45s ease-out，reduced-motion 停用）。

FORM: 反收斂指派——7 個 grounded 方向按共鳴排序後取第 7：圖書館卡片目錄（card catalog）。seed: cd6fd985867aec1069f7df50a88d7001

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
