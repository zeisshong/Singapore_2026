# Dino's Singapore Adventure

小暴龍的新加坡冒險日記。此版本保留原專案的行程、預算、MRT、Google Maps、GAS 同步、加密資訊、記帳與全部圖片，並完成品牌化 UI、RWD 與 PWA 基礎支援。

## 部署到 GitHub Pages

1. 將此資料夾內的全部檔案推送到 GitHub repository 的預設分支。
2. 到 **Settings → Pages**。
3. Source 選擇 **Deploy from a branch**。
4. Branch 選擇 `main`，資料夾選擇 `/ (root)`。
5. 儲存後等待 GitHub Pages 完成部署。

## 主要檔案

- `index.html`：行程主站
- `singapore_expense_2026.html`：旅遊記帳
- `css/modern.css`：新版品牌與介面樣式
- `js/app.js`：PWA 註冊與漸進式動畫
- `manifest.webmanifest`、`sw.js`：PWA
- `images/`：原始圖片，完整保留
- `assets/dino/`：小暴龍品牌資產

## 注意

- GAS URL、加密資料與原有 JavaScript 邏輯均保留於原 HTML。
- Service Worker 快取版本在 `sw.js` 的 `CACHE` 常數；大幅更新時請調整版本字串。
