/**
 * 錯誤碼對照表
 */
const ERROR_CODES = {
    "E00000": "未定義的路由", "E00001": "該路由方法未定義", "E00002": "沒有該功能的權限",
    "E00003": "欄位驗證失敗", "E00004": "請輸入token資訊", "E00005": "token已過期，請重新登入",
    "E00006": "token已失效，請重新登入", "E00007": "查無該帳號資料", "E00008": "帳號密碼錯誤或是該帳號尚未通過認證",
    "E10001": "請輸入token資訊", "E10102": "輸入的卡別或卡號錯誤", "E10104": "寄送簡訊失敗，發送超過限制",
    "E10105": "簡訊碼驗證失敗", "E10107": "帳號或密碼錯誤", "E10119": "查詢會員資料失敗，會員不存在",
    "E10123": "查詢會員底下卡片資訊失敗", "E10130": "會員綁卡失敗", "E10165": "該卡片已被綁定",
    "E10168": "取得微信簽章失敗", "E10173": "查詢綁卡資訊失敗", "E10190": "證件號格式有誤",
    "E10201": "請求逾期，請重新登入", "E10202": "登入失敗，簽章無效", "E10224": "查詢會員底下卡片資訊失敗",
    "E10244": "查無該第三方資訊", "E10247": "請輸入token", "E10252": "apiData格式異常",
    "E10261": "寄送驗證碼失敗", "E10263": "驗證碼驗證失敗", "E10265": "無法找尋到此筆交易資訊",
    "E10288": "該車架號查無外觀車號", "E10296": "查詢票券失敗", "E10301": "取得卡片清單失敗",
    "E10303": "取得卡片資料失敗", "E10321": "查無該商品，無法兌換", "E10329": "查詢行銷禮物箱紀錄失敗",
    "E10330": "查無該禮物資訊", "E10342": "車柱錄碼失敗", "E10344": "車輛錄碼失敗",
    "E10359": "更新卡片資料失敗", "E10401": "查詢已登錄資訊失敗", "E10405": "查詢本月成果失敗",
    "E10407": "查詢年度紀錄失敗", "E10409": "查詢排行榜失敗", "E10501": "會員滿站增時失敗",
    "E451002": "會員刪除申請(寄信)失敗", "E518001": "由於密碼強度不足，請您重新設定",
    "E536002": "沿用舊密碼失敗", "E602001": "查詢違規記點紀錄失敗", "E00100": "目前沒有資料",
    "E00101": "查無該筆資料", "E00200": "目前沒有資料", "E00201": "查無該筆資料",
    "E00203": "查詢國家區域失敗", "E00300": "目前沒有資料", "E00301": "查無該筆資料",
    "E00500": "目前沒有資料", "E00501": "查無該筆資料", "E00503": "查詢最新消息失敗",
    "E00600": "目前沒有資料", "E00601": "查無該筆資料", "E00603": "查詢主廣告失敗",
    "E00800": "目前沒有資料", "E00801": "查無該筆資料", "E00803": "查詢服務中心失敗",
    "E01000": "目前沒有資料", "E01001": "查無該筆資料", "E01003": "查詢app廣告失敗",
    "E01200": "目前沒有資料", "E01201": "查無該筆資料", "E01203": "查詢可註冊卡別失敗",
    "E01300": "目前沒有資料", "E01301": "查無該筆資料", "E01303": "查詢遺失車輛失敗",
    "E02900": "查無此會員", "E02901": "該會員尚無綁定裝置", "E02907": "群組標籤推播發送失敗",
    "E02936": "目前沒有資料", "E99999": "您的嘗試過於頻繁，請稍後再試"
};

const API_MAP = {
    "webLogin": "後台使用者登入", "api/me": "取得使用者資料", "tw2/bindCard": "台灣2.0會員綁卡",
    "api/bindCard": "綁卡API", "api/cno2cid": "外觀卡號轉內碼", "tw2/login": "台灣2.0會員登入",
    "tw2/card": "台灣2.0查詢會員卡片", "api/card": "查詢卡片API", "tw2/me": "台灣2.0查詢會員資料",
    "tw2/delCard": "台灣2.0刪除卡片", "api/unbindCard": "解綁卡片API", "tw2/register/singleRental": "單次租車註冊",
    "api/register": "註冊API", "tw2/checkCardIsValid": "檢查卡片有效性", "tw2/rideRecord": "台灣2.0騎乘紀錄",
    "tw2/repair": "台灣2.0維修通報", "tw2/tapPay": "TapPay支付", "tw2/refund": "退押金",
    "tw2/bindVirtualCard": "驗證綁虛擬卡", "common/register": "中國大陸註冊會員",
    "common/login": "中國大陸登入", "common/card": "中國大陸查詢卡片", "common/bindCard": "中國大陸綁卡",
    "tw/third/insuranceAddNotification": "保險平台加保通知", "tw/fcm/device": "FCM裝置註冊/註銷",
    "tw1/rideRecord": "台灣1.0騎乘紀錄", "api/actionLog": "查詢操作紀錄"
};

