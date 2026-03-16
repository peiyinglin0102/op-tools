import express from 'express';
import {
  getGmailCountByQuery,
  buildMonthQuery,
  buildWeekQuery,
  buildTodayQuery
} from './service.js';

const router = express.Router();

router.get('/count', async (req, res) => {
  try {
    const range = req.query.range === 'week' ? 'week' : 'month';
    const builder = range === 'week' ? buildWeekQuery : buildMonthQuery;

    const data = {
      money: await getGmailCountByQuery(builder('叫修/扣款異常')),
      battery: await getGmailCountByQuery(builder('叫修/電池空值')),
      error:   await getGmailCountByQuery(builder('叫修/移轉')),
      lost:    await getGmailCountByQuery(builder('叫修/紀錄遺失')),
      today:   await getGmailCountByQuery(buildTodayQuery('叫修/案件')),
    };

    res.json({ status: 1, range, data });
  } catch (e) {
    res.status(500).json({ status: 0, msg: e.message });
  }
});

/* ✅ 這一行一定要有 */
export default router;
