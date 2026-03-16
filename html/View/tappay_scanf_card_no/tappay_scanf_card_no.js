/* =============================================================
   ⭐ Tappay 前六後四 + 銀行卡查詢
   ⭐ 一格一格(td)點擊即可複製（Battery 手感）
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ===============================
       第一部分：前六後四 CSV（表格）
    =============================== */
    const formValue = document.getElementById("form_value");
    const csvInput = document.getElementById("csv_input");
    const cardStartLast = document.getElementById("card_start_last");
    const tappayResult = document.getElementById("tappay_result");

    formValue.addEventListener('change', () => {
        clearTable(tappayResult);

        const sixFour = extractSixFour(cardStartLast.value);
        if (!sixFour || !csvInput.files[0]) return;

        const keyword = addDash(sixFour);

        findKeyword(csvInput, keyword).then(rows => {
            if (!rows.length) {
                addTappayRow("-", "-", "查無資料", "-", "-", keyword);
                return;
            }

            rows.forEach(data => {
                addTappayRow(
                    cleanValue(data["Date"]),
                    `${cleanValue(data["Original Amount"])} / ${cleanValue(data["Refunded Amount"])}`,
                    cleanValue(data["RecTrade ID"]),
                    cleanValue(data["Cardholder Phone Number"]),
                    cleanValue(data["Order Number"]),
                    keyword
                );
            });
        });
    });

    function addTappayRow(date, amt, tradeId, phone, orderNo, sixFour) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${date}</td>
            <td>${amt}</td>
            <td>${tradeId}</td>
            <td>${phone}</td>
            <td>${orderNo}</td>
            <td>${sixFour}</td>
        `;
        bindTdCopy(tr);
        tappayResult.appendChild(tr);
    }

    /* ===============================
       第二部分：銀行卡查詢（表格）
    =============================== */
    const bankCardNoInput = document.getElementById("bank_card_no");
    const findBankCardBtn = document.getElementById("find_bank_card");
    const bankResult = document.getElementById("bank_result");

    bankCardNoInput.addEventListener("keydown", e => {
        if (e.key === "Enter") findBankCardBtn.click();
    });

    findBankCardBtn.addEventListener("click", async () => {
        clearTable(bankResult);

        const bankCardNo = bankCardNoInput.value.trim();
        if (!bankCardNo) return;

        try {
            const res = await fetch(`/api/Card/getByBankCardNo/${bankCardNo}`);
            const data = await res.json();

            if (data.status == 1 && data.data.length) {
                data.data.forEach(r => addBankRow(r.card_no, r.mem_id));
            } else {
                addBankRow("無", "查無資料");
            }
        } catch {
            addBankRow("錯誤", "查詢失敗");
        }
    });

    function addBankRow(cardNo, memId) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${cardNo || "-"}</td>
            <td>${memId || "-"}</td>
        `;
        bindTdCopy(tr);
        bankResult.appendChild(tr);
    }

    function clearTable(tbody) {
        tbody.innerHTML = "";
    }
});

/* =============================================================
   ⭐ td 點擊 → 複製該格文字
============================================================= */
function bindTdCopy(tr) {
    tr.querySelectorAll("td").forEach(td => {
        td.addEventListener("click", e => {
            e.stopPropagation(); // 防止誤觸其他事件
            copyCellText(td.innerText);
        });
    });
}

function copyCellText(text) {
    if (!text) return;

    navigator.clipboard.writeText(text)
        .then(() => showToast("已複製到剪貼簿", "success"))
        .catch(() => showToast("複製失敗", "error"));
}

/* =============================================================
   ⭐ Toast（與 battery.js 完全一致）
============================================================= */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;

    const bgColor = type === "success"
        ? "rgba(46, 160, 67, 0.95)"
        : "rgba(218, 54, 51, 0.95)";

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

/* =============================================================
   ⭐ 原本邏輯（完全保留）
============================================================= */
function cleanValue(v) {
    if (!v) return "-";
    v = v.replace(/^="\s*/, "").replace(/"\s*$/, "");
    if (v.trim() === "" || v.trim() === '""') return "-";
    return v.replace(/^"/, "").replace(/"$/, "").trim();
}

function extractSixFour(input) {
    if (!input) return null;
    const digits = (input.match(/\d/g) || []).join('');
    if (digits.length < 10) return null;
    return [digits.slice(0, 6), digits.slice(-4)];
}

function addDash(cardNumber) {
    return `${cardNumber[0]}-${cardNumber[1]}`;
}

function findKeyword(csvInput, keyword) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvInput.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: r => resolve(
                r.data.filter(row =>
                    (row["Partial Card Number"] || "").includes(keyword)
                )
            ),
            error: reject
        });
    });
}
