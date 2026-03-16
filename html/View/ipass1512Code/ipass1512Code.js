document.addEventListener('DOMContentLoaded', async () => {
    let jsonData = {};
    const inputCode = document.getElementById("err_code_value");

    const url = "/api/Json/getIpass1512Code/";

    const res = await fetch(url).then(r => r.json());
    if (res.status === 1) {
        jsonData = res.jsonDataEncode;
        renderTable(jsonData);
    }

    /* ===============================
       即時搜尋（模糊比對）
    =============================== */
    inputCode.addEventListener("input", () => {
        const keyword = inputCode.value.trim().toLowerCase();

        if (!keyword) {
            renderTable(jsonData);
            return;
        }

        const filtered = Object.entries(jsonData).filter(
            ([code, message]) =>
                code.toLowerCase().includes(keyword) ||
                message.toLowerCase().includes(keyword)
        );

        if (!filtered.length) {
            renderTable({ "無資料": "" });
            return;
        }

        const result = {};
        filtered.forEach(([c, m]) => result[c] = m);
        renderTable(result);
    });

    /* ===============================
       CRUD（原 API 不動）
    =============================== */
    const safe = (v) => encodeURIComponent(v.trim());

    document.getElementById("btnAdd").addEventListener("click", async () => {
        const code = prompt("請輸入錯誤碼");
        if (!code) return;

        const msg = prompt("請輸入錯誤訊息");
        if (!msg) return;

        const res = await fetch("/api/Json/ipass1512/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, message: msg })
        }).then(r => r.json());

        alert(res.message);
        location.reload();
    });

    document.getElementById("btnUpdate").addEventListener("click", async () => {
        const code = inputCode.value.trim();
        if (!jsonData[code]) {
            alert("錯誤碼不存在");
            return;
        }

        const msg = prompt("新的錯誤訊息", jsonData[code]);
        if (!msg) return;

        const res = await fetch(`/api/Json/ipass1512/update/${safe(code)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: msg })
        }).then(r => r.json());

        alert(res.message);
        location.reload();
    });

    document.getElementById("btnDelete").addEventListener("click", async () => {
        const code = inputCode.value.trim();
        if (!jsonData[code]) {
            alert("錯誤碼不存在");
            return;
        }

        if (!confirm(`確定刪除 ${code} ?`)) return;

        const res = await fetch(`/api/Json/ipass1512/delete/${safe(code)}`, {
            method: "DELETE"
        }).then(r => r.json());

        alert(res.message);
        location.reload();
    });
});

/* ===============================
   表格渲染 + 單格複製
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
   單格複製 + Toast（同 ecc）
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

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background =
        type === "success"
            ? "rgba(46,160,67,.95)"
            : "rgba(218,54,51,.95)";
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
