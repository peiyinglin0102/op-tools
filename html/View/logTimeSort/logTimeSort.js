// C:\Users\winnie.lin\Desktop\tool2.0\html\View\logTimeSort\logTimeSort.js

let parsedLogs = [];
let allKeys = new Set();

// 舊工具預設勾選欄位
const DEFAULT_COLUMNS = ['Time', 'Method', 'Path', 'bike_no', 'api', 'api_type', 'GPS_Decimal'];

/* ==========================================================
   欄位字典 (只保留舊工具/Core Schema 提到的欄位)
   Category Codes:
     CORE  : 核心 / 常用
     TRANS : 單次交易 / 扣款
     PASS  : 月票 / MaaS / 優惠 / 轉乘
     MEMBER: 會員 / 卡片
     BIKE  : 車輛 / 設備 / 場站
     SYS   : 系統 / 其他
   ========================================================== */
const FIELD_INFO = {
    // --- Core / Common (核心/常用) ---
    'Time': { label: '時間', cat: 'CORE' },
    'Method': { label: '方法', cat: 'CORE' },
    'Path': { label: '路徑', cat: 'CORE' },
    'api': { label: 'API名稱', cat: 'CORE' },
    'api_type': { label: 'API類型', cat: 'CORE' },
    'api_data_type': { label: '資料類型', cat: 'CORE' },
    '1512_code': { label: '錯誤代碼', cat: 'CORE' },
    'mdate': { label: '目前時間', cat: 'CORE' },

    // --- Transaction (單次交易 / 金額 / 補扣款) ---
    'trans_idx': { label: '交易單號', cat: 'TRANS' },
    'orderid': { label: '訂單編號', cat: 'TRANS' },
    'frameno': { label: '訂單編號', cat: 'TRANS' },
    'trade_no': { label: '第三方單號', cat: 'TRANS' },
    'rent_time': { label: '借車時間', cat: 'TRANS' },
    'time': { label: '還車 / 操作時間', cat: 'TRANS' },

    'rent_amt': { label: '租借金額', cat: 'TRANS' },
    'amt_before_txn': { label: '交易前餘額', cat: 'TRANS' },
    'amt_after_txn': { label: '交易後餘額', cat: 'TRANS' },
    'overdraft_amt': { label: '補欠款金額', cat: 'TRANS' },
    'deposit': { label: '押金', cat: 'TRANS' },
    'refund_amount': { label: '退款金額', cat: 'TRANS' },
    'fees': { label: '規費', cat: 'TRANS' },
    'purse_balance': { label: '餘額', cat: 'TRANS' },

    'pay_type': { label: '付款方式', cat: 'TRANS' },
    'pay_status': { label: '付款狀態', cat: 'TRANS' },
    'code': { label: '扣款狀態', cat: 'TRANS' },
    'msg_type': { label: '交易類別', cat: 'TRANS' },
    'tsqn': { label: '交易序號', cat: 'TRANS' },

    'ecc_cr': { label: '悠遊卡清分', cat: 'TRANS' },
    'ipass_cr': { label: '一卡通清分', cat: 'TRANS' },

    'overdraft_time': { label: '一般補扣款時間', cat: 'TRANS' },
    'overdraft_code': { label: '補扣款狀態', cat: 'TRANS' },
    'overdraft_s_id': { label: '補扣款場站', cat: 'TRANS' },
    'overdraft_device_id': { label: '補扣款車機序號', cat: 'TRANS' },

    'rent_bike_status': { label: '借車狀態', cat: 'TRANS' },
    'rent_s_id': { label: '借車場站ID', cat: 'TRANS' },

    // --- Pass / MaaS / 優惠 / 轉乘 (月票相關獨立一類) ---
    'fare_product_type': { label: '悠遊卡月票票種', cat: 'PASS' },
    'fare_product_expire_date': { label: '悠遊卡月票到期日', cat: 'PASS' },

    'maasenddate': { label: '一卡通月票結束時間', cat: 'PASS' },
    'maasstartdate': { label: '一卡通月票起始時間', cat: 'PASS' },

    'mpgov_type': { label: 'MeN-Go 月票種類', cat: 'PASS' },
    'mpgov_date': { label: 'MeN-Go 月票購迄日', cat: 'PASS' },
    'mpgov_setflag': { label: '月票設定狀態', cat: 'PASS' },

    'rate_info': { label: '費率別', cat: 'PASS' },

    'maascard': { label: '一卡通 MaaS 卡種類', cat: 'PASS' },
    'maasperiod': { label: 'MaaS 天數 / 時數', cat: 'PASS' },
    'maasperiodcode': { label: 'MaaS 票種旗標', cat: 'PASS' },
    'maasareacode': { label: 'MaaS 區域代碼', cat: 'PASS' },
    'maastransport': { label: 'MaaS 交通運具', cat: 'PASS' },
    'mappingtype': { label: 'MaaS 對應類型', cat: 'PASS' },

    'welfarecardtype': { label: '特種票票卡種類', cat: 'PASS' },
    'accumulated_free_rides': { label: '社福點數 (已使用)', cat: 'PASS' },

    'tag_data': { label: '扣款 / 優惠群組旗標', cat: 'PASS' },

    'personal_discount': { label: '敬老優惠金額', cat: 'PASS' },
    'transfer_discount': { label: '轉乘優惠金額', cat: 'PASS' },
    'transfer_group_code': { label: '寫入轉乘群組', cat: 'PASS' },

    'trftxntime': { label: '一卡通轉乘時間', cat: 'PASS' },
    'txn_date_time_of_urt': { label: '悠遊卡轉乘時間', cat: 'PASS' },
    'trfcurrentsystemid': { label: '轉乘業者代碼', cat: 'PASS' },
    'usedaccptbfotxn': { label: '交易前使用點數', cat: 'PASS' },

    // --- Member / Card (會員 / 卡片屬性) ---
    'mem_id': { label: '會員帳號', cat: 'MEMBER' },
    'user_id': { label: '會員ID', cat: 'MEMBER' },
    'phone': { label: '手機', cat: 'MEMBER' },

    'card_no': { label: '外觀卡號', cat: 'MEMBER' },
    'card_id': { label: '卡片內碼 (Hash)', cat: 'MEMBER' },
    'card_ic': { label: '晶片內碼', cat: 'MEMBER' },
    'm_id': { label: '卡片 ID', cat: 'MEMBER' },
    'openid': { label: '外部 OpenID', cat: 'MEMBER' },

    'card_type': { label: '卡種', cat: 'MEMBER' },
    'cardtype': { label: '一卡通卡種', cat: 'MEMBER' },
    'issuer': { label: '發卡單位 / 卡別', cat: 'MEMBER' },

    'personal_profile': { label: '身分別', cat: 'MEMBER' },
    'personal_profile_authorization': { label: '愛心 / 社福註記', cat: 'MEMBER' },
    'profile_exp_date': { label: '身分別到期日', cat: 'MEMBER' },

    'speproviderid': { label: '特種票識別單位', cat: 'MEMBER' },
    'speprovidertype': { label: '特種票識別身分', cat: 'MEMBER' },
    'speiduseptlimit': { label: '特種票使用上限', cat: 'MEMBER' },
    'speidrstdate': { label: '社福卡重置日', cat: 'MEMBER' },

    // --- Bike / Device / Station (車輛 / 設備 / 場站) ---
    'bike_no': { label: '車號', cat: 'BIKE' },
    'asset_no': { label: '資產編號', cat: 'BIKE' },

    'battery': { label: '電量', cat: 'BIKE' },
    'battery_id': { label: '電池ID', cat: 'BIKE' },

    'group_no': { label: '車輛群組', cat: 'BIKE' },
    'bike_type': { label: '車種', cat: 'BIKE' },
    'lock_status': { label: '車鎖狀態', cat: 'BIKE' },

    'bike_gps': { label: '車輛 GPS (原始)', cat: 'BIKE' },
    'GPS_Decimal': { label: 'GPS (十進位)', cat: 'BIKE' },
    'lat': { label: '緯度', cat: 'BIKE' },
    'lng': { label: '經度', cat: 'BIKE' },
    'lon': { label: '經度', cat: 'BIKE' },

    'return_bike_status': { label: '還車狀態', cat: 'BIKE' },
    'poweroff_return_status': { label: '斷電還車狀態', cat: 'BIKE' },

    's_no': { label: '場站代號', cat: 'BIKE' },
    's_id': { label: '還車場站 ID', cat: 'BIKE' },
    'rent_s_no': { label: '借車場站代號', cat: 'BIKE' },
    'rent_s_pillar_no': { label: '借車車柱', cat: 'BIKE' },
    'return_s_no': { label: '還車場站代號', cat: 'BIKE' },
    's_pillar_no': { label: '車柱編號', cat: 'BIKE' },

    'device_id': { label: '設備ID', cat: 'BIKE' },
    'area_code': { label: '區碼', cat: 'BIKE' },
    'templock': { label: '鎖車 ', cat: 'BIKE' },
    'tempunlock': { label: '解鎖 ', cat: 'BIKE' },

    // --- System / Other (系統 / 其他) ---
    'ip': { label: 'IP', cat: 'SYS' },
    'err_code': { label: '錯誤碼', cat: 'SYS' },
    'msg': { label: '訊息', cat: 'SYS' },
    'status': { label: '狀態', cat: 'SYS' }
};

