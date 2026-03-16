import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');

export default async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

  const oauthConfig = credentials.web || credentials.installed;
  if (!oauthConfig) throw new Error('client_secret.json 裡找不到 web 或 installed');

  const { client_secret, client_id, redirect_uris } = oauthConfig;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // ✅ 自動 refresh 後把新 token 寫回 token.json（重啟也能延續）
  oAuth2Client.on('tokens', (tokens) => {
    const old = fs.existsSync(TOKEN_PATH)
      ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'))
      : {};

    const merged = {
      ...old,
      ...tokens,
      // refresh 時可能不回 refresh_token，要保留舊的
      refresh_token: tokens.refresh_token || old.refresh_token,
    };

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
  });

  // 已授權過
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
    return oAuth2Client;
  }

  // 第一次 / 重新授權
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // ✅ 確保拿到 refresh_token（重授權時很重要）
    scope: SCOPES,
  });

  console.log('\n🔐 請到以下網址授權 Gmail：\n');
  console.log(authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const code = await new Promise(resolve => {
    rl.question('\n👉 貼上授權碼（網址列 code=... 那段）：', answer => {
      rl.close();
      resolve(answer.trim());
    });
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));

  console.log('🎉 Gmail 授權完成');
  return oAuth2Client;
}
