// C:\Users\winnie.lin\Desktop\tool2.0\html\View\opCanned\opCanned.js
// 前端：OP 罐頭工廠（分類 + 罐頭 CRUD + 複製剪貼簿 + 搜尋 + 排序 + 拖曳 + 時間顯示）

let opData = { categories: [] };
let currentCategoryId = null;
let editingItemId = null; // null = 新增模式, 有值 = 編輯模式
let searchKeyword = "";

// 排序：time = 依時間, manual = 手動拖曳順序
let sortMode = "time"; // "time" | "manual"
let sortDirection = "desc"; // "asc" | "desc" 依時間排序方向（預設新→舊）

// 拖曳狀態
let draggingCategoryId = null;
let draggingItemId = null;

// 額外：分類 Modal 狀態 (分類依舊使用彈窗)
let categoryModalMode = "add"; // 'add' or 'rename'
let editingCategoryId = null;

// DOM 參照
let categoryListEl, itemListEl, searchInputEl;
let btnAddCategory, btnRenameCategory, btnDeleteCategory;
let currentCategoryNameEl;
let btnSortTimeAsc, btnSortTimeDesc;

// 編輯區 DOM (右側欄位)
let editorTitleEl;
let itemCategorySelect, itemTitleInput, itemContentInput;
let btnItemReset, btnItemSave, btnAddItem;

// 分類 Modal DOM
let categoryModalBackdrop, categoryModalTitle, categoryNameInput, btnCategoryCancel, btnCategorySave;

/* ===============================
   初始化
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. 抓取 DOM
    categoryListEl = document.getElementById("categoryList");
    itemListEl = document.getElementById("itemList");
    searchInputEl = document.getElementById("opcSearchInput");

    // 左側分類按鈕
    btnAddCategory = document.getElementById("btnAddCategory");
    btnRenameCategory = document.getElementById("btnRenameCategory");
    btnDeleteCategory = document.getElementById("btnDeleteCategory");
    currentCategoryNameEl = document.getElementById("currentCategoryName");

    // 排序按鈕
    btnSortTimeAsc = document.getElementById("btnSortTimeAsc");
    btnSortTimeDesc = document.getElementById("btnSortTimeDesc");

    // 中間列表按鈕
    btnAddItem = document.getElementById("btnAddItem");

    // 右側編輯區元件
    editorTitleEl = document.getElementById("editorTitle");
    itemCategorySelect = document.getElementById("itemCategorySelect");
    itemTitleInput = document.getElementById("itemTitleInput");
    itemContentInput = document.getElementById("itemContentInput");
    btnItemReset = document.getElementById("btnItemCancel");
    btnItemSave = document.getElementById("btnItemSave");

    // 分類 Modal
    categoryModalBackdrop = document.getElementById("categoryModalBackdrop");
    categoryModalTitle = document.getElementById("categoryModalTitle");
    categoryNameInput = document.getElementById("categoryNameInput");
    btnCategoryCancel = document.getElementById("btnCategoryCancel");
    btnCategorySave = document.getElementById("btnCategorySave");

    // 2. 綁定事件
    bindCategoryEvents();
    bindEditorEvents();
    bindSearchEvents();
    bindSortEvents();

    // 3. 載入資料
    fetchData();
});

/* ===============================
   讀取資料
=============================== */
async function fetchData() {
    try {
        const res = await fetch("/api/opcanned");
        if (!res.ok) throw new Error("HTTP " + res.status);
        opData = await res.json();
        if (!opData.categories || !Array.isArray(opData.categories)) {
            opData = { categories: [] };
        }

        // 初始化 items 陣列
        opData.categories.forEach(cat => {
            if (!Array.isArray(cat.items)) cat.items = [];
        });

        // 檢查當前分類是否還存在
        if (currentCategoryId && !opData.categories.find(c => c.id === currentCategoryId)) {
            currentCategoryId = null;
        }

        // 渲染畫面
        renderCategories();
        renderCategorySelectOptions();
        updateCategoryButtonsState();

        if (currentCategoryId) {
            renderItems();
            setEditorMode("add");
        } else {
            itemListEl.innerHTML = `<div class="opc-empty-tip">左側選擇一個分類後，這裡會顯示對應的 OP 罐頭內容。</div>`;
            currentCategoryNameEl.textContent = "請先選擇左側分類";
            disableEditor(true);
        }
    } catch (err) {
        console.error("fetchData error", err);
        showToast("讀取資料失敗", "error");
    }
}