// 分類設定 (用於折疊選單)
const CATEGORIES = [
    { code: 'CORE', label: '核心 / 常用 (Core)', icon: 'fa-star' },
    { code: 'TRANS', label: '單次交易 / 扣款 (Trans)', icon: 'fa-file-invoice-dollar' },
    { code: 'PASS', label: '月票 / MaaS / 優惠 (Pass)', icon: 'fa-ticket-alt' },
    { code: 'BIKE', label: '車輛 / 場站 (Bike & Station)', icon: 'fa-bicycle' },
    { code: 'MEMBER', label: '會員 / 卡片 (Member)', icon: 'fa-id-card' },
    { code: 'SYS', label: '系統 / 其他 (System)', icon: 'fa-server' }
];

document.addEventListener('DOMContentLoaded', () => {
    const btnParse = document.getElementById('btn_parse_log');
    const btnCopyRaw = document.getElementById('btn_copy_raw_sorted');
    const btnUpdateTable = document.getElementById('btn_update_table');
    const inputLogElement = document.getElementById('inputLog');
    const rawSortedOutput = document.getElementById('rawSortedOutput');

    if (btnParse) {
        btnParse.addEventListener('click', parseLogs);
    }

    // Ctrl+Enter 快速解析
    if (inputLogElement) {
        inputLogElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                parseLogs();
            }
        });
    }

    if (btnCopyRaw && rawSortedOutput) {
        btnCopyRaw.addEventListener('click', () => {
            if (!rawSortedOutput.value.trim()) return;
            navigator.clipboard.writeText(rawSortedOutput.value)
                .then(() => showToast('已複製排序後 LOG', 'success'))
                .catch(() => showToast('複製失敗', 'error'));
        });
    }

    if (btnUpdateTable) {
        btnUpdateTable.addEventListener('click', () => {
            renderTable();
            showToast('已更新欄位列表', 'success');
        });
    }
});

