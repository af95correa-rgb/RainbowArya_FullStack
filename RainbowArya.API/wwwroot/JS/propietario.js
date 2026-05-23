// propietario.js — Módulo de Registro Asistido Mejorado

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    await loadOwners();
    setupRegistrationForm();
});

// ── Modal usando system-modal del HTML ─────────────────────────
const showSysModal = (title, message, confirmCallback = null, isSuccess = true) => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');

    titleEl.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="color: ${isSuccess ? '#2ecc71' : '#e74c3c'}"></i> ${title}`;
    msgEl.textContent = message;
    actions.innerHTML = '';

    if (confirmCallback) {
        const btnCancel = document.createElement('button');
        btnCancel.className = 'button secondary';
        btnCancel.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        btnCancel.onclick = () => { backdrop.style.display = 'none'; };

        const btnOk = document.createElement('button');
        btnOk.className = 'button danger';
        btnOk.innerHTML = '<i class="fas fa-check"></i> Confirmar';
        btnOk.onclick = () => { backdrop.style.display = 'none'; confirmCallback(); };

        actions.appendChild(btnCancel);
        actions.appendChild(btnOk);
    } else {
        const btnOk = document.createElement('button');
        btnOk.className = 'button primary';
        btnOk.innerHTML = '<i class="fas fa-check"></i> Aceptar';
        btnOk.onclick = () => { backdrop.style.display = 'none'; };
        actions.appendChild(btnOk);
    }
    backdrop.style.display = 'flex';
};

// ── Estado ─────────────────────────────────────────────────────
let owners = [];

// ── Cargar y renderizar propietarios ───────────────────────────
const loadOwners = async () => {
    const container = document.getElementById('invoices-list');
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: var(--arya-blue);"></i>
            <p style="margin-top: 10px; color: #6c757d;">Cargando clientes...</p>
        </div>`;

    try {
        owners = await ownersAPI.getAll();
        renderOwners(owners);
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #e74c3c;"></i>
                <p style="margin-top: 10px; color: #e74c3c;">Error al cargar los clientes</p>
            </div>`;
    }
};

const renderOwners = (list) => {
    const container = document.getElementById('invoices-list');
    if (!container) return;

    if (!list.length) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-users" style="font-size: 3em; color: #bdc3c7;"></i>
                <p style="margin-top: 10px; color: #6c757d;">No hay clientes registrados</p>
                <small>Complete el formulario para agregar su primer cliente</small>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: linear-gradient(135deg, #8e44ad, #6c3483); color: white;">
                        <th style="padding: 12px;"><i class="fas fa-user"></i> Nombre</th>
                        <th style="padding: 12px;"><i class="fas fa-id-card"></i> Documento</th>
                        <th style="padding: 12px;"><i class="fas fa-phone"></i> Teléfono</th>
                        <th style="padding: 12px;"><i class="fas fa-envelope"></i> Email</th>
                        <th style="padding: 12px;"><i class="fas fa-circle"></i> Estado</th>
                        <th style="padding: 12px;"><i class="fas fa-cog"></i> Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(o => `
                        <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 12px;"><strong>${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}</strong></td>
                            <td style="padding: 12px;">${escapeHtml(o.document)}</td>
                            <td style="padding: 12px;">${escapeHtml(o.phone) || '—'}</td>
                            <td style="padding: 12px;">${escapeHtml(o.email)}</td>
                            <td style="padding: 12px;">
                                <span class="status-badge ${o.isActive ? 'status-active' : 'status-inactive'}">
                                    <i class="fas ${o.isActive ? 'fa-check-circle' : 'fa-ban'}"></i>
                                    ${o.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td style="padding: 12px;">
                                <div class="action-group">
                                    <button class="icon-button ${o.isActive ? 'delete' : 'edit'}" 
                                            onclick="toggleOwnerStatus(${o.id}, '${escapeHtml(o.firstName)} ${escapeHtml(o.lastName)}', ${o.isActive})" 
                                            title="${o.isActive ? 'Desactivar cliente' : 'Activar cliente'}">
                                        <i class="fas ${o.isActive ? 'fa-user-slash' : 'fa-user-check'}"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <small style="color: #6c757d;">
                <i class="fas fa-chart-line"></i> Total de clientes: <strong>${list.length}</strong>
            </small>
        </div>
    `;
};

// Función para escapar HTML y evitar XSS
const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// ── Formulario de registro asistido mejorado ────────────────────
const setupRegistrationForm = () => {
    const form = document.getElementById('assisted-registration-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores
        const firstName = document.getElementById('reg-name').value.trim();
        const lastName = document.getElementById('reg-lastname').value.trim();
        const age = document.getElementById('reg-age').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const petName = document.getElementById('pet-name').value.trim();
        const petType = document.getElementById('pet-type').value;
        const petAge = parseInt(document.getElementById('pet-age').value) || 1;
        const petColor = document.getElementById('pet-color').value.trim();

        // Validaciones
        if (!firstName || !lastName || !phone || !email || !petName || !petType) {
            showSysModal('Campos Requeridos', 'Por favor completa todos los campos obligatorios.', null, false);
            return;
        }

        if (password && password.length < 6) {
            showSysModal('Contraseña Inválida', 'La contraseña debe tener al menos 6 caracteres.', null, false);
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

        // Mapear especie
        const speciesMap = { 'Canino': 0, 'Felino': 1, 'Ave': 2, 'Exotico': 3 };
        const speciesValue = speciesMap[petType] ?? 4;

        // Fecha de nacimiento estimada
        const birthYear = new Date().getFullYear() - petAge;
        const birthDate = `${birthYear}-01-01`;

        // Documento provisional
        const docProvisional = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);

        try {
            // Crear propietario
            const newOwner = await ownersAPI.create({
                firstName,
                lastName,
                document: docProvisional + Date.now().toString().slice(-4),
                email,
                phone,
                address: '',
            });

            // Crear mascota
            await petsAPI.create({
                name: petName,
                species: speciesValue,
                breed: 'Sin especificar',
                birthDate: birthDate,
                color: petColor || 'No especificado',
                weight: 5.0,
                ownerId: newOwner.id,
            });

            showSysModal(
                '¡Registro Exitoso!',
                `✅ ${firstName} ${lastName} y su mascota ${petName} han sido registrados correctamente.`,
                null,
                true
            );

            form.reset();
            await loadOwners();

        } catch (err) {
            console.error(err);
            showSysModal('Error en el Registro', err.message || 'No se pudo completar el registro. Intente nuevamente.', null, false);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
};

// ── Activar/Desactivar propietario ─────────────────────────────
window.toggleOwnerStatus = async (id, name, isActive) => {
    const action = isActive ? 'desactivar' : 'activar';
    const confirmed = confirm(`¿Estás seguro de ${action} al cliente ${name}?`);
    if (!confirmed) return;

    try {
        if (isActive) {
            // Desactivar (soft delete)
            await ownersAPI.delete(id);
            showToast(`✅ Cliente ${name} desactivado correctamente`, 'warning');
        } else {
            // Reactivar - obtener los datos actuales del cliente y enviar todos los campos
            const owner = owners.find(o => o.id === id);
            if (!owner) {
                showToast(`❌ No se encontraron datos del cliente`, 'error');
                return;
            }

            // Enviar todos los campos requeridos por el DTO
            const updateData = {
                firstName: owner.firstName,
                lastName: owner.lastName,
                document: owner.document,
                email: owner.email,
                phone: owner.phone,
                address: owner.address || ''
            };

            await ownersAPI.update(id, updateData);
            showToast(`✅ Cliente ${name} activado correctamente`, 'success');
        }
        await loadOwners();
    } catch (err) {
        console.error(err);
        showToast(`❌ Error al ${action} al cliente: ${err.message}`, 'error');
    }
};

// Función auxiliar para toasts
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#f39c12'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}