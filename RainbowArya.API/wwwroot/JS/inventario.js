// inventario.js — Adaptado exactamente al HTML existente
// IDs reales: #name, #category, #quantity, #price, #supplier, #product-id
// Lista: #inventory-list
// Modal: #system-modal-backdrop

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    setupCategorySelect();
    await loadProducts();
    setupForm();
});

// ── Modal ──────────────────────────────────────────────────────
const showSysModal = (title, message, confirmCallback = null, confirmText = 'Confirmar') => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    titleEl.textContent = title;
    msgEl.textContent = message;
    actions.innerHTML = '';
    if (confirmCallback) {
        const btnCancel = document.createElement('button');
        btnCancel.className = 'button secondary';
        btnCancel.textContent = 'Cancelar';
        btnCancel.onclick = () => { backdrop.style.display = 'none'; };
        const btnOk = document.createElement('button');
        btnOk.className = 'button danger';
        btnOk.textContent = confirmText;
        btnOk.onclick = () => { backdrop.style.display = 'none'; confirmCallback(); };
        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);
    } else {
        const btnOk = document.createElement('button');
        btnOk.className = 'button primary';
        btnOk.textContent = 'Aceptar';
        btnOk.onclick = () => { backdrop.style.display = 'none'; };
        actions.appendChild(btnOk);
    }
    backdrop.style.display = 'flex';
};

// ── Poblar select #category con los valores del backend ────────
const CATEGORY_MAP = ['Medicine', 'Vaccine', 'Food', 'Accessory', 'Supplement', 'Other'];
const CATEGORY_LABELS = ['Medicamento', 'Vacuna', 'Alimento', 'Accesorio', 'Suplemento', 'Otro'];

const setupCategorySelect = () => {
    const select = document.getElementById('category');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione categoría...</option>' +
        CATEGORY_LABELS.map((label, i) =>
            `<option value="${i}">${label}</option>`
        ).join('');
};

// ── Estado ─────────────────────────────────────────────────────
let products = [];
let editingId = null;

// ── Cargar productos → #inventory-list ────────────────────────
const loadProducts = async () => {
    const container = document.getElementById('inventory-list');
    if (container) container.innerHTML = '<p style="text-align:center;padding:20px;color:#aaa;">⏳ Cargando inventario...</p>';
    try {
        products = await productsAPI.getAll();
        renderProducts(products);
    } catch (err) {
        if (container) container.innerHTML = '<p style="color:red;padding:20px;">Error cargando inventario.</p>';
    }
};

