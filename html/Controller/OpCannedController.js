import fs from 'fs';
import path from 'path';

function getProjectRoot() {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'html', 'View'))) return cwd;

  if (fs.existsSync(path.join(cwd, 'View')) && fs.existsSync(path.join(cwd, 'Controller'))) {
    return path.resolve(cwd, '..');
  }

  return cwd;
}

const rootDir = getProjectRoot();
const jsonDir = path.join(rootDir, 'html', 'Json');
const jsonPath = path.join(jsonDir, 'op_canned.json');

// 確保資料夾與檔案存在
function ensureDataFile() {
    if (!fs.existsSync(jsonDir)) {
        fs.mkdirSync(jsonDir, { recursive: true });
    }

    if (!fs.existsSync(jsonPath)) {
        const initData = { categories: [] };
        fs.writeFileSync(jsonPath, JSON.stringify(initData, null, 2), 'utf-8');
    }
}

function readData() {
    ensureDataFile();
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    try {
        const data = JSON.parse(raw);

        if (!data.categories || !Array.isArray(data.categories)) {
            return { categories: [] };
        }

        // 確保每個 category 與 item 結構完整
        data.categories.forEach(cat => {
            if (!cat.id) {
                cat.id = genId('cat');
            }
            if (!cat.name) {
                cat.name = '未命名分類';
            }
            if (!Array.isArray(cat.items)) {
                cat.items = [];
            }
            cat.items.forEach(item => {
                if (!item.id) item.id = genId('item');
                if (!item.title) item.title = '';
                if (!item.content) item.content = '';
                if (!item.created_at) item.created_at = item.updated_at || new Date().toISOString();
                if (!item.updated_at) item.updated_at = item.created_at;
            });
        });

        return data;
    } catch (e) {
        console.error('parse op_canned.json error, reset to empty', e);
        return { categories: [] };
    }
}

function writeData(data) {
    // 簡單防呆：只允許 { categories: [] } 結構
    const safeData = {
        categories: Array.isArray(data.categories) ? data.categories : []
    };
    fs.writeFileSync(jsonPath, JSON.stringify(safeData, null, 2), 'utf-8');
}

function genId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

const OpCannedController = {
    // 取得全部分類與罐頭
    getAll(req, res) {
        try {
            const data = readData();
            res.json(data);
        } catch (err) {
            console.error('getAll error', err);
            res.status(500).json({ msg: '讀取資料失敗' });
        }
    },

    // 新增分類
    addCategory(req, res) {
        try {
            const { name } = req.body;
            if (!name || !name.trim()) {
                return res.status(400).json({ msg: '分類名稱不得為空' });
            }

            const data = readData();
            const id = genId('cat');
            const now = new Date().toISOString();

            data.categories.push({
                id,
                name: name.trim(),
                created_at: now,
                items: []
            });

            writeData(data);
            res.json({ status: 'ok', id });
        } catch (err) {
            console.error('addCategory error', err);
            res.status(500).json({ msg: '新增分類失敗' });
        }
    },

    // 更新分類名稱
    updateCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const { name } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({ msg: '分類名稱不得為空' });
            }

            const data = readData();
            const cat = data.categories.find(c => c.id === categoryId);
            if (!cat) {
                return res.status(404).json({ msg: '找不到分類' });
            }

            cat.name = name.trim();
            writeData(data);
            res.json({ status: 'ok' });
        } catch (err) {
            console.error('updateCategory error', err);
            res.status(500).json({ msg: '更新分類失敗' });
        }
    },

    // 刪除分類（連同底下罐頭一起刪）
    deleteCategory(req, res) {
        try {
            const { categoryId } = req.params;
            const data = readData();
            const before = data.categories.length;
            data.categories = data.categories.filter(c => c.id !== categoryId);

            if (data.categories.length === before) {
                return res.status(404).json({ msg: '找不到分類' });
            }

            writeData(data);
            res.json({ status: 'ok' });
        } catch (err) {
            console.error('deleteCategory error', err);
            res.status(500).json({ msg: '刪除分類失敗' });
        }
    },

    // 新增罐頭內容
    addItem(req, res) {
        try {
            const { categoryId, title, content } = req.body;

            if (!categoryId) {
                return res.status(400).json({ msg: '缺少 categoryId' });
            }
            if (!title || !title.trim()) {
                return res.status(400).json({ msg: '標題不得為空' });
            }
            if (!content || !content.trim()) {
                return res.status(400).json({ msg: '內容不得為空' });
            }

            const data = readData();
            const cat = data.categories.find(c => c.id === categoryId);
            if (!cat) {
                return res.status(404).json({ msg: '找不到分類' });
            }

            const id = genId('item');
            const now = new Date().toISOString();
            const item = {
                id,
                title: title.trim(),
                content: content.trim(),
                created_at: now,
                updated_at: now
            };

            cat.items.push(item);

            writeData(data);
            res.json({ status: 'ok', id, updated_at: now });
        } catch (err) {
            console.error('addItem error', err);
            res.status(500).json({ msg: '新增罐頭失敗' });
        }
    },

    // 更新罐頭內容（可跨分類移動）
    updateItem(req, res) {
        try {
            const { itemId } = req.params;
            const { categoryId, title, content } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).json({ msg: '標題不得為空' });
            }
            if (!content || !content.trim()) {
                return res.status(400).json({ msg: '內容不得為空' });
            }

            const data = readData();

            // 先找到 item 在哪一個分類
            let foundCategory = null;
            let foundItem = null;

            for (const cat of data.categories) {
                const item = cat.items.find(i => i.id === itemId);
                if (item) {
                    foundCategory = cat;
                    foundItem = item;
                    break;
                }
            }

            if (!foundItem) {
                return res.status(404).json({ msg: '找不到罐頭' });
            }

            const now = new Date().toISOString();

            // 是否要移動分類
            if (categoryId && categoryId !== foundCategory.id) {
                const targetCat = data.categories.find(c => c.id === categoryId);
                if (!targetCat) {
                    return res.status(404).json({ msg: '目標分類不存在' });
                }

                // 從原分類移除
                foundCategory.items = foundCategory.items.filter(i => i.id !== itemId);

                // 放進新分類
                targetCat.items.push({
                    id: foundItem.id,
                    title: title.trim(),
                    content: content.trim(),
                    created_at: foundItem.created_at || now,
                    updated_at: now
                });
            } else {
                // 只在原分類更新
                foundItem.title = title.trim();
                foundItem.content = content.trim();
                foundItem.updated_at = now;
            }

            writeData(data);
            res.json({ status: 'ok', updated_at: now });
        } catch (err) {
            console.error('updateItem error', err);
            res.status(500).json({ msg: '更新罐頭失敗' });
        }
    },

    // 刪除罐頭
    deleteItem(req, res) {
        try {
            const { itemId } = req.params;
            const data = readData();
            let removed = false;

            for (const cat of data.categories) {
                const before = cat.items.length;
                cat.items = cat.items.filter(i => i.id !== itemId);
                if (cat.items.length !== before) {
                    removed = true;
                    break;
                }
            }

            if (!removed) {
                return res.status(404).json({ msg: '找不到罐頭' });
            }

            writeData(data);
            res.json({ status: 'ok' });
        } catch (err) {
            console.error('deleteItem error', err);
            res.status(500).json({ msg: '刪除罐頭失敗' });
        }
    }
};

export default OpCannedController;
