// C:\Users\winnie.lin\Desktop\tool2.0\html\View\opCanned\opCanned.js
// 前端：OP 罐頭工廠（分類 + 罐頭 CRUD + 複製剪貼簿）

let opData = { categories: [] };
let currentCategoryId = null;
let editingItemId = null;

// DOM 參照（先宣告，等 DOMContentLoaded 再賦值）
let categoryListEl;
let itemListEl;

let btnAddCategory;
let btnRenameCategory;
let btnDeleteCategory;
let btnAddItem;

let currentCategoryNameEl;

let itemModalBackdrop;
let itemModalTitle;
let itemCategorySelect;
let itemTitleInput;
let itemContentInput;
let btnItemCancel;
let btnItemSave;

let toastEl;

// ===============================
// 小工具：Toast
// ===============================
function showToast(message, type = 'success') {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = ''; // reset class
    toastEl.classList.add(type === 'error' ? 'error' : 'success');
    toastEl.classList.add('show');
    setTimeout(() => {
        toastEl.classList.remove('show');
    }, 2000);
}

// ===============================
// 讀取後端 JSON
// ===============================
async function fetchData() {
    try {
        const res = await fetch('/api/opcanned');
        if (!res.ok) throw new Error('HTTP ' + res.status);

        const data = await res.json();
        opData = data && data.categories ? data : { categories: [] };

        renderCategories();
        renderCategorySelectOptions();

        // 如果目前選取的分類被刪掉了，清掉
        if (currentCategoryId && !opData.categories.find(c => c.id === currentCategoryId)) {
            currentCategoryId = null;
        }
        updateCategoryButtonsState();

        if (currentCategoryId) {
            renderItems();
        } else {
            if (itemListEl) {
                itemListEl.innerHTML = `
                    <div class="opc-empty-tip">
                        左側選擇一個分類後，這裡會顯示對應的 OP 罐頭內容。
                    </div>
                `;
            }
            if (currentCategoryNameEl) {
                currentCategoryNameEl.textContent = '請先選擇左側分類';
            }
        }
    } catch (err) {
        console.error('fetchData error', err);
        showToast('讀取資料失敗', 'error');
    }
}

// ===============================
// 渲染分類列表
// ===============================
function renderCategories() {
    if (!categoryListEl) return;
    categoryListEl.innerHTML = '';

    if (!opData.categories.length) {
        const li = document.createElement('li');
        li.textContent = '目前尚未建立任何分類';
        li.style.fontSize = '12px';
        li.style.color = '#8b949e';
        li.style.cursor = 'default';
        categoryListEl.appendChild(li);
        return;
    }

    opData.categories.forEach(cat => {
        const li = document.createElement('li');
        li.dataset.id = cat.id;
        if (cat.id === currentCategoryId) li.classList.add('active');

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = cat.name;

        const countSpan = document.createElement('span');
        countSpan.className = 'count';
        countSpan.textContent = cat.items?.length ? `${cat.items.length}` : '0';

        li.appendChild(nameSpan);
        li.appendChild(countSpan);

        li.addEventListener('click', () => {
            currentCategoryId = cat.id;
            renderCategories();
            renderItems();
            updateCategoryButtonsState();
        });

        categoryListEl.appendChild(li);
    });
}

// ===============================
// 下拉選單：分類選項
// ===============================
function renderCategorySelectOptions() {
    if (!itemCategorySelect) return;
    itemCategorySelect.innerHTML = '';
    opData.categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        itemCategorySelect.appendChild(opt);
    });
}

// ===============================
// 分類按鈕啟用/停用
// ===============================
function updateCategoryButtonsState() {
    const hasCategory = !!currentCategoryId;
    if (btnRenameCategory) btnRenameCategory.disabled = !hasCategory;
    if (btnDeleteCategory) btnDeleteCategory.disabled = !hasCategory;
    if (btnAddItem) btnAddItem.disabled = !hasCategory;
}

function getCurrentCategory() {
    return opData.categories.find(c => c.id === currentCategoryId) || null;
}

