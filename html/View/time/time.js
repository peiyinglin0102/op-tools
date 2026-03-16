document.addEventListener('DOMContentLoaded', async () => {
    const unixTime = document.getElementById('unix_time_value');
    const epochTime = document.getElementById('epoch_time_value');
    const epochTimeChangeStart = document.getElementById('epoch_time_value_change_start');
    const epochTimeChangeLast = document.getElementById('epoch_time_value_change_last');
    const startChangeUnix = document.getElementById('start_change_unix');
    const startChangeEpoch = document.getElementById('start_change_epoch');

    const fareInput = document.getElementById('fare_product_expire_date_value');
    const fareBtn = document.getElementById('fare_change_btn');

    epochTime.value = getFormattedTime();

    startChangeUnix.addEventListener('click', () => {
        const v = unixTime.value.trim();
        if (!v) return;
        document.getElementById('UnixFormattedDate')
            .insertAdjacentElement("afterend", addRow([v, changeUnixTime(v)]));
    });

    startChangeEpoch.addEventListener('click', () => {
        const v = epochTime.value.trim();
        const r = changeEpochTime(v);
        document.getElementById('epochFormattedDate')
            .insertAdjacentElement("afterend", addRow([v, r === -1 ? "錯誤" : r]));
    });

    epochTimeChangeStart.onclick = () => epochTime.value = setToEndOfDay(epochTime.value, "start");
    epochTimeChangeLast.onclick = () => epochTime.value = setToEndOfDay(epochTime.value, "last");

    fareBtn.addEventListener('click', () => {
        const v = fareInput.value.trim();
        if (!v) return;
        document.getElementById('FareFormattedDate')
            .insertAdjacentElement("afterend", addRow([v, transferDosDateToDate(v)]));
    });

unixTime.onkeydown = (e) => {
  if (e.key === 'Enter') startChangeUnix.click();
};

epochTime.onkeydown = (e) => {
  if (e.key === 'Enter') startChangeEpoch.click();
};

});

/* ===== 原本工具函式（不動） ===== */
function getFormattedTime() {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function setToEndOfDay(str, m) {
    const a = str.match(/\d+/g); if (!a) return str;
    return `${a[0]}-${a[1]}-${a[2]} ${m==="start"?"00:00:00":"23:59:59"}`;
}
function changeUnixTime(v) {
    const d = new Date(v * 1000);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function changeEpochTime(v) {
    const a = v.match(/\d+/g); if (!a || a.length !== 6) return -1;
    return Math.floor(new Date(a[0], a[1]-1, a[2], a[3], a[4], a[5]).getTime()/1000);
}
function transferDosDateToDate(h) {
    const n = parseInt(h,16);
    return `${1980+(n>>9)}-${pad((n>>5)&0xf)}-${pad(n&0x1f)}`;
}
function pad(n){return String(n).padStart(2,'0');}

/* ===== 表格列 ===== */
function addRow(values){
    const tr=document.createElement("tr");
    values.forEach(v=>{
        const td=document.createElement("td");
        td.textContent=v;
        bindTdCopy(td);
        tr.appendChild(td);
    });
    const td=document.createElement("td");
    const b=document.createElement("button");
    b.className="btn-del";
    b.textContent="移除";
    b.onclick=()=>tr.remove();
    td.appendChild(b);
    tr.appendChild(td);
    return tr;
}

/* ===== 複製（與 monthly 完全一致） ===== */
function bindTdCopy(td){
    td.addEventListener("click",e=>{
        e.stopPropagation();
        if(!td.innerText) return;
        navigator.clipboard.writeText(td.innerText)
            .then(()=>showToast("已複製到剪貼簿","success"))
            .catch(()=>showToast("複製失敗","error"));
    });
}

function showToast(msg,type){
    const t=document.createElement("div");
    t.innerText=msg;
    t.style.cssText=`
        position:fixed;bottom:30px;right:30px;
        background:${type==="success"?"rgba(46,160,67,.95)":"rgba(218,54,51,.95)"};
        color:#fff;padding:12px 20px;border-radius:8px;
        font-size:15px;font-weight:600;z-index:99999;
        box-shadow:0 6px 20px rgba(0,0,0,.4);
        opacity:0;transition:.3s;transform:translateY(10px)`;
    document.body.appendChild(t);
    requestAnimationFrame(()=>{t.style.opacity=1;t.style.transform="translateY(0)"});
    setTimeout(()=>{t.style.opacity=0;t.style.transform="translateY(10px)";setTimeout(()=>t.remove(),300)},2500);
}
