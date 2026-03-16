document.addEventListener('DOMContentLoaded', () => {
    const hashCode = document.getElementById('hach_code_value');
    const dataCardNo = document.getElementById('data_cardno');
    const usrCardno = document.getElementById('usr_cardno');

    let hashCodeValue = null;

    /* Enter 直接觸發 */
    hashCode.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            generatePath();
        }
    });

    /* 點擊產生 */
    document.querySelector('.btn-primary').addEventListener('click', generatePath);

    function generatePath() {
        hashCodeValue = hashCode.value.trim();
        if (!hashCodeValue) return;

        addOption("/data/local/lifeplus/db/cloud/cardno", 'data_cardno', 1);
        addOption("/usr/local/lifeplus/db/cardno", 'usr_cardno');
    }

    /* 單格點擊複製（完全比照 monthly） */
    [dataCardNo, usrCardno].forEach(td => {
        td.addEventListener('click', e => {
            e.stopPropagation();
            if (!td.textContent) return;
            navigator.clipboard.writeText(td.textContent)
                .then(() => showToast("已複製到剪貼簿", "success"))
                .catch(() => showToast("複製失敗", "error"));
        });
    });

    function addOption(path, elementId, data = 0) {
        try {
            if (!hashCodeValue || hashCodeValue.length < 6) return;

            let text = `less ${path}`;
            text += "/" + hashCodeValue[2] + hashCodeValue[3];
            text += "/" + hashCodeValue[0] + hashCodeValue[1];
            text += "/" + hashCodeValue[4] + hashCodeValue[5];

            if (data === 1) {
                text += hashCodeValue[6] + ".card.db";
            }

            document.getElementById(elementId).textContent = text;
        } catch (err) {
            console.error(err);
        }
    }
});

/* ===============================
   ⭐ Toast（與 monthly / battery 共用）
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
