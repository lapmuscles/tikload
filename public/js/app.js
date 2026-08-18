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

function renderResults(v) {
  const title = v.title || '無標題';
  const author = v.author?.nickname || v.author || '未知作者';
  const desc = v.title || '';
  const thumb = v.cover || v.origin_cover || v.music?.cover || '';

  const noWmVideo = v.play || v.hdplay || '';
  const wmVideo = v.wmplay || v.play || '';
  const audio = v.music?.play || v.music?.url || '';
  const image = v.cover || v.origin_cover || '';

  const fileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const size = v.size ? fileSize(v.size) : '';
  const duration = v.duration ? `${Math.floor(v.duration / 60)}:${String(v.duration % 60).padStart(2, '0')}` : '';

  let html = `
    <div class="results-header">
      ${thumb ? `<img class="results-thumb" src="${thumb}" alt="縮圖" />` : ''}
      <div class="results-info">
        <p class="results-title">${escapeHtml(title)}</p>
        <p class="results-author">@${escapeHtml(author)}</p>
        <p class="results-desc">${escapeHtml(desc)}${duration ? ` · ${duration}` : ''}${size ? ` · ${size}` : ''}</p>
      </div>
    </div>
    <div class="download-grid">
      ${noWmVideo ? `<a class="dl-btn" href="${noWmVideo}" target="_blank" rel="noopener" download>
        <div class="dl-btn-icon video">🎬</div>
        <span>無浮水印影片</span>
        <span class="dl-btn-label">${size || 'MP4'}</span>
      </a>` : ''}
      ${wmVideo && wmVideo !== noWmVideo ? `<a class="dl-btn" href="${wmVideo}" target="_blank" rel="noopener" download>
        <div class="dl-btn-icon video">🎞️</div>
        <span>含浮水印影片</span>
        <span class="dl-btn-label">MP4</span>
      </a>` : ''}
      ${audio ? `<a class="dl-btn" href="${audio}" target="_blank" rel="noopener" download>
        <div class="dl-btn-icon audio">🎵</div>
        <span>僅音訊</span>
        <span class="dl-btn-label">MP3</span>
      </a>` : ''}
      ${image ? `<a class="dl-btn" href="${image}" target="_blank" rel="noopener" download>
        <div class="dl-btn-icon image">🖼️</div>
        <span>封面圖片</span>
        <span class="dl-btn-label">JPG</span>
      </a>` : ''}
    </div>
  `;

  resultsCard.innerHTML = html;
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
