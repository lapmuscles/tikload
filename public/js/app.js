/**
 * TikLoad — TikTok 無浮水印下載器
 * 前端邏輯
 */

const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const btnText = downloadBtn.querySelector('.btn-text');
const btnSpinner = downloadBtn.querySelector('.btn-spinner');
const errorMsg = document.getElementById('errorMsg');
const resultsSection = document.getElementById('resultsSection');
const resultsCard = document.getElementById('resultsCard');

// 儲存目前多圖貼文的圖片列表
let currentImages = [];

// 根據輸入內容啟用/停用按鈕
urlInput.addEventListener('input', () => {
  const val = urlInput.value.trim();
  downloadBtn.disabled = !isTikTokUrl(val);
  hideError();
});

// 處理請求
downloadBtn.addEventListener('click', fetchTikTok);
urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !downloadBtn.disabled) fetchTikTok();
});

// =============================================
// 隨機檔名生成
// =============================================
function generateRandomName(ext) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `tikload_${random}.${ext}`;
}

// =============================================
//  Blob 下載（自訂檔名）
// =============================================
async function downloadFile(url, ext, btnEl) {
  if (!url) return;

  const originalText = btnEl ? btnEl.innerHTML : '';
  if (btnEl) {
    btnEl.innerHTML = '<span class="dl-downloading">⏳ 下載中…</span>';
    btnEl.classList.add('downloading');
    btnEl.disabled = true;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = generateRandomName(ext);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // Blob 下載失敗時 fallback 到新分頁開啟
    console.warn('Blob download failed, falling back to new tab:', err);
    window.open(url, '_blank');
  } finally {
    if (btnEl) {
      btnEl.innerHTML = originalText;
      btnEl.classList.remove('downloading');
      btnEl.disabled = false;
    }
  }
}

// =============================================
//  狀態控制
// =============================================
function isTikTokUrl(url) {
  return /(?:tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/.test(url);
}

function showLoading() {
  btnSpinner.hidden = false;
  btnText.textContent = '處理中…';
  downloadBtn.disabled = true;
  urlInput.disabled = true;
}

function hideLoading() {
  btnSpinner.hidden = true;
  btnText.textContent = '取得';
  downloadBtn.disabled = false;
  urlInput.disabled = false;
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
}

// =============================================
//  取得影片資訊
// =============================================
async function fetchTikTok() {
  const url = urlInput.value.trim();
  if (!isTikTokUrl(url)) return;

  hideError();
  showLoading();
  resultsSection.hidden = true;

  try {
    const res = await fetch('/.netlify/functions/tiktok-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `伺服器錯誤（${res.status}）`);
    }

    const data = await res.json();

    if (data.code !== 0 && !data.data) {
      throw new Error(data.msg || '無法取得影片，請確認連結後再試一次。');
    }

    const video = data.data || data;
    renderResults(video);
  } catch (err) {
    showError(err.message || '發生錯誤，請稍後再試。');
  } finally {
    hideLoading();
  }
}

// =============================================
//  渲染結果
// =============================================
function renderResults(v) {
  const title = v.title || '無標題';
  const author = v.author?.nickname || v.author || '未知作者';
  const desc = v.title || '';
  const thumb = v.cover || v.origin_cover || v.music?.cover || '';

  // 偵測多圖貼文（image carousel）
  const images = v.images || v.images_list || [];
  const isImagePost = Array.isArray(images) && images.length > 0;
  currentImages = isImagePost
    ? images.map((img) => (typeof img === 'string' ? img : (img.url || img)))
    : [];

  const noWmVideo = v.play || v.hdplay || '';
  const wmVideo = v.wmplay || v.play || '';
  const audio = v.music?.play || v.music?.url || '';
  const coverImage = v.cover || v.origin_cover || '';

  const fileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const size = v.size ? fileSize(v.size) : '';
  const duration = v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '';

  // 多圖貼文：顯示所有圖片
  const imagePostHtml = isImagePost ? `
    <p class="images-label">共 ${images.length} 張圖片 — 點擊即可下載</p>
    <div class="images-grid">
      ${images.map((img, i) => {
        const imgUrl = typeof img === 'string' ? img : (img.url || img);
        return `<button class="image-item" onclick="downloadFile('${imgUrl}', 'jpg', this)">
          <img src="${imgUrl}" alt="圖片 ${i + 1}" loading="lazy" />
          <span class="image-item-badge">${i + 1} / ${images.length}</span>
          <span class="image-item-dl">⬇ 下載</span>
        </button>`;
      }).join('')}
    </div>
    <div class="download-all-row">
      <button class="download-all-btn" onclick="downloadAllImages()">⬇ 下載全部圖片</button>
    </div>
  ` : '';

  // 單張封面（非多圖貼文時顯示）
  const singleCoverHtml = (!isImagePost && coverImage) ? `<button class="dl-btn" onclick="downloadFile('${coverImage}', 'jpg', this)">
        <div class="dl-btn-icon image">🖼️</div>
        <span>封面圖片</span>
        <span class="dl-btn-label">JPG</span>
      </button>` : '';

  let html = `
    <div class="results-header">
      ${thumb ? `<img class="results-thumb" src="${thumb}" alt="縮圖" />` : ''}
      <div class="results-info">
        <p class="results-title">${escapeHtml(title)}</p>
        <p class="results-author">@${escapeHtml(author)}</p>
        <p class="results-desc">${escapeHtml(desc)}${duration ? ` · ${duration}` : ''}${size ? ` · ${size}` : ''}${isImagePost ? ` · 📷 ${images.length} 張圖片` : ''}</p>
      </div>
    </div>
    ${imagePostHtml}
    <div class="download-grid">
      ${noWmVideo ? `<button class="dl-btn" onclick="downloadFile('${noWmVideo}', 'mp4', this)">
        <div class="dl-btn-icon video">🎬</div>
        <span>無浮水印影片</span>
        <span class="dl-btn-label">${size || 'MP4'}</span>
      </button>` : ''}
      ${wmVideo && wmVideo !== noWmVideo ? `<button class="dl-btn" onclick="downloadFile('${wmVideo}', 'mp4', this)">
        <div class="dl-btn-icon video">🎞️</div>
        <span>含浮水印影片</span>
        <span class="dl-btn-label">MP4</span>
      </button>` : ''}
      ${audio ? `<button class="dl-btn" onclick="downloadFile('${audio}', 'mp3', this)">
        <div class="dl-btn-icon audio">🎵</div>
        <span>僅音訊</span>
        <span class="dl-btn-label">MP3</span>
      </button>` : ''}
      ${singleCoverHtml}
    </div>
  `;

  resultsCard.innerHTML = html;
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// =============================================
//  工具函數
// =============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 下載所有圖片
async function downloadAllImages() {
  for (let i = 0; i < currentImages.length; i++) {
    const url = currentImages[i];
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = generateRandomName('jpg');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, '_blank');
    }
    // 間隔避免瀏覽器封鎖
    if (i < currentImages.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
}