/**
 * 取得欄位資訊 (分類與中文名)
 * 若不在 FIELD_INFO 內，則依據關鍵字進行模糊分類，其餘歸類為 SYS
 */
function getFieldMeta(key) {
    if (FIELD_INFO[key]) {
        return FIELD_INFO[key];
    }

    const lower = key.toLowerCase();

    // ===== PASS：月票 / MaaS / 優惠 / 轉乘相關 =====
    if (
        lower.includes('mpgov') ||
        lower.includes('maas') ||
        lower.includes('pass') ||
        lower.includes('fare_product') ||
        lower.includes('fare') ||
        lower.includes('rate') ||
        lower.includes('discount') ||
        lower.includes('subsid') ||
        lower.includes('welfare') ||
        lower.includes('transfer') ||
        lower.startsWith('trf')
    ) {
        return { label: key, cat: 'PASS' };
    }

    // ===== TRANS：金額 / 時間 / 單次扣款 =====
    if (lower.includes('time') || lower.includes('date')) {
        return { label: key, cat: 'TRANS' };
    }
    if (
        lower.includes('amt') ||
        lower.includes('amount') ||
        lower.includes('fee') ||
        lower.includes('cost') ||
        lower.includes('price') ||
        lower.includes('balance')
    ) {
        return { label: key, cat: 'TRANS' };
    }

    // ===== BIKE：車輛 / GPS / 場站 =====
    if (
        lower.includes('bike') ||
        lower.includes('gps') ||
        lower.includes('lat') ||
        lower.includes('lng') ||
        lower.includes('lon')
    ) {
        return { label: key, cat: 'BIKE' };
    }
    if (lower.includes('station') || lower.startsWith('s_')) {
        return { label: key, cat: 'BIKE' };
    }
    if (
        lower.includes('battery') ||
        lower.includes('device') ||
        lower.includes('pillar')
    ) {
        return { label: key, cat: 'BIKE' };
    }

    // ===== MEMBER：會員 / 卡片 =====
    if (
        lower.includes('card') ||
        lower.includes('mem') ||
        lower.includes('user') ||
        lower.includes('profile') ||
        lower.includes('openid')
    ) {
        return { label: key, cat: 'MEMBER' };
    }

    // 其他歸類為系統欄位
    return { label: key, cat: 'SYS' };
}

