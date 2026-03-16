// ==========================================
// Constants & Maps
// ==========================================

// 卡片種類 (issuer / card_type)
const CARD_TYPE_MAP = {
    0: "未知/異常",
    1: "悠遊卡",
    2: "一卡通",
    3: "調度卡",
    4: "維修卡",
    20: "掃碼-信用卡",
    21: "掃碼-單次租車",
    22: "掃碼-LINE Pay",
    23: "掃碼-悠遊付",
    25: "iPASS MONEY"
};

// group_no（車況群組）
const GROUP_NO_MAP = {
    1: "在站",
    2: "使用中",
    3: "維修中",
    4: "調度中",
    5: "在庫",
    6: "遺失",
    7: "其他",
    8: "新車",
    9: "臨停",
    10: "低電量禁用",
    11: "報廢",
    12: "更版禁用",
    13: "跨區鎖車禁用"
};

// iPASS cardtype（允許/禁止交易）
const IPASS_CARDTYPE_MAP = {
    "01": { label: "敬老卡", allowed: true },
    "02": { label: "愛心卡", allowed: true },
    "03": { label: "陪伴卡", allowed: true },
    "04": { label: "一般卡", allowed: true },
    "05": { label: "聯名信用卡", allowed: true },
    "06": { label: "紀念卡", allowed: true },
    "07": { label: "學生卡", allowed: true },
    "0C": { label: "高捷員工卡", allowed: true },
    "0D": { label: "計次折扣卡", allowed: true },

    "0E": { label: "旅遊卡", allowed: false },
    "15": { label: "高捷一日卡", allowed: false },
    "16": { label: "高捷工作卡", allowed: false },
    "17": { label: "高捷來賓卡", allowed: false },
    "18": { label: "高捷測試卡", allowed: false }
};

// 🚌 轉乘運具代碼（悠遊卡: transfer_group_code / 一卡通: trfcurrentsystemid）
const TRANSFER_CODE_MAP = {
    "01": ["台北：捷運", "新北：捷運"],
    "02": ["台北：北市公車", "新北：北市公車"],
    "0c": ["台北：新北或高雄公車", "新北：新北或高雄公車", "高雄：公車"],
    "0d": ["台北：山區小巴", "新北：山區小巴"],
    "0e": ["台北：幹線公車", "新北：幹線公車"],
    "1c": ["台北：公共運具"],
    "23": ["新北：公共運具"],
    "06": ["高雄：台鐵"],
    "0b": ["高雄：高捷"],
    "17": ["新北：輕軌", "高雄：輕軌"],
    "fe": ["高雄：高雄客運1"],
    "b3": ["高雄：高雄客運2"],
    "b4": ["高雄：高雄客運3"],
    "b2": ["高雄：渡輪"],
    "a2": ["高雄：公共運具"],
    "00": ["未使用/無轉乘碼"]
};

// tag_data bit flag
const TAG_DATA_FLAGS = [
    { bit: 1,   label: "轉乘" },
    { bit: 2,   label: "敬老" },
    { bit: 4,   label: "月票" },
    { bit: 8,   label: "n分鐘內還車不寫卡(同站借還不計費)" },
    { bit: 32,  label: "時數卡(一卡通)" },
    { bit: 64,  label: "學生卡" },
    { bit: 128, label: "票券優惠" },
    { bit: 256, label: "敬老卡(一卡通)" },
    { bit: 512, label: "台南市民卡(一卡通)" }
];

// 借車結果
const RENT_BIKE_STATUS_MAP = {
    "0": "0: 借車失敗",
    "1": "1: 借車成功"
};

// 斷電還車
const POWEROFF_RETURN_STATUS_MAP = {
    "0": "0: 正常還車",
    "1": "1: 斷電還車"
};

// 還車結果
const RETURN_BIKE_STATUS_MAP = {
    "0": "0: 還車失敗",
    "1": "1: 還車成功"
};

