document.addEventListener('DOMContentLoaded', () => {
    const inputA = document.getElementById('inputA');
    const inputB = document.getElementById('inputB');
    const inputC = document.getElementById('inputC');

    const outputAOnly   = document.getElementById('outputAOnly');
    const outputBOnly   = document.getElementById('outputBOnly');
    const outputCUnique = document.getElementById('outputCUnique');

    // 上面統計
    const countA    = document.getElementById('countA');
    const countB    = document.getElementById('countB');
    const countC    = document.getElementById('countC');
    const countDiff = document.getElementById('countDiff');

    // 每欄內的右上角小數字
    const countALocal  = document.getElementById('countALocal');
    const countBLocal  = document.getElementById('countBLocal');
    const countCLocal  = document.getElementById('countCLocal');
    const countAOnly   = document.getElementById('countAOnly');
    const countBOnly   = document.getElementById('countBOnly');
    const countCUnique = document.getElementById('countCUnique');

    const ignoreCaseCheckbox = document.getElementById('ignoreCase');
    let ignoreCase = ignoreCaseCheckbox.checked;

    function parseLines(text) {
        return text
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    }

    function normalize(str) {
        return ignoreCase ? str.toLowerCase() : str;
    }

    function recompute() {
        const listA = parseLines(inputA.value);
        const listB = parseLines(inputB.value);
        const listC = parseLines(inputC.value);

        const normA = listA.map(normalize);
        const normB = listB.map(normalize);
        const normC = listC.map(normalize);

        // A 有 B 沒有
        const aOnly = [];
        normA.forEach((val, idx) => {
            if (!normB.includes(val)) {
                aOnly.push(listA[idx]); // 保留原樣
            }
        });

        // B 有 A 沒有
        const bOnly = [];
        normB.forEach((val, idx) => {
            if (!normA.includes(val)) {
                bOnly.push(listB[idx]);
            }
        });

        // C 去重（保留第一次）
        const cUnique = [];
        const seen = new Set();
        normC.forEach((val, idx) => {
            if (!seen.has(val)) {
                seen.add(val);
                cUnique.push(listC[idx]);
            }
        });

        // 更新統計
        countA.textContent = listA.length;
        countB.textContent = listB.length;
        countC.textContent = listC.length;
        countDiff.textContent = aOnly.length + bOnly.length;

        countALocal.textContent  = listA.length;
        countBLocal.textContent  = listB.length;
        countCLocal.textContent  = listC.length;
        countAOnly.textContent   = aOnly.length;
        countBOnly.textContent   = bOnly.length;
        countCUnique.textContent = cUnique.length;

        // 更新結果
        outputAOnly.value   = aOnly.join('\n');
        outputBOnly.value   = bOnly.join('\n');
        outputCUnique.value = cUnique.join('\n');
    }

    // 監聽輸入
    inputA.addEventListener('input', recompute);
    inputB.addEventListener('input', recompute);
    inputC.addEventListener('input', recompute);

    // 大小寫切換
    ignoreCaseCheckbox.addEventListener('change', () => {
        ignoreCase = ignoreCaseCheckbox.checked;
        recompute();
    });

    // 複製按鈕（沿用 time 的 showToast UX）
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const el = document.getElementById(targetId);
            if (!el) return;

            const text = el.value.trim();
            if (!text) {
                showToast('沒有可複製的內容', 'error');
                return;
            }

            navigator.clipboard.writeText(text)
                .then(() => showToast('已複製到剪貼簿', 'success'))
                .catch(() => showToast('複製失敗', 'error'));
        });
    });
});

/* ===== Toast（跟 time.js 一樣風格） ===== */
function showToast(msg, type){
    const t = document.createElement('div');
    t.innerText = msg;
    t.style.cssText = `
        position:fixed;bottom:30px;right:30px;
        background:${type==="success"?"rgba(46,160,67,.95)":"rgba(218,54,51,.95)"};
        color:#fff;padding:12px 20px;border-radius:8px;
        font-size:15px;font-weight:600;z-index:99999;
        box-shadow:0 6px 20px rgba(0,0,0,.4);
        opacity:0;transition:.3s;transform:translateY(10px)`;
    document.body.appendChild(t);
    requestAnimationFrame(()=>{
        t.style.opacity = 1;
        t.style.transform = "translateY(0)";
    });
    setTimeout(()=>{
        t.style.opacity = 0;
        t.style.transform = "translateY(10px)";
        setTimeout(()=>t.remove(),300);
    },2500);
}
