# Open in Freedium - Browser Extension

一個瀏覽器擴充功能，讓你快速透過 [Freedium](https://freedium-mirror.cfd) 開啟 Medium 文章，繞過付費牆。

> 本專案 fork 自 [wywywywy/freedium-browser-extension](https://github.com/wywywywy/freedium-browser-extension)，感謝原作者 [wywywywy](https://github.com/wywywywy) 的貢獻。

![Screenshot showing "Open in Freedium" in context menu](assets/screenshot.png)

## 功能

- 在任何 Medium 連結上按右鍵，選擇「Open in Freedium」即可開啟
- 在 Medium 文章頁面按右鍵，也可直接開啟
- 支援自訂 Freedium domain
- 支援 Whitelist / Blacklist 兩種過濾模式
- 可新增自訂 URL patterns（例如自架 Medium 部落格的網域）

## 安裝方式（Chrome / Edge）

由於此擴充功能已從 Chrome Web Store 下架，需手動載入：

1. Clone 此 repo
2. 執行 `build.sh`（Linux / macOS）或 `build.bat`（Windows）
3. 開啟 Chrome 的擴充功能頁面 `chrome://extensions`（Edge 為 `edge://extensions`）
4. 啟用「開發人員模式」
5. 點擊「載入未封裝項目」
6. 選擇 build script 產生的 `chrome` 資料夾

## 安裝方式（Firefox）

**Firefox Add-on**: https://addons.mozilla.org/en-GB/firefox/addon/open-in-freedium/

## 使用方式

1. 點擊擴充功能圖示，開啟設定面板
2. 可自訂 Freedium domain
3. 選擇過濾模式：
   - **Whitelist**：僅在 medium.com 及符合的 URL 上顯示右鍵選單
   - **Blacklist**：在所有頁面顯示右鍵選單，排除符合的 URL
4. 點擊「Manage >」管理自訂 URL patterns

## 專案結構

```
├── manifest.json          # Chrome MV3 manifest
├── src/
│   ├── background.js      # Service worker（右鍵選單、訊息處理）
│   ├── options.html/js/css # 擴充功能設定面板
│   ├── patterns.html/js/css # URL patterns 管理頁面
├── icons/                 # 擴充功能圖示
├── build.sh / build.bat   # 打包腳本
```

## 致謝

- 原作者：[wywywywy](https://github.com/wywywywy)
- 原始 repo：[wywywywy/freedium-browser-extension](https://github.com/wywywywy/freedium-browser-extension)