const renderProducts = (list) => {
    const container = document.getElementById('inventory-list');
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<p style="text-align:center;padding:30px;color:#aaa;">📦 No hay productos registrados.</p>';
        return;
    }
    const ICONS = {
        Medicine: 'fa-pills', Vaccine: 'fa-syringe', Food: 'fa-bone',
        Accessory: 'fa-tag', Supplement: 'fa-capsules', Other: 'fa-box'
    };
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Precio</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${list.map(p => {
        const catIdx = CATEGORY_MAP.indexOf(p.category);
        const catLabel = catIdx >= 0 ? CATEGORY_LABELS[catIdx] : p.category;
        const icon = ICONS[p.category] || 'fa-box';
        const lowStock = p.isLowStock;
        return `
                    <tr style="${lowStock ? 'background:#fff3cd;' : ''}">
                        <td>
                            <i class="fas ${icon}" style="margin-right:6px;color:var(--arya-primary);"></i>
                            <strong>${p.name}</strong>
                            ${p.expiryDate ? `<br><small style="color:#e67e22;"><i class="fas fa-calendar-times"></i> Vence: ${formatDate(p.expiryDate)}</small>` : ''}
                        </td>
                        <td><span style="background:#e8f4f8;color:#3498db;padding:3px 10px;border-radius:12px;font-size:12px;">${catLabel}</span></td>
                        <td>
                            <span style="font-weight:700;color:${lowStock ? '#e74c3c' : '#2ecc71'};">
                                ${p.stock}
                            </span>
                            <small style="color:#999;">/ min ${p.minStock}</small>
                            ${lowStock ? '<br><span style="font-size:11px;color:#e74c3c;">⚠ Stock bajo</span>' : ''}
                        </td>
                        <td>${formatCurrency(p.price)}</td>
                        <td style="font-size:13px;color:#666;">${p.supplier || '—'}</td>
                        <td>
                            <span style="padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;
                                background:${p.isActive ? '#e8f5e9' : '#fce4ec'};
                                color:${p.isActive ? '#2e7d32' : '#c62828'};">
                                ${p.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>
                            <div class="action-group">
                                <button class="icon-button edit" onclick="loadEditProduct(${p.id})" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="icon-button complete" onclick="adjustStockModal(${p.id}, '${p.name.replace(/'/g, "\\'")}', ${p.stock})" title="Ajustar stock">
                                    <i class="fas fa-boxes"></i>
                                </button>
                                <button class="icon-button delete" onclick="deleteProductModal(${p.id})" title="Desactivar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
    }).join('')}
            </tbody>
        </table>
    `;
};

// ── Formulario (IDs reales del HTML) ──────────────────────────
const setupForm = () => {
    const form = document.getElementById('product-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value.trim(),
            category: parseInt(document.getElementById('category').value),
            stock: parseInt(document.getElementById('quantity').value),
            price: parseFloat(document.getElementById('price').value),
            supplier: document.getElementById('supplier')?.value.trim() || null,
            minStock: 5,
            description: null,
        };

        if (!data.name || isNaN(data.category) || isNaN(data.stock) || isNaN(data.price)) {
            showSysModal('Campos requeridos', 'Completa nombre, categoría, existencias y precio.');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            if (editingId) {
                await productsAPI.update(editingId, data);
                showToast('Producto actualizado', 'success');
                editingId = null;
                resetFormUI();
            } else {
                await productsAPI.create(data);
                showToast('Producto creado', 'success');
            }
            form.reset();
            setupCategorySelect();
            await loadProducts();
        } catch (err) {
            showSysModal('Error', err.message || 'No se pudo guardar el producto.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        }
    });
};

// ── Cargar datos en formulario para editar ─────────────────────
window.loadEditProduct = async (id) => {
    try {
        const p = await productsAPI.getById(id);
        editingId = id;
        document.getElementById('product-id').value = id;
        document.getElementById('name').value = p.name;
        const catIdx = CATEGORY_MAP.indexOf(p.category);
        document.getElementById('category').value = catIdx >= 0 ? catIdx : '';
        document.getElementById('quantity').value = p.stock;
        document.getElementById('price').value = p.price;
        if (document.getElementById('supplier'))
            document.getElementById('supplier').value = p.supplier || '';
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
        showToast('Editando producto — modifica y guarda', 'info');
    } catch (err) { showSysModal('Error', err.message); }
};

window.resetFormUI = () => {
    editingId = null;
    document.getElementById('product-id').value = '';
    setupCategorySelect();
};

// ── Ajustar stock con modal ────────────────────────────────────
window.adjustStockModal = (id, name, currentStock) => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    titleEl.textContent = `Ajustar Stock — ${name}`;
    msgEl.innerHTML = `
        <p style="margin-bottom:12px;">Stock actual: <strong>${currentStock}</strong></p>
        <div style="display:flex;gap:10px;align-items:center;">
            <label style="font-weight:600;">Cantidad a ajustar:</label>
            <input id="stock-adjust-input" type="number" value="0"
                style="width:100px;padding:8px;border:2px solid #ddd;border-radius:8px;font-size:15px;">
        </div>
        <p style="margin-top:8px;font-size:13px;color:#777;">Positivo para agregar, negativo para restar.</p>
    `;
    actions.innerHTML = '';
    const btnCancel = document.createElement('button');
    btnCancel.className = 'button secondary';
    btnCancel.textContent = 'Cancelar';
    btnCancel.onclick = () => { backdrop.style.display = 'none'; };
    const btnOk = document.createElement('button');
    btnOk.className = 'button primary';
    btnOk.textContent = 'Aplicar';
    btnOk.onclick = async () => {
        const qty = parseInt(document.getElementById('stock-adjust-input')?.value);
        if (isNaN(qty) || qty === 0) { showToast('Ingresa una cantidad válida', 'warning'); return; }
        backdrop.style.display = 'none';
        try {
            await productsAPI.updateStock(id, qty);
            showToast(`Stock actualizado: ${currentStock} → ${currentStock + qty}`, 'success');
            await loadProducts();
        } catch (err) { showSysModal('Error', err.message); }
    };
    actions.appendChild(btnCancel);
    actions.appendChild(btnOk);
    backdrop.style.display = 'flex';
    setTimeout(() => document.getElementById('stock-adjust-input')?.focus(), 100);
};

// ── Eliminar ───────────────────────────────────────────────────
window.deleteProductModal = (id) => {
    const product = products.find(p => p.id === id);
    showSysModal(
        'Desactivar Producto',
        `¿Desactivar "${product?.name}"? Solo aplica si el stock es 0.`,
        async () => {
            try {
                await productsAPI.delete(id);
                showToast('Producto desactivado', 'warning');
                await loadProducts();
            } catch (err) { showSysModal('Error', err.message); }
        }
    );
};