/* ===============================
   渲染左側分類 + 拖曳排序
=============================== */
function renderCategories() {
    if (!categoryListEl) return;
    categoryListEl.innerHTML = "";

    if (!opData.categories.length) {
        const li = document.createElement("li");
        li.textContent = "目前尚未建立任何分類";
        li.style.color = "#8b949e";
        li.style.cursor = "default";
        li.draggable = false;
        categoryListEl.appendChild(li);
        return;
    }

    opData.categories.forEach(cat => {
        const li = document.createElement("li");
        li.dataset.id = cat.id;
        li.draggable = true;

        if (cat.id === currentCategoryId) li.classList.add("active");

        const nameSpan = document.createElement("span");
        nameSpan.className = "name";
        nameSpan.textContent = cat.name;

        const countSpan = document.createElement("span");
        countSpan.className = "count";
        countSpan.textContent = cat.items?.length || 0;

        li.appendChild(nameSpan);
        li.appendChild(countSpan);

        // 點擊：切換分類
        li.addEventListener("click", () => {
            currentCategoryId = cat.id;
            searchKeyword = "";
            if (searchInputEl) searchInputEl.value = "";

            // 切分類時，預設回到「時間排序」
            sortMode = "time";
            sortDirection = "desc";
            updateSortButtonsUI();

            renderCategories();
            renderItems();
            updateCategoryButtonsState();
            setEditorMode("add");
            disableEditor(false);
        });

        // 拖曳事件
        li.addEventListener("dragstart", e => {
            draggingCategoryId = cat.id;
            li.classList.add("dragging");
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", cat.id);
            }
        });

        li.addEventListener("dragover", e => {
            e.preventDefault();
            if (!draggingCategoryId || draggingCategoryId === cat.id) return;
            li.classList.add("drag-over");
            if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        });

        li.addEventListener("dragleave", () => {
            li.classList.remove("drag-over");
        });

        li.addEventListener("drop", e => {
            e.preventDefault();
            li.classList.remove("drag-over");
            if (!draggingCategoryId || draggingCategoryId === cat.id) return;

            const fromIdx = opData.categories.findIndex(c => c.id === draggingCategoryId);
            const toIdx = opData.categories.findIndex(c => c.id === cat.id);
            if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

            const [moved] = opData.categories.splice(fromIdx, 1);
            opData.categories.splice(toIdx, 0, moved);

            draggingCategoryId = null;
            renderCategories();
            renderCategorySelectOptions();
            updateCategoryButtonsState();
            persistCategoryOrder();
        });

        li.addEventListener("dragend", () => {
            draggingCategoryId = null;
            li.classList.remove("dragging");
            clearCategoryDragStyles();
        });

        categoryListEl.appendChild(li);
    });
}

function clearCategoryDragStyles() {
    if (!categoryListEl) return;
    categoryListEl.querySelectorAll("li").forEach(li => {
        li.classList.remove("drag-over");
        li.classList.remove("dragging");
    });
}

async function persistCategoryOrder() {
    try {
        const order = opData.categories.map(c => c.id);
        await fetch("/api/opcanned/categories/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order })
        });
    } catch (err) {
        console.error("persistCategoryOrder error", err);
    }
}

function renderCategorySelectOptions() {
    if (!itemCategorySelect) return;
    const currentVal = itemCategorySelect.value;
    itemCategorySelect.innerHTML = "";
    opData.categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.id;
        opt.textContent = cat.name;
        itemCategorySelect.appendChild(opt);
    });
    if (currentVal && Array.from(itemCategorySelect.options).some(o => o.value === currentVal)) {
        itemCategorySelect.value = currentVal;
    } else if (currentCategoryId) {
        itemCategorySelect.value = currentCategoryId;
    }
}

function updateCategoryButtonsState() {
    const hasCategory = !!currentCategoryId;
    if (btnRenameCategory) btnRenameCategory.disabled = !hasCategory;
    if (btnDeleteCategory) btnDeleteCategory.disabled = !hasCategory;
    if (btnAddItem) btnAddItem.disabled = !hasCategory;
}

function getCurrentCategory() {
    return opData.categories.find(c => c.id === currentCategoryId) || null;
}

