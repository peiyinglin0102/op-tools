document.addEventListener('DOMContentLoaded', async () => {
    const eccCR = document.getElementById('cr_value');
    let eccCRValue = null;

    eccCR.addEventListener('change', () => {
        let nowLength = 0;
        eccCRValue = document.getElementById('cr_value').value;

        if (eccCRValue != null && eccCRValue != "") {
            addOption(nowLength, nowLength += 16, 'a1', 1);
            addOption(nowLength, nowLength += 2, 'a2');
            addOption(nowLength, nowLength += 2, 'a3');
            addOption(nowLength, nowLength += 16, 'a4');
            addOption(nowLength, nowLength += 6, 'a5');
            addOption(nowLength, nowLength += 2, 'a6');
            addOption(nowLength, nowLength += 2, 'a7');
            addOption(nowLength, nowLength += 8, 'a8');
            addOption(nowLength, nowLength += 12, 'a9');
            addOption(nowLength, nowLength += 2, 'a10');
            addOption(nowLength, nowLength += 6, 'a11');
            addOption(nowLength, nowLength += 2, 'a12');
            addOption(nowLength, nowLength += 4, 'a13');
            addOption(nowLength, nowLength += 2, 'a14');
            addOption(nowLength, nowLength += 2, 'a15');
            addOption(nowLength, nowLength += 2, 'a16');
            addOption(nowLength, nowLength += 2, 'a17');
            addOption(nowLength, nowLength += 4, 'a18');
            addOption(nowLength, nowLength += 6, 'a19', 1);
            addOption(nowLength, nowLength += 6, 'a20');
            addOption(nowLength, nowLength += 2, 'a21');
            addOption(nowLength, nowLength += 6, 'a22', 1);
            addOption(nowLength, nowLength += 2, 'a23');
            addOption(nowLength, nowLength += 4, 'a24');
            addOption(nowLength, nowLength += 66, 'a25');
            addOption(nowLength, nowLength += 2, 'a26');
            addOption(nowLength, nowLength += 6, 'a27');
            addOption(nowLength, nowLength += 6, 'a28', 1);
            addOption(nowLength, nowLength += 32, 'a29');
            addOption(nowLength, nowLength += 16, 'a30');
            addOption(nowLength, nowLength += 32, 'a31');
            addOption(nowLength, nowLength += 2, 'a32');
            addOption(nowLength, nowLength += 2, 'a33');
            addOption(nowLength, nowLength += 8, 'a34');
            addOption(nowLength, nowLength += 2, 'a35');
            addOption(nowLength, nowLength += 10, 'a36');
            addOption(nowLength, nowLength += 6, 'a37');
            addOption(nowLength, nowLength += 2, 'a38');
            addOption(nowLength, nowLength += 2, 'a39');
            addOption(nowLength, nowLength += 10, 'a40');
            addOption(nowLength, nowLength += 6, 'a41');
            addOption(nowLength, nowLength += 8, 'a42');
            addOption(nowLength, nowLength += 4, 'a43');
            addOption(nowLength, nowLength += 2, 'a44');
            addOption(nowLength, nowLength += 2, 'a45');
            addOption(nowLength, nowLength += 4, 'a46');
            addOption(nowLength, nowLength += 4, 'a47');
            addOption(nowLength, nowLength += 4, 'a48');
            addOption(nowLength, nowLength += 4, 'a49');
            addOption(nowLength, nowLength += 10, 'a50');
            addOption(nowLength, nowLength += 2, 'a51');
        }
    })

    function addOption(start, length, elementId, type = 0) {
        try {
            const element = document.getElementById(elementId);
            // console.log('eccCRValue', eccCRValue);

            let text = "";
            for (let i = start; i < length; i++) {
                // console.log("eccCRValue[i]", eccCRValue[i]);

                text += eccCRValue[i] || "";
            }

            if (type != 0) {
                element.textContent = loadType(text);
            } else {
                element.innerHTML = '<p>' + text + '</p>';
            }

            // console.log('text', text);

            return 1;
        } catch (error) {
            return 0;
        }
    }

    // function loadType(text, type) {
    //     let data = 0;
    //     switch (type) {
    //         case 1:
    //             const newText = text[4] + text[5] + text[2] + text[3] + text[0] + text[1];
    //             // hex to decimal
    //             data = parseInt(newText, 16);

    //             break;
    //         default:
    //             break;
    //     }
    //     return text + ' / ' + data;
    // }

    function loadType(hexStr) {
        console.log("hexStr", hexStr);

        let swapped = "";
        for (let i = 0; i < hexStr.length; i += 2) {
            swapped = hexStr[i] + hexStr[i + 1] + swapped;
            console.log(`swapped ${i}`, swapped);
        }

        data = parseInt(swapped, 16);
        return hexStr + ' / ' + data;
    }

})
