import dotenv from 'dotenv';
dotenv.config();

/**
 * BikeTransactionController
 * 職責：查詢 bike_transaction 交易紀錄
 * Collection：bike_transaction
 */
export default class BikeTransactionController {

    /**
     * 依訂單號查詢交易紀錄
     * GET /api/Transaction/getByTransactionId/:bikeTransactionIdx
     */
    static async getByTransactionId(req, res) {
        try {
            const { bikeTransactionIdx } = req.params;

            if (!bikeTransactionIdx) {
                return res.json({
                    status: "0",
                    data: "請輸入訂單號"
                });
            }

            // 1️⃣ 查主交易
            const mainDocs = await req.db
                .collection('bike_transaction')
                .find({ trans_idx: bikeTransactionIdx })
                .toArray();

            if (mainDocs.length === 0) {
                return res.json({
                    status: "0",
                    data: "<span style='color:red;'>❌沒有找到交易紀錄</span>"
                });
            }

            const mainData = mainDocs[0];
            const assetNo = mainData.asset_no;

            // 2️⃣ 查同車號所有交易（依時間排序）
            const allDocs = await req.db
                .collection('bike_transaction')
                .find({ asset_no: assetNo })
                .sort({ rent_time: 1 })
                .toArray();

            let prev = null;
            let next = null;

            for (let i = 0; i < allDocs.length; i++) {
                if (allDocs[i].trans_idx === bikeTransactionIdx) {
                    if (i > 0) prev = allDocs[i - 1];
                    if (i < allDocs.length - 1) next = allDocs[i + 1];
                    break;
                }
            }

            return res.json({
                status: "1",
                data: {
                    main: mainData,
                    prev: prev,
                    next: next
                }
            });

        } catch (error) {
            console.error("❌ BikeTransactionController Error:", error);
            return res.status(500).json({
                status: "0",
                error: "Query failed"
            });
        }
    }
}
