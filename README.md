# Smart Mobility Operations Platform (智慧運具營運與維運輔助系統)

這是我在任職期間參與開發與維護的內部營運輔助系統。此專案旨在解決客服、營運及開發團隊在日常維運與客訴排解中遇到的繁瑣查詢流程，將散落於各資料庫、第三方金流與票證系統（如一卡通、悠遊卡、TapPay）的數據進行整合。

透過這個統一的 Web 工具平台，大幅降低了跨部門溝通的成本，並提升了問題排查與日誌解析的效率。

*(註：本 README 專為個人作品集展示所寫，已隱去機密商業資訊與敏感配置，僅探討技術實作與功能架構)*

---

## 🚀 專案亮點與我的貢獻

- **系統整合與架構設計**：使用 Node.js / Express 作為後端中介層，統一封裝對內部核心系統、第三方票證資料庫及外部 API 的呼叫。
- **維運效率提升**：開發日誌解析工具 (Log Parser) 與時間排序工具，讓開發者在面對龐大的伺服器 Log 時，能快速撈出關鍵錯誤與請求軌跡。
- **客服支援自動化**：實作「罐頭訊息管理系統 (Canned Messages)」，以及票卡、月票、車輛騎乘交易紀錄的圖形化查詢介面，將原先需由工程師撈取資料的需求，轉移給客服團隊自行操作。
- **容器化部署**：透過 Docker 與 `docker-compose` 將前後端與獨立設定環境進行容器化，確保持續整合 (CI/CD) 的穩定性。

## 🛠 技術堆疊 (Tech Stack)

### Backend
- **Node.js & Express.js**：建構靈活的 RESTful API 與內部微服務溝通的橋樑。
- **MongoDB**：作為部分工具（如罐頭訊息、靜態代碼等）的資料儲存媒介。
- **Morgan & Winston**：用於系統 HTTP 請求的流控與本地日誌記錄。
- **Google APIs**：串接 Gmail 自動寄發特定的通知與信件。

### Frontend
- **HTML / CSS / JavaScript (Vanilla)**：因應快速開發與強烈工具屬性，採用原生技術搭配 EJS / 靜態渲染，達成極低的載入延遲。
- **Bootstrap / Custom CSS**：建立乾淨、響應式且易用的 Dashboard 介面。

### DevOps & Infrastructure
- **Docker / Docker Compose**：標準化運作環境，實現高可攜性。
- **GitLab CI/CD**：(.gitlab-ci.yml) 自動化構建與部屬流程。

---

## 🌟 核心功能模組 (Features)

### 1. 票證與交易查詢中心 (Card & Transaction Query)
- **多卡種支援**：支援悠遊卡 (ECC)、一卡通 (iPass) 的代碼與清分檔 (CR) 查詢及錯帳比對。
- **卡號與交易關聯**：可透過外觀卡號、銀行卡號 (前六後四)、或是 TapPay 的 `card_no` 反查使用者交易軌跡。
- **月票管理**：整合地方公共交通月票查詢系統，快速比對會員帳號與月票效期。

### 2. 車輛與設備維護 (Vehicle & Hardware Ops)
- **車況與電池監控**：(Battery & Bike API) 透過外觀車號或硬體 ID，查詢即時的車輛狀態與電池電量。
- **騎乘紀錄追蹤**：(Bike Transaction) 圖形化展現單筆交易的起訖點、收費與狀態。

### 3. 開發者維運工具箱 (DevOps Toolkits)
- **Log Parser / Time Sort**：上傳或貼上 Raw Server Logs，系統自動進行格式化、高亮關鍵字及時間軸排序，大幅減少 Debug 時間。
- **Hash Code / Hex Convert**：內建的輔助小工具，提供開發者在串接金流或硬體通訊協定時，隨時計算與轉換。

### 4. 系統後台與字典管理 (Configurations)
- **App 錯誤碼字典**：動態 CRUD 管理錯誤碼，並對外提供 API 供前台或 App 端顯示友善錯誤提示。
- **罐頭訊息工廠 (Canned Messages)**：客服用的分類公版訊息管理庫。

---

## 💡 學習與成長

在開發這個專案的過程中，我學到了如何**從使用者的痛點出發**。原先很多排查異常的問題都需要開發團隊花費 10-20 分鐘跑 SQL、看 Log，而這個工具的誕生，將這些流程簡化為「輸入條件 -> 一鍵查詢」。

我也深入了解了 Node.js 作為 Gateway API 的角色發揮，不論是資料的聚合 (Aggregation)、還是對外請求的代理 (Proxy)，並學會如何透過 Docker 讓這類內部工具可以不受伺服器環境影響，穩定地提供服務。

---
*If you have any questions about the implementations or system design patterns used here, feel free to reach out!*
