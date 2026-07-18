(function () {
  'use strict';

  const PANEL_NAMES = [
    'd1',
    'd2',
    'd3',
    'budget',
    'map',
    'uss',
    'private'
  ];

  const SUMMARY_VISIBLE_PANELS = new Set([
    'd1',
    'd2',
    'd3'
  ]);

  const TRIP_SUMMARIES = {
    d1: {
      title: '今日亮點',
      main: '星耀樟宜、牛車水與濱海灣',
      detail: '清晨抵達後進市區，晚上看兩場免費燈光水舞。',
      tip: '先寄放行李再進市區，晚上回機場取行李後入住。'
    },

    d2: {
      title: '今日亮點',
      main: '新加坡環球影城',
      detail: '上午先玩熱門設施，下午依排隊時間彈性調整。',
      tip: '先衝變形金剛與木乃伊，超過 45 分鐘的設施晚點再回來。'
    },

    d3: {
      title: '今日亮點',
      main: '雨漩渦補拍與返台',
      detail: '退房後回星耀樟宜，保留充足時間辦理登機。',
      tip: '確認護照、登機證與行李，至少提前兩小時抵達航廈。'
    }
  };

  const WEATHER_TEXT = {
    0: '晴朗',
    1: '大致晴朗',
    2: '局部多雲',
    3: '陰天',
    45: '有霧',
    48: '霧凇',
    51: '毛毛雨',
    53: '毛毛雨',
    55: '較強毛毛雨',
    56: '凍毛毛雨',
    57: '強凍毛毛雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '凍雨',
    67: '強凍雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '米雪',
    80: '陣雨',
    81: '陣雨',
    82: '強陣雨',
    85: '陣雪',
    86: '強陣雪',
    95: '雷雨',
    96: '雷雨伴冰雹',
    99: '強雷雨伴冰雹'
  };

  let budgetChart = null;
  let stickyResizeObserver = null;

  function getPanelNameFromButton(button) {
    if (!button) return null;

    const handler = button.getAttribute('onclick') || '';
    const match = handler.match(/switchTab\(['"]([^'"]+)['"]\)/);

    return match ? match[1] : null;
  }

  function findTabButton(panelName) {
    return Array.from(
      document.querySelectorAll('.tab-btn')
    ).find((button) => {
      return getPanelNameFromButton(button) === panelName;
    });
  }

  function syncStickyHeight() {
    const stickyTop = document.querySelector('.sticky-top');

    if (!stickyTop) return;

    const height = Math.ceil(
      stickyTop.getBoundingClientRect().height
    );

    document.documentElement.style.setProperty(
      '--sticky-h',
      `${height}px`
    );
  }

  function syncCompactHeader() {
    const stickyTop = document.querySelector('.sticky-top');

    if (!stickyTop) return;

    const shouldCompact = window.scrollY > 90;

    stickyTop.classList.toggle(
      'is-compact',
      shouldCompact
    );

    document.body.classList.toggle(
      'is-compact',
      shouldCompact
    );

    window.requestAnimationFrame(syncStickyHeight);
  }

  function setSummaryVisibility(panelName) {
    const summary = document.querySelector('.trip-summary');

    if (!summary) return;

    summary.hidden = !SUMMARY_VISIBLE_PANELS.has(
      panelName
    );
  }

  function updateTripSummary(panelName) {
    const summary =
      TRIP_SUMMARIES[panelName] ||
      TRIP_SUMMARIES.d1;

    const title = document.getElementById(
      'highlight-title'
    );

    const main = document.getElementById(
      'highlight-main'
    );

    const detail = document.getElementById(
      'highlight-detail'
    );

    const tip = document.getElementById(
      'dino-tip'
    );

    if (title) {
      title.textContent = summary.title;
    }

    if (main) {
      main.textContent = summary.main;
    }

    if (detail) {
      detail.textContent = summary.detail;
    }

    if (tip) {
      tip.textContent = summary.tip;
    }
  }

  function scrollActiveTabIntoView(button) {
    if (!button) return;

    window.requestAnimationFrame(() => {
      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    });
  }

  function switchTab(panelName) {
    if (!PANEL_NAMES.includes(panelName)) {
      panelName = 'd1';
    }

    const panel = document.getElementById(
      `panel-${panelName}`
    );

    if (!panel) return;

    document
      .querySelectorAll('.panel')
      .forEach((item) => {
        item.classList.toggle(
          'active',
          item === panel
        );
      });

    const activeButton = findTabButton(panelName);

    document
      .querySelectorAll('.tab-btn')
      .forEach((button) => {
        button.classList.toggle(
          'active',
          button === activeButton
        );
      });

    document.body.setAttribute(
      'data-active-panel',
      panelName
    );

    setSummaryVisibility(panelName);
    updateTripSummary(panelName);
    scrollActiveTabIntoView(activeButton);

    if (panelName === 'budget') {
      renderBudgetChart();
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    window.requestAnimationFrame(syncStickyHeight);
  }

  function openMrtModal(imagePath, title) {
    const modal = document.getElementById(
      'mrtModal'
    );

    const image = document.getElementById(
      'mrtModalImg'
    );

    if (!modal || !image || !imagePath) return;

    image.src = imagePath;
    image.alt = title || '地圖';

    modal.classList.add('open');
    modal.classList.add('active');

    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeMrtModal() {
    const modal = document.getElementById(
      'mrtModal'
    );

    const image = document.getElementById(
      'mrtModalImg'
    );

    if (!modal) return;

    modal.classList.remove('open');
    modal.classList.remove('active');

    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (image) {
      window.setTimeout(() => {
        if (
          !modal.classList.contains('open') &&
          !modal.classList.contains('active')
        ) {
          image.src = '';
        }
      }, 150);
    }
  }

  async function copyText(elementOrText) {
    const text =
      typeof elementOrText === 'string'
        ? elementOrText
        : elementOrText?.dataset?.copy ||
          elementOrText?.textContent?.trim();

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      showCopyFeedback(elementOrText, '已複製');
    } catch (error) {
      const textarea =
        document.createElement('textarea');

      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';

      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy');
        showCopyFeedback(
          elementOrText,
          '已複製'
        );
      } catch (copyError) {
        showCopyFeedback(
          elementOrText,
          '複製失敗'
        );
      }

      textarea.remove();
    }
  }

  function showCopyFeedback(element, message) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    const original =
      element.dataset.originalText ||
      element.innerHTML;

    element.dataset.originalText = original;
    element.textContent = message;

    window.setTimeout(() => {
      element.innerHTML = original;
    }, 1200);
  }

  function readExpenseCache() {
    try {
      const cached = JSON.parse(
        localStorage.getItem(
          'expenseCache_singapore'
        ) || 'null'
      );

      if (
        cached &&
        Array.isArray(cached.rows)
      ) {
        return cached.rows;
      }
    } catch (error) {
      console.warn(
        'Unable to read expense cache.',
        error
      );
    }

    return null;
  }

  function syncBudgetSummary() {
    const budgetTotal = 21360;
    const rows = readExpenseCache();

    const spentElement = document.getElementById(
      'budget-spent'
    );

    const detailElement =
      document.getElementById(
        'budget-detail'
      );

    if (!spentElement || !detailElement) {
      return;
    }

    if (!rows) {
      spentElement.textContent =
        `預估 NT$ ${budgetTotal.toLocaleString()}`;

      detailElement.textContent =
        '尚無記帳快取，開啟記帳頁後會自動同步。';

      return;
    }

    const rates = {
      TWD: 1,
      SGD: 24.5,
      USD: 32.5,
      JPY: 0.22
    };

    const spent = Math.round(
      rows.reduce((sum, row) => {
        const amount =
          Number(row['金額']) ||
          Number(row.amount) ||
          0;

        const currency =
          row['幣別'] ||
          row.currency ||
          'TWD';

        return (
          sum +
          amount *
            (rates[currency] || 1)
        );
      }, 0)
    );

    const remaining = Math.max(
      0,
      budgetTotal - spent
    );

    spentElement.textContent =
      `已記帳 NT$ ${spent.toLocaleString()}`;

    detailElement.textContent =
      `剩餘約 NT$ ${remaining.toLocaleString()}，資料來自記帳系統。`;
  }

  async function loadWeather() {
    const weatherMain =
      document.getElementById('weather-main');

    const weatherDetail =
      document.getElementById(
        'weather-detail'
      );

    if (!weatherMain || !weatherDetail) {
      return;
    }

    const endpoint =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=1.3521' +
      '&longitude=103.8198' +
      '&current=temperature_2m,' +
      'apparent_temperature,' +
      'precipitation,' +
      'weather_code' +
      '&timezone=Asia%2FSingapore';

    try {
      const controller =
        new AbortController();

      const timeout = window.setTimeout(
        () => controller.abort(),
        8000
      );

      const response = await fetch(endpoint, {
        signal: controller.signal,
        cache: 'no-store'
      });

      window.clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(
          `Weather request failed: ${response.status}`
        );
      }

      const data = await response.json();
      const weather = data.current || {};

      const temperature = Number(
        weather.temperature_2m
      );

      const apparentTemperature = Number(
        weather.apparent_temperature
      );

      const precipitation = Number(
        weather.precipitation
      );

      const code = Number(
        weather.weather_code
      );

      weatherMain.innerHTML =
        `🌤️ <strong>${Math.round(
          temperature
        )}°C</strong>`;

      weatherDetail.textContent =
        `${WEATHER_TEXT[code] || '即時天氣'}，` +
        `體感 ${Math.round(
          apparentTemperature
        )}°C，` +
        `降雨 ${
          Number.isFinite(precipitation)
            ? precipitation
            : 0
        } mm。`;

      try {
        localStorage.setItem(
          'singaporeWeatherCache',
          JSON.stringify({
            savedAt: Date.now(),
            main: weatherMain.innerHTML,
            detail: weatherDetail.textContent
          })
        );
      } catch (error) {}
    } catch (error) {
      const cached = readWeatherCache();

      if (cached) {
        weatherMain.innerHTML = cached.main;
        weatherDetail.textContent =
          `${cached.detail}（離線快取）`;

        return;
      }

      weatherMain.innerHTML =
        '🌤️ <strong>暫時無法更新</strong>';

      weatherDetail.textContent =
        '目前無法取得即時天氣，請確認網路連線。';
    }
  }

  function readWeatherCache() {
    try {
      const cached = JSON.parse(
        localStorage.getItem(
          'singaporeWeatherCache'
        ) || 'null'
      );

      if (
        cached &&
        cached.main &&
        cached.detail
      ) {
        return cached;
      }
    } catch (error) {}

    return null;
  }

  function renderBudgetChart() {
    const canvas =
      document.getElementById(
        'budgetPieChart'
      );

    const legend =
      document.getElementById(
        'budgetLegend'
      );

    if (!canvas || !window.Chart) {
      return;
    }

    const items = [
      {
        label: '機票',
        value: 6955.26,
        color: '#4DB6AC'
      },
      {
        label: '住宿',
        value: 6020.16,
        color: '#5F7E93'
      },
      {
        label: '環球影城',
        value: 2014,
        color: '#6B4CC2'
      },
      {
        label: '網路與保險',
        value: 1838,
        color: '#E0A85F'
      },
      {
        label: '餐飲交通與其他',
        value: 4532.58,
        color: '#E17A4C'
      }
    ];

    if (budgetChart) {
      budgetChart.destroy();
      budgetChart = null;
    }

    budgetChart = new window.Chart(
      canvas.getContext('2d'),
      {
        type: 'doughnut',

        data: {
          labels: items.map(
            (item) => item.label
          ),

          datasets: [
            {
              data: items.map(
                (item) => item.value
              ),

              backgroundColor: items.map(
                (item) => item.color
              ),

              borderWidth: 0,
              hoverOffset: 3
            }
          ]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '66%',

          plugins: {
            legend: {
              display: false
            },

            tooltip: {
              callbacks: {
                label(context) {
                  const value =
                    Number(context.raw) || 0;

                  return (
                    `${context.label}: NT$ ` +
                    value.toLocaleString(
                      'zh-TW',
                      {
                        maximumFractionDigits: 0
                      }
                    )
                  );
                }
              }
            }
          }
        }
      }
    );

    if (legend) {
      const total = items.reduce(
        (sum, item) => sum + item.value,
        0
      );

      legend.innerHTML = items
        .map((item) => {
          const percent = Math.round(
            (item.value / total) * 100
          );

          return `
            <div class="chart-legend-row">
              <span>
                <span
                  style="
                    display:inline-block;
                    width:9px;
                    height:9px;
                    margin-right:6px;
                    border-radius:50%;
                    background:${item.color};
                  "
                ></span>
                ${item.label}
              </span>

              <strong>${percent}%</strong>
            </div>
          `;
        })
        .join('');
    }
  }

  async function unlock() {
    const input =
      document.getElementById('lock-pwd');

    const errorElement =
      document.getElementById(
        'lock-error'
      );

    const lockScreen =
      document.getElementById(
        'lock-screen'
      );

    const privateContent =
      document.getElementById(
        'private-content'
      );

    if (
      !input ||
      !lockScreen ||
      !privateContent
    ) {
      return;
    }

    if (errorElement) {
      errorElement.style.display = 'none';
    }

    const encrypted =
      typeof window.ENCRYPTED === 'string'
        ? window.ENCRYPTED
        : typeof ENCRYPTED === 'string'
          ? ENCRYPTED
          : '';

    if (!encrypted) {
      showUnlockError(
        errorElement,
        '找不到加密內容。'
      );

      return;
    }

    try {
      const html =
        await decryptEncryptedContent(
          encrypted,
          input.value
        );

      privateContent.innerHTML = html;
      privateContent.style.display = 'block';
      lockScreen.style.display = 'none';

      sessionStorage.setItem(
        'singaporePrivateUnlocked',
        '1'
      );
    } catch (error) {
      showUnlockError(
        errorElement,
        '密碼錯誤，請再試一次'
      );

      input.select();
    }
  }

  function showUnlockError(
    errorElement,
    message
  ) {
    if (!errorElement) return;

    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  async function decryptEncryptedContent(
    encrypted,
    password
  ) {
    if (!password) {
      throw new Error('Password required.');
    }

    if (
      typeof window.CryptoJS !== 'undefined'
    ) {
      const decrypted =
        window.CryptoJS.AES.decrypt(
          encrypted,
          password
        );

      const result =
        decrypted.toString(
          window.CryptoJS.enc.Utf8
        );

      if (!result) {
        throw new Error(
          'Unable to decrypt content.'
        );
      }

      return result;
    }

    throw new Error(
      'CryptoJS is unavailable.'
    );
  }

  function restorePrivateSession() {
    if (
      sessionStorage.getItem(
        'singaporePrivateUnlocked'
      ) !== '1'
    ) {
      return;
    }

    /*
     * 密碼本身不儲存在瀏覽器，因此重新整理後仍需再次輸入。
     * 只保留狀態欄位，避免把敏感密碼寫入 localStorage。
     */
    sessionStorage.removeItem(
      'singaporePrivateUnlocked'
    );
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .catch((error) => {
          console.warn(
            'Service worker registration failed.',
            error
          );
        });
    });
  }

  function enhanceCards() {
    const style =
      document.createElement('style');

    style.textContent = `
      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }

        to {
          opacity: 1;
          transform: none;
        }
      }

      .reveal-card {
        animation: rise .42s both;
      }
    `;

    document.head.appendChild(style);

    document
      .querySelectorAll(
        '.card, .budget-card, .mrt-card, ' +
        '.uss-guide-card, .uss-quick-card'
      )
      .forEach((card, index) => {
        card.style.animationDelay =
          `${(index % 8) * 35}ms`;

        card.classList.add('reveal-card');
      });
  }

  function bindEvents() {
    const modal =
      document.getElementById('mrtModal');

    if (modal) {
      modal.setAttribute(
        'aria-hidden',
        'true'
      );
    }

    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          closeMrtModal();
        }
      }
    );

    window.addEventListener(
      'resize',
      () => {
        window.requestAnimationFrame(
          syncStickyHeight
        );
      },
      {
        passive: true
      }
    );

    window.addEventListener(
      'orientationchange',
      () => {
        window.setTimeout(
          syncStickyHeight,
          200
        );
      }
    );

    window.addEventListener(
      'scroll',
      syncCompactHeader,
      {
        passive: true
      }
    );

    window.addEventListener(
      'storage',
      (event) => {
        if (
          event.key ===
          'expenseCache_singapore'
        ) {
          syncBudgetSummary();
        }
      }
    );

    if (
      typeof window.ResizeObserver !==
      'undefined'
    ) {
      const stickyTop =
        document.querySelector(
          '.sticky-top'
        );

      if (stickyTop) {
        stickyResizeObserver =
          new ResizeObserver(
            syncStickyHeight
          );

        stickyResizeObserver.observe(
          stickyTop
        );
      }
    }
  }

  function initialize() {
    registerServiceWorker();
    restorePrivateSession();
    bindEvents();
    enhanceCards();
    syncBudgetSummary();
    loadWeather();

    const requestedPanel =
      window.location.hash
        .replace(/^#/, '')
        .replace(/^panel-/, '');

    const initialPanel =
      PANEL_NAMES.includes(requestedPanel)
        ? requestedPanel
        : document.body.getAttribute(
            'data-active-panel'
          ) || 'd1';

    switchTab(initialPanel);
    syncCompactHeader();
    syncStickyHeight();

    window.setTimeout(
      syncStickyHeight,
      250
    );
  }

  window.switchTab = switchTab;
  window.updateTripSummary =
    updateTripSummary;

  window.openMrtModal = openMrtModal;
  window.closeMrtModal = closeMrtModal;

  window.copyText = copyText;
  window.unlock = unlock;

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      initialize,
      {
        once: true
      }
    );
  } else {
    initialize();
  }
})();
