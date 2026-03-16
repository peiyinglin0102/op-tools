import dotenv from 'dotenv';
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.URI;
const dbName = process.env.CORE_DB_NAME;

// MongoDB 中間件
export const connectToCoreDatabase = async (req, res, next) => {
    try {
        if (!req.mongoClient) {
            const client = await MongoClient.connect(uri);
            req.mongoClient = client;

            console.log("✅ Connected to the database", dbName);
        }
        req.db = req.mongoClient?.db(dbName)

        next();
    } catch (error) {
        console.error("❌ Database connection error:", error);
        res.status(500).json({ status: "0", error: "Database connection failed" });
    }
};
