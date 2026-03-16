document.addEventListener('DOMContentLoaded', () => {
    const accountNoElement = document.getElementById('user_account');
    const findElement = document.getElementById('find');
    const tableBody = document.getElementById('tableElement');

    accountNoElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            findElement.click();
        }
    });

    findElement.addEventListener('click', async () => {
        const user_account = accountNoElement.value.trim();
        if (!user_account) return;

        clearTable(tableBody);

        try {
            const res = await fetch(`/api/Monthly/getByAccount/${user_account}`);
            const data = await res.json();

            if (data.status == 1 && data.data.length) {
                data.data.forEach(row => addTable(row, tableBody));
            } else {
                addTableEmpty(tableBody);
            }
        } catch (err) {
            console.error(err);
            showToast("查詢失敗", "error");
        }
    });
});

/* ===============================
   ⭐ 表格操作（原邏輯保留）
=============================== */
function clearTable(tbody) {
    tbody.innerHTML = "";
}

function addTable(newValue, tableBody) {
    const tr = document.createElement('tr');

    tr.appendChild(createTdElement(newValue._start_time, 0));
    tr.appendChild(createTdElement(newValue.create_date, 1));
    tr.appendChild(createTdElement(newValue._end_time, 0));

    bindTdCopy(tr);
    tableBody.appendChild(tr);
}

function addTableEmpty(tableBody) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>-</td>
        <td>查無資料</td>
        <td>-</td>
    `;
    bindTdCopy(tr);
    tableBody.appendChild(tr);
}

function createTdElement(value, type) {
    if (type === 0) value = changeUnixTime(value);
    if (type === 1) value = chanheISODate(value);

    const td = document.createElement('td');
    td.textContent = value || "-";
    return td;
}

/* ===============================
   ⭐ 時間轉換（原本 그대로）
=============================== */
function changeUnixTime(unixTime) {
    const date = new Date(unixTime * 1000);
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} `
         + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function chanheISODate(isoDate) {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} `
         + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function pad(n) {
    return String(n).padStart(2, '0');
}

/* ===============================
   ⭐ 單格點擊複製（與 tappay 完全一致）
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
    if (!text) return;

    navigator.clipboard.writeText(text)
        .then(() => showToast("已複製到剪貼簿", "success"))
        .catch(() => showToast("複製失敗", "error"));
}

/* ===============================
   ⭐ Toast（Battery 共用）
=============================== */
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
