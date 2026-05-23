// Admin.js — Panel Administrativo conectado al backend

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    setupTabs();
    await Promise.all([
        renderUsers(),
        generateReport(),
        renderCatalogue()
    ]);

    // Botón crear usuario
    const createUserBtn = document.getElementById('create-user-btn');
    if (createUserBtn) {
        createUserBtn.onclick = openCreateUserModal;
    }

    // Botón agregar nuevo producto
    const addNewItemBtn = document.getElementById('add-new-item-btn');
    if (addNewItemBtn) {
        addNewItemBtn.onclick = openCreateProductModal;
    }

    document.getElementById('generate-report-btn')?.addEventListener('click', generateReport);
});

// ── Modal de sistema ───────────────────────────────────────────
const showSystemModal = (title, message, isConfirm = false, callback = null) => {
    return new Promise(resolve => {
        const backdrop = document.getElementById('system-modal-backdrop');
        const modal = document.getElementById('system-modal');
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');
        const actions = document.getElementById('modal-actions');
        if (!backdrop || !modal) { resolve(window.confirm(message)); return; }
        titleEl.textContent = title;
        msgEl.innerHTML = message;
        actions.innerHTML = '';
        const btnOk = document.createElement('button');
        btnOk.className = 'button primary';
        btnOk.textContent = isConfirm ? 'Confirmar' : 'Cerrar';
        actions.appendChild(btnOk);
        if (isConfirm) {
            const btnCancel = document.createElement('button');
            btnCancel.className = 'button danger';
            btnCancel.textContent = 'Cancelar';
            actions.prepend(btnCancel);
            btnCancel.addEventListener('click', () => { backdrop.style.display = 'none'; resolve(false); }, { once: true });
        }
        backdrop.style.display = 'flex';
        btnOk.addEventListener('click', () => {
            backdrop.style.display = 'none';
            if (callback) callback();
            resolve(true);
        }, { once: true });
    });
};

// ── Tabs ───────────────────────────────────────────────────────
const setupTabs = () => {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.getAttribute('data-tab'));
            if (target) target.classList.add('active');
        });
    });
};

// ==========================================
// CATÁLOGO DE PRODUCTOS
// ==========================================

const CATEGORY_LABELS = {
    'Medicine': '💊 Medicamento',
    'Vaccine': '💉 Vacuna',
    'Food': '🍖 Alimento',
    'Accessory': '🧸 Accesorio',
    'Supplement': '💪 Suplemento',
    'Other': '📦 Otro'
};

