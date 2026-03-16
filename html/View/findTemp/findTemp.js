document.addEventListener('DOMContentLoaded', async () => {
    const cardNoElement = document.getElementById('card_no');
    const findElement = document.getElementById('find');
    const form = document.getElementById('cards-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
    });

    cardNoElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter'){
            findElement.click();
        }
    })

    findElement.addEventListener('click', async (event) => {
        const card_no = document.getElementById('card_no').value;
        const url = `/api/Temp/getfindTemp/${card_no}`;

        await fetch(url, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            return response.json();
        }).then(data => {
            if (data.status == 1) {
                const changeCardNoElement = document.getElementById("change_card_no");
                const changeCardStatus = document.getElementById("change_card_status");

                this.changeTable(card_no, changeCardNoElement);
                this.changeTable(data.data, changeCardStatus);
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

function changeTable(newValue, changeElement) {
    console.log(newValue);
    changeElement.innerHTML = newValue;
}
