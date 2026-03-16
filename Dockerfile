FROM node:23

# 專案根目錄~~
WORKDIR /var/www/op-tool

# 先把 html 的依賴檔 copy 進去（只 copy package 檔可吃快取）
COPY html/package*.json ./html/

# 在 html 目錄安裝依賴（node_modules 會在 /var/www/op-tool/html/node_modules）
RUN cd html && npm ci --omit=dev

# 再 copy 全部程式碼（包含 html/Controller, html/gmail...）
COPY . .

# 讓 npm start 一定吃到 html/package.json
WORKDIR /var/www/op-tool/html

CMD ["npm", "start"]
