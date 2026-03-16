import dotenv from 'dotenv';

dotenv.config();

export default class TempCardController {
    static async findTempCard(req, res) {
        try {
            const { card_no } = req.params;

            const query = { card_no: { $eq: card_no } };
            const options = {
            };
            const documents = await req.db.collection('bike_transaction').find(query, options).toArray();

            if (!documents.length > 0) {
                return res.json({ status: "1", data: "<span style=\"color: red;\">❌沒有找到東西</span>" });
            }

            res.json({ status: "1", data: "有資料" });
        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ status: "0", error: "Query failed" });
        }
    }
}
