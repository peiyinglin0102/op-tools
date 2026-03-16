document.addEventListener('DOMContentLoaded', async () => {
    const fullForm = document.getElementById('form_value');
    const cardNoElement = document.getElementById("cardNo");
    const outJsonElement = document.getElementById("outJson");
    const copyOutJson = document.getElementById("copy_out_json");

    const parsedList = document.getElementById("parsedList");
    const copyOutParsed = document.getElementById("copy_out_parsed");

    let lastParsedText = ""; // 用於「複製解析」
    let debounceTimer = null;

    // Enter 直接查
    cardNoElement.addEventListener('keydown', e => {
        if (e.key === 'Enter') fetchCard();
    });

    // 保留原本 change 觸發（固定串接邏輯）
    fullForm.addEventListener('change', fetchCard);

    // input debounce（自動查詢）
    cardNoElement.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchCard, 350);
    });

    async function fetchCard() {
        const cardNo = cardNoElement.value.trim();
        if (!cardNo) {
            clearOutput();
            return;
        }

        getTransactionFormIdx(cardNo, outJsonElement).then(data => {
            try {
                if (data.status == 0) throw new Error("API 請求失敗");
                if (data.data.status == 0) throw new Error("無資料");

                // 你的 controller 回傳：{status:1, data:[...]}
                const doc = data.data.data[0];

                // ✅ 原始 JSON（保持原樣）
                outJsonElement.value = JSON.stringify(doc, null, 4);

                // ✅ 解析渲染（順序 = 原始 JSON）
                renderParsedInJsonOrder(doc);

            } catch (error) {
                clearOutput();
                showToast("查無資料", "error");
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
       ✅ 解析規則（依你提供的規格）
    =============================== */

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

    function statusText(v) {
        const s = String(v);
        if (s === "1") return { pill: "pill-ok", text: "1｜啟用" };
        if (s === "0") return { pill: "pill-bad", text: "0｜鎖卡黑名單(系統黑名單)" };
        return { pill: "", text: `${v}｜未知` };
    }

    function rateInfoText(v) {
        const s = String(v || "");
        if (!s) return "";
        const p = s[0].toUpperCase();
        const map = {
            "L": "長期會員",
            "S": "短期會員",
            "G": "團體/貴賓會員(依版本)"
        };
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

    // 欄位中文說明（用於 kv-sub）
    const FIELD_META = [
        { key: "status", title: "卡片狀態", desc: "0 鎖卡黑名單(系統黑名單)；1 啟用" },
        { key: "card_type", title: "卡別", desc: "卡別/卡種編號（常見：1悠遊卡、2一卡通、21掃碼-單次租車…）" },
        { key: "card_no", title: "外觀卡號", desc: "票卡外觀卡號（依實際資訊保留大小寫）" },
        { key: "card_id", title: "加密票卡晶片號碼", desc: "建議全轉小寫；系統對應建議以 card_id + card_type 作識別依據" },
        { key: "mem_id", title: "會員帳號", desc: "手機號碼" },
        { key: "card_ic", title: "卡片 IC", desc: "票卡晶片 IC（顯示用）" },
        { key: "rate_info", title: "費率別", desc: "L 長期、S 短期、G 團體/貴賓（依版本）" },
        { key: "start_date", title: "綁卡日期", desc: "Timestamp (int32)：Unix 秒數" },
        { key: "modify_date", title: "更新時間", desc: "Timestamp (int32)：Unix 秒數" },
        { key: "created_at", title: "建立時間", desc: "ISO 時間字串" },
        { key: "digestidx", title: "最新帳務 idx", desc: "空值多表示無欠款；有欠款或未退押金時不能移除" },
        { key: "flags_rec", title: "借出/鎖車狀態", desc: "0可借出；1借出未還；2暫時性鎖車60s；4欠費（依文件）" },
        { key: "amout_rec", title: "最新欠款金額", desc: "0 也可能仍欠款，需以 overdraft_rec 為準（若有該欄位）" },
        { key: "_id", title: "資料唯一 ID", desc: "Mongo ObjectId" },
        { key: "ins_id", title: "關聯資料 ID", desc: "安裝/綁定相關資料索引" },
        { key: "ins_status", title: "安裝狀態", desc: "安裝狀態（原值顯示）" },
        { key: "basic_fee", title: "基本費率", desc: "基本費率（原值顯示）" },
        { key: "depost", title: "押金", desc: "押金（原值顯示）" },
        { key: "pay_type", title: "支付方式", desc: "支付方式（原值顯示）" },
        { key: "status_bit", title: "狀態 bit", desc: "狀態旗標（原值顯示）" },
        { key: "status_bits", title: "狀態 bits", desc: "狀態旗標集合（原值顯示）" }
    ];

    function metaDesc(key) {
        const m = FIELD_META.find(x => x.key === key);
        return m ? `${m.title}｜${m.desc}` : "（原值顯示）";
    }

    function renderParsedInJsonOrder(doc) {
        parsedList.innerHTML = "";

        // ✅ 解析文字（按 JSON key 順序）
        const lines = [];
        lines.push("【卡片解析】");

        const rowsHtml = [];
        const keys = Object.keys(doc); // ✅ 這就是你要的順序

        for (const key of keys) {
            const rawVal = doc[key];

            // 值顯示：依 key 做「解讀後顯示」，但仍保留原值
            let showVal = toSafeString(rawVal);
            let pill = null;
            let desc = metaDesc(key);

            if (key === "status") {
                const st = statusText(rawVal);
                showVal = st.text; // 已含原值
                pill = st.pill ? { pillText: st.pill === "pill-ok" ? "OK" : "LOCK", pillClass: st.pill } : null;
            }

            if (key === "card_type") {
                const n = Number(rawVal);
                const name = CARD_TYPE_MAP[n] || "未知卡別";
                showVal = `${toSafeString(rawVal)}｜${name}`;
            }

            if (key === "rate_info") {
                const t = rateInfoText(rawVal);
                showVal = t || toSafeString(rawVal);
            }

            // 常見時間欄位：int timestamp -> 可讀時間
            if (["start_date", "modify_date", "create_date", "cancel_date", "uncancel_date", "mv_date", "nowtime", "signup_everyday_at"].includes(key)) {
                showVal = formatTimeFromUnix(rawVal);
            }

            // 解析文字行：用「key：顯示值」（方便貼客服）
            lines.push(`${key}：${showVal}`);

            // 卡片：點一下複製「原始值」(不是顯示值) —— 你說要複製該值
            rowsHtml.push(makeKVClickable(key, showVal, desc, rawVal, pill));
        }


        lastParsedText = lines.join("\n");

        parsedList.innerHTML = rowsHtml.join("");

        // ✅ 卡片點擊複製「該值」
        parsedList.querySelectorAll(".kv-row").forEach(el => {
            el.addEventListener("click", () => {
                const raw = el.getAttribute("data-raw") || "";
                // raw 可能是 ""，也可能是 JSON string（object）
                navigator.clipboard.writeText(raw)
                    .then(() => showToast("已複製該值到剪貼簿", "success"));
            });
        });
    }

    function makeKVClickable(key, showValue, desc, rawValue, pill = null) {
        const pillHtml = pill
            ? `<span class="pill ${pill.pillClass}">${pill.pillText}</span>`
            : "";

        // rawValue 存字串（object 先 stringify）
        const rawStr = (rawValue === null || rawValue === undefined)
            ? ""
            : (typeof rawValue === "object" ? JSON.stringify(rawValue) : String(rawValue));

        return `
            <div class="kv-row" data-key="${escapeHtml(key)}" data-raw="${escapeHtml(rawStr)}" title="點擊複製該值">
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

});

/* ===== API（原樣保留） ===== */
async function getTransactionFormIdx(cardNo, outJsonElement) {
    const url = `/api/Card/getByCardNo/${cardNo}`;
    outJsonElement.value = "";

    return await fetch(url, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json())
    .then(data => ({ status: 1, data }))
    .catch(() => ({ status: 0, data: "" }));
}

/* ===== Toast（與 monthly / battery 共用） ===== */
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
