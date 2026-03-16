document.addEventListener('DOMContentLoaded', async () => {
    const bankCardNoElement = document.getElementById('bank_card_no');
    const findElement = document.getElementById('find');

    bankCardNoElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            findElement.click();
        }
    })

    findElement.addEventListener('click', async (event) => {
        const bankCardNo = document.getElementById('bank_card_no').value;
        const url = `/api/Card/getByBankCardNo/${bankCardNo}`;

        const targetElement = document.getElementById("tableElement");
        removeNextSiblings(targetElement);

        await fetch(url, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            return response.json();
        }).then(data => {
            console.log("data", data);
            if (data.status == 1) {
                data.data.forEach((newValue) => {
                    this.addTable(newValue, targetElement);
                    // this.addTable(newData._start_time, 0);
                    // this.addTable(newData.create_date, 1);
                    // this.addTable(newData._end_time, 0);
                })
            } else if (data.status == 0) {
                console.log(data.data);
            } else {
                alert('未知錯誤');
            }
        }).catch((err) => {
            console.log("core2del", err);
        })
    });
})

function removeNextSiblings(element) {
    while (element.nextElementSibling) {
        element.nextElementSibling.remove();
    }
}

function addTable(newValue, tableElement) {
    console.log(newValue);

    const newtr = this.createTrElement('tr', newValue);

    tableElement.insertAdjacentElement("afterend", newtr);
}

function createTrElement(ElementType, newValue) {
    const fullElement = document.createElement(ElementType);

    // const createAtElement = this.createTdElement(newValue._id, 3);
    const cardNoElement = this.createTdElement(newValue.card_no);
    const memIdElement = this.createTdElement(newValue.mem_id);

    fullElement.appendChild(cardNoElement);
    fullElement.appendChild(memIdElement);

    return fullElement
}

function createTdElement(newValue) {
    const tdValue = document.createElement('td');
    if (!newValue) {
        newValue = "無資料";
    }
    tdValue.textContent = newValue;

    return tdValue;
}
