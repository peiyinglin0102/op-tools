//Node.js 去連接 MongoDB 資料
import dotenv from 'dotenv';
//dotenv：幫你讀 .env 檔，裡面放機密設定（例如資料庫密碼、伺服器 IP）
import { MongoClient } from 'mongodb';
//mongodb：MongoDB 官方提供的連線工具，可以讓你用 JavaScript 操作資料庫
dotenv.config();
console.log("連接主機：", process.env.IP, process.env.PORT);
//啟用 dotenv，讓 .env 檔的內容變成 process.env 變數。
//比喻：就像在 Flask 裡 os.environ.get("PORT") 一樣。
const uri = `mongodb://mpadmin:mp%4023692699@192.168.101.101:30000/admin`;
//連接 MongoDB 的網址（URI），裡面會包含帳號、密碼與資料庫伺服器位置
const client = new MongoClient(uri);
//建立一個 MongoDB 客戶端物件。像拿出一支電話準備打給資料庫。
const session = client.startSession();
//開啟一個「會話（session）」，你可以在這裡面進行交易（transaction）。
// const uri = `mongodb://mpadmin:mp%4023692699@${process.env.IP}:${process.env.PORT}/admin?3t.uriVersion=3&3t.connectTimeout=10000&3t.connection.name=2.0_Dev&3t.databases=admin&3t.connectionMode=direct&3t.proxyType=default&3t.proxyHost=&3t.proxyPort=&readPreference=primary&3t.proxyProtocol=&3t.socketTimeout=0`;

try {
    session.startTransaction();
    await client.connect();
    console.log("連接 DB 成功");
    // const database = client.db('sample_mflix');
    // const Collections = client.collection('Collections');
    const database = client.db('core');
    const Collections = database.collection('cards');
    // console.log("設定連接 資料表? ");
    
    // const query = { username: "Luke" };
    const findOne = await Collections.findOne({ card_no: "90222222216666654321" })
    console.log("find one", findOne);
 //驗證「連線是否真的成功」
} catch (error) {
    console.log("連接 DB 錯誤", error);
} finally {
    console.log("DB 斷開連接");
    await client.close();
}




