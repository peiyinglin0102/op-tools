document.addEventListener('DOMContentLoaded', () => {

    const hwid = document.getElementById('hwid');
    const findHwid = document.getElementById('findHwid');

    const assetSearch = document.getElementById('assetSearch');
    const findAsset = document.getElementById('findAsset');

    const resultArea = document.getElementById("result_area");

    hwid.addEventListener('keydown', e => { if (e.key === 'Enter') findHwid.click(); });
    assetSearch.addEventListener('keydown', e => { if (e.key === 'Enter') findAsset.click(); });

    findHwid.addEventListener('click', () => {
        const id = hwid.value.trim();
        if (!id) return;
        resultArea.innerHTML = "";
        query(`/api/Bike/getByDeviceId/${id}`);
    });

    findAsset.addEventListener('click', () => {
        const no = assetSearch.value.trim();
        if (!no) return;
        resultArea.innerHTML = "";
        query(`/api/bike/getByAssetNo/${no}`);
    });
});

async function query(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status == 1) {
                data.data.forEach(v => renderRow(v));
            } else {
                showToast(data.data || '查無資料', 'error');
            }
        })
        .catch(() => showToast('查詢失敗', 'error'));
}

function renderRow(row) {
    const resultArea = document.getElementById("result_area");

    addRow("bike_no（16進制）", row.bike_no, resultArea);
    addRow("asset_no（外觀車號）", row.asset_no, resultArea);
    addRow("device_id（車機序號）", row.device_id, resultArea);
}

function addRow(label, value, container) {
    const row = document.createElement("div");
    row.className = "result-row";
    row.onclick = () => copyText(value);

    row.innerHTML = `
        <div class="result-label">${label}</div>
        <div class="result-text">${value || ''}</div>
    `;

    container.appendChild(row);
}

function copyText(text) {
    if (!text) return;
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
    toast.style.background = type === "success"
        ? "rgba(46,160,67,0.95)"
        : "rgba(218,54,51,0.95)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = 99999;
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = "1");

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