/* ===============================
   渲染中間列表（含時間排序 + 拖曳排序 + 顯示時間）
=============================== */
function renderItems() {
    const cat = getCurrentCategory();
    if (!itemListEl || !cat) return;

    if (currentCategoryNameEl) currentCategoryNameEl.textContent = cat.name;

    let items = cat.items || [];
    const kw = (searchKeyword || "").toLowerCase();

    if (kw) {
        items = items.filter(item => {
            const text = `${item.title || ""} ${item.content || ""}`.toLowerCase();
            return text.includes(kw);
        });
    }

    // sortMode = "time" 時依時間排序，"manual" 時保持目前順序
    if (sortMode === "time") {
        items = items.slice().sort((a, b) => {
            const ta = getItemTimestamp(a);
            const tb = getItemTimestamp(b);
            if (sortDirection === "asc") return ta - tb;
            return tb - ta;
        });
    } else {
        items = items.slice(); // 保持 cat.items 的順序
    }

    itemListEl.innerHTML = "";

    if (!items.length) {
        itemListEl.innerHTML = `
            <div class="opc-empty-tip">
                ${kw ? "沒有符合搜尋條件的罐頭。" : "此分類尚無內容。<br>請在右側填寫並新增。"}
            </div>
        `;
        return;
    }

    const allowDrag = !kw; // 有搜尋時不開放拖曳，避免排序混亂

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "opc-item-card";
        card.dataset.id = item.id;

        if (allowDrag) {
            card.draggable = true;
        }

        if (editingItemId === item.id) {
            card.style.borderColor = "#58a6ff";
        }

        const timeLabel = formatItemTime(item);

        card.innerHTML = `
            <div class="opc-item-title">${escapeHtml(item.title)}</div>
            <div class="opc-item-content" title="點擊複製內容">${escapeHtml(item.content)}</div>
            ${timeLabel ? `<div class="opc-item-meta">${timeLabel}</div>` : ""}
        `;

        // 點擊卡片內容複製
        const contentEl = card.querySelector(".opc-item-content");
        contentEl.addEventListener("click", e => {
            e.stopPropagation();
            onCopyPlainText(item.content, card);
        });

        // 右上角操作按鈕區
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "opc-item-actions";

        const btnEdit = createActionButton("編輯", "", () => {
            setEditorMode("edit", item);
            renderItems();
        });
        const btnDel = createActionButton("刪除", "opc-btn-danger", () => {
            onDeleteItem(item);
        });

        actionsDiv.appendChild(btnEdit);
        actionsDiv.appendChild(btnDel);
        card.appendChild(actionsDiv);

        // 罐頭拖曳事件
        if (allowDrag) {
            card.addEventListener("dragstart", e => {
                draggingItemId = item.id;
                card.classList.add("dragging");
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", item.id);
                }
            });

            card.addEventListener("dragover", e => {
                e.preventDefault();
                if (!draggingItemId || draggingItemId === item.id) return;
                card.classList.add("drag-over");
                if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
            });

            card.addEventListener("dragleave", () => {
                card.classList.remove("drag-over");
            });

            card.addEventListener("drop", e => {
                e.preventDefault();
                card.classList.remove("drag-over");
                if (!draggingItemId || draggingItemId === item.id) return;

                const category = getCurrentCategory();
                if (!category) return;

                const fromIdx = category.items.findIndex(it => it.id === draggingItemId);
                const toIdx = category.items.findIndex(it => it.id === item.id);
                if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

                const [moved] = category.items.splice(fromIdx, 1);
                category.items.splice(toIdx, 0, moved);

                draggingItemId = null;

                // 一旦手動拖曳，就切換成 manual 模式
                sortMode = "manual";
                updateSortButtonsUI();

                renderItems();
                persistItemOrder(category);
            });

            card.addEventListener("dragend", () => {
                draggingItemId = null;
                card.classList.remove("dragging");
                clearItemDragStyles();
            });
        }

        itemListEl.appendChild(card);
    });
}

function clearItemDragStyles() {
    if (!itemListEl) return;
    itemListEl.querySelectorAll(".opc-item-card").forEach(card => {
        card.classList.remove("dragging");
        card.classList.remove("drag-over");
    });
}

function getItemTimestamp(item) {
    const t = item.updated_at || item.created_at;
    if (!t) return 0;
    const ms = Date.parse(t);
    return isNaN(ms) ? 0 : ms;
}

// 時間字串格式化：優先顯示 updated_at，不同於 created_at 就標「更新時間」
function formatItemTime(item) {
    const hasCreated = !!item.created_at;
    const hasUpdated = !!item.updated_at;

    if (!hasCreated && !hasUpdated) return "";

    let label = "建立時間";
    let timeStr = item.created_at || item.updated_at;

    if (hasUpdated && item.updated_at !== item.created_at) {
        label = "更新時間";
        timeStr = item.updated_at;
    }

    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return "";

    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());

    return `${label}：${y}-${m}-${day} ${hh}:${mm}`;
}

