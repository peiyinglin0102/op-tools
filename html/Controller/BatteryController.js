import express from 'express';
const router = express.Router();

// 這裡不用再 import coreDB，因為 MongoDB 的 DB 是從 req.db 取的

router.get('/battery', async (req, res) => {
    try {
        const assetNo = req.query.asset_no;

        if (!assetNo) {
            return res.status(400).json({ error: "asset_no is required" });
        }

        // MongoDB 查詢
        const query = { asset_no: assetNo };

        const result = await req.db
            .collection('bike')
            .findOne(query, { projection: { battery_id: 1, _id: 0 } });

        if (!result) {
            return res.json({ battery_id: null });
        }

        return res.json({ battery_id: result.battery_id });

    } catch (err) {
        console.error("GET /api/bike/battery ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
