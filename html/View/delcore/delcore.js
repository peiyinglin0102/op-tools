document.addEventListener('DOMContentLoaded', async () => {

    /* ============================
       1. 載入卡別下拉選單
    ============================ */
    try {
        let allCardType = await loadCardType();
        const cardTypeElement = document.getElementById('card_type');

        if (allCardType && allCardType.data) {
            allCardType.data.forEach(data => {
                addOption(data.card_type, data.card_name, cardTypeElement);
            });
        }
    } catch (error) {
        console.log('error', error);
    }

    /* ============================
       2. 刪卡按鈕行為
    ============================ */
    const delBtn = document.getElementById('del');

    delBtn.addEventListener('click', async () => {
        const confirmed = confirm('您確定要刪除此卡嗎？');

        if (!confirmed) return;

        const card_type = document.getElementById('card_type').value;
        const card_no = document.getElementById('card_no').value;
        const url = `/core2del/${card_type}/${card_no}`;

        try {
            const res = await fetch(url, {
                method: 'delete',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.status == 1) {
                alert('刪除完成');
            } else if (data.status == 0) {
                alert(data.message);
            } else {
                alert('未知錯誤');
            }
        } catch (err) {
            console.log("core2del", err);
        }
    });

    /* ============================
       3. 卡號搜尋功能
    ============================ */

    const searchInput = document.getElementById("searchCardNo");
    const outJsonElement = document.getElementById("outJson");
    const copyOutJson = document.getElementById("copy_out_json");

    searchInput.addEventListener('change', async () => {
        getTransactionFormIdx(searchInput.value, outJsonElement).then(data => {
            try {
                if (data.status == 0) throw new Error("API 失敗");
                if (data.data.status == 0) throw new Error("無資料");

                outJsonElement.value = JSON.stringify(data.data.data[0], null, 4);
            } catch (error) {
                alert(data.data.data);
            }
        });
    });

    copyOutJson.addEventListener('click', () => {
        copyClipboard(outJsonElement.value);
    });

})


/* ============================
   共用 Function 區
============================ */

async function loadCardType() {
    return fetch('/api/type/getallcardtype')
        .then(res => res.json())
        .catch(err => { console.log(err); return null; });
}

function addOption(value, item, cardTypeElement) {
    const op = document.createElement('option');
    op.textContent = item;
    op.value = value;
    cardTypeElement.appendChild(op);
}

async function getTransactionFormIdx(cardNo, outJsonElement) {
    const url = `/api/Card/getByCardNo/${cardNo}`;
    outJsonElement.value = "";

    return await fetch(url)
        .then(res => res.json())
        .then(data => ({ status: 1, data: data }))
        .catch(() => ({ status: 0, data: "" }));
}

function copyClipboard(content) {
    navigator.clipboard.writeText(content).then(() => {
        showText("已複製到剪貼簿 (*≧∀≦*)♡");
    });
}

function showText(text) {
    let tooltip = document.createElement("div");
    tooltip.textContent = text;
    tooltip.style.position = "fixed";
    tooltip.style.bottom = "20px";
    tooltip.style.right = "20px";
    tooltip.style.background = "rgba(0,0,0,0.7)";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "15px 25px";
    tooltip.style.borderRadius = "8px";
    tooltip.style.fontSize = "16px";
    tooltip.style.zIndex = "9999";
    tooltip.style.transition = "opacity 0.3s";

    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.style.opacity = "0";
        setTimeout(() => tooltip.remove(), 300);
    }, 1500);
}