function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
}

async function persistItemOrder(category) {
    try {
        const order = category.items.map(i => i.id);
        await fetch("/api/opcanned/items/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categoryId: category.id,
                order
            })
        });
    } catch (err) {
        console.error("persistItemOrder error", err);
    }
}

function createActionButton(text, extraClass, onClick) {
    const btn = document.createElement("button");
    btn.className = `opc-btn ${extraClass}`;
    btn.textContent = text;
    btn.addEventListener("click", e => {
        e.stopPropagation();
        onClick();
    });
    return btn;
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ===============================
   右側編輯區邏輯
=============================== */
function bindEditorEvents() {
    if (btnAddItem) {
        btnAddItem.addEventListener("click", () => {
            setEditorMode("add");
        });
    }

    if (btnItemReset) {
        btnItemReset.addEventListener("click", () => {
            setEditorMode("add");
        });
    }

    if (btnItemSave) {
        btnItemSave.addEventListener("click", saveItem);
    }
}

function setEditorMode(mode, item = null) {
    editingItemId = mode === "edit" && item ? item.id : null;

    if (editorTitleEl) {
        editorTitleEl.innerHTML =
            mode === "edit"
                ? `<i class="fa fa-pencil-square-o"></i> 編輯罐頭`
                : `<i class="fa fa-plus-circle"></i> 新增罐頭`;
    }

    if (mode === "edit" && item) {
        if (itemCategorySelect) itemCategorySelect.value = currentCategoryId;
        if (itemTitleInput) itemTitleInput.value = item.title;
        if (itemContentInput) itemContentInput.value = item.content;
        if (btnItemReset) btnItemReset.textContent = "取消編輯";
    } else {
        if (itemCategorySelect) itemCategorySelect.value = currentCategoryId || "";
        if (itemTitleInput) itemTitleInput.value = "";
        if (itemContentInput) itemContentInput.value = "";
        if (btnItemReset) btnItemReset.textContent = "重置";

        setTimeout(() => {
            if (itemTitleInput && !itemTitleInput.disabled) itemTitleInput.focus();
        }, 50);
    }
}

function disableEditor(disabled) {
    if (itemCategorySelect) itemCategorySelect.disabled = disabled;
    if (itemTitleInput) itemTitleInput.disabled = disabled;
    if (itemContentInput) itemContentInput.disabled = disabled;
    if (btnItemSave) btnItemSave.disabled = disabled;
    if (btnItemReset) btnItemReset.disabled = disabled;
}

async function saveItem() {
    const categoryId = itemCategorySelect.value;
    const title = itemTitleInput.value.trim();
    const content = itemContentInput.value.trim();
    const mode = editingItemId ? "edit" : "add";

    if (!categoryId) return showToast("請選擇分類", "error");
    if (!title) return showToast("標題不得為空", "error");
    if (!content) return showToast("內容不得為空", "error");

    try {
        let res;
        if (mode === "add") {
            res = await fetch("/api/opcanned/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, title, content })
            });
        } else {
            res = await fetch(`/api/opcanned/items/${encodeURIComponent(editingItemId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categoryId, title, content })
            });
        }

        if (!res.ok) throw new Error("HTTP " + res.status);

        showToast(mode === "add" ? "新增成功" : "更新成功");

        // 存檔後回到「時間排序模式」
        sortMode = "time";
        sortDirection = "desc";
        updateSortButtonsUI();

        await fetchData();
        setEditorMode("add");
    } catch (err) {
        console.error("save item error", err);
        showToast("儲存失敗", "error");
    }
}

async function onDeleteItem(item) {
    if (!confirm(`確定要刪除「${item.title}」嗎？`)) return;

    try {
        const res = await fetch(`/api/opcanned/items/${encodeURIComponent(item.id)}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("HTTP " + res.status);

        showToast("已刪除");
        if (editingItemId === item.id) {
            setEditorMode("add");
        }
        await fetchData();
    } catch (err) {
        console.error("delete item error", err);
        showToast("刪除失敗", "error");
    }
}

/* ===============================
   剪貼簿功能
=============================== */
async function onCopyPlainText(text, cardEl) {
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast("已複製到剪貼簿 (*≧∀≦*)♡", "success");
        if (cardEl) {
            cardEl.classList.add("copied");
            setTimeout(() => cardEl.classList.remove("copied"), 500);
        }
    } catch (err) {
        console.error("copy error", err);
        showToast("複製失敗", "error");
    }
}

/* ===============================
   搜尋功能
=============================== */
function bindSearchEvents() {
    if (!searchInputEl) return;
    searchInputEl.addEventListener("input", () => {
        searchKeyword = searchInputEl.value || "";
        renderItems();
    });
}

/* ===============================
   時間排序按鈕
=============================== */
function bindSortEvents() {
    if (btnSortTimeAsc) {
        btnSortTimeAsc.addEventListener("click", () => {
            sortMode = "time";
            sortDirection = "asc";
            updateSortButtonsUI();
            renderItems();
        });
    }
    if (btnSortTimeDesc) {
        btnSortTimeDesc.addEventListener("click", () => {
            sortMode = "time";
            sortDirection = "desc";
            updateSortButtonsUI();
            renderItems();
        });
    }
}

function updateSortButtonsUI() {
    if (btnSortTimeAsc) {
        btnSortTimeAsc.classList.toggle("active", sortMode === "time" && sortDirection === "asc");
    }
    if (btnSortTimeDesc) {
        btnSortTimeDesc.classList.toggle("active", sortMode === "time" && sortDirection === "desc");
    }
}

/* ===============================
   分類事件 (新增 / 改名 / 刪除)
=============================== */
function bindCategoryEvents() {
    if (btnAddCategory) {
        btnAddCategory.addEventListener("click", () => openCategoryModal("add"));
    }
    if (btnRenameCategory) {
        btnRenameCategory.addEventListener("click", () => {
            const cat = getCurrentCategory();
            if (cat) openCategoryModal("rename", cat);
        });
    }
    if (btnDeleteCategory) {
        btnDeleteCategory.addEventListener("click", async () => {
            const cat = getCurrentCategory();
            if (!cat || !confirm(`確定要刪除分類「${cat.name}」及底下所有罐頭嗎？`)) return;
            try {
                const res = await fetch(`/api/opcanned/categories/${encodeURIComponent(cat.id)}`, {
                    method: "DELETE"
                });
                if (!res.ok) throw new Error();
                showToast("分類已刪除");
                currentCategoryId = null;
                await fetchData();
            } catch (err) {
                showToast("刪除分類失敗", "error");
            }
        });
    }

    if (btnCategoryCancel) btnCategoryCancel.addEventListener("click", closeCategoryModal);
    if (btnCategorySave) btnCategorySave.addEventListener("click", saveCategory);

    if (categoryModalBackdrop) {
        categoryModalBackdrop.addEventListener("click", e => {
            if (e.target === categoryModalBackdrop) closeCategoryModal();
        });
    }
}

function openCategoryModal(mode, category) {
    categoryModalMode = mode;
    editingCategoryId = category ? category.id : null;
    if (categoryModalTitle) {
        categoryModalTitle.textContent = mode === "add" ? "新增分類" : "重新命名分類";
    }
    if (categoryNameInput) {
        categoryNameInput.value = mode === "add" ? "" : (category.name || "");
        setTimeout(() => categoryNameInput.focus(), 50);
    }
    if (categoryModalBackdrop) categoryModalBackdrop.classList.add("show");
}

function closeCategoryModal() {
    if (categoryModalBackdrop) categoryModalBackdrop.classList.remove("show");
}

async function saveCategory() {
    const name = categoryNameInput.value.trim();
    if (!name) return showToast("名稱不可為空", "error");

    try {
        let res;
        if (categoryModalMode === "add") {
            res = await fetch("/api/opcanned/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
        } else {
            res = await fetch(`/api/opcanned/categories/${encodeURIComponent(editingCategoryId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
        }
        if (!res.ok) throw new Error();

        showToast("分類儲存成功");

        if (categoryModalMode === "add") {
            const result = await res.json();
            if (result.id) currentCategoryId = result.id;
        }

        await fetchData();
        closeCategoryModal();
    } catch (err) {
        showToast("儲存失敗", "error");
    }
}

/* ===============================
   Toast
=============================== */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.background =
        type === "success"
            ? "rgba(46, 160, 67, 0.95)"
            : "rgba(218, 54, 51, 0.95)";
    toast.style.color = "#fff";
    toast.style.padding = "12px 20px";
    toast.style.borderRadius = "8px";
    toast.style.fontSize = "15px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = 99999;
    toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s, transform 0.3s";
    toast.style.transform = "translateY(10px)";

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
