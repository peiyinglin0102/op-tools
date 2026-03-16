import dotenv from 'dotenv';

dotenv.config();

export default class BikeController {
    static async getByBankCardNo(req, res) {
        try {
            const { bankCardNo } = req.params;

            if (!bankCardNo) {
                return res.json({ status: "0", data: "前六後四不能為空" });
            }
            const bankCardNoSp = bankCardNo.split("-");

            if (bankCardNoSp.length < 2) {
                return res.json({ status: "0", data: "請填入正確前六後四" });
            }
            const query = { "card_type": "21", "card_info.bin_code": bankCardNoSp[0], "card_info.last_four": bankCardNoSp[1] }
            const options = {
                projection: { card_no: 1, mem_id: 1, _id: 0 },
            };
            const documents = await req.db.collection('cards').find(query, options).toArray();

            if (!documents.length > 0) {
                return res.json({ status: "0", data: "<span style=\"color: red;\">❌沒有找到東西</span>" });
            }

            res.json({ status: "1", data: documents });
        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ status: "0", error: "Query failed" });
        }
    }

    static async getByCardNo(req, res) {
        try {
            const { cardNo } = req.params;

            if (!cardNo) {
                return res.json({ status: 0, data: "卡號不能為空" });
            }

            const query = { "card_no": cardNo };
            const options = {};

            const documents = await req.db.collection('cards').find(query, options).toArray();

            if (!documents.length > 0) {
                return res.json({ status: 0, data: "❌沒有找到東西<" });
            }

            res.json({ status: 1, data: documents });
        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ status: 0, error: "Query failed" });
        }
    }
}
