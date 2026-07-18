(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.animationDelay = (i % 8) * 45 + 'ms';
    card.classList.add('reveal-card');
  });

  const style = document.createElement('style');
  style.textContent = `
    @keyframes rise {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }

    .reveal-card {
      animation: rise .45s both;
    }
  `;
  document.head.appendChild(style);
})();

(function () {
  const top = document.querySelector('.sticky-top');

  if (!top) return;

  let compact = false;

  const sync = () => {
    const next = window.scrollY > 90;

    if (next !== compact) {
      compact = next;
      top.classList.toggle('is-compact', compact);
      document.body.classList.toggle('is-compact', compact);
    }
  };

  window.addEventListener('scroll', sync, { passive: true });
  sync();
})();

(function () {
  if (typeof window.updateTripSummary === 'function') {
    window.updateTripSummary(
      document.body.getAttribute('data-active-panel') || 'd1'
    );
  }

  const budgetTotal = 21360;
  let spent = 0;
  let hasCache = false;

  try {
    const cached = JSON.parse(
      localStorage.getItem('expenseCache_singapore') || 'null'
    );

    if (cached && Array.isArray(cached.rows)) {
      hasCache = true;

      const rates = {
        TWD: 1,
        SGD: 24.5,
        USD: 32.5,
        JPY: 0.22
      };

      spent = Math.round(
        cached.rows.reduce((sum, row) => {
          return (
            sum +
            (Number(row['金額']) || 0) *
              (rates[row['幣別'] || 'TWD'] || 1)
          );
        }, 0)
      );
    }
  } catch (error) {}

  const spentEl = document.getElementById('budget-spent');
  const detailEl = document.getElementById('budget-detail');

  if (spentEl) {
    spentEl.textContent = hasCache
      ? '已記帳 NT$ ' + spent.toLocaleString()
      : '預估 NT$ ' + budgetTotal.toLocaleString();
  }

  if (detailEl) {
    detailEl.textContent = hasCache
      ? `剩餘約 NT$ ${Math.max(
          0,
          budgetTotal - spent
        ).toLocaleString()}，資料來自記帳系統。`
      : '尚無記帳快取，開啟記帳頁後會自動同步。';
  }

  const weatherMain = document.getElementById('weather-main');
  const weatherDetail = document.getElementById('weather-detail');

  const codeText = {
    0: '晴朗',
    1: '大致晴朗',
    2: '局部多雲',
    3: '陰天',
    45: '有霧',
    48: '霧凇',
    51: '毛毛雨',
    53: '毛毛雨',
    55: '較強毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    80: '陣雨',
    81: '陣雨',
    82: '強陣雨',
    95: '雷雨'
  };

  fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=1.3521&longitude=103.8198&current=temperature_2m,apparent_temperature,precipitation,weather_code&timezone=Asia%2FSingapore'
  )
    .then((response) => {
      if (!response.ok) throw new Error('weather');
      return response.json();
    })
    .then((data) => {
      const weather = data.current || {};

      if (weatherMain) {
        weatherMain.innerHTML = `🌤️ <strong>${Math.round(
          weather.temperature_2m
        )}°C</strong>`;
      }

      if (weatherDetail) {
        weatherDetail.textContent = `${
          codeText[weather.weather_code] || '即時天氣'
        }，體感 ${Math.round(
          weather.apparent_temperature
        )}°C，降雨 ${weather.precipitation || 0} mm。`;
      }
    })
    .catch(() => {
      if (weatherMain) {
        weatherMain.innerHTML = '🌤️ <strong>暫時無法更新</strong>';
      }

      if (weatherDetail) {
        weatherDetail.textContent = '請確認網路連線後重新整理。';
      }
    });
})();

