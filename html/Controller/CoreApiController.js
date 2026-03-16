import dotenv from 'dotenv';

dotenv.config();

export default class CoreApiController {
    static async callCoreTwoDelApi(req, res) {
        const { card_type } = req.params;
        const { card_no } = req.params;

        const sid_token = process.env.CORE_SID_TOKEN;

        const data = new URLSearchParams();
        data.append('sid', sid_token);
        data.append('data', JSON.stringify({ card_type: card_type, card_id: card_no, cause: 2 }));

        console.log('card_type', card_type);
        console.log('card_no', card_no);

        const url = `https://${process.env.CORE_API_DOMAINNAME}/api/v3/cardinfodelete`;
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
        }).then(response => {
            return response.json();
        }).then(data => {
            console.log("res data", data);
            if (data.RetCode == 1) {
                return res.json({ status: 1 });
            } else {
                return res.json({ status: 0, message: data.RetVal });
            }
        }).catch(error => {
            console.log('error', error);
            return res.json({ status: 0, message: "API 錯誤" });
        })
    }
}
