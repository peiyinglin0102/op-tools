// C:\Users\winnie.lin\Desktop\tool2.0\html\start.js
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';
import express from 'express';

import HomeController from './Controller/HomeController.js';
import TypeController from './Controller/TypeController.js';
import BikeController from './Controller/BikeController.js';
import CardController from './Controller/CardController.js';
import JsonController from './Controller/JsonController.js';
import CoreApiController from './Controller/CoreApiController.js';
import MonthlyController from './Controller/MonthlyController.js';
import TempCardController from './Controller/TempCardController.js';
import BikeTransactionController from './Controller/BikeTransactionController.js';
import BatteryController from './Controller/BatteryController.js';
import gmailApi from './gmail/api.js';
import OpCannedController from './Controller/OpCannedController.js';
import { BackendApiLog } from './Middleware/BackendApiLogMiddleware.js';
import { connectToCoreDatabase } from './Middleware/CoredbMiddleware.js';
import { connectToAuthDatabase } from './Middleware/AuthdbMiddleware.js';

// 專案根目錄偵測：最後要回傳「包含 html/ 的那一層」
function getProjectRoot() {
  const cwd = process.cwd();

  // 如果目前目錄下就有 html/View，代表 cwd 已經是專案根目錄
  if (fs.existsSync(path.join(cwd, 'html', 'View'))) return cwd;

  // 如果目前目錄下有 View + Controller，代表 cwd 是 html/，專案根目錄在上一層
  if (fs.existsSync(path.join(cwd, 'View')) && fs.existsSync(path.join(cwd, 'Controller'))) {
    return path.resolve(cwd, '..');
  }

  // 兜底
  return cwd;
}

const rootDir = getProjectRoot();

// 讀環境變數（.env）
dotenv.config();
const protocol = process.env.PROTOCOL || 'https';
const port = process.env.PORT || 80;
const proxyPort = process.env.PROXYPORT || 443;
const domain = process.env.DOMAIN || 'localhost';

// 建立 Express app
const app = express();

const logFilePath = process.env.LOGFILENAME || 'logs';