(function () {
  const tabBar = document.querySelector('.tab-bar');
  const tabContent = document.querySelector('.tab-content');

  if (!tabBar || !tabContent || document.getElementById('panel-uss')) {
    return;
  }

  const style = document.createElement('style');

  style.textContent = `
    .tab-bar {
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .tab-bar::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      min-width: 76px;
      flex-shrink: 0;
    }

    .uss-map-card {
      background: var(--surface);
      border: 0.5px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      cursor: zoom-in;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    }

    .uss-map-card img {
      display: block;
      width: 100%;
      height: auto;
    }

    .uss-map-label {
      padding: 0.7rem 0.85rem;
      border-top: 0.5px solid var(--border);
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .uss-map-hint {
      font-weight: 400;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .uss-route-card {
      margin-top: 0.75rem;
      background: var(--surface);
      border: 0.5px solid var(--border);
      border-radius: var(--radius);
      padding: 0.8rem 1rem;
    }

    .uss-route-title {
      font-size: 0.82rem;
      font-weight: 600;
      margin-bottom: 0.4rem;
    }

    .uss-route-text {
      font-size: 0.78rem;
      line-height: 1.65;
      color: var(--text-secondary);
    }

    .uss-map-modal {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.94);
      display: none;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
      padding: 4rem 0.5rem 2rem;
    }

    .uss-map-modal.open {
      display: block;
    }

    .uss-map-modal img {
      display: block;
      width: 1800px;
      max-width: none;
      height: auto;
      margin: 0 auto;
      touch-action: pinch-zoom;
    }

    .uss-map-close {
      position: fixed;
      top: max(0.8rem, env(safe-area-inset-top));
      right: 0.8rem;
      z-index: 10000;
      width: 2.6rem;
      height: 2.6rem;
      border: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.94);
      font-size: 1.2rem;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
      cursor: pointer;
    }

    @media (max-width: 640px) {
      .uss-map-modal img {
        width: 1500px;
      }

      .tab-btn {
        min-width: 70px;
      }

      .tab-label {
        font-size: 0.74rem;
      }

      .tab-sub {
        font-size: 0.58rem;
      }
    }
  `;

  document.head.appendChild(style);

  const tab = document.createElement('button');

  tab.className = 'tab-btn uss-tab';
  tab.type = 'button';

  tab.innerHTML = `
    <div class="tab-dot" style="background:#6B4CC2;"></div>
    <div class="tab-label">USS 地圖</div>
    <div class="tab-sub">Park Map</div>
  `;

  tabBar.appendChild(tab);

  const panel = document.createElement('div');

  panel.className = 'panel';
  panel.id = 'panel-uss';

  panel.innerHTML = `
    <div class="panel-dino-hero mrt-dino-hero">
      <div>
        <div class="panel-dino-kicker">小暴龍帶路</div>
        <div class="panel-dino-title">
          新加坡環球影城園區地圖
        </div>
        <div class="panel-dino-note">
          點擊圖片可全螢幕查看，手機支援雙指縮放。
        </div>
      </div>

      <img
        src="assets/dino/dino-map-guide.png"
        alt=""
        aria-hidden="true"
      >
    </div>

    <div class="uss-map-card" id="ussMapCard">
      <img
        src="images/uss-park-map.webp"
        alt="新加坡環球影城中文園區地圖"
      >

      <div class="uss-map-label">
        <span>USS 中文園區地圖</span>
        <span class="uss-map-hint">點擊放大</span>
      </div>
    </div>

    <div class="uss-route-card">
      <div class="uss-route-title">建議遊玩方向</div>

      <div class="uss-route-text">
        科幻城市 → 古埃及 → 失落的世界 → 遙遠王國 →
        小黃人樂園 → 紐約 → 好萊塢
      </div>
    </div>
  `;

  tabContent.appendChild(panel);

  const modal = document.createElement('div');

  modal.className = 'uss-map-modal';
  modal.id = 'ussMapModal';

  modal.innerHTML = `
    <button
      class="uss-map-close"
      type="button"
      aria-label="關閉"
    >
      ✕
    </button>

    <img
      src="images/uss-park-map.webp"
      alt="新加坡環球影城中文園區地圖"
    >
  `;

  document.body.appendChild(modal);

  const summary = document.querySelector('.trip-summary');

  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((button) => {
      button.classList.remove('active');
    });

    document.querySelectorAll('.panel').forEach((item) => {
      item.classList.remove('active');
    });

    tab.classList.add('active');
    panel.classList.add('active');

    document.body.setAttribute('data-active-panel', 'uss');

    if (summary) {
      summary.style.display = 'none';
    }

    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  });

  document
    .querySelectorAll('.tab-btn:not(.uss-tab)')
    .forEach((button) => {
      button.addEventListener('click', () => {
        if (summary) {
          summary.style.display = '';
        }
      });
    });

  const openModal = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document
    .getElementById('ussMapCard')
    .addEventListener('click', openModal);

  modal.addEventListener('click', closeModal);

  modal.querySelector('img').addEventListener('click', (event) => {
    event.stopPropagation();
  });

  modal
    .querySelector('.uss-map-close')
    .addEventListener('click', closeModal);
})();