// ===============================
// 渲染罐頭列表
// ===============================
function renderItems() {
    if (!itemListEl || !currentCategoryNameEl) return;

    const cat = getCurrentCategory();
    if (!cat) {
        itemListEl.innerHTML = `
            <div class="opc-empty-tip">
                找不到選取的分類，請重新整理頁面。
            </div>
        `;
        currentCategoryNameEl.textContent = '分類不存在';
        return;
    }

    currentCategoryNameEl.textContent = cat.name;

    if (!cat.items || !cat.items.length) {
        itemListEl.innerHTML = `
            <div class="opc-empty-tip">
                這個分類目前還沒有任何 OP 罐頭。<br>
                點右上角「＋ 新增罐頭」來建立第一則吧！
            </div>
        `;
        return;
    }

    itemListEl.innerHTML = '';
    cat.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'opc-item-card';

        const header = document.createElement('div');
        header.className = 'opc-item-header';

        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';

        const title = document.createElement('div');
        title.className = 'opc-item-title';
        title.textContent = item.title;

        const meta = document.createElement('div');
        meta.className = 'opc-item-meta';
        meta.textContent = item.updated_at
            ? `最後更新：${new Date(item.updated_at).toLocaleString()}`
            : '';

        left.appendChild(title);
        if (meta.textContent) left.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'opc-item-actions';

        const btnCopy = document.createElement('button');
        btnCopy.className = 'opc-btn';
        btnCopy.textContent = '複製';
        btnCopy.addEventListener('click', () => onCopyItem(item));

        const btnEdit = document.createElement('button');
        btnEdit.className = 'opc-btn';
        btnEdit.textContent = '編輯';
        btnEdit.addEventListener('click', () => openItemModal('edit', item));

        const btnDelete = document.createElement('button');
        btnDelete.className = 'opc-btn opc-btn-danger';
        btnDelete.textContent = '刪除';
        btnDelete.addEventListener('click', () => onDeleteItem(item));

        actions.appendChild(btnCopy);
        actions.appendChild(btnEdit);
        actions.appendChild(btnDelete);

        header.appendChild(left);
        header.appendChild(actions);

        const content = document.createElement('div');
        content.className = 'opc-item-content';
        content.textContent = item.content;

        card.appendChild(header);
        card.appendChild(content);

        itemListEl.appendChild(card);
    });
}

// ===============================
// 罐頭複製
// ===============================
async function onCopyItem(item) {
    try {
        await navigator.clipboard.writeText(item.content);
        showToast('已複製到剪貼簿 (*≧∀≦*)♡');
    } catch (err) {
        console.error('copy error', err);
        showToast('複製失敗，請手動選取文字', 'error');
    }
}