// ===============================
// Log 設定
// ===============================
const logDir = path.join(rootDir, logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' });

morgan.token('timestamp', () => new Date().toISOString());

// HTTP 請求紀錄
app.use(
    morgan(':remote-addr - :method :url :status :response-time ms', {
        stream: accessLogStream
    })
);

// 讓 Express 讀得懂 JSON body（一定要放在 API 前面）
app.use(express.json());

// ===============================
// 靜態檔案
// ===============================

// /public → 靜態檔案（icon、圖片、JS、CSS 等）
app.use('/public', express.static(path.join(rootDir, 'Public')));

// 靜態 View（單純 HTML 頁面）
app.use(express.static(path.join(rootDir, 'html', 'View')));

// ===============================
// 首頁：導到 dashboard（有 header + footer 的那種）
// ===============================
app.get('/', (req, res) => {
    req.params.pageName = 'dashboard';
    return HomeController.home(req, res);
});
app.get('/dashbord', (req, res) => {
    req.params.pageName = 'dashboard';
    return HomeController.home(req, res);
});

// 共用：其他頁面（/logParser, /opcanned, /time ...）
app.get('/:pageName', HomeController.home);

// Gmail API
app.use('/api/gmail', gmailApi);

// ===============================
// 轉發到 Core / Auth DB 的 API
// ===============================

app.get('/api/bike/getByAssetNo/:assetNo', connectToCoreDatabase, BikeController.getByAssetNo);

app.delete(
    '/core2del/:card_type/:card_no',
    BackendApiLog('外部 api 請求(刪卡)'),
    CoreApiController.callCoreTwoDelApi
);

app.get(
    '/api/type/getallcardtype',
    BackendApiLog('api 查詢(所有 card type)'),
    connectToCoreDatabase,
    TypeController.getAllCardType
);

app.get(
    '/api/Temp/getfindTemp/:card_no',
    BackendApiLog('api 查詢(9970)'),
    connectToCoreDatabase,
    TempCardController.findTempCard
);

app.get(
    '/api/Monthly/getByAccount/:account',
    BackendApiLog('api 查詢(MeN-Go 月票)'),
    connectToAuthDatabase,
    MonthlyController.getByAccount
);

app.get(
    '/api/Bike/getByDeviceId/:deviceId',
    BackendApiLog('api 查詢(外觀車號)'),
    connectToCoreDatabase,
    BikeController.getByDeviceId
);

app.get(
    '/api/Card/getByCardNo/:cardNo',
    BackendApiLog('api 卡號 - 查詢卡片資訊)'),
    connectToCoreDatabase,
    CardController.getByCardNo
);

app.get(
    '/api/Card/getByBankCardNo/:bankCardNo',
    BackendApiLog('api 前六後四 - 查詢卡號'),
    connectToCoreDatabase,
    CardController.getByBankCardNo
);

app.get(
    '/api/Transaction/getByTransactionId/:bikeTransactionIdx',
    BackendApiLog('查詢訂單交易紀錄'),
    connectToCoreDatabase,
    BikeTransactionController.getByTransactionId
);

// API Log Parser 頁面
app.get('/apiLogParser', (req, res) => {
    res.sendFile(path.join(rootDir, 'html', 'View', 'apiLogParser', 'apiLogParser.html'));
});
// LOG 時間排序工具 頁面
app.get('/logTimeSort', (req, res) => {
    res.sendFile(path.join(rootDir, 'html', 'View', 'logTimeSort', 'logTimeSort.html'));
});
// 清分檔整合工具 crMerge 頁面（原本少了 html 資料夾）
app.get('/crMerge', (req, res) => {
    res.sendFile(path.join(rootDir, 'html', 'View', 'crMerge', 'crMerge.html'));
});

// 電池相關 API
app.use('/api/bike', connectToCoreDatabase, BatteryController);

// ===============================
// Json 靜態代碼 API + CRUD
// ===============================
app.get('/api/Json/getAppErrCode/', BackendApiLog('api 靜態 err code'), JsonController.getAppErrCode);
app.get('/api/Json/getEcc1512Code/', BackendApiLog('api 靜態 ecc 1512 code'), JsonController.getEcc1512Code);
app.post('/api/Json/ecc1512/add', JsonController.addEcc1512Code);
app.put('/api/Json/ecc1512/update/:code', JsonController.updateEcc1512Code);
app.delete('/api/Json/ecc1512/delete/:code', JsonController.deleteEcc1512Code);

app.get('/api/Json/getIpass1512Code/', BackendApiLog('api 靜態 ipass 1512 code'), JsonController.getIpass1512Code);

// iPass 1512 CRUD
app.post('/api/Json/ipass1512/add', JsonController.addIpass1512Code);
app.put('/api/Json/ipass1512/update/:code', JsonController.updateIpass1512Code);
app.delete('/api/Json/ipass1512/delete/:code', JsonController.deleteIpass1512Code);

// App Error Code CRUD
app.post('/api/Json/app_err/add', JsonController.addAppErrCode);
app.put('/api/Json/app_err/update/:code', JsonController.updateAppErrCode);
app.delete('/api/Json/app_err/delete/:code', JsonController.deleteAppErrCode);

// ===============================
// OP 罐頭工廠 API（JSON 檔 CRUD）
// ===============================

// 取得全部（分類＋罐頭）
app.get('/api/opcanned', OpCannedController.getAll);

// 分類 CRUD
app.post('/api/opcanned/categories', OpCannedController.addCategory);
app.put('/api/opcanned/categories/:categoryId', OpCannedController.updateCategory);
app.delete('/api/opcanned/categories/:categoryId', OpCannedController.deleteCategory);

// 罐頭 Item CRUD
app.post('/api/opcanned/items', OpCannedController.addItem);
app.put('/api/opcanned/items/:itemId', OpCannedController.updateItem);
app.delete('/api/opcanned/items/:itemId', OpCannedController.deleteItem);

// （如果你真的要保留舊版路由，可以在這裡額外做相容處理）
// app.post('/api/opcanned/add', OpCannedController.addItem);
// app.put('/api/opcanned/update', OpCannedController.updateItem);
// app.delete('/api/opcanned/delete', OpCannedController.deleteItem);

// ===============================
// 測試 API
// ===============================
app.get('/test/getping', (req, res) => {
    console.log('test api get');
    res.json({ status: 'ok' });
});

app.post('/test/getping', (req, res) => {
    console.log('test api post');
    res.json({ status: '' });
});

// 404
app.use((req, res) => {
    res.status(404).send('404 ˋˊ');
});

app.listen(port, () => {
    console.log(`開啟於：http://localhost:${port}`);
});
