document.addEventListener('DOMContentLoaded', async () => {
    const eccCR = document.getElementById('cr_value');
    let eccCRValue = null;

    eccCR.addEventListener('change', () => {
        let nowLength = 0;
        eccCRValue = document.getElementById('cr_value').value;

        if (eccCRValue != null && eccCRValue != "") {
            addOption(nowLength, nowLength += 8, 'a1');
            addOption(nowLength, nowLength += 24, 'a2');
            addOption(nowLength, nowLength += 8, 'a3');
            addOption(nowLength, nowLength += 8, 'a4');
            addOption(nowLength, nowLength += 8, 'a5');
            addOption(nowLength, nowLength += 8, 'a6');
            addOption(nowLength, nowLength += 12, 'a7');
            addOption(nowLength, nowLength += 8, 'a8');
            addOption(nowLength, nowLength += 2, 'a9');
            addOption(nowLength, nowLength += 4, 'a10');
            addOption(nowLength, nowLength += 4, 'a11');
            addOption(nowLength, nowLength += 2, 'a12');
            addOption(nowLength, nowLength += 2, 'a13');
            addOption(nowLength, nowLength += 8, 'a14');
            addOption(nowLength, nowLength += 2, 'a15');
            addOption(nowLength, nowLength += 8, 'a16');
            addOption(nowLength, nowLength += 2, 'a17');
            addOption(nowLength, nowLength += 2, 'a18');
            addOption(nowLength, nowLength += 2, 'a19');
            addOption(nowLength, nowLength += 2, 'a20');
            addOption(nowLength, nowLength += 2, 'a21');
            addOption(nowLength, nowLength += 8, 'a22');
            addOption(nowLength, nowLength += 2, 'a23');
            addOption(nowLength, nowLength += 2, 'a24');
            addOption(nowLength, nowLength += 4, 'a25');
            addOption(nowLength, nowLength += 8, 'a26');
            addOption(nowLength, nowLength += 2, 'a27');
            addOption(nowLength, nowLength += 4, 'a28');
            addOption(nowLength, nowLength += 4, 'a29');
            addOption(nowLength, nowLength += 4, 'a30');
            addOption(nowLength, nowLength += 2, 'a31');
            addOption(nowLength, nowLength += 8, 'a32');
            addOption(nowLength, nowLength += 2, 'a33');
            addOption(nowLength, nowLength += 2, 'a34');
            addOption(nowLength, nowLength += 8, 'a35');
            addOption(nowLength, nowLength += 4, 'a36');
            addOption(nowLength, nowLength += 16, 'a37');
            addOption(nowLength, nowLength += 8, 'a38');
            addOption(nowLength, nowLength += 112, 'a39');
            addOption(nowLength, nowLength += 2, 'a40');
            addOption(nowLength, nowLength += 10, 'a41');
            addOption(nowLength, nowLength += 10, 'a42');
            addOption(nowLength, nowLength += 10, 'a43');
            addOption(nowLength, nowLength += 8, 'a44');
            addOption(nowLength, nowLength += 2, 'a45');
        }
    })

    function addOption(start, length, elementId) {
        try {
            const element = document.getElementById(elementId);

            let text = "";
            for (let i = start; i < length; i++) {

                text += eccCRValue[i] || "";
            }

            element.textContent = text;

            return 1;
        } catch (error) {
            return 0;
        }
    }
})
