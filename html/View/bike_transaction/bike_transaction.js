document.addEventListener('DOMContentLoaded', () => {

    const fullForm = document.getElementById('full_form');

    const tagDataElement = document.getElementById("tag_data");
    const flagsRecElement = document.getElementById("flags_rec");
    const digestidxElement = document.getElementById("digestidx");
    const amoutRecElement = document.getElementById("amout_rec");
    const origamtElement = document.getElementById("origamt");

    const outJsonElement = document.getElementById("outJson");

    fullForm.addEventListener('change', () => {
        setOutJson();
    });

    amoutRecElement.addEventListener('change', () => {
        origamtElement.value = amoutRecElement.value;
    });

    function setOutJson() {
        let jsonLines = [];

        if (tagDataElement.value !== "") {
            jsonLines.push(`"tag_data" : NumberInt(${tagDataElement.value})`);
        }

        jsonLines.push(`"flags_rec" : NumberInt(${flagsRecElement.value})`);
        jsonLines.push(`"digestidx" : "${digestidxElement.value}"`);
        jsonLines.push(`"amout_rec" : NumberLong(${amoutRecElement.value})`);
        jsonLines.push(`"origamt" : NumberLong(${origamtElement.value})`);

        // ⚠️ 保留一行一行顯示
        outJsonElement.innerText = jsonLines.join(",\n");
    }
});

/* ===============================
   點擊整列 → 複製（完全沿用 battery.js）
=============================== */
function copyByRow(rowElement) {
    const textEl = rowElement.querySelector(".result-text");
    if (!textEl || !textEl.innerText) return;

    navigator.clipboard.writeText(textEl.innerText)
        .then(() => showToast("已複製到剪貼簿", "success"))
        .catch(() => showToast("複製失敗", "error"));
}

/* ===============================
   Toast 提示（成功 / 失敗）
   👉 與 battery.js 完全一致
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