new Vue({
    el: "#app-parser",
    data: {
        rawLog: "",
        parsedLogs: [],
        filterText: "",
        allOpen: false,
        allErrorOpen: false
    },
    computed: {
        filteredLogs() {
            if (!this.filterText) return this.parsedLogs;
            const k = this.filterText.toLowerCase();
            return this.parsedLogs.filter(l =>
                l.route_display.toLowerCase().includes(k) ||
                l.method.toLowerCase().includes(k) ||
                (l.errCode && l.errCode.toLowerCase().includes(k)) ||
                JSON.stringify(l.request || {}).toLowerCase().includes(k) ||
                JSON.stringify(l.response || {}).toLowerCase().includes(k)
            );
        }
    },
    methods: {
        // ⭐ 全部展開 / 收合
        toggleAll() {
            this.allOpen = !this.allOpen;
            this.parsedLogs.forEach(log => {
                log.isOpen = this.allOpen;
            });
        },

        // ⭐ 只展開 / 收合 Error 卡片
        toggleAllError() {
            this.allErrorOpen = !this.allErrorOpen;
            this.parsedLogs.forEach(log => {
                if (log.isError) {
                    log.isOpen = this.allErrorOpen;
                }
            });
        },
        clearLogs() {
            this.rawLog = "";
            this.parsedLogs = [];
            this.allErrorOpen = false;
            this.allOpen = false;
        },

        toggleCard(log) {
            log.isOpen = !log.isOpen;
        },
        onInputLog() {
            this.parseProcess(this.rawLog);
        },
        // 核心解析器：智慧提取並實現自動排版
        parseProcess(text) {
            if (!text || !text.trim()) {
                this.parsedLogs = [];
                return;
            }

            const logs = [];
            const cleanLines = [];
            const lines = text.split('\n');

            lines.forEach(line => {
                const trimmed = line.trim();
                if (!trimmed) return;

                // 智慧定位：尋找該行第一個 '{' 到最後一個 '}'
                // 這能解決 grep/zgrep 帶來的檔名前綴問題
                const firstBrace = trimmed.indexOf('{');
                const lastBrace = trimmed.lastIndexOf('}');
                
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const jsonStr = trimmed.substring(firstBrace, lastBrace + 1);
                    try {
                        const obj = JSON.parse(jsonStr);
                        const source = trimmed.substring(0, firstBrace).replace(/[:\s]+$/, "");
                        logs.push(this.buildLogItem(obj, source));
                        cleanLines.push(trimmed); // 保留檔名 + JSON
                    } catch (e) {
                        console.warn("JSON Parse Error on line:", trimmed);
                    }
                }
            });

            this.parsedLogs = logs;

            // ⭐ 只有在「真的有 log」時，才預設展開 Error
            if (this.parsedLogs.length > 0) {
                this.allErrorOpen = true;
                this.allOpen = false;

                this.parsedLogs.forEach(log => {
                    if (log.isError) {
                        log.isOpen = true;
                    }
                });
            }


        },
        buildLogItem(obj, source = "") {
            // 正規化 response 欄位大小寫與相容性
            const res = obj.response || {};
            const retCode = res.retCode !== undefined ? res.retCode : res.RetCode;
            const errCode = res.errCode || res.ErrCode || res.err_code || null;
            
            // 判斷錯誤狀態
            let isError = false;
            if (obj.status && parseInt(obj.status) >= 400) isError = true;
            if (retCode === 0 || retCode === "0") isError = true;
            if (errCode && errCode !== "E00010") isError = true; 

            const route = obj.route || obj.api_name || "Unknown Route";
            const apiLabel = API_MAP[obj.api_name] || API_MAP[obj.route] || "";

            return {
                isOpen: false,
                source,
                method: obj.method || "LOG",
                status: obj.status || "-",
                route: route,
                route_display: apiLabel ? `${apiLabel} (${route})` : route,
                request: obj.request || null,
                response: obj.response || null,
                isError: isError,
                errCode: errCode,
                errDesc: ERROR_CODES[errCode] || res.retMsg || res.RetMsg || ""
            };
        },
        renderBlock(data) {
            if (!data) return '<span class="jv-null">null</span>';
            const json = JSON.stringify(data, null, 2);
            return `<pre>${this.syntaxHighlight(json)}</pre>`;
        },
        syntaxHighlight(json) {
            return json.replace(
                /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                (match) => {
                    let cls = 'jv-number';
                    if (/^"/.test(match)) {
                        cls = /:$/.test(match) ? 'jv-key' : 'jv-string';
                    } else if (/true|false/.test(match)) {
                        cls = 'jv-boolean';
                    } else if (/null/.test(match)) {
                        cls = 'jv-null';
                    }
                    return `<span class="${cls}">${match}</span>`;
                }
            );
        }
    }
});