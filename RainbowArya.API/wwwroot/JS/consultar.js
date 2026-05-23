// Consultar.js — Consulta de Citas conectado al backend

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    await loadAllAppointments();
    setupFilters();
    setupSearch();
});

const showModal = (title, message, isSuccess = true, callback = null) => {
    const modal   = document.getElementById('notification-modal');
    const titleEl = document.getElementById('modal-title');
    const msgEl   = document.getElementById('modal-message');
    const iconEl  = document.getElementById('modal-icon');
    const closeBtn= document.getElementById('modal-close-btn');
    titleEl.textContent = title;
    msgEl.textContent   = message;
    iconEl.className    = isSuccess ? 'icon-large fas fa-check-circle' : 'icon-large fas fa-times-circle';
    iconEl.style.color  = isSuccess ? 'var(--arya-secondary)' : 'var(--danger-color)';
    closeBtn.style.backgroundColor = isSuccess ? 'var(--arya-secondary)' : 'var(--danger-color)';
    closeBtn.onclick = callback || closeModal;
    modal.style.display = 'flex';
};
const closeModal = () => document.getElementById('notification-modal').style.display = 'none';

let allAppointments = [];

const STATUS_COLORS = {
    Scheduled:  '#3498db',
    InProgress: '#f39c12',
    Completed:  '#2ecc71',
    Cancelled:  '#e74c3c',
};

const loadAllAppointments = async () => {
    showLoading('consultar-list', 'Cargando citas...');
    try {
        allAppointments = await appointmentsAPI.getAll();
        renderAppointments(allAppointments);
        updateCounters(allAppointments);
    } catch (err) {
        showEmpty('consultar-list', 'Error cargando citas.', '❌');
    }
};

const updateCounters = (list) => {
    const counts = { Scheduled: 0, InProgress: 0, Completed: 0, Cancelled: 0 };
    list.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
    Object.entries(counts).forEach(([status, count]) => {
        const el = document.getElementById('count-' + status.toLowerCase());
        if (el) el.textContent = count;
    });
    const totalEl = document.getElementById('count-total');
    if (totalEl) totalEl.textContent = list.length;
};

const renderAppointments = (list) => {
    const container = document.getElementById('consultar-list');
    if (!container) return;
    if (!list.length) { showEmpty('consultar-list', 'No se encontraron citas.', '📅'); return; }

    container.innerHTML = list.map(a => {
        const statusColor = STATUS_COLORS[a.status] || '#95a5a6';
        const statusLabel = APPOINTMENT_STATUS_LABELS[a.status] || a.status;
        const typeLabel   = APPOINTMENT_TYPE_LABELS[a.type] || a.type;

        return '<div class="consultar-card" style="display:flex;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);margin-bottom:14px;overflow:hidden;">' +
            '<div style="width:5px;background:' + statusColor + ';flex-shrink:0;"></div>' +
            '<div style="flex:1;padding:16px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">' +
                    '<div>' +
                        '<h4 style="margin:0 0 6px;"><i class="fas fa-paw"></i> ' + a.petName + ' <small style="font-weight:400;color:#777;">— ' + a.ownerFullName + '</small></h4>' +
                        '<p style="margin:4px 0;"><i class="fas fa-user-md"></i> <strong>' + a.veterinarianFullName + '</strong></p>' +
                        '<p style="margin:4px 0;"><i class="fas fa-calendar-alt"></i> ' + formatDateTime(a.appointmentDate) + '</p>' +
                        '<p style="margin:4px 0;"><i class="fas fa-tag"></i> ' + typeLabel + '</p>' +
                        (a.notes ? '<p style="margin:4px 0;color:#666;"><i class="fas fa-sticky-note"></i> ' + a.notes + '</p>' : '') +
                        (a.cancellationReason ? '<p style="margin:4px 0;color:#e74c3c;"><i class="fas fa-ban"></i> ' + a.cancellationReason + '</p>' : '') +
                        (a.hasMedicalRecord ? '<span style="font-size:12px;background:#e8f5e9;color:#2ecc71;padding:3px 10px;border-radius:12px;"><i class="fas fa-file-medical"></i> Historia clínica</span>' : '') +
                    '</div>' +
                    '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">' +
                        '<span style="background:' + statusColor + ';color:white;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:600;">' + statusLabel + '</span>' +
                        '<button class="button secondary btn-sm" onclick="viewDetail(' + a.id + ')"><i class="fas fa-eye"></i> Detalle</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
};

const setupFilters = () => {
    const filterStatus = document.getElementById('filter-status');
    const filterDate   = document.getElementById('filter-date');
    const filterType   = document.getElementById('filter-type');

    if (filterType) {
        filterType.innerHTML = '<option value="">Todos los tipos</option>' +
            Object.entries(APPOINTMENT_TYPE_LABELS).map(function(e) {
                return '<option value="' + e[0] + '">' + e[1] + '</option>';
            }).join('');
    }

    const apply = () => {
        let filtered = allAppointments.slice();
        if (filterStatus && filterStatus.value) filtered = filtered.filter(a => a.status === filterStatus.value);
        if (filterDate && filterDate.value)     filtered = filtered.filter(a => a.appointmentDate && a.appointmentDate.startsWith(filterDate.value));
        if (filterType && filterType.value)     filtered = filtered.filter(a => a.type === filterType.value);
        renderAppointments(filtered);
        updateCounters(filtered);
    };

    if (filterStatus) filterStatus.addEventListener('change', apply);
    if (filterDate)   filterDate.addEventListener('input', apply);
    if (filterType)   filterType.addEventListener('change', apply);

    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (filterStatus) filterStatus.value = '';
        if (filterDate)   filterDate.value   = '';
        if (filterType)   filterType.value   = '';
        renderAppointments(allAppointments);
        updateCounters(allAppointments);
    });
};

