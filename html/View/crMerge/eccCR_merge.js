document.addEventListener('DOMContentLoaded', async () => {

    const eccInput = document.getElementById('cr_value_ecc');
    let raw = "";

    eccInput.addEventListener('change', () => {
        let now = 0;
        raw = eccInput.value;

        if (!raw) return;

        add(now, now+=16, "a1E", 1);
        add(now, now+=2, "a2E");
        add(now, now+=2, "a3E");
        add(now, now+=16, "a4E");
        add(now, now+=6, "a5E");
        add(now, now+=2, "a6E");
        add(now, now+=2, "a7E");
        add(now, now+=8, "a8E");
        add(now, now+=12, "a9E");
        add(now, now+=2, "a10E");
        add(now, now+=6, "a11E");
        add(now, now+=2, "a12E");
        add(now, now+=4, "a13E");
        add(now, now+=2, "a14E");
        add(now, now+=2, "a15E");
        add(now, now+=2, "a16E");
        add(now, now+=2, "a17E");
        add(now, now+=4, "a18E");
        add(now, now+=6, "a19E", 1);
        add(now, now+=6, "a20E");
        add(now, now+=2, "a21E");
        add(now, now+=6, "a22E", 1);
        add(now, now+=2, "a23E");
        add(now, now+=4, "a24E");
        add(now, now+=66, "a25E");
        add(now, now+=2, "a26E");
        add(now, now+=6, "a27E");
        add(now, now+=6, "a28E", 1);
        add(now, now+=32, "a29E");
        add(now, now+=16, "a30E");
        add(now, now+=32, "a31E");
        add(now, now+=2, "a32E");
        add(now, now+=2, "a33E");
        add(now, now+=8, "a34E");
        add(now, now+=2, "a35E");
        add(now, now+=10, "a36E");
        add(now, now+=6, "a37E");
        add(now, now+=2, "a38E");
        add(now, now+=2, "a39E");
        add(now, now+=10, "a40E");
        add(now, now+=6, "a41E");
        add(now, now+=8, "a42E");
        add(now, now+=4, "a43E");
        add(now, now+=2, "a44E");
        add(now, now+=2, "a45E");
        add(now, now+=4, "a46E");
        add(now, now+=4, "a47E");
        add(now, now+=4, "a48E");
        add(now, now+=4, "a49E");
        add(now, now+=10, "a50E");
        add(now, now+=2, "a51E");
    });

function add(start, end, id, type=0){
    const el = document.getElementById(id);
    if(!el) return;
    let text = raw.slice(start, end);
    el.textContent = type===1 ? showType(text) : text;
    bindCopy(el);
}

function showType(hex){
    let swapped="";
    for(let i=0;i<hex.length;i+=2){
        swapped = hex[i] + hex[i+1] + swapped;
    }
    return hex + " / " + parseInt(swapped,16);
}

function bindCopy(td){
    td.onclick = () => copyCellText(td.innerText);
}
});
function copyCellText(text){
    if(!text) return;
    navigator.clipboard.writeText(text)
        .then(()=>showToast("已複製到剪貼簿"))
        .catch(()=>showToast("複製失敗","error"));
}

function showToast(msg,type="success"){
    const t=document.createElement("div");
    t.innerText=msg;
    t.style.cssText=`
        position:fixed;bottom:30px;right:30px;
        background:${type==="success"?"rgba(46,160,67,.95)":"rgba(218,54,51,.95)"};
        color:#fff;padding:12px 20px;border-radius:8px;z-index:99999;opacity:0;transition:.3s`;
    document.body.appendChild(t);
    requestAnimationFrame(()=>t.style.opacity=1);
    setTimeout(()=>{t.style.opacity=0;setTimeout(()=>t.remove(),300)},2500);
}
