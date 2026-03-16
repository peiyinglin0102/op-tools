import dotenv from 'dotenv';
dotenv.config();

/**
 * BikeController
 * 對應頁面：hwidFindBikeNo
 * Collection：bike
 */
export default class BikeController {

    /**
     * 依「車機序號 / HWID / device_id」查詢
     * GET /api/Bike/getByDeviceId/:deviceId
     */
    static async getByDeviceId(req, res) {
        try {
            const { deviceId } = req.params;

            if (!deviceId) {
                return res.json({
                    status: "0",
                    data: "請輸入車機序號"
                });
            }

            const query = { device_id: deviceId };
            const options = {
                projection: {
                    _id: 0,
                    bike_no: 1,
                    asset_no: 1,
                    device_id: 1
                }
            };

            const documents = await req.db
                .collection('bike')
                .find(query, options)
                .toArray();

            if (documents.length === 0) {
                return res.json({
                    status: "0",
                    data: "<span style='color:red;'>❌沒有找到東西</span>"
                });
            }

            return res.json({
                status: "1",
                data: documents   // ⚠️ 一定是陣列
            });

        } catch (error) {
            console.error("❌ BikeController.getByDeviceId Error:", error);
            return res.status(500).json({
                status: "0",
                error: "Query failed"
            });
        }
    }

    /**
     * 依「外觀車號 / asset_no」查詢
     * GET /api/bike/getByAssetNo/:assetNo
     */
    static async getByAssetNo(req, res) {
        try {
            const { assetNo } = req.params;

            if (!assetNo) {
                return res.json({
                    status: "0",
                    data: "請輸入外觀車號"
                });
            }

            const query = { asset_no: assetNo };
            const options = {
                projection: {
                    _id: 0,
                    bike_no: 1,
                    asset_no: 1,
                    device_id: 1
                }
            };

            const documents = await req.db
                .collection('bike')
                .find(query, options)
                .toArray();

            if (documents.length === 0) {
                return res.json({
                    status: "0",
                    data: "<span style='color:red;'>❌沒有找到東西</span>"
                });
            }

            return res.json({
                status: "1",
                data: documents   // ⚠️ 一定是陣列
            });

        } catch (error) {
            console.error("❌ BikeController.getByAssetNo Error:", error);
            return res.status(500).json({
                status: "0",
                error: "Query failed"
            });
        }
    }
}
