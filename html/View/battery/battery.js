document.addEventListener('DOMContentLoaded', () => {
    const assetNo = document.getElementById("asset_no");
    const happyBtn = document.querySelector(".btn.btn-primary");

    assetNo.addEventListener('change', handleQuery);
    happyBtn.addEventListener('click', handleQuery);

    async function handleQuery() {
        const assetNoValue = assetNo.value.trim();
        if (!assetNoValue) return;

        const batteryId = await fetchBatteryId(assetNoValue);

        document.getElementById("row1_output").innerText =
            `{ "asset_no": "${assetNoValue}" }`;

        document.getElementById("row2_output").innerText =
            `{ "asset_no": "${assetNoValue}", "process": NumberInt(0), "type_id": NumberInt(4) }`;

        document.getElementById("row3_output").innerText =
            `{ "battery_id": "${batteryId}" }`;
    }
});

async function fetchBatteryId(assetNo) {
    try {
        const res = await fetch(`/api/bike/battery?asset_no=${assetNo}`);
        const data = await res.json();
        return data.battery_id ?? null;
    } catch (err) {
        console.error("fetchBatteryId ERROR:", err);
        return null;
    }
}

/* ===============================
   點擊整列 → 複製
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