// ===============================
// 分類相關事件
// ===============================
async function handleAddCategory() {
    const name = window.prompt('請輸入新分類名稱：');
    if (!name || !name.trim()) return;

    try {
        const res = await fetch('/api/opcanned/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const result = await res.json();
        showToast('新增分類成功');
        await fetchData();
        if (result.id) {
            currentCategoryId = result.id;
            renderCategories();
            renderItems();
            updateCategoryButtonsState();
        }
    } catch (err) {
        console.error('addCategory error', err);
        showToast('新增分類失敗', 'error');
    }
}

async function handleRenameCategory() {
    const cat = getCurrentCategory();
    if (!cat) return;

    const name = window.prompt('請輸入新的分類名稱：', cat.name);
    if (!name || !name.trim()) return;

    try {
        const res = await fetch(`/api/opcanned/categories/${encodeURIComponent(cat.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name.trim() })
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('分類已更新');
        await fetchData();
    } catch (err) {
        console.error('renameCategory error', err);
        showToast('更新分類失敗', 'error');
    }
}

async function handleDeleteCategory() {
    const cat = getCurrentCategory();
    if (!cat) return;

    const ok = window.confirm(`確定要刪除分類「${cat.name}」及底下所有罐頭嗎？`);
    if (!ok) return;

    try {
        const res = await fetch(`/api/opcanned/categories/${encodeURIComponent(cat.id)}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('分類已刪除');
        currentCategoryId = null;
        await fetchData();
    } catch (err) {
        console.error('deleteCategory error', err);
        showToast('刪除分類失敗', 'error');
    }
}

// ===============================
// 罐頭（Item）相關
// ===============================
function openItemModal(mode, item) {
    editingItemId = mode === 'edit' && item ? item.id : null;
    if (!itemModalBackdrop || !itemModalTitle) return;

    itemModalTitle.textContent = mode === 'edit' ? '編輯罐頭' : '新增罐頭';

    renderCategorySelectOptions();

    if (mode === 'edit' && item) {
        const cat = getCurrentCategory();
        if (itemCategorySelect) {
            itemCategorySelect.value = cat ? cat.id : (opData.categories[0]?.id || '');
        }
        if (itemTitleInput) itemTitleInput.value = item.title || '';
        if (itemContentInput) itemContentInput.value = item.content || '';
    } else {
        if (itemCategorySelect) {
            itemCategorySelect.value = currentCategoryId || (opData.categories[0]?.id || '');
        }
        if (itemTitleInput) itemTitleInput.value = '';
        if (itemContentInput) itemContentInput.value = '';
    }

    itemModalBackdrop.classList.add('show');
}

function closeItemModal() {
    editingItemId = null;
    if (itemModalBackdrop) {
        itemModalBackdrop.classList.remove('show');
    }
}

async function handleSaveItem() {
    if (!itemCategorySelect || !itemTitleInput || !itemContentInput) return;

    const mode = editingItemId ? 'edit' : 'add';
    const categoryId = itemCategorySelect.value;
    const title = itemTitleInput.value;
    const content = itemContentInput.value;

    if (!categoryId) {
        showToast('請選擇分類', 'error');
        return;
    }
    if (!title.trim()) {
        showToast('標題不得為空', 'error');
        return;
    }
    if (!content.trim()) {
        showToast('內容不得為空', 'error');
        return;
    }

    try {
        if (mode === 'add') {
            const res = await fetch('/api/opcanned/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId,
                    title,
                    content
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            showToast('新增罐頭成功');
        } else {
            const res = await fetch(`/api/opcanned/items/${encodeURIComponent(editingItemId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId,
                    title,
                    content
                })
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            showToast('罐頭已更新');
        }

        closeItemModal();
        await fetchData();
    } catch (err) {
        console.error('save item error', err);
        showToast('儲存失敗', 'error');
    }
}

async function onDeleteItem(item) {
    const ok = window.confirm(`確定要刪除罐頭「${item.title}」嗎？`);
    if (!ok) return;

    try {
        const res = await fetch(`/api/opcanned/items/${encodeURIComponent(item.id)}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showToast('罐頭已刪除');
        await fetchData();
    } catch (err) {
        console.error('delete item error', err);
        showToast('刪除失敗', 'error');
    }
}

// ===============================
// 初始化：等 DOM 準備好再綁定
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    // 抓 DOM 元素
    categoryListEl = document.getElementById('categoryList');
    itemListEl = document.getElementById('itemList');

    btnAddCategory = document.getElementById('btnAddCategory');
    btnRenameCategory = document.getElementById('btnRenameCategory');
    btnDeleteCategory = document.getElementById('btnDeleteCategory');
    btnAddItem = document.getElementById('btnAddItem');

    currentCategoryNameEl = document.getElementById('currentCategoryName');

    itemModalBackdrop = document.getElementById('itemModalBackdrop');
    itemModalTitle = document.getElementById('itemModalTitle');
    itemCategorySelect = document.getElementById('itemCategorySelect');
    itemTitleInput = document.getElementById('itemTitleInput');
    itemContentInput = document.getElementById('itemContentInput');
    btnItemCancel = document.getElementById('btnItemCancel');
    btnItemSave = document.getElementById('btnItemSave');

    toastEl = document.getElementById('toast');

    // 綁定事件
    if (btnAddCategory) btnAddCategory.addEventListener('click', handleAddCategory);
    if (btnRenameCategory) btnRenameCategory.addEventListener('click', handleRenameCategory);
    if (btnDeleteCategory) btnDeleteCategory.addEventListener('click', handleDeleteCategory);

    if (btnAddItem) btnAddItem.addEventListener('click', () => openItemModal('add'));
    if (btnItemCancel) btnItemCancel.addEventListener('click', closeItemModal);
    if (btnItemSave) btnItemSave.addEventListener('click', handleSaveItem);

    // 先關掉 Modal
    if (itemModalBackdrop) itemModalBackdrop.classList.remove('show');

    // 載入資料
    fetchData();
});
