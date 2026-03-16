import fs from "fs";
import path from "path";

// 專案根目錄偵測：最後回傳「包含 html/ 的那一層」
function getProjectRoot() {
  const cwd = process.cwd();

  // cwd 已經是專案根（底下有 html/View）
  if (fs.existsSync(path.join(cwd, "html", "View"))) return cwd;

  // cwd 是 html/（底下有 View/ Controller/ Json/）
  if (
    fs.existsSync(path.join(cwd, "View")) &&
    fs.existsSync(path.join(cwd, "Controller"))
  ) {
    return path.resolve(cwd, "..");
  }

  return cwd;
}

const rootDir = getProjectRoot();

// ===== JSON 路徑（統一）=====
const ipassJSON  = path.join(rootDir, "html", "Json", "ipass1512.json");
const eccJSON    = path.join(rootDir, "html", "Json", "ecc1512.json");
const appErrJSON = path.join(rootDir, "html", "Json", "app_err_code.json");

export default class JsonController {
  // ===============================
  // 取得 APP 錯誤碼
  // ===============================
  static async getAppErrCode(req, res) {
    try {
      const jsonData = fs.readFileSync(appErrJSON, "utf8");
      const jsonDataEncode = JSON.parse(jsonData);

      return res.json({
        status: 1,
        jsonDataEncode
      });
    } catch (error) {
      console.error("讀取 app_err_code.json 失敗", error);
      return res.json({
        status: 0,
        message: "讀取 app_err_code.json 失敗"
      });
    }
  }

  // ===============================
  // ECC 1512
  // ===============================
  static async getEcc1512Code(req, res) {
    try {
      const data = JSON.parse(fs.readFileSync(eccJSON, "utf8"));
      return res.json({ status: 1, jsonDataEncode: data });
    } catch (err) {
      return res.json({ status: 0, message: "讀取 ecc1512.json 失敗" });
    }
  }

  static async addEcc1512Code(req, res) {
    try {
      const { code, message } = req.body;
      if (!code || !message) {
        return res.json({ status: 0, message: "code 或 message 不可為空" });
      }

      const data = JSON.parse(fs.readFileSync(eccJSON, "utf8"));
      if (data[code]) {
        return res.json({ status: 0, message: "錯誤碼已存在" });
      }

      data[code] = message;
      fs.writeFileSync(eccJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "新增成功" });
    } catch (err) {
      return res.json({ status: 0, message: "新增失敗" });
    }
  }

  static async updateEcc1512Code(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const { message } = req.body;

      const data = JSON.parse(fs.readFileSync(eccJSON, "utf8"));
      if (!data[code]) {
        return res.json({ status: 0, message: "錯誤碼不存在" });
      }

      data[code] = message;
      fs.writeFileSync(eccJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "修改成功" });
    } catch {
      return res.json({ status: 0, message: "修改失敗" });
    }
  }

  static async deleteEcc1512Code(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const data = JSON.parse(fs.readFileSync(eccJSON, "utf8"));

      if (!data[code]) {
        return res.json({ status: 0, message: "錯誤碼不存在" });
      }

      delete data[code];
      fs.writeFileSync(eccJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "刪除成功" });
    } catch {
      return res.json({ status: 0, message: "刪除失敗" });
    }
  }

  // ===============================
  // iPass 1512
  // ===============================
  static async getIpass1512Code(req, res) {
    try {
      const data = JSON.parse(fs.readFileSync(ipassJSON, "utf8"));
      return res.json({ status: 1, jsonDataEncode: data });
    } catch {
      return res.json({ status: 0, message: "讀取 ipass1512.json 失敗" });
    }
  }

  static async addIpass1512Code(req, res) {
    try {
      const { code, message } = req.body;
      const data = JSON.parse(fs.readFileSync(ipassJSON, "utf8"));

      if (data[code]) {
        return res.json({ status: 0, message: "錯誤碼已存在" });
      }

      data[code] = message;
      fs.writeFileSync(ipassJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "新增成功" });
    } catch {
      return res.json({ status: 0, message: "新增失敗" });
    }
  }

  static async updateIpass1512Code(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const { message } = req.body;
      const data = JSON.parse(fs.readFileSync(ipassJSON, "utf8"));

      if (!data[code]) {
        return res.json({ status: 0, message: "錯誤碼不存在" });
      }

      data[code] = message;
      fs.writeFileSync(ipassJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "修改成功" });
    } catch {
      return res.json({ status: 0, message: "修改失敗" });
    }
  }

  static async deleteIpass1512Code(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const data = JSON.parse(fs.readFileSync(ipassJSON, "utf8"));

      delete data[code];
      fs.writeFileSync(ipassJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "刪除成功" });
    } catch {
      return res.json({ status: 0, message: "刪除失敗" });
    }
  }

  // ===============================
  // APP Error Code CRUD
  // ===============================
  static async addAppErrCode(req, res) {
    try {
      const { code, message } = req.body;
      const data = JSON.parse(fs.readFileSync(appErrJSON, "utf8"));

      if (data[code]) {
        return res.json({ status: 0, message: "錯誤碼已存在" });
      }

      data[code] = message;
      fs.writeFileSync(appErrJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "新增成功" });
    } catch {
      return res.json({ status: 0, message: "新增失敗" });
    }
  }

  static async updateAppErrCode(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const { message } = req.body;
      const data = JSON.parse(fs.readFileSync(appErrJSON, "utf8"));

      data[code] = message;
      fs.writeFileSync(appErrJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "修改成功" });
    } catch {
      return res.json({ status: 0, message: "修改失敗" });
    }
  }

  static async deleteAppErrCode(req, res) {
    try {
      const code = decodeURIComponent(req.params.code);
      const data = JSON.parse(fs.readFileSync(appErrJSON, "utf8"));

      delete data[code];
      fs.writeFileSync(appErrJSON, JSON.stringify(data, null, 4), "utf8");
      return res.json({ status: 1, message: "刪除成功" });
    } catch {
      return res.json({ status: 0, message: "刪除失敗" });
    }
  }
}
