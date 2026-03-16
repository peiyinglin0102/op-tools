import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const rootDir = process.cwd();

dotenv.config();

const logFilePath = process.env.LOGFILENAME || "logs";
const logDir = path.join(rootDir, logFilePath);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const apiLogStream = fs.createWriteStream(path.join(logDir, 'apilog.log'), { flags: 'a' });

export const BackendApiLog = (logMessage = 'API accessed') => {
    return (req, res, next) => {
        const timestamp = new Date().toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            hour12: false
        });
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const logLine = `[${timestamp}] ${ip} - ${req.method} ${req.originalUrl} - ${logMessage}\n`;

        apiLogStream.write(logLine);
        next();
    };
};



















