import dotenv from 'dotenv';

dotenv.config();

export default class TypeController {
    static async getAllCardType(req, res) {
        try {
            const query = { card_name: { $ne: "" } };
            const options = {
                sort: { card_type: 1 },
                projection: { card_type: 1, card_name: 1, _id: 0 },
            };
            const cardTypeName = await req.db.collection('card_type').find(query, options).toArray();

            if (!cardTypeName.length > 0) {
                res.json({ status: '0', data: "找不到資料" });
            }

            res.json({ status: '1', data: cardTypeName });
        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ status: "0", error: "Query failed" });
        }
    }

}