const renderCatalogue = async () => {
    const container = document.getElementById('catalogue-list');
    if (!container) return;

    container.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando catálogo...</p>
        </div>
    `;

    try {
        const products = await productsAPI.getAll();

        if (!products || !products.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos registrados.</p>
                    <small>Use el botón "Agregar Nuevo Ítem" para crear productos.</small>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(p => `
            <div class="catalogue-item">
                <span data-label="Nombre">
                    <strong>${escapeHtml(p.name)}</strong><br>
                    <small style="color:#888;">ID: ${p.id}</small>
                </span>
                <span data-label="Tipo">${CATEGORY_LABELS[p.category] || p.category}</span>
                <span data-label="Precio" class="price-display">${formatCurrency(p.price)}</span>
                <span data-label="IVA">${(p.taxPercentage || 19)}%</span>
                <span class="catalogue-actions">
                    <button class="edit-btn" onclick="editCatalogueItem(${p.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </span>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Error cargando catálogo.</p>
                <button class="button primary" onclick="renderCatalogue()" style="margin-top:10px;">
                    <i class="fas fa-sync-alt"></i> Reintentar
                </button>
            </div>
        `;
    }
};

// ── Abrir modal para crear nuevo producto ─────────────────────
const openCreateProductModal = () => {
    const createHTML = `
        <div style="text-align:left;">
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-tag"></i> NOMBRE:</label>
                    <input id="product-name" type="text" placeholder="Ej: Amoxicilina" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-box"></i> CATEGORÍA:</label>
                    <select id="product-category" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                        <option value="Medicine">💊 Medicamento</option>
                        <option value="Vaccine">💉 Vacuna</option>
                        <option value="Food">🍖 Alimento</option>
                        <option value="Accessory">🧸 Accesorio</option>
                        <option value="Supplement">💪 Suplemento</option>
                        <option value="Other">📦 Otro</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-dollar-sign"></i> PRECIO:</label>
                    <input id="product-price" type="number" step="0.01" placeholder="0.00" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-percent"></i> IVA (%):</label>
                    <input id="product-tax" type="number" step="0.01" value="19" placeholder="19" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-cubes"></i> STOCK:</label>
                    <input id="product-stock" type="number" value="0" placeholder="0" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-chart-line"></i> STOCK MÍNIMO:</label>
                    <input id="product-minstock" type="number" value="5" placeholder="5" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-align-left"></i> DESCRIPCIÓN:</label>
                <textarea id="product-description" rows="3" placeholder="Descripción del producto..." style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px; resize:vertical;"></textarea>
            </div>
        </div>
    `;

    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');

    titleEl.innerHTML = '<i class="fas fa-plus-circle"></i> Agregar Nuevo Producto';
    msgEl.innerHTML = createHTML;
    actions.innerHTML = `
        <button class="button secondary" id="cancel-product-btn" style="background: #95a5a6;">
            <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="button primary" id="save-product-btn" style="background: linear-gradient(135deg, #8e44ad, #6c3483);">
            <i class="fas fa-save"></i> Guardar Producto
        </button>
    `;

    backdrop.style.display = 'flex';

    document.getElementById('cancel-product-btn').onclick = () => {
        backdrop.style.display = 'none';
    };

    document.getElementById('save-product-btn').onclick = async () => {
        const name = document.getElementById('product-name')?.value.trim();
        const category = document.getElementById('product-category')?.value;
        const price = parseFloat(document.getElementById('product-price')?.value);
        const taxPercentage = parseFloat(document.getElementById('product-tax')?.value) || 19;
        const stock = parseInt(document.getElementById('product-stock')?.value) || 0;
        const minStock = parseInt(document.getElementById('product-minstock')?.value) || 5;
        const description = document.getElementById('product-description')?.value.trim();

        if (!name) {
            alert('❌ El nombre del producto es obligatorio');
            return;
        }

        if (isNaN(price) || price <= 0) {
            alert('❌ Ingrese un precio válido');
            return;
        }

        const data = {
            name: name,
            category: category,
            price: price,
            taxPercentage: taxPercentage,
            stock: stock,
            minStock: minStock,
            description: description || null
        };

        const saveBtn = document.getElementById('save-product-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            await productsAPI.create(data);
            backdrop.style.display = 'none';
            alert('✅ Producto creado correctamente');
            await renderCatalogue();
        } catch (err) {
            alert('❌ Error: ' + (err.message || 'No se pudo crear el producto'));
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Producto';
        }
    };
};

// ── Editar producto ───────────────────────────────────────────
window.editCatalogueItem = async (id) => {
    try {
        const product = await productsAPI.getById(id);

        const editHTML = `
            <div style="text-align:left;">
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-tag"></i> NOMBRE:</label>
                        <input id="edit-product-name" type="text" value="${escapeHtml(product.name)}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-box"></i> CATEGORÍA:</label>
                        <select id="edit-product-category" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                            <option value="Medicine" ${product.category === 'Medicine' ? 'selected' : ''}>💊 Medicamento</option>
                            <option value="Vaccine" ${product.category === 'Vaccine' ? 'selected' : ''}>💉 Vacuna</option>
                            <option value="Food" ${product.category === 'Food' ? 'selected' : ''}>🍖 Alimento</option>
                            <option value="Accessory" ${product.category === 'Accessory' ? 'selected' : ''}>🧸 Accesorio</option>
                            <option value="Supplement" ${product.category === 'Supplement' ? 'selected' : ''}>💪 Suplemento</option>
                            <option value="Other" ${product.category === 'Other' ? 'selected' : ''}>📦 Otro</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-dollar-sign"></i> PRECIO:</label>
                        <input id="edit-product-price" type="number" step="0.01" value="${product.price}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-percent"></i> IVA (%):</label>
                        <input id="edit-product-tax" type="number" step="0.01" value="${product.taxPercentage || 19}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-cubes"></i> STOCK:</label>
                        <input id="edit-product-stock" type="number" value="${product.stock}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-chart-line"></i> STOCK MÍNIMO:</label>
                        <input id="edit-product-minstock" type="number" value="${product.minStock || 5}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-align-left"></i> DESCRIPCIÓN:</label>
                    <textarea id="edit-product-description" rows="3" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px; resize:vertical;">${escapeHtml(product.description || '')}</textarea>
                </div>
            </div>
        `;

        const backdrop = document.getElementById('system-modal-backdrop');
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');
        const actions = document.getElementById('modal-actions');

        titleEl.innerHTML = '<i class="fas fa-edit"></i> Editar Producto';
        msgEl.innerHTML = editHTML;
        actions.innerHTML = `
            <button class="button secondary" id="cancel-edit-product-btn" style="background: #95a5a6;">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="button primary" id="save-edit-product-btn" style="background: linear-gradient(135deg, #8e44ad, #6c3483);">
                <i class="fas fa-save"></i> Guardar Cambios
            </button>
        `;

        backdrop.style.display = 'flex';

        document.getElementById('cancel-edit-product-btn').onclick = () => {
            backdrop.style.display = 'none';
        };

        document.getElementById('save-edit-product-btn').onclick = async () => {
            const name = document.getElementById('edit-product-name')?.value.trim();
            const category = document.getElementById('edit-product-category')?.value;
            const price = parseFloat(document.getElementById('edit-product-price')?.value);
            const taxPercentage = parseFloat(document.getElementById('edit-product-tax')?.value) || 19;
            const stock = parseInt(document.getElementById('edit-product-stock')?.value) || 0;
            const minStock = parseInt(document.getElementById('edit-product-minstock')?.value) || 5;
            const description = document.getElementById('edit-product-description')?.value.trim();

            if (!name) {
                alert('❌ El nombre del producto es obligatorio');
                return;
            }

            if (isNaN(price) || price <= 0) {
                alert('❌ Ingrese un precio válido');
                return;
            }

            const data = {
                name: name,
                category: category,
                price: price,
                taxPercentage: taxPercentage,
                stock: stock,
                minStock: minStock,
                description: description || null
            };

            const saveBtn = document.getElementById('save-edit-product-btn');
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                await productsAPI.update(id, data);
                backdrop.style.display = 'none';
                alert('✅ Producto actualizado correctamente');
                await renderCatalogue();
            } catch (err) {
                alert('❌ Error: ' + (err.message || 'No se pudo actualizar el producto'));
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            }
        };

    } catch (err) {
        alert('❌ Error cargando producto: ' + err.message);
    }
};

// Función auxiliar para escapar HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

const renderUsers = async () => {
    const container = document.querySelector('.users-container');
    if (!container) return;

    container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fas fa-spinner fa-spin"></i> Cargando usuarios...</div>';

    try {
        const users = await usersAPI.getAll();

        if (!users.length) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">No hay usuarios registrados.</div>';
            return;
        }

        const roleColors = {
            'Admin': '#e74c3c',
            'Veterinarian': '#2ecc71',
            'Receptionist': '#3498db',
            'AuxVet': '#f39c12'
        };

        const roleLabels = {
            'Admin': 'Administrador',
            'Veterinarian': 'Veterinario',
            'Receptionist': 'Recepcionista',
            'AuxVet': 'Auxiliar Vet.'
        };

        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-avatar">
                    <i class="fas ${user.role === 'Admin' ? 'fa-user-shield' : user.role === 'Veterinarian' ? 'fa-user-md' : 'fa-user'}"></i>
                </div>
                <div class="user-info">
                    <h4>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</h4>
                    <p><i class="fas fa-envelope"></i> ${escapeHtml(user.email)}</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px;">
                        <span class="user-role" style="background: ${roleColors[user.role] || '#95a5a6'}">${roleLabels[user.role] || user.role}</span>
                        <span class="user-status ${user.isActive ? 'status-enabled' : 'status-disabled'}">
                            <i class="fas ${user.isActive ? 'fa-check-circle' : 'fa-ban'}"></i>
                            ${user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="icon-button edit" onclick="editUser(${user.id})" title="Editar usuario">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-button toggle-status-btn ${user.isActive ? '' : 'active'}" 
                            onclick="toggleUser(${user.id}, '${escapeHtml(user.firstName)}')" 
                            title="${user.isActive ? 'Desactivar usuario' : 'Activar usuario'}">
                        <i class="fas ${user.isActive ? 'fa-ban' : 'fa-check-circle'}"></i>
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="text-align:center;padding:40px;color:red;">Error cargando usuarios.</div>';
    }
};

window.toggleUser = async (id, name) => {
    const confirmed = confirm(`¿Estás seguro de cambiar el estado del usuario ${name}?`);
    if (!confirmed) return;

    try {
        await usersAPI.toggleActive(id);
        alert('✅ Estado del usuario actualizado');
        await renderUsers();
    } catch (err) {
        alert('❌ Error: ' + (err.message || 'No se pudo cambiar el estado'));
    }
};

window.editUser = async (id) => {
    try {
        const user = await usersAPI.getById(id);

        const editHTML = `
            <div style="text-align:left;">
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-user"></i> NOMBRE:</label>
                        <input id="edit-firstname" type="text" value="${escapeHtml(user.firstName)}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-user"></i> APELLIDO:</label>
                        <input id="edit-lastname" type="text" value="${escapeHtml(user.lastName)}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-id-card"></i> DOCUMENTO:</label>
                        <input id="edit-document" type="text" value="${escapeHtml(user.document)}" readonly disabled style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px; background:#f5f5f5;">
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-envelope"></i> EMAIL:</label>
                        <input id="edit-email" type="email" value="${escapeHtml(user.email)}" readonly disabled style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px; background:#f5f5f5;">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-lock"></i> NUEVA CONTRASEÑA:</label>
                        <input id="edit-password" type="password" placeholder="Dejar vacío para mantener la actual" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                        <small style="display:block; margin-top:5px; color:#6c757d;">Mínimo 8 caracteres si desea cambiarla</small>
                    </div>
                    <div class="form-group" style="flex:1">
                        <label><i class="fas fa-phone"></i> TELÉFONO:</label>
                        <input id="edit-phone" type="text" value="${escapeHtml(user.phone)}" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-user-tag"></i> ROL:</label>
                    <select id="edit-role" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                        <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Administrador</option>
                        <option value="Veterinarian" ${user.role === 'Veterinarian' ? 'selected' : ''}>Veterinario</option>
                        <option value="Receptionist" ${user.role === 'Receptionist' ? 'selected' : ''}>Recepcionista</option>
                        <option value="AuxVet" ${user.role === 'AuxVet' ? 'selected' : ''}>Auxiliar Veterinario</option>
                    </select>
                </div>
            </div>
        `;

        const backdrop = document.getElementById('system-modal-backdrop');
        const titleEl = document.getElementById('modal-title');
        const msgEl = document.getElementById('modal-message');
        const actions = document.getElementById('modal-actions');

        titleEl.innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuario';
        msgEl.innerHTML = editHTML;
        actions.innerHTML = `
            <button class="button secondary" id="cancel-edit-btn" style="background: #95a5a6;">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="button primary" id="save-edit-btn" style="background: linear-gradient(135deg, #8e44ad, #6c3483);">
                <i class="fas fa-save"></i> Guardar Cambios
            </button>
        `;

        backdrop.style.display = 'flex';

        document.getElementById('cancel-edit-btn').onclick = () => {
            backdrop.style.display = 'none';
        };

        document.getElementById('save-edit-btn').onclick = async () => {
            const newPassword = document.getElementById('edit-password').value.trim();
            const firstName = document.getElementById('edit-firstname').value.trim();
            const lastName = document.getElementById('edit-lastname').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            const role = document.getElementById('edit-role').value;

            if (!firstName || !lastName || !phone) {
                alert('❌ Nombre, apellido y teléfono son requeridos');
                return;
            }

            if (newPassword && newPassword.length < 8) {
                alert('❌ La nueva contraseña debe tener al menos 8 caracteres');
                return;
            }

            const data = {
                firstName,
                lastName,
                document: user.document,
                email: user.email,
                password: newPassword || 'NoChange123!',
                phone,
                role
            };

            try {
                await usersAPI.update(id, data);

                if (newPassword) {
                    const passwords = JSON.parse(localStorage.getItem('ra_passwords') || '{}');
                    passwords[user.email.toLowerCase()] = newPassword;
                    localStorage.setItem('ra_passwords', JSON.stringify(passwords));
                }

                backdrop.style.display = 'none';
                alert('✅ Usuario actualizado correctamente');
                await renderUsers();

            } catch (err) {
                alert('❌ Error: ' + (err.message || 'No se pudo actualizar el usuario'));
            }
        };

    } catch (err) {
        alert('❌ Error cargando usuario: ' + err.message);
    }
};

// ── Crear usuario ──────────────────────────────────────────────
const openCreateUserModal = async () => {
    const createHTML = `
        <div style="text-align:left;">
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-user"></i> NOMBRE:</label>
                    <input id="new-firstname" type="text" placeholder="Ej: Juan" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-user"></i> APELLIDO:</label>
                    <input id="new-lastname" type="text" placeholder="Ej: Pérez" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-id-card"></i> DOCUMENTO:</label>
                    <input id="new-document" type="text" placeholder="Número de documento" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-envelope"></i> EMAIL:</label>
                    <input id="new-email" type="email" placeholder="correo@ejemplo.com" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-lock"></i> CONTRASEÑA:</label>
                    <input id="new-password" type="password" placeholder="Mínimo 8 caracteres" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    <small style="display:block; margin-top:5px; color:#6c757d;">La contraseña debe tener al menos 8 caracteres</small>
                </div>
                <div class="form-group" style="flex:1">
                    <label><i class="fas fa-phone"></i> TELÉFONO:</label>
                    <input id="new-phone" type="text" placeholder="3XXXXXXXXX" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-user-tag"></i> ROL:</label>
                <select id="new-role" style="width:100%; padding:12px; border:2px solid #e0e0e0; border-radius:10px;">
                    <option value="Admin">Administrador</option>
                    <option value="Veterinarian">Veterinario</option>
                    <option value="Receptionist">Recepcionista</option>
                    <option value="AuxVet">Auxiliar Veterinario</option>
                </select>
            </div>
        </div>
    `;

    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');

    titleEl.innerHTML = '<i class="fas fa-user-plus"></i> Crear Nuevo Usuario';
    msgEl.innerHTML = createHTML;
    actions.innerHTML = `
        <button class="button secondary" id="cancel-create-btn" style="background: #95a5a6;">
            <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="button primary" id="confirm-create-btn" style="background: linear-gradient(135deg, #8e44ad, #6c3483);">
            <i class="fas fa-check"></i> Crear Usuario
        </button>
    `;

    backdrop.style.display = 'flex';

    document.getElementById('cancel-create-btn').onclick = () => {
        backdrop.style.display = 'none';
    };

    document.getElementById('confirm-create-btn').onclick = async () => {
        const firstName = document.getElementById('new-firstname')?.value.trim();
        const lastName = document.getElementById('new-lastname')?.value.trim();
        const documentNum = document.getElementById('new-document')?.value.trim();
        const email = document.getElementById('new-email')?.value.trim();
        const password = document.getElementById('new-password')?.value;
        const phone = document.getElementById('new-phone')?.value.trim();
        const role = document.getElementById('new-role')?.value;

        if (!firstName || !lastName || !documentNum || !email || !password || !phone) {
            alert('❌ Por favor complete todos los campos');
            return;
        }

        if (password.length < 8) {
            alert('❌ La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (!email.includes('@')) {
            alert('❌ Ingrese un email válido');
            return;
        }

        const data = { firstName, lastName, document: documentNum, email, password, phone, role };

        try {
            await usersAPI.create(data);

            const passwords = JSON.parse(localStorage.getItem('ra_passwords') || '{}');
            passwords[email.toLowerCase()] = password;
            localStorage.setItem('ra_passwords', JSON.stringify(passwords));

            backdrop.style.display = 'none';
            alert('✅ Usuario creado correctamente');
            await renderUsers();

        } catch (err) {
            alert('❌ Error: ' + (err.message || 'No se pudo crear el usuario'));
        }
    };
};

// ==========================================
// REPORTES
// ==========================================

const generateReport = async () => {
    const type = document.getElementById('report-type')?.value || 'summary';
    const output = document.getElementById('report-output');
    if (!output) return;
    output.innerHTML = '<p style="color:#aaa;">Cargando reporte...</p>';
    try {
        if (type === 'summary') {
            const [invoices, appointments, owners] = await Promise.all([
                invoicesAPI.getAll(),
                appointmentsAPI.getAll(),
                ownersAPI.getAll(),
            ]);
            const paid = invoices.filter(i => i.status === 'Paid');
            const total = paid.reduce((s, i) => s + i.total, 0);
            const tax = paid.reduce((s, i) => s + i.tax, 0);
            const completed = appointments.filter(a => a.status === 'Completed').length;
            output.innerHTML = `
                <h3><i class="fas fa-money-bill-wave"></i> Resumen General</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-top:16px;">
                    <div class="report-stat"><p>Facturas pagadas</p><strong>${paid.length}</strong></div>
                    <div class="report-stat"><p>Total recaudado</p><strong>${formatCurrency(total)}</strong></div>
                    <div class="report-stat"><p>IVA recaudado</p><strong>${formatCurrency(tax)}</strong></div>
                    <div class="report-stat"><p>Citas completadas</p><strong>${completed}</strong></div>
                    <div class="report-stat"><p>Propietarios</p><strong>${owners.length}</strong></div>
                </div>
            `;
        } else if (type === 'appointments') {
            const appointments = await appointmentsAPI.getAll();
            const byVet = {};
            appointments.forEach(a => {
                byVet[a.veterinarianFullName] = (byVet[a.veterinarianFullName] || 0) + 1;
            });
            output.innerHTML = `
                <h3><i class="fas fa-calendar-check"></i> Citas por Veterinario</h3>
                <p>Total citas: <strong>${appointments.length}</strong></p>
                <ul style="margin-top:12px;">
                    ${Object.entries(byVet).map(([vet, count]) =>
                `<li><strong>${escapeHtml(vet)}:</strong> ${count} citas</li>`
            ).join('')}
                </ul>
            `;
        }
    } catch (err) {
        output.innerHTML = '<p style="color:red;">Error generando reporte.</p>';
    }
};