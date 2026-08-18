# TikLoad — TikTok 無浮水印下載器

一個現代、快速且精美的網頁應用程式，用於下載 TikTok 影片、音訊與圖片（無浮水印）。

## 功能特色

- ⚡ **無浮水印** — 下載乾淨無水印的影片
- 🎵 **多種格式** — 影片（MP4）、音訊（MP3）、圖片（JPG）
- 📱 **完整響應式** — 支援所有裝置
- 🎨 **現代 UI** — 深色主題、玻璃擬態效果與流暢動畫
- 🔒 **隱私優先** — 不儲存任何資料、無需登入
- 🚀 **免費無限** — 無限制、無廣告

## 技術架構

| 層級 | 技術 |
|------|------|
| 前端 | HTML5、CSS3（現代）、原生 JavaScript |
| 後端 | Netlify Functions（Serverless 無伺服器函數） |
| API | tikwm.com（免費 TikTok API） |
| 主機 | Netlify（靜態網站 + 無伺服器函數） |

## 專案結構

```
tikload/
├── netlify.toml           # Netlify 設定檔
├── public/                # 前端靜態資源
│   ├── index.html         # 主頁面
│   ├── css/
│   │   └── styles.css     # 現代深色 UI 樣式
│   ├── js/
│   │   └── app.js         # 前端邏輯
│   └── assets/
│       └── favicon.svg    # 網站圖示
├── functions/             # Netlify 無伺服器函數
│   └── tiktok-api.js      # API 代理函數
└── README.md
```

## 快速開始

### 本機開發

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 啟動本機開發伺服器
netlify dev
```

應用程式將啟動於 `http://localhost:8888`。

### 部署到 Netlify

#### 方式一：使用 Netlify CLI

```bash
netlify login
netlify init
netlify deploy
```

#### 方式二：透過 GitHub

1. 將此儲存庫推送到 GitHub
2. 前往 [app.netlify.com](https://app.netlify.com)
3. 點擊「Add new site」→「Import an existing project」
4. 選擇你的 GitHub 儲存庫
5. 設定：
   - Build command：（留空）
   - Publish directory：`public`
6. 點擊「Deploy」

#### 方式三：拖放部署

1. 將 `public` 資料夾壓縮成 zip
2. 拖放至 [app.netlify.com/drop](https://app.netlify.com/drop)
3. *（注意：拖放部署不包含無伺服器函數，完整功能請使用 CLI 或 GitHub 方式）*

## 運作原理

1. 使用者將 TikTok 連結貼入輸入欄位
2. 前端將連結傳送至 Netlify Function
3. Function 呼叫 `tikwm.com` API 並传入 TikTok 連結
4. API 回傳影片資訊（無浮水印網址、音訊網址、封面圖片）
5. 前端渲染下載按鈕

## API 說明

本應用使用 [tikwm.com](https://tikwm.com) 作為後端 API：

- **端點：** `GET https://www.tikwm.com/api/?url=<tiktok_url>&hd=1`
- **回應：** 包含影片資訊的 JSON 格式

### 回應欄位說明

| 欄位 | 說明 |
|------|------|
| `play` | 無浮水印影片網址 |
| `wmplay` | 含浮水印影片網址 |
| `hdplay` | 高畫質無浮水印影片網址 |
| `music.play` | 音訊（MP3）網址 |
| `cover` | 封面圖片網址 |
| `title` | 影片標題/描述 |
| `author.nickname` | 作者用戶名 |
| `size` | 檔案大小（位元組） |
| `duration` | 影片時長（秒） |

## 注意事項

- 本專案僅供**教育與個人使用**
- 與 TikTok 或 ByteDance 無任何隸屬關係
- 請尊重內容創作者的版權
- 請勿用於商業用途或侵權行為

---

以 ❤️ 打造，使用現代網頁技術。
