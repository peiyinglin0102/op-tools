import authorize from './auth.js';
import { google } from 'googleapis';

/* 計算 threads（案件數） */
async function countThreads(query) {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  let count = 0;
  let pageToken;

  do {
    const res = await gmail.users.threads.list({
      userId: 'me',
      q: query,
      pageToken,
      maxResults: 500,
    });

    count += res.data.threads?.length || 0;
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return count;
}

/* 工具：轉 YYYY/MM/DD */
function fmt(d) {
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

/* 本月（1 號 → 今天） */
export function buildMonthQuery(label) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return `label:"${label}" after:${fmt(start)} before:${fmt(end)}`;
}

/* 本週（週一 → 今天） */
export function buildWeekQuery(label) {
  const now = new Date();
  const day = now.getDay(); // 0=日
  const diff = day === 0 ? 6 : day - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);

  const end = new Date(now);
  end.setDate(now.getDate() + 1);

  return `label:"${label}" after:${fmt(monday)} before:${fmt(end)}`;
}

/* 今日 */
export function buildTodayQuery(label) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return `label:"${label}" after:${fmt(today)} before:${fmt(tomorrow)}`;
}

export async function getGmailCountByQuery(query) {
  return await countThreads(query);
}