// 遞迴解析 JSON (舊工具邏輯)
function recursiveJsonParse(str) {
    if (typeof str !== 'string') return str;
    try {
        const result = JSON.parse(str);
        if (result && typeof result === 'object') {
            for (let key in result) {
                result[key] = recursiveJsonParse(result[key]);
            }
            return result;
        }
        return result;
    } catch (e) {
        return str;
    }
}

// 物件扁平化 (舊工具邏輯)
function flattenObject(obj, prefix = '', res = {}) {
    for (let key in obj) {
        const propName = prefix ? prefix + '.' + key : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            flattenObject(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

// NMEA GPS 轉十進位 (舊工具邏輯)
function nmeaToDecimal(nmeaStr) {
    if (!nmeaStr || typeof nmeaStr !== 'string') return '';
    const parts = nmeaStr.split(',');
    if (parts.length < 4) return nmeaStr;

    const latRaw = parts[0];
    const latDir = parts[1];
    const lonRaw = parts[2];
    const lonDir = parts[3];

    function convert(val) {
        if (!val) return 0;
        const dotIndex = val.indexOf('.');
        if (dotIndex === -1) return parseFloat(val);
        const degreesStr = val.substring(0, dotIndex - 2);
        const minutesStr = val.substring(dotIndex - 2);
        return parseFloat(degreesStr) + (parseFloat(minutesStr) / 60);
    }

    let lat = convert(latRaw);
    let lon = convert(lonRaw);
    if (latDir === 'S') lat = -lat;
    if (lonDir === 'W') lon = -lon;
    return lat.toFixed(6) + ', ' + lon.toFixed(6);
}

// 解析單行 LOG (舊工具核心邏輯)
function parseLogLine(line) {
    const dataSplitIndex = line.indexOf(',data=');
    if (dataSplitIndex === -1) return null;

    const mainPart = line.substring(0, dataSplitIndex);
    const jsonPart = line.substring(dataSplitIndex + 6); // skip ",data="

    const splitMain = mainPart.split(' ');
    if (splitMain.length < 2) return null;

    const dateStr = splitMain[0] + ' ' + splitMain[1];

    // Method parsing
    const methodMatch = mainPart.match(/\[(POST|GET|PUT|DELETE)\]/);
    const method = methodMatch ? methodMatch[1] : '';

    // Path parsing (simple approach from old tool context)
    let path = '';
    const pathMatch = mainPart.match(/\s(\/[^\s?]+)/);
    if (pathMatch) path = pathMatch[1];

    let dataObj = recursiveJsonParse(jsonPart);
    let flatData = flattenObject(dataObj);

    // 去除 update. 前綴
    let finalData = {};
    for (let key in flatData) {
        if (key.startsWith('update.')) {
            finalData[key.substring(7)] = flatData[key];
        } else {
            finalData[key] = flatData[key];
        }
    }

    // 計算 GPS
    if (finalData['bike_gps']) {
        finalData['GPS_Decimal'] = nmeaToDecimal(finalData['bike_gps']);
    }
    const v = String(finalData['device_status'] ?? '').trim();
    finalData['templock'] = (v === 'templock') ? 'Y' : '';
    finalData['tempunlock'] = (v === 'tempunlock') ? 'Y' : '';
    return {
        Time: dateStr,
        Method: method,
        Path: path,
        Raw: line,
        ...finalData
    };
}

function parseLogs() {
    const input = document.getElementById('inputLog').innerText.trim();
    const rawSortedOutput = document.getElementById('rawSortedOutput');
    const fieldCard = document.getElementById('fieldSelectionCard');

    if (!input) {
        parsedLogs = [];
        rawSortedOutput.value = '';
        // 一開始選擇顯示欄位不用隱藏
        renderTable();
        showToast('尚未貼上任何 LOG', 'error');
        return;
    }

    const lines = input.split('\n');
    parsedLogs = [];
    allKeys = new Set(['Time', 'Method', 'Path']);

    lines.forEach(line => {
        if (!line.trim()) return;
        const parsed = parseLogLine(line.trim());
        if (parsed) {
            parsedLogs.push(parsed);
            Object.keys(parsed).forEach(k => {
                if (k !== 'Raw') allKeys.add(k);
            });
        }
    });

    if (parsedLogs.length === 0) {
        showToast('解析失敗，請確認格式包含 ",data="', 'error');
        return;
    }

    // 依 Time 排序 (相容斜線與橫線格式)
    parsedLogs.sort((a, b) => {
        const tA = new Date(a.Time ? a.Time.replace(/\//g, '-') : 0);
        const tB = new Date(b.Time ? b.Time.replace(/\//g, '-') : 0);
        return tA - tB;
    });

    rawSortedOutput.value = parsedLogs.map(l => l.Raw).join('\n');

    generateAccordionCheckboxes();
    renderTable();
    if (fieldCard) fieldCard.style.display = 'block';

    showToast(`解析完成，共 ${parsedLogs.length} 筆`, 'success');
}

/**
 * 產生折疊式欄位選單 (Accordion) + 搜尋欄位
 */
function generateAccordionCheckboxes() {
    const container = document.getElementById('fieldAccordion');
    if (!container) return;
    container.innerHTML = '';

    // === 搜尋列 ===
    const searchWrapper = document.createElement('div');
    searchWrapper.id = 'fieldSearchWrapper';
    searchWrapper.style.marginBottom = '8px';
    searchWrapper.style.display = 'flex';
    searchWrapper.style.alignItems = 'center';
    searchWrapper.style.gap = '6px';

    const searchLabel = document.createElement('span');
    searchLabel.innerText = '搜尋欄位：';
    searchLabel.style.fontSize = '13px';
    searchLabel.style.opacity = '0.8';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'fieldSearchInput';
    searchInput.placeholder = '輸入欄位英文或中文關鍵字';
    searchInput.style.flex = '1';
    searchInput.style.padding = '4px 8px';
    searchInput.style.borderRadius = '4px';
    searchInput.style.border = '1px solid #30363d';
    searchInput.style.background = '#0d1117';
    searchInput.style.color = '#c9d1d9';
    searchInput.style.fontSize = '13px';

    searchInput.addEventListener('input', handleFieldSearch);

    searchWrapper.appendChild(searchLabel);
    searchWrapper.appendChild(searchInput);
    container.appendChild(searchWrapper);

    // 真正放 <details> 的容器
    const accordionBody = document.createElement('div');
    accordionBody.id = 'fieldAccordionBody';
    container.appendChild(accordionBody);

    // 1. 將解析出的所有 Key 分類
    const grouped = {};
    CATEGORIES.forEach(c => grouped[c.code] = []);

    allKeys.forEach(key => {
        const meta = getFieldMeta(key);
        // 若找不到分類 (meta.cat 不在 CATEGORIES 裡)，歸類到 SYS
        if (grouped[meta.cat]) {
            grouped[meta.cat].push({ key, label: meta.label });
        } else {
            grouped['SYS'].push({ key, label: meta.label });
        }
    });

    // 2. 建立 UI
    CATEGORIES.forEach(cat => {
        const fields = grouped[cat.code];
        if (fields.length === 0) return; // 該分類無資料則不顯示

        // 排序：已知欄位優先，其餘字母排序
        fields.sort((a, b) => {
            const isKnownA = FIELD_INFO[a.key] ? 1 : 0;
            const isKnownB = FIELD_INFO[b.key] ? 1 : 0;
            if (isKnownA !== isKnownB) return isKnownB - isKnownA;
            return a.key.localeCompare(b.key);
        });

        // 建立 <details>
        const details = document.createElement('details');
        details.className = 'category-group';

        // 預設展開常用欄位
        if (cat.code === 'CORE') details.open = true;

        // <summary> 標題
        const summary = document.createElement('summary');
        summary.className = 'category-summary';
        summary.innerHTML = `<span><i class="fas ${cat.icon} w-5"></i> ${cat.label}</span> <span style="font-size:12px; background:#30363d; padding:2px 8px; border-radius:10px;">${fields.length}</span>`;

        // 內容區塊
        const content = document.createElement('div');
        content.className = 'category-content';

        fields.forEach(item => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            label.setAttribute('data-field-key', item.key);
            label.setAttribute('data-field-label', item.label || item.key);

            // 顯示格式： key (中文) 或是 key
            const displayText = (item.label && item.label !== item.key)
                ? `${item.key} (${item.label})`
                : item.key;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = item.key;

            // 預設勾選
            if (DEFAULT_COLUMNS.includes(item.key) || item.key === 'GPS_Decimal') {
                checkbox.checked = true;
                label.classList.add('is-checked');
            }

            // 樣式互動
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) label.classList.add('is-checked');
                else label.classList.remove('is-checked');
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(displayText));
            content.appendChild(label);
        });

        details.appendChild(summary);
        details.appendChild(content);
        accordionBody.appendChild(details);
    });
}

/**
 * 欄位搜尋：依關鍵字顯示/隱藏欄位，並自動展開有命中的分類
 */
function handleFieldSearch(e) {
    const term = e.target.value.trim().toLowerCase();
    const container = document.getElementById('fieldAccordionBody');
    if (!container) return;

    const groups = container.querySelectorAll('.category-group');

    if (!term) {
        // 清除搜尋：所有分類與欄位恢復顯示
        groups.forEach(group => {
            group.style.display = '';
            const labels = group.querySelectorAll('.checkbox-label');
            labels.forEach(lb => {
                lb.style.display = '';
            });
            // 保持原本 open 狀態（Core 在 generate 時已預設 open）
        });
        return;
    }

    groups.forEach(group => {
        let hasMatch = false;
        const labels = group.querySelectorAll('.checkbox-label');

        labels.forEach(lb => {
            const key = (lb.getAttribute('data-field-key') || '').toLowerCase();
            const labelText = (lb.getAttribute('data-field-label') || '').toLowerCase();
            const fullText = (key + ' ' + labelText);

            if (fullText.includes(term)) {
                lb.style.display = '';
                hasMatch = true;
            } else {
                lb.style.display = 'none';
            }
        });

        if (hasMatch) {
            group.style.display = '';
            group.open = true; // 有命中就自動展開
        } else {
            group.style.display = 'none';
        }
    });
}

function renderTable() {
    const tableHead = document.querySelector('#outputTable thead');
    const tableBody = document.querySelector('#outputTable tbody');
    if (!tableHead || !tableBody) return;

    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    // 抓取勾選欄位
    const checkboxes = document.querySelectorAll('#fieldAccordion input[type="checkbox"]:checked');
    const selectedKeys = Array.from(checkboxes).map(cb => cb.value);

    // 依照分類順序排序顯示，體驗較好 (Core -> Trans -> Pass -> Bike -> Member -> Sys)
    const sortedSelectedKeys = [];
    CATEGORIES.forEach(cat => {
        const keysInThisCat = [];
        selectedKeys.forEach(k => {
            const meta = getFieldMeta(k);
            if (meta.cat === cat.code) keysInThisCat.push(k);
        });
        keysInThisCat.sort();
        sortedSelectedKeys.push(...keysInThisCat);
    });

    // 補漏網之魚 (若有無法歸類的)
    const categorizedSet = new Set(sortedSelectedKeys);
    selectedKeys.forEach(k => {
        if (!categorizedSet.has(k)) sortedSelectedKeys.push(k);
    });

    if (sortedSelectedKeys.length === 0 || parsedLogs.length === 0) return;

    // Header
    const headerRow = document.createElement('tr');
    sortedSelectedKeys.forEach((key, index) => {
        const th = document.createElement('th');
        const meta = getFieldMeta(key);
        // 標題顯示：Key (中文)
        th.innerText = (meta.label && meta.label !== key) ? `${key}\n${meta.label}` : key;
        th.draggable = true;
        th.setAttribute('data-col-index', index);

        th.addEventListener('dragstart', handleDragStart, false);
        th.addEventListener('dragover', handleDragOver, false);
        th.addEventListener('dragleave', handleDragLeave, false);
        th.addEventListener('drop', handleDrop, false);

        headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Rows
    parsedLogs.forEach(log => {
        const row = document.createElement('tr');
        sortedSelectedKeys.forEach(key => {
            const td = document.createElement('td');
            const val = log[key] !== undefined ? log[key] : '';
            // 物件轉字串顯示
            td.innerText = (typeof val === 'object') ? JSON.stringify(val) : val;
            if (key === 'Time') td.classList.add('fixed-date');
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });
}

/* Drag & Drop */
let dragSrcEl = null;
function handleDragStart(e) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}
function handleDragLeave(e) { this.classList.remove('drag-over'); }
function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    this.classList.remove('drag-over');
    if (dragSrcEl !== this) {
        const srcIdx = parseInt(dragSrcEl.getAttribute('data-col-index'));
        const dstIdx = parseInt(this.getAttribute('data-col-index'));
        moveColumn(srcIdx, dstIdx);
    }
    if (dragSrcEl) dragSrcEl.style.opacity = '1';
    dragSrcEl = null;
    return false;
}
function moveColumn(fromIdx, toIdx) {
    const table = document.getElementById('outputTable');
    if (!table) return;
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cellFrom = row.cells[fromIdx];
        if (!cellFrom) continue;
        if (toIdx >= row.cells.length) row.appendChild(cellFrom);
        else {
            if (fromIdx < toIdx) row.insertBefore(cellFrom, row.cells[toIdx].nextSibling);
            else row.insertBefore(cellFrom, row.cells[toIdx]);
        }
    }
    const headerCells = table.rows[0].cells;
    for (let i = 0; i < headerCells.length; i++) headerCells[i].setAttribute('data-col-index', i);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = type === 'success' ? 'rgba(46, 160, 67, 0.95)' : 'rgba(218, 54, 51, 0.95)';
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '15px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = 99999;
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.transform = 'translateY(10px)';
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
