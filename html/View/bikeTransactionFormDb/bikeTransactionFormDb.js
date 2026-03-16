document.addEventListener('DOMContentLoaded', async () => {
    const fullForm = document.getElementById('form_value');
    const transIdxElement = document.getElementById("transIdx");
    const outJsonElement = document.getElementById("outJson");
    const copyOutJson = document.getElementById("copy_out_json");

    const parsedList = document.getElementById("parsedList");
    const copyOutParsed = document.getElementById("copy_out_parsed");

    let lastParsedText = "";
    let debounceTimer = null;

    // ✅ 卡片點擊複製（只綁一次，不要 once）
    parsedList.addEventListener("click", (e) => {
        const row = e.target.closest(".kv-row");
        if (!row) return;
        const raw = row.getAttribute("data-raw") || "";
        navigator.clipboard.writeText(raw)
            .then(() => showToast("已複製該值到剪貼簿", "success"));
    });

    transIdxElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') fetchTrans();
    });

    // 保留你原本 change 觸發（固定串接邏輯）
    fullForm.addEventListener('change', fetchTrans);

    // input debounce（自動查詢）
    transIdxElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchTrans, 350);
    });

    async function fetchTrans() {
        const transIdx = transIdxElement.value.trim();
        if (!transIdx) {
            clearOutput();
            return;
        }

        getBikeTransactionByTransIdx(transIdx, outJsonElement).then(data => {
            try {
                if (data.status == 0) throw new Error("API 請求失敗");

                // data.data = 後端回傳的 JSON：{status:"1"/"0", data:{main,prev,next} or string}
                let payload = data.data;

                // ✅ 後端 status 是字串
                if (payload && typeof payload === "object" && String(payload.status) === "0") {
                    const msg = typeof payload.data === "string" ? stripHtml(payload.data) : "查無資料";
                    throw new Error(msg);
                }

                // ✅ 取出真正的 {main, prev, next}
                if (payload && typeof payload === "object" && payload.data && typeof payload.data === "object") {
                    payload = payload.data;
                }

                if (!payload || typeof payload !== "object" || payload.main === undefined) {
                    throw new Error("資料格式不符");
                }

                // ✅ 原始 JSON
                outJsonElement.value = JSON.stringify(payload, null, 4);

                // ✅ 解析渲染（順序 = 原始 JSON）
                renderParsedTransaction(payload);

            } catch (error) {
                clearOutput();
                showToast(error?.message ? String(error.message) : "查無資料", "error");
            }
        });
    }

    function clearOutput() {
        outJsonElement.value = "";
        parsedList.innerHTML = "";
        lastParsedText = "";
    }

    copyOutJson.addEventListener('click', () => {
        if (!outJsonElement.value) return;
        navigator.clipboard.writeText(outJsonElement.value)
            .then(() => showToast("已複製 JSON 到剪貼簿", "success"));
    });

    copyOutParsed.addEventListener('click', () => {
        if (!lastParsedText) return;
        navigator.clipboard.writeText(lastParsedText)
            .then(() => showToast("已複製解析到剪貼簿", "success"));
    });

    /* ===============================
       ✅ 解析：對照表 (依照 Schema 補全)
    =============================== */

    const GROUP_NO_MAP = {
        "1": "在站",
        "2": "使用中",
        "3": "維修中",
        "4": "調度中",
        "5": "在庫",
        "6": "遺失",
        "7": "其他",
        "8": "新車",
        "9": "臨停",
        "10": "低電量禁用",
        "11": "報廢",
        "12": "更版失敗禁用",
        "13": "跨區鎖車禁用"
    };

    const CODE_MAP = {
        "0": "失敗",
        "1": "成功",
        "2": "未付款"
    };

    // 城市碼對照 (參考 s_city schema)
    const CITY_MAP = {
        "50": "台灣",
        "5001": "台北市",
        "5002": "新北市",
        "5003": "桃園市",
        "5004": "新竹市",
        "5005": "新竹縣",
        "5006": "台中市",
        "5007": "苗栗縣",
        "5010": "嘉義市",
        "5011": "嘉義縣",
        "5012": "高雄市",
        "5013": "台南市",
        "5014": "屏東縣",
        "5015": "台東縣",
        "5016": "光復鄉",
        "5081": "臺大專區",
        "5082": "新竹科學園區",
        "5099": "YB_大甲"
    };

    // 票卡旗標 (參考 bike_transaction tag_data)
    const TAG_DATA_MAP = {
        "00": "一般卡",
        "01": "轉乘",
        "02": "敬老",
        "03": "轉乘+敬老",
        "04": "月票",
        "05": "轉乘+月票",
        "08": "還車不寫卡",
        "16": "校園優惠",
        "32": "時數卡",
        "64": "高雄學生卡",
        "128": "騎乘券",
        "256": "高雄敬老卡"
    };

    // 卡別 (參考 card_type schema)
    const CARD_TYPE_MAP = {
        0: "未知/異常",
        1: "悠遊卡",
        2: "一卡通(臺灣智慧卡)",
        3: "高雄捷運卡",
        4: "調度卡",
        5: "維修卡",
        6: "839小額付費",
        7: "玉山信用卡",
        8: "泉通卡",
        9: "銀聯卡",
        10: "支付寶",
        11: "微信",
        12: "銀聯卡(遠端)",
        13: "福路通",
        14: "泉程通",
        15: "APP虛擬卡",
        16: "惠民寶",
        17: "莆田福祿通",
        20: "掃碼-信用卡",
        21: "掃碼-單次租車",
        22: "掃碼-LINE Pay",
        23: "掃碼-悠遊付",
        25: "iPASS MONEY"
    };

    // 鎖車狀態對照 (lock_status)
    const LOCK_STATUS_MAP = {
        "1": "鎖上",
        "2": "解鎖",
        "4": "動作成功",
        "8": "動作失敗",
        "6": "解鎖成功",
        "9": "上鎖失敗"
    };

    /* ===============================
       ✅ 欄位定義 (完整版)
    =============================== */
    const FIELD_META = [
        // --- 核心識別 ---
        { key: "_id", title: "系統編號", desc: "MongoDB ObjectId" },
        { key: "trans_idx", title: "交易訂單號", desc: "Unique Index (trans_idx)" },
        { key: "api_data_type", title: "API類型", desc: "資料來源標記 (2:還車/交易)" },
        
        // --- 車輛資訊 ---
        { key: "bike_no", title: "車號(16進)", desc: "16進制內部編號" },
        { key: "bike_dec", title: "車號(10進)", desc: "10進制編號" },
        { key: "asset_no", title: "外觀車號", desc: "車身顯示編號" },
        { key: "bike_type", title: "車種", desc: "01:YB2.0, 02:EYB, 99:1.0" },
        { key: "device_id", title: "車機編號", desc: "YB2.0 車機 device_id" },
        { key: "group_no", title: "車輛狀態", desc: "1在站/2使用中... (參照 GROUP_NO_MAP)" },
        
        // --- 卡片與會員 ---
        { key: "card_id", title: "卡號(Hash)", desc: "系統內碼 Hash" },
        { key: "card_no", title: "外觀卡號", desc: "實際卡面號碼" },
        { key: "card_type", title: "卡別代碼", desc: "參照 CARD_TYPE_MAP" },
        { key: "card_name", title: "卡別名稱", desc: "卡別中文名稱" },
        { key: "tag_data", title: "票卡屬性", desc: "00一般/01轉乘... (參照 TAG_DATA_MAP)" },
        { key: "is_virtual_card", title: "虛擬卡", desc: "true/false" },
        { key: "mem_id", title: "會員帳號", desc: "手機或身分證" },
        { key: "name", title: "姓名", desc: "會員姓名" },
        { key: "rate_info", title: "費率等級", desc: "L:長期, S:短期, G:團體" },
        { key: "rate_id", title: "費率ID", desc: "對應 balance_set 的 _id" },

        // --- 借車資訊 (Rent) ---
        { key: "rent_time", title: "借車時間", desc: "Unix Timestamp" },
        { key: "rent_s_no", title: "借車場站代號", desc: "rent_s_no" },
        { key: "rent_s_name_tw", title: "借車場站(繁)", desc: "rent_s_name_tw" },
        { key: "rent_s_name_cn", title: "借車場站(簡)", desc: "rent_s_name_cn" },
        { key: "rent_s_name_en", title: "借車場站(英)", desc: "rent_s_name_en" },
        { key: "rent_s_city_id", title: "借車城市代碼", desc: "參照 CITY_MAP" },
        { key: "rent_s_no_s_area_cn", title: "借車行政區", desc: "rent_s_no_s_area_cn" },
        { key: "rent_s_pillar_no", title: "借車車柱", desc: "rent_s_pillar_no" },
        { key: "rent_bike_status", title: "借車狀態", desc: "0:失敗, 1:成功" },
        { key: "rent_term_no", title: "借車期別", desc: "rent_term_no" },
        { key: "rent_amt", title: "租借金額", desc: "單位:分 (未扣優惠前)" },
        { key: "rent_sec", title: "租借秒數", desc: "rent_sec" },

        // --- 還車資訊 (Return) ---
        { key: "time", title: "還車時間", desc: "Unix Timestamp (time)" },
        { key: "s_no", title: "還車場站代號", desc: "s_no" },
        { key: "s_name_tw", title: "還車場站(繁)", desc: "s_name_tw" },
        { key: "s_name_cn", title: "還車場站(簡)", desc: "s_name_cn" },
        { key: "s_name_en", title: "還車場站(英)", desc: "s_name_en" },
        { key: "s_city_id", title: "還車城市代碼", desc: "參照 CITY_MAP" },
        { key: "s_no_s_area_cn", title: "還車行政區", desc: "s_no_s_area_cn" },
        { key: "s_pillar_no", title: "還車車柱", desc: "s_pillar_no" },
        { key: "return_bike_status", title: "還車狀態", desc: "0:失敗, 1:成功" },
        { key: "return_term_no", title: "還車期別", desc: "return_term_no" },
        { key: "poweroff_return_status", title: "斷電還車", desc: "0:無, 1:有" },

        // --- 扣款與金額 ---
        { key: "code", title: "扣款狀態", desc: "0:失敗, 1:成功, 2:未付款" },
        { key: "success_time", title: "扣款時間", desc: "Unix Timestamp" },
        { key: "amout_rec", title: "實收金額", desc: "單位:分" },
        { key: "crossfee", title: "調度費", desc: "-1:無, >0:金額(元)" },
        { key: "origamt", title: "原始金額", desc: "單位:分 (折扣前)" },
        { key: "subsidize", title: "市府補貼", desc: "單位:分" },
        { key: "transfer_discount", title: "轉乘優惠", desc: "單位:分" },
        { key: "monthly_pass", title: "月票優惠", desc: "單位:分" },
        { key: "daily_pass", title: "時數優惠", desc: "單位:分" },
        { key: "student_discount", title: "學生優惠", desc: "單位:分" },
        { key: "citizen", title: "市民優惠", desc: "單位:分" },
        { key: "voucher_available", title: "騎乘券折抵", desc: "0:無, >0:金額" },

        // --- 補扣款 (Overdraft) ---
        { key: "overdraft_code", title: "補扣狀態", desc: "0:失敗, 1:成功" },
        { key: "overdraft_time", title: "補扣時間", desc: "Unix Timestamp" },
        { key: "overdraft_s_no", title: "補扣場站", desc: "overdraft_s_no" },
        { key: "overdraft_amt", title: "補扣金額", desc: "單位:分" },

        // --- 保險 ---
        { key: "insurance_id", title: "保單ID", desc: "保險資料序號" },
        { key: "premium_amt", title: "保費金額", desc: "premium_amt" },
        { key: "amount_per_premium_unit", title: "單位保費", desc: "每單位金額" },
        { key: "minutes_per_premium_unit", title: "保費單位時間", desc: "分鐘" },

        // --- 其他系統資訊 ---
        { key: "lock_status", title: "鎖控結果", desc: "參照 LOCK_STATUS_MAP" },
        { key: "lock_timev2", title: "鎖控時間", desc: "Unix Timestamp" },
        { key: "country_id", title: "縣市別(舊)", desc: "country_id" },
        { key: "province", title: "省別碼", desc: "province" },
        { key: "create_date", title: "建檔日期", desc: "Unix Timestamp" },
        { key: "modify_date", title: "更新日期", desc: "Unix Timestamp" }
    ];


    function metaDesc(key) {
        const m = FIELD_META.find(x => x.key === key);
        return m ? `${m.title}｜${m.desc}` : "（原值顯示）";
    }

    function rateInfoText(v) {
        const s = String(v || "");
        if (!s) return "";
        const p = s[0].toUpperCase();
        const map = { "L": "長期會員", "S": "短期會員", "G": "團體/貴賓會員" };
        return map[p] ? `${s}｜${map[p]}` : `${s}｜(未定義)`;
    }

    function isLikelyUnixSeconds(n) {
        return Number.isFinite(n) && n >= 1000000000 && n <= 4102444800;
    }
    function isLikelyUnixMillis(n) {
        return Number.isFinite(n) && n >= 1000000000000 && n <= 4102444800000;
    }

    function formatTimeFromUnix(val) {
        const num = Number(val);
        if (!Number.isFinite(num)) return String(val);

        let ms = null;
        if (isLikelyUnixMillis(num)) ms = num;
        else if (isLikelyUnixSeconds(num)) ms = num * 1000;
        else return String(val);

        const d = new Date(ms);
        const yyyy = d.getFullYear();
        const MM = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const ss = String(d.getSeconds()).padStart(2, "0");
        return `${val}｜${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
    }

    function toSafeString(v) {
        if (v === null || v === undefined) return "";
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
    }

    function renderParsedTransaction(payload) {
        parsedList.innerHTML = "";

        const lines = [];
        lines.push("【交易解析】（順序同原始 JSON）");

        const sections = [
            { key: "main", label: "main｜本筆交易", obj: payload.main },
            { key: "prev", label: "prev｜上一筆", obj: payload.prev },
            { key: "next", label: "next｜下一筆", obj: payload.next }
        ];

        const allHtml = [];

        for (const sec of sections) {
            const obj = sec.obj;

            if (obj === null) {
                allHtml.push(`
                    <div class="section-head">
                        <div class="title">${escapeHtml(sec.label)}</div>
                        <div class="meta">null</div>
                    </div>
                `);
                lines.push(`\n[${sec.key}] = null`);
                continue;
            }

            allHtml.push(`
                <div class="section-head">
                    <div class="title">${escapeHtml(sec.label)}</div>
                    <div class="meta">${Object.keys(obj).length} fields</div>
                </div>
            `);
            lines.push(`\n[${sec.key}]`);

            const keys = Object.keys(obj);

            for (const key of keys) {
                const rawVal = obj[key];

                let showVal = toSafeString(rawVal);
                let desc = metaDesc(key);
                let pill = null;

                if (key === "group_no") {
                    const t = GROUP_NO_MAP[String(rawVal)];
                    showVal = t ? `${toSafeString(rawVal)}｜${t}` : toSafeString(rawVal);
                }

                if (key === "code") {
                    const t = CODE_MAP[String(rawVal)];
                    showVal = t ? `${toSafeString(rawVal)}｜${t}` : toSafeString(rawVal);
                    pill = (String(rawVal) === "1")
                        ? { pillText: "OK", pillClass: "pill-ok" }
                        : (String(rawVal) === "0" ? { pillText: "FAIL", pillClass: "pill-bad" } : null);
                }

                if (key === "card_type") {
                    const name = obj.card_name ? String(obj.card_name) : (CARD_TYPE_MAP[Number(rawVal)] || "未知卡別");
                    showVal = `${toSafeString(rawVal)}｜${name}`;
                }

                if (key === "rate_info") {
                    const t = rateInfoText(rawVal);
                    showVal = t || toSafeString(rawVal);
                }

                if (key === "tag_data") {
                    const t = TAG_DATA_MAP[String(rawVal)];
                    showVal = t ? `${toSafeString(rawVal)}｜${t}` : toSafeString(rawVal);
                }
                
                if (key === "rent_s_city_id" || key === "s_city_id") {
                    const t = CITY_MAP[String(rawVal)];
                    showVal = t ? `${toSafeString(rawVal)}｜${t}` : toSafeString(rawVal);
                }

                if (key === "lock_status") {
                    const t = LOCK_STATUS_MAP[String(rawVal)];
                    showVal = t ? `${toSafeString(rawVal)}｜${t}` : toSafeString(rawVal);
                }

                if (["rent_time", "time", "success_time", "lock_timev2", "overdraft_time", "create_date", "mv_date", "cancel_date", "uncancel_date", "signup_everyday_at"].includes(key)) {
                    showVal = formatTimeFromUnix(rawVal);
                }

                lines.push(`${key}：${showVal}`);
                allHtml.push(makeKVClickable(`${sec.key}.${key}`, key, showVal, desc, rawVal, pill));
            }
        }

        lastParsedText = lines.join("\n");
        parsedList.innerHTML = allHtml.join("");
    }

    function makeKVClickable(domKey, key, showValue, desc, rawValue, pill = null) {
        const pillHtml = pill
            ? `<span class="pill ${pill.pillClass}">${pill.pillText}</span>`
            : "";

        const rawStr = (rawValue === null || rawValue === undefined)
            ? ""
            : (typeof rawValue === "object" ? JSON.stringify(rawValue) : String(rawValue));

        return `
            <div class="kv-row" data-key="${escapeHtml(domKey)}" data-raw="${escapeHtml(rawStr)}" title="點擊複製該值">
                <div class="copy-hint">點擊複製</div>
                <div class="kv-key">${escapeHtml(key)}</div>
                <div class="kv-val">${pillHtml}${escapeHtml(showValue)}</div>
                <div class="kv-sub">${escapeHtml(desc || "")}</div>
            </div>
        `;
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function stripHtml(s) {
        return String(s || "").replace(/<[^>]*>/g, "");
    }
});

/* ===== API（串接風格保留） ===== */
async function getBikeTransactionByTransIdx(transIdx, outJsonElement) {
    // ✅ 對齊你的 Controller
    // GET /api/Transaction/getByTransactionId/:bikeTransactionIdx
    const url = `/api/Transaction/getByTransactionId/${transIdx}`;

    outJsonElement.value = "";

    return await fetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => ({ status: 1, data }))
    .catch(() => ({ status: 0, data: "" }));
}

/* ===== Toast（共用） ===== */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background =
        type === "success"
            ? "rgba(46, 160, 67, 0.95)"
            : "rgba(218, 54, 51, 0.95)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = 99999;
    toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s, transform 0.3s";
    toast.style.transform = "translateY(10px)";

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}