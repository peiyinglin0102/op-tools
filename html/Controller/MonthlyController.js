import dotenv from 'dotenv';

dotenv.config();

export default class MonthlyController {
    static async getByAccount(req, res) {
        try {
            const { account } = req.params;

            if (!account) {
                return res.json({ status: "0", data: "請填入帳號" });
            }

            const query = { phone: { $eq: account } };
            const options = {
            };
            const documents = await req.db.collection('voucher').find(query, options).toArray();

            console.log("query", query);
            console.log("documents", documents);


            if (!documents.length > 0) {
                return res.json({ status: "0", data: "<span style=\"color: red;\">❌沒有找到東西</span>" });
            }

            res.json({ status: "1", data: documents });
        } catch (error) {
            console.error("❌ Error:", error);
            res.status(500).json({ status: "0", error: "Query failed" });
        }
    }
}