// 扣款 code
const CODE_STATUS_MAP = {
    "0": "0: 扣款失敗",
    "1": "1: 扣款成功"
};

// 補扣款 code
const OVERDRAFT_CODE_STATUS_MAP = {
    "0": "0: 補扣款失敗",
    "1": "1: 補扣款成功"
};

// msg_type
const MSG_TYPE_MAP = {
    "01": "01: 一般扣款(扣點)",
    "04": "04: 月票扣款",
    "05": "05: 月票後扣款"
};

// 狀態碼 (通用：0 = 失敗, 1 = 成功)
const STATUS_MAP = {
    "0": "失敗",
    "1": "成功"
};

// 金額欄位：十六進位 / 十進位
const HEX_MONEY_KEYS = [
    "purse_balance",
    "rent_amt",
    "amout_rec",
    "amt",
    "origamt"
];
const DEC_MONEY_KEYS = ["overdraft_amt", "subsidize"];

// ==========================================
// Vue Application
// ==========================================
new Vue({
    el: '#app',
    data: {
        rawInput: '',
        logs: [],
        filterText: '',
        showOnlyErrors: false,
        showOnlyMoney: false
    },
    watch: {
        rawInput(val) {
            this.parseAll(val);
        }
    },
    computed: {
        displayedLogs() {
            let res = this.logs;
            const kw = this.filterText.trim().toLowerCase();

            if (kw) {
                res = res.filter(l => l.searchString.includes(kw));
            }

            if (this.showOnlyErrors) {
                res = res.filter(l => l.isError);
            }

            if (this.showOnlyMoney) {
                res = res.filter(l =>
                    l.apiType === 'DEDUCT' ||
                    l.apiType === 'OVERDRAFT' ||
                    (l.data.amt && l.data.amt !== '0')
                );
            }

            return res;
        },

        // 顯示「全部展開/全部收合」狀態
        allDisplayedExpanded() {
            if (!this.displayedLogs.length) return false;
            return this.displayedLogs.every(l => !!l.expanded);
        }
    },
    methods: {
        // 全部展開/收合（只作用在目前顯示的列表）
        toggleAllDisplayed() {
            const target = !this.allDisplayedExpanded;
            this.displayedLogs.forEach(l => { l.expanded = target; });
        },

        // -----------------------------
        // Parsing Logic (Core)
        // -----------------------------
        parseAll(text) {
            if (!text) {
                this.logs = [];
                return;
            }

            const lines = text.split(/\r?\n/);
            const parsed = [];
            // ✅ 用來避免同一個扣款/補扣重複解析
            const seenPostKey = new Set();

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('===') || trimmed.startsWith('#')) return;

                // 只吃 MG log 的 [POST] 主行，以及「單行 JSON」（Laravel）
                if (!trimmed.includes('[POST]') && !trimmed.startsWith('{')) {
                    return;
                }

                const isPostLine = trimmed.includes('[POST]');
                const logObj = this.parseSingleLine(trimmed);
                if (!logObj) return;

                if (isPostLine) {
                    const key = this.makePostKey(logObj);
                    if (key) {
                        if (seenPostKey.has(key)) {
                            // 已經解析過同一個請求 → 跳過
                            return;
                        }
                        seenPostKey.add(key);
                    }
                }

                parsed.push(logObj);
            });

            this.logs = parsed;
        },

        // 依 reqId + apiPath + api_data_type + trans_idx 組唯一 key
        makePostKey(logObj) {
            const rid = logObj.reqId || '';
            const path = logObj.apiPath || '';
            const adt = logObj.data.api_data_type || '';
            const tx  = logObj.data.trans_idx || '';

            if (!rid && !path && !adt && !tx) return null;
            return `${rid}|${path}|${adt}|${tx}`;
        },

        parseSingleLine(line) {
            // 再防呆一次
            if (!line.includes('[POST]') && !line.startsWith('{')) {
                return null;
            }

            let timestamp = '';
            let apiPath = '';
            let jsonStr = '';
            let rawData = {};

            // 抓 request id，例如 [3696911594]
            const reqMatch = line.match(/\[(\d+)\]/);
            const reqId = reqMatch ? reqMatch[1] : null;

            // ✅ FIX 1: data= 後面 JSON（允許尾端空白；zgrep 也可能帶檔名: 前綴）
            const dataMatch = line.match(/data=({.*})\s*$/);
            if (dataMatch) {
                jsonStr = dataMatch[1];

                // ✅ FIX 2: 不要用 ^ 錨點，因為 zgrep 會變成 "檔名.gz:2025/10/03 ..."
                const dateMatch = line.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
                if (dateMatch) timestamp = dateMatch[1];

                // ✅ FIX 3: api path 取到 ? 前（更穩）
                const apiMatch = line.match(/(\/api\/[^\s\?]+)/);
                if (apiMatch) apiPath = apiMatch[1];
            } else {
                // 純 JSON 行 (Laravel)
                if (line.startsWith('{')) {
                    jsonStr = line;
                } else {
                    return null;
                }
            }

            try {
                rawData = JSON.parse(jsonStr);

                // 解開 query
                if (typeof rawData.query === 'string') {
                    try {
                        const q = JSON.parse(rawData.query);
                        rawData = { ...rawData, ...q };
                        delete rawData.query;
                    } catch (e) {}
                }
                // 解開 update
                if (typeof rawData.update === 'string') {
                    try {
                        const u = JSON.parse(rawData.update);
                        rawData = { ...rawData, ...u };
                        if (u.api_data_type) rawData.api_data_type = u.api_data_type;
                        delete rawData.update;
                    } catch (e) {}
                }
            } catch (e) {
                console.warn("JSON Parse Error", e);
                return null;
            }

            return this.enrichLogObject(rawData, timestamp, apiPath, line, reqId);
        },

        enrichLogObject(data, timeStr, apiPath, rawLine, reqId) {
            // 優先使用 JSON 內的時間，沒有才用 Log 前綴時間
            let finalTime = data.time || data.rent_time || data.overdraft_time || data.success_time;

            if (finalTime && /^\d+$/.test(finalTime)) {
                if (finalTime.length === 10) finalTime = parseInt(finalTime) * 1000;
                else finalTime = parseInt(finalTime);
            } else if (timeStr) {
                finalTime = new Date(timeStr).getTime();
            }

            // 判斷業務類型
            let typeLabel = "其他";
            let apiType = "OTHER";

            apiPath = apiPath || "";

            if (apiPath.includes('cardinfofind')) {
                typeLabel = "靠卡";
                apiType = "CARD";
            } else if (apiPath.includes('gateopening')) {
                typeLabel = "放車";
                apiType = "GATE";
            } else if (apiPath.includes('bike_transaction')) {
                const subType = String(data.api_data_type);
                if (subType === '1') { typeLabel = "借車"; apiType = "RENT"; }
                else if (subType === '2') { typeLabel = "還車"; apiType = "RETURN"; }
                else if (subType === '3') { typeLabel = "扣款"; apiType = "DEDUCT"; }
                else if (subType === '4') { typeLabel = "補扣"; apiType = "OVERDRAFT"; }
                else { typeLabel = "Bike Trans"; apiType = "TRANS"; }
            }

            // 判斷是否錯誤（不包含 poweroff_return_status）
            let isError = false;
            let errorMsg = "";

            if (data.rent_bike_status === "0" || data.rent_bike_status === 0) {
                isError = true; errorMsg = "借車失敗";
            }
            if (data.return_bike_status === "0" || data.return_bike_status === 0) {
                isError = true; errorMsg = "還車失敗";
            }
            if (data.code === "0" || data.code === 0) {
                isError = true; errorMsg = "扣款失敗";
            }
            if (data.overdraft_code === "0" || data.overdraft_code === 0) {
                isError = true; errorMsg = "補扣失敗";
            }
            if (data.RetCode !== undefined && data.RetCode != 1) {
                isError = true;
                if (!errorMsg) errorMsg = `Code: ${data.RetCode}`;
            }

            const searchString = (JSON.stringify(data) + rawLine + typeLabel).toLowerCase();

            return {
                data,
                rawLine,
                displayTime: finalTime,
                typeLabel,
                apiType,
                apiPath,
                reqId,
                isError,
                errorMsg,
                searchString,
                expanded: false // 預設收合
            };
        },

        // -----------------------------
        // Display Helpers
        // -----------------------------
        getCardClass(log) {
            return {
                'type-error': log.isError
            };
        },

        getTypeClass(log) {
            return log.isError ? 'error' : '';
        },

        formatTimeSimple(ts) {
            if (!ts) return '--:--:--';
            return moment(ts).format('HH:mm:ss');
        },
        formatTimeDetail(ts) {
            if (!ts) return '';
            return moment(ts).format('MM-DD');
        },

        // 提取器（給上半部膠囊用）
        getTx(log) {
            // 一般流程：trans_idx
            // 放車(gateopening)：orderid
            return log.data.trans_idx || log.data.orderid || null;
        },

        getBikeNo(log) {
            return log.data.bike_no || log.data.overdraft_bike_no || null;
        },
        getMoney(log) {
            let val = log.data.amt || log.data.overdraft_amt || log.data.subsidize;
            if (val === undefined || val === null || val === "") return null;

            // amt 可能 hex；如果含 a-f 就當 hex
            if (log.data.amt) {
                if (typeof val === 'string' &&
                    /^[0-9a-fA-F]+$/.test(val) &&
                    /[a-fA-F]/.test(val)) {
                    const dec = parseInt(val, 16);
                    return isNaN(dec) ? val : dec;
                }
            }
            return val;
        },
        getCardInfo(log) {
            let num = log.data.card_no || log.data.card_ic;
            if (!num) return null;
            if (typeof num === 'string' && /^[0-9a-fA-F]+$/.test(num)) {
                const dec = parseInt(num, 16);
                if (!isNaN(dec)) {
                    return `${dec} (hex:${num.substring(0,4)}..)`;
                }
            }
            return num;
        },
        getStation(log) {
            return log.data.s_id || log.data.rent_s_id || null;
        },
        getBalance(log) {
            const hex = log.data.purse_balance;
            if (!hex) return null;
            const dec = parseInt(hex, 16);
            return isNaN(dec) ? null : dec;
        },

        // -----------------------------
        // Field Detail Formatter
        // -----------------------------
        getCriticalFields(log) {
            const importantKeys = [
                'trans_idx',
                'orderid',
                'bike_no',
                'amt',
                'purse_balance',
                'rent_time',
                'return_time',
                'time',
                'rent_bike_status',
                'return_bike_status',
                'poweroff_return_status',
                'code',
                'overdraft_code',
                'card_type',
                'cardtype',
                's_id',
                'rent_s_id',
                'group_no',
                'msg_type',
                'RetCode',
                'retCode',
                'errCode',
                'ErrCode',
                'status'
            ];

            const res = {};
            importantKeys.forEach(k => {
                if (log.data[k] !== undefined) res[k] = log.data[k];
            });
            return res;
        },

        getOtherFields(log) {
            const importantKeys = [
                'trans_idx',
                'orderid',
                'bike_no',
                'amt',
                'purse_balance',
                'rent_time',
                'return_time',
                'time',
                'rent_bike_status',
                'return_bike_status',
                'poweroff_return_status',
                'code',
                'overdraft_code',
                'card_type',
                'cardtype',
                's_id',
                'rent_s_id',
                'group_no',
                'msg_type',
                'RetCode',
                'retCode',
                'errCode',
                'ErrCode',
                'status'
            ];
            const res = {};
            for (let k in log.data) {
                if (!importantKeys.includes(k) && k !== 'api_data_type') {
                    res[k] = log.data[k];
                }
            }
            return res;
        },

        htmlEscape(str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        formatUnixTime(val) {
            const s = String(val).trim();
            if (!/^\d+$/.test(s)) return null;
            let num = parseInt(s, 10);
            if (s.length === 10) num *= 1000;
            else if (s.length !== 13) return null;

            const d = new Date(num);
            if (isNaN(d.getTime())) return null;

            const pad = n => (n < 10 ? "0" + n : "" + n);
            const yyyy = d.getFullYear();
            const MM = pad(d.getMonth() + 1);
            const dd = pad(d.getDate());
            const hh = pad(d.getHours());
            const mm = pad(d.getMinutes());
            const ss = pad(d.getSeconds());
            return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
        },

        formatValue(key, val) {
            if (val === null || val === undefined) return '';
            const rawStr = String(val);
            let valHtml = `<span class="val-str">${this.htmlEscape(rawStr)}</span>`;

            // 0. group_no / cardtype / transfer_code 專用對照
            if (key === "group_no") {
                const text = GROUP_NO_MAP[Number(val)];
                if (text) {
                    return `<span class="txt-green">${this.htmlEscape(rawStr)}: ${this.htmlEscape(text)}</span>`;
                }
            }

            if (key === "cardtype") {
                const k = rawStr.toUpperCase();
                const meta = IPASS_CARDTYPE_MAP[k];
                if (meta) {
                    return meta.allowed
                        ? `<span class="txt-green">${k}: ${this.htmlEscape(meta.label)}（允許交易）</span>`
                        : `<span class="txt-red">${k}: ${this.htmlEscape(meta.label)}（禁止交易）</span>`;
                }
            }

            if (key === "transfer_group_code" || key === "trfcurrentsystemid") {
                const low = rawStr.toLowerCase();
                const labels = TRANSFER_CODE_MAP[low];
                if (labels && labels.length) {
                    return `<span class="val-hex">${this.htmlEscape(rawStr)}</span>` +
                           ` <span class="txt-green">（${labels.map(this.htmlEscape).join(" / ")}）</span>`;
                }
            }

            // 1. 金額/餘額
            if (HEX_MONEY_KEYS.includes(key)) {
                if (typeof val === "string" && /^[0-9a-fA-F]+$/.test(val)) {
                    const dec = parseInt(val, 16);
                    if (!isNaN(dec)) {
                        return `<span class="val-hex">${this.htmlEscape(val)}</span>` +
                               ` <span class="val-dec">$${dec}</span>`;
                    }
                } else if (typeof val === "number") {
                    return `<span class="val-dec">$${val}</span>`;
                }
            } else if (DEC_MONEY_KEYS.includes(key)) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    return `<span class="val-dec">$${num}</span>`;
                }
            }

            // 2. 卡號/內碼 (Hex -> Dec)
            if (["card_ic", "card_no"].includes(key)) {
                if (typeof val === "string" && /^[0-9a-fA-F]+$/.test(val) && val.length <= 8) {
                    const dec = parseInt(val, 16);
                    if (!isNaN(dec)) {
                        return `<span class="val-hex">${this.htmlEscape(val)}</span>` +
                               ` <span class="val-dec">${dec}</span>`;
                    }
                }
            }

            // 3. 卡片種類 / issuer
            if (key === "card_type" || key === "issuer") {
                const num = Number(val);
                const mapped = CARD_TYPE_MAP[num];
                if (num === 0) {
                    return `<span class="txt-red">0 (未知/異常)</span>`;
                }
                if (mapped) {
                    return `<span class="txt-green">${this.htmlEscape(mapped)}</span>`;
                }
            }

            // 4. 車號
            if (["bike_no", "overdraft_bike_no", "frameno"].includes(key)) {
                return `<span class="txt-green" style="font-weight:bold">${this.htmlEscape(rawStr)}</span>`;
            }

            // 5. Unix time 類欄位
            if ([
                "time",
                "rent_time",
                "success_time",
                "success_time_4",
                "overdraft_time",
                "overdraft_time_4",
                "UC_Failure_time",
                "return_time",
                "4G_err_code_utc",
                "mdate"
            ].includes(key)) {
                const human = this.formatUnixTime(val);
                if (human) {
                    return `<span class="val-hex">${this.htmlEscape(rawStr)}</span>` +
                           ` <span class="val-dec">${human}</span>`;
                }
            }

            // 6. tag_data（bit flag）
            if (key === "tag_data") {
                const num = parseInt(val, 10);
                if (!isNaN(num)) {
                    if (num === 0) {
                        return `<span class="val-str">0: 無轉乘</span>`;
                    }
                    const flags = TAG_DATA_FLAGS
                        .filter(f => (num & f.bit) === f.bit)
                        .map(f => f.label);
                    return `<span class="val-str">${num}</span>` +
                           (flags.length
                               ? ` <span class="txt-green">(${flags.map(this.htmlEscape).join("、")})</span>`
                               : "");
                }
            }

            // 7. 借車/還車/斷電還車狀態
            if (key === "rent_bike_status") {
                const v = rawStr;
                const text = RENT_BIKE_STATUS_MAP[v] || v;
                return v === "1"
                    ? `<span class="txt-green">${this.htmlEscape(text)}</span>`
                    : `<span class="txt-red">${this.htmlEscape(text)}</span>`;
            }

            if (key === "poweroff_return_status") {
                const v = rawStr;
                const text = POWEROFF_RETURN_STATUS_MAP[v] || v;
                if (v === "1") {
                    // 斷電還車：用橘色提醒，但不當失敗
                    return `<span class="txt-orange">${this.htmlEscape(text)}</span>`;
                }
                return `<span class="val-str">${this.htmlEscape(text)}</span>`;
            }

            if (key === "return_bike_status") {
                const v = rawStr;
                const text = RETURN_BIKE_STATUS_MAP[v] || v;
                return v === "1"
                    ? `<span class="txt-green">${this.htmlEscape(text)}</span>`
                    : `<span class="txt-red">${this.htmlEscape(text)}</span>`;
            }

            // 8. 扣款 / 補扣款 code / msg_type
            if (key === "code") {
                const v = rawStr;
                const text = CODE_STATUS_MAP[v] || v;
                return v === "1"
                    ? `<span class="txt-green">${this.htmlEscape(text)}</span>`
                    : `<span class="txt-red">${this.htmlEscape(text)}</span>`;
            }

            if (key === "overdraft_code") {
                const v = rawStr;
                const text = OVERDRAFT_CODE_STATUS_MAP[v] || v;
                return v === "1"
                    ? `<span class="txt-green">${this.htmlEscape(text)}</span>`
                    : `<span class="txt-red">${this.htmlEscape(text)}</span>`;
            }

            if (key === "msg_type") {
                const v = rawStr;
                const text = MSG_TYPE_MAP[v] || v;
                return `<span class="val-str">${this.htmlEscape(text)}</span>`;
            }

            // 9. RetCode / status 等錯誤碼
            if (["RetCode", "retCode", "errCode", "ErrCode", "status"].includes(key)) {
                const isErr = val != 1 && val != 200 && val != "1";
                return isErr
                    ? `<span class="txt-red">${this.htmlEscape(rawStr)} ✗</span>`
                    : `<span class="txt-green">${this.htmlEscape(rawStr)} ✓</span>`;
            }

            // 10. 訊息類
            if (["RetMsg", "retMsg", "err_msg"].includes(key)) {
                const msg = rawStr;
                const isErr = msg !== "成功" && msg !== "查詢成功" && msg !== "寄送簡訊成功";
                return isErr
                    ? `<span class="txt-red">${this.htmlEscape(msg)}</span>`
                    : `<span class="txt-green">${this.htmlEscape(msg)}</span>`;
            }

            // 其他欄位：一般顯示
            return valHtml;
        }
    }
});