const setupSearch = () => {
    const input = document.getElementById('search-consultar');
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        const filtered = allAppointments.filter(a =>
            a.petName.toLowerCase().includes(q) ||
            a.ownerFullName.toLowerCase().includes(q) ||
            a.veterinarianFullName.toLowerCase().includes(q)
        );
        renderAppointments(filtered);
        updateCounters(filtered);
    });
};

window.viewDetail = async (id) => {
    try {
        const a = await appointmentsAPI.getById(id);
        const statusColor = STATUS_COLORS[a.status] || '#95a5a6';
        const modal   = document.getElementById('notification-modal');
        const titleEl = document.getElementById('modal-title');
        const msgEl   = document.getElementById('modal-message');
        const closeBtn= document.getElementById('modal-close-btn');

        titleEl.innerHTML = '<i class="fas fa-calendar-check"></i> Detalle Cita #' + a.id;
        msgEl.innerHTML =
            '<div style="text-align:left;">' +
                '<div style="background:' + statusColor + ';color:white;padding:8px 16px;border-radius:8px;margin-bottom:16px;text-align:center;font-weight:700;">' +
                    (APPOINTMENT_STATUS_LABELS[a.status] || a.status) +
                '</div>' +
                '<p><strong>🐾 Mascota:</strong> ' + a.petName + '</p>' +
                '<p><strong>👤 Propietario:</strong> ' + a.ownerFullName + '</p>' +
                '<p><strong>👨‍⚕️ Veterinario:</strong> ' + a.veterinarianFullName + '</p>' +
                '<p><strong>📅 Fecha:</strong> ' + formatDateTime(a.appointmentDate) + '</p>' +
                '<p><strong>🏷️ Tipo:</strong> ' + (APPOINTMENT_TYPE_LABELS[a.type] || a.type) + '</p>' +
                (a.notes ? '<p><strong>📝 Notas:</strong> ' + a.notes + '</p>' : '') +
                (a.cancellationReason ? '<p style="color:#e74c3c;"><strong>❌ Cancelación:</strong> ' + a.cancellationReason + '</p>' : '') +
                (a.rescheduleCount > 0 ? '<p><strong>🔄 Reagendamientos:</strong> ' + a.rescheduleCount + '</p>' : '') +
                (a.hasMedicalRecord ? '<p style="color:#2ecc71;"><strong>📋 Historia:</strong> Registrada</p>' : '<p style="color:#f39c12;"><strong>📋 Historia:</strong> Pendiente</p>') +
            '</div>';

        closeBtn.style.backgroundColor = 'var(--arya-primary)';
        closeBtn.textContent = 'Cerrar';
        closeBtn.onclick = closeModal;
        modal.style.display = 'flex';
    } catch (err) { showModal('Error', err.message, false); }
};
