document.addEventListener("DOMContentLoaded", async () => {

    const inputCode = document.getElementById("err_code_value");
    const tableBody = document.getElementById("err_code");

    const btnAdd = document.getElementById("btnAdd");
    const btnUpdate = document.getElementById("btnUpdate");
    const btnDelete = document.getElementById("btnDelete");

    let jsonData = {};

    // ===============================
    // 讀取資料
    // ===============================
    await loadData();

    async function loadData() {
        const res = await fetch("/api/Json/getAppErrCode");
        const data = await res.json();

        if (data.status !== 1) {
            showToast("讀取失敗", "error");
            return;
        }

        jsonData = data.jsonDataEncode;
        renderTable(jsonData);
    }

    // ===============================
    // 搜尋
    // ===============================
    inputCode.addEventListener("input", () => {
        const keyword = inputCode.value.trim().toLowerCase();
        tableBody.innerHTML = "";

        if (!keyword) return renderTable(jsonData);

        const filtered = Object.entries(jsonData).filter(
            ([k, v]) =>
                k.toLowerCase().includes(keyword) ||
                v.toLowerCase().includes(keyword)
        );

        if (!filtered.length) {
            tableBody.appendChild(createRow("無資料", ""));
            return;
        }

        filtered.forEach(([k, v]) => {
            tableBody.appendChild(createRow(k, v));
        });
    });

    // ===============================
    // 新增
    // ===============================
    btnAdd.addEventListener("click", async () => {
        const code = prompt("請輸入錯誤碼");
        if (!code) return;

        const message = prompt("請輸入錯誤訊息");
        if (!message) return;

        const res = await fetch("/api/Json/app_err/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, message })
        }).then(r => r.json());

        showToast(res.message, res.status === 1 ? "success" : "error");
        if (res.status === 1) loadData();
    });

    // ===============================
    // 修改
    // ===============================
    btnUpdate.addEventListener("click", async () => {
        const code = inputCode.value.trim();
        if (!jsonData[code]) {
            showToast("錯誤碼不存在", "error");
            return;
        }

        const message = prompt("新的錯誤訊息", jsonData[code]);
        if (!message) return;

        const res = await fetch(`/api/Json/app_err/update/${encodeURIComponent(code)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        }).then(r => r.json());

        showToast(res.message, res.status === 1 ? "success" : "error");
        if (res.status === 1) loadData();
    });

    // ===============================
    // 刪除
    // ===============================
    btnDelete.addEventListener("click", async () => {
        const code = inputCode.value.trim();
        if (!jsonData[code]) {
            showToast("錯誤碼不存在", "error");
            return;
        }

        if (!confirm(`確定刪除 ${code}？`)) return;

        const res = await fetch(`/api/Json/app_err/delete/${encodeURIComponent(code)}`, {
            method: "DELETE"
        }).then(r => r.json());

        showToast(res.message, res.status === 1 ? "success" : "error");
        if (res.status === 1) {
            inputCode.value = "";
            loadData();
        }
    });
});

/* ===============================
   表格處理（原樣保留）
=============================== */
function renderTable(data) {
    const tbody = document.getElementById("err_code");
    tbody.innerHTML = "";
    Object.entries(data).forEach(([k, v]) => {
        tbody.appendChild(createRow(k, v));
    });
}

function createRow(code, msg) {
    const tr = document.createElement("tr");
    tr.appendChild(td(code));
    tr.appendChild(td(msg));
    bindTdCopy(tr);
    return tr;
}

function td(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

/* ===============================
   單格複製
=============================== */
function bindTdCopy(tr) {
    tr.querySelectorAll("td").forEach(td => {
        td.addEventListener("click", e => {
            e.stopPropagation();
            copyCellText(td.innerText);
        });
    });
}

function copyCellText(text) {
    if (!text || text === "無資料") return;
    navigator.clipboard.writeText(text)
        .then(() => showToast("已複製到剪貼簿"))
        .catch(() => showToast("複製失敗", "error"));
}

/* ===============================
   Toast
=============================== */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background =
        type === "success" ? "rgba(46,160,67,.95)" : "rgba(218,54,51,.95)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = 99999;
    toast.style.opacity = "0";
    toast.style.transition = "0.3s";

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = "1");
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
