# TikSave — TikTok No-Watermark Downloader

A modern, fast, and beautiful web app for downloading TikTok videos, audio, and images without watermarks.

## Features

- ⚡ **No Watermark** — Download clean videos
- 🎵 **Multiple Formats** — Video (MP4), Audio (MP3), Image (JPG)
- 📱 **Fully Responsive** — Works on all devices
- 🎨 **Modern UI** — Dark theme with glassmorphism & animations
- 🔒 **Privacy First** — No data stored, no login required
- 🚀 **Free & Unlimited** — No limits, no ads

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (modern), Vanilla JS |
| Backend | Netlify Functions (Serverless) |
| API | tikwm.com (free TikTok API) |
| Hosting | Netlify (static + serverless) |

## Project Structure

```
tiktok-downloader/
├── netlify.toml           # Netlify configuration
├── public/                # Static frontend
│   ├── index.html         # Main page
│   ├── css/
│   │   └── styles.css     # Modern dark UI
│   ├── js/
│   │   └── app.js         # Frontend logic
│   └── assets/
│       └── favicon.svg    # Favicon
├── functions/             # Netlify serverless functions
│   └── tiktok-api.js      # API proxy function
└── README.md
```

## Getting Started

### Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local dev server
netlify dev
```

The app will be available at `http://localhost:8888`.

### Deploy to Netlify

#### Option 1: Via Netlify CLI

```bash
netlify login
netlify init
netlify deploy
```

#### Option 2: Via GitHub

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repo
5. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `public`
6. Click "Deploy"

#### Option 3: Drag & Drop

1. Zip the `public` folder
2. Drag & drop onto [app.netlify.com/drop](https://app.netlify.com/drop)
3. *(Note: drag & drop won't include serverless functions — use CLI or GitHub for full functionality)*

## How It Works

1. User pastes a TikTok URL into the input field
2. Frontend sends the URL to the Netlify Function
3. Function calls the `tikwm.com` API with the TikTok URL
4. API returns video metadata (no-watermark URL, audio URL, cover image)
5. Frontend renders download buttons with the media URLs

## API

The app uses [tikwm.com](https://tikwm.com) as the backend API:

- **Endpoint:** `GET https://www.tikwm.com/api/?url=<tiktok_url>&hd=1`
- **Response:** JSON with video info

### Response Fields

| Field | Description |
|-------|-------------|
| `play` | No-watermark video URL |
| `wmplay` | Watermarked video URL |
| `hdplay` | HD no-watermark video URL |
| `music.play` | Audio (MP3) URL |
| `cover` | Cover image URL |
| `title` | Video title/description |
| `author.nickname` | Author username |
| `size` | File size in bytes |
| `duration` | Duration in seconds |

## License

This project is provided for **educational and personal use only**.

- Not affiliated with TikTok or ByteDance
- Respect content creators' rights
- Do not use for commercial purposes or to infringe copyright

---

Built with ❤️ using modern web technologies.
