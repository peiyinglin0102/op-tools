document.addEventListener('DOMContentLoaded', async () => {


    /* ============================================================
       ⭐ 上方：9970 多筆格式化
    ============================================================ */
    const inputValueElement = document.getElementById("input_value");
    const outputValueElement = document.getElementById("output_value");
    const countArea = document.getElementById("count_area");



    inputValueElement.addEventListener('input', () => {
        const { jsonText, count } = extractCardNumbers(inputValueElement.value);


        outputValueElement.value = jsonText;
        countArea.textContent = count > 0 ? `共 ${count} 筆` : "";
    });



    /* ============================================================
       ⭐ 下方：findTemp 單筆 API 查詢
    ============================================================ */
    const cardNoElement = document.getElementById('card_no');
    const findElement = document.getElementById('find');
    const form = document.getElementById('cards-form');


    form.addEventListener('submit', function (event) {
        event.preventDefault();
    });


    cardNoElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') findElement.click();
    });


    findElement.addEventListener('click', async () => {


        const card_no = cardNoElement.value.trim();
        if (!card_no) return;


        const url = `/api/Temp/getfindTemp/${card_no}`;


        try {
            const res = await fetch(url);
            const data = await res.json();


            const changeCardNoElement = document.getElementById("change_card_no");
            const changeCardStatus = document.getElementById("change_card_status");


            if (data.status == 1) {
                changeTable(card_no, changeCardNoElement);
                changeTable(data.data, changeCardStatus);
            } else {
                changeTable(card_no, changeCardNoElement);
                changeTable("❌ 查無資料", changeCardStatus);
            }


        } catch (err) {
            console.log("findTemp error", err);
        }
    });


});




/* ============================================================
   ⭐ changeTable - 單筆查詢填入表格
============================================================ */
function changeTable(newValue, changeElement) {
    changeElement.innerHTML = newValue;
}




/* ============================================================
   ⭐ 以下保留：你的 extractCardNumbers() 全功能版
============================================================ */
function extractCardNumbers(text) {
    if (!text) return { jsonText: "", count: 0 };


    const rawLines = text.split(/\r?\n/);
    const cardNumbers = [];


    let expectCardAfterType = false;
    let expectCardAfterLabel = false;


    for (let raw of rawLines) {
        const line = raw.trim();
        if (!line) continue;


        if (line.includes(",") && !line.includes("\t")) {
            const parts = line.split(",").map(p => p.trim());
            parts.forEach(p => { if (isRealCardNumber(p)) cardNumbers.push(p); });
            continue;
        }


        if (raw.includes("\t")) {
            const cols = raw.split("\t").map(c => c.trim());
            cols.forEach(col => {
                if (isCardType(col)) { expectCardAfterType = true; return; }


                if (expectCardAfterType && isRealCardNumber(col)) {
                    cardNumbers.push(col);
                    expectCardAfterType = false;
                    return;
                }


                if (isCardLabel(col)) {
                    const m = col.match(/(\d{8,20})/);
                    if (m && isRealCardNumber(m[1])) cardNumbers.push(m[1]);
                    else expectCardAfterLabel = true;
                    return;
                }


                if (expectCardAfterLabel && isRealCardNumber(col)) {
                    cardNumbers.push(col);
                    expectCardAfterLabel = false;
                }
            });
            continue;
        }


        if (isCardLabel(line)) {
            const m = line.match(/(\d{8,20})/);
            if (m && isRealCardNumber(m[1])) cardNumbers.push(m[1]);
            else expectCardAfterLabel = true;
            continue;
        }


        if (expectCardAfterLabel && isRealCardNumber(line)) {
            cardNumbers.push(line);
            expectCardAfterLabel = false;
            continue;
        }


        if (isCardType(line)) {
            expectCardAfterType = true;
            continue;
        }


        if (expectCardAfterType && isRealCardNumber(line)) {
            cardNumbers.push(line);
            expectCardAfterType = false;
            continue;
        }


        if (isRealCardNumber(line)) {
            cardNumbers.push(line);
            continue;
        }


        expectCardAfterType = false;
        expectCardAfterLabel = false;
    }


    const jsonText = cardNumbers.map(n => `"${n}"`).join(",");
    return { jsonText, count: cardNumbers.length };
}




/* ============================================================
   ⭐ 工具 functions
============================================================ */
function isRealCardNumber(s) {
    if (!/^\d{8,20}$/.test(s)) return false;
    if (s.length === 10 && s.startsWith("00")) return false;
    return true;
}
function isCardLabel(line) {
    return /卡號|Card/i.test(line);
}
function isCardType(line) {
    return ["悠遊卡", "一卡通", "愛金卡", "TPASS", "月票", "轉乘"].some(k => line.includes(k));
}


/* ===============================
   點擊整列 → 複製（battery + textarea 通用版）
=============================== */
function copyByRow(rowElement) {
    const textEl = rowElement.querySelector(".result-text");
    if (!textEl) return;


    // ⭐ 關鍵：textarea 用 value，div 用 innerText
    const text =
        typeof textEl.value === "string" && textEl.value.trim() !== ""
            ? textEl.value
            : textEl.innerText;


    if (!text || !text.trim()) return;


    navigator.clipboard.writeText(text)
        .then(() => showToast("已複製到剪貼簿", "success"))
        .catch(() => showToast("複製失敗", "error"));
}


/* ===============================
   Toast 提示（成功 / 失敗）
=============================== */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;


    const bgColor = type === "success"
        ? "rgba(46, 160, 67, 0.95)"   // 綠
        : "rgba(218, 54, 51, 0.95)"; // 紅


    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background = bgColor;
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



