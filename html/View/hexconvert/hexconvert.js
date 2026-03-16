/* ===============================
   ⭐ Enter 鍵解析（比照 monthly）
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("log_input");

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // 避免換行
            extractFromLog();
        }
    });

    /* ⭐ 單格點擊複製（與 monthly 完全一致） */
    ["row_hex", "row_dec"].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener("click", e => {
            e.stopPropagation();
            copyCellText(el.innerText);
        });
    });
});

/* ===============================
   ⭐ 原本解析邏輯（完全不動）
=============================== */
function extractFromLog() {
    let input = document.getElementById("log_input").value.trim();

    let match = input.match(/"purse_balance":"([0-9a-fA-F]+)"/);
    let hex = "";

    if (match) {
        hex = match[1];
    } else {
        hex = input.replace(/[^0-9a-fA-F]/g, "");
    }

    if (hex.length === 0) {
        document.getElementById("row_hex").innerText = "❌ 無法解析 Hex";
        document.getElementById("row_dec").innerText = "";
        return;
    }

    document.getElementById("row_hex").innerText = hex;

    let dec = parseInt(hex, 16);
    if (isNaN(dec)) {
        document.getElementById("row_dec").innerText = "❌ 轉換失敗";
        return;
    }

    document.getElementById("row_dec").innerText = dec + " 元";
}

/* ===============================
   ⭐ 複製 & Toast（Battery / Monthly 共用）
=============================== */
function copyCellText(text) {
    if (!text || text === "-") return;

    navigator.clipboard.writeText(text)
        .then(() => showToast("已複製到剪貼簿", "success"))
        .catch(() => showToast("複製失敗", "error"));
}

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
