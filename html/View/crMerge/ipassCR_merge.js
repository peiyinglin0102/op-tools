// ipassCR_merge.js
// 解析 iPASS 清分檔 → 依固定欄位長度切片 → 輸出到 a1I ~ a45I
// 新增：自動顯示金額/時間（不影響複製：仍只複製 hex 原值）

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('cr_value_ipass');
    if (!input) return;

    // 欄位長度（字元）
    const SEGMENTS = [
      8,   // 1  卡號
      24,  // 2  卡號批號
      8,   // 3  交易讀寫器編號
      8,   // 4  電子票值 (LE 4B → 金額)
      8,   // 5  備份電子票值 (LE 4B → 金額)
      8,   // 6  同步後票值 (LE 4B → 金額)
      12,  // 7  優惠記名身份字型
      8,   // 8  前筆交易日期 (LE 4B → Unix 秒 → 時間)
      2,   // 9  前筆交易類別
      4,   // 10 前筆扣款金額 (LE 2B → 金額)
      4,   // 11 前筆餘額 (LE 2B → 金額)
      2,   // 12 前筆系統編號
      2,   // 13 前筆地點業者
      8,   // 14 前筆設備編號
      2,   // 15 同步狀態
      8,   // 16 轉乘群#1 (LE 4B → Unix 秒 → 時間)
      2,   // 17 轉乘群#2
      2,   // 18 轉乘群#3
      2,   // 19 轉乘群#4
      2,   // 20 轉乘群#5
      2,   // 21 轉乘群#6
      8,   // 22 轉乘群#7
      2,   // 23 個人身份別
      2,   // 24 發卡單位編號
      4,   // 25 交易金額 (LE 2B → 金額)
      8,   // 26 交易時間 (LE 4B → Unix 秒 → 時間)
      2,   // 27 交易類別
      4,   // 28 租賃應付金額 (LE 2B → 金額)
      4,   // 29 轉騎優惠金額 (LE 2B → 金額)
      4,   // 30 專案優惠金額 (LE 2B → 金額)
      2,   // 31 專案旗標
      8,   // 32 借車時間 (LE 4B → Unix 秒 → 時間)
      2,   // 33 此次轉乘群#3
      2,   // 34 此次轉乘群#2
      8,   // 35 交易後餘額 (LE 4B → 金額)
      4,   // 36 卡片交易序號
      16,  // 37 SAM卡號
      8,   // 38 押碼值
      112, // 39 押碼 byte array
      2,   // 40 扣款種類
      10,  // 41 腳踏車編號
      10,  // 42 還車車柱
      10,  // 43 借車車柱
      8,   // 44 月票到期日
      2    // 45 效期有效天數
    ];

    const ids = SEGMENTS.map((_, i) => `a${i + 1}I`);

    // 哪些欄位要轉成金額（LE：小端序）
    const MONEY_LE32 = new Set(['a4I', 'a5I', 'a6I', 'a35I']); // 8 hex (4 bytes)
    const MONEY_LE16 = new Set(['a10I', 'a11I', 'a25I', 'a28I', 'a29I', 'a30I']); // 4 hex (2 bytes)

    // 哪些欄位要轉成時間（Unix 秒，LE 4 bytes，顯示 +08:00）
    const TIME_LE32  = new Set(['a8I', 'a16I', 'a26I', 'a32I']);

    // 初始清空
    clearCells(ids);

    const handler = () => {
      const raw = sanitizeHex(input.value);
      if (!raw) {
        clearCells(ids);
        return;
      }

      let pos = 0;
      let lastFilled = -1;

      for (let i = 0; i < SEGMENTS.length; i++) {
        const len = SEGMENTS[i];
        const start = pos;
        const end = pos + len;
        pos = end;

        const cellId = ids[i];
        const el = document.getElementById(cellId);
        if (!el) continue;

        const hex = raw.slice(start, end);
        // 預設僅顯示 hex
        let human = '';

        // 金額（LE）
        if (MONEY_LE32.has(cellId) && hex.length === 8) {
          const v = leHexToInt(hex);
          human = `（＝ ${v} ）`;
        } else if (MONEY_LE16.has(cellId) && hex.length === 4) {
          const v = leHexToInt(hex);
          human = `（＝ ${v} ）`;
        }

        // 時間（LE → Unix 秒 → +08:00）
        if (TIME_LE32.has(cellId) && hex.length === 8) {
          const ts = leHexToInt(hex);
          const dt = new Date((ts + 8 * 3600) * 1000); // 轉台灣時間
          const fmt = formatDateTime(dt);
          human = `（${fmt}）`;
        }

        // 內容：hex + 轉譯提示（提示設小字、半透明）
        el.innerHTML = `
          <span data-copy>${hex}</span>
          ${human ? `<span style="margin-left:.5em;opacity:.75;font-size:12px;">${human}</span>` : ''}
        `;
        bindCopy(el);

        if (hex.length) lastFilled = i;
      }

      // 清空尾端未覆蓋欄位
      for (let i = lastFilled + 1; i < ids.length; i++) {
        const el = document.getElementById(ids[i]);
        if (el) el.textContent = '';
      }
    };

    // 即時更新 + 相容 change
    input.addEventListener('input', handler);
    input.addEventListener('change', handler);

    // ========= 工具 =========
    function sanitizeHex(str) {
      if (!str) return '';
      return String(str).replace(/[^0-9a-f]/gi, '').toUpperCase();
    }

    function clearCells(cellIds) {
      cellIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });
    }

    // 只複製 data-copy 的純 hex
    function bindCopy(td) {
      td.onclick = () => {
        const pure = td.querySelector('[data-copy]')?.textContent || td.innerText;
        copyCellText(pure);
      };
    }

    // 小端序 hex → 整數（按位元組反轉）
    function leHexToInt(hex) {
      if (!hex || hex.length % 2 !== 0) return 0;
      const bytes = hex.match(/.{1,2}/g) || [];
      const be = bytes.reverse().join('');
      return parseInt(be, 16) || 0;
    }

    // yyyy/MM/dd HH:mm:ss
    function formatDateTime(d) {
      const pad = n => (n < 10 ? '0' + n : '' + n);
      return (
        d.getFullYear() + '/' +
        pad(d.getMonth() + 1) + '/' +
        pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds())
      );
    }
  });

  // ===== 原本的複製 / Toast 行為 =====
  window.copyCellText = function (text) {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => showToast('已複製到剪貼簿'))
      .catch(() => showToast('複製失敗', 'error'));
  };

  window.showToast = function (msg, type = 'success') {
    const t = document.createElement('div');
    t.innerText = msg;
    t.style.cssText = `
      position:fixed;bottom:30px;right:30px;
      background:${type === 'success' ? 'rgba(46,160,67,.95)' : 'rgba(218,54,51,.95)'};
      color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;opacity:0;transition:.3s
    `;
    document.body.appendChild(t);
    requestAnimationFrame(() => (t.style.opacity = 1));
    setTimeout(() => {
      t.style.opacity = 0;
      setTimeout(() => t.remove(), 300);
    }, 2500);
  };
})();
