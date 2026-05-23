// agendar.js — Adaptado exactamente al HTML existente
// IDs reales: #veterinarian, #owner, #type, #date, #time, #pet, #notes
// Modal: #system-modal-backdrop

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    await Promise.all([loadVets(), loadOwners()]);
    await loadAppointments();
    setupForm();
});

// ── Modal usando system-modal del HTML ─────────────────────────
const showSysModal = (title, message, confirmCallback = null, confirmText = 'Confirmar') => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    titleEl.textContent = title;
    msgEl.innerHTML = message;
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

// Modal con input de texto (reemplaza prompt())
const showInputModal = (title, placeholder, callback) => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    titleEl.textContent = title;
    msgEl.innerHTML = `
        <textarea id="modal-input" rows="3" placeholder="${placeholder}"
            style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;
                   font-size:14px;box-sizing:border-box;margin-top:8px;resize:vertical;">
        </textarea>
    `;
    actions.innerHTML = '';

    const btnCancel = document.createElement('button');
    btnCancel.className = 'button secondary';
    btnCancel.textContent = 'Cancelar';
    btnCancel.onclick = () => { backdrop.style.display = 'none'; };

    const btnOk = document.createElement('button');
    btnOk.className = 'button danger';
    btnOk.textContent = 'Confirmar Cancelación';
    btnOk.onclick = () => {
        const val = document.getElementById('modal-input')?.value.trim();
        if (!val) { showToast('El motivo es obligatorio', 'warning'); return; }
        backdrop.style.display = 'none';
        callback(val);
    };
    actions.appendChild(btnCancel);
    actions.appendChild(btnOk);
    backdrop.style.display = 'flex';
    setTimeout(() => document.getElementById('modal-input')?.focus(), 100);
};

// ── Estado ─────────────────────────────────────────────────────
let appointments = [];
let vets = [];
let owners = [];
let allPets = [];
let selectedAppointmentId = null;

const STATUS_COLORS = {
    Scheduled: '#3498db',
    InProgress: '#f39c12',
    Completed: '#2ecc71',
    Cancelled: '#e74c3c',
};

// ── Cargar veterinarios → select #veterinarian ─────────────────
const loadVets = async () => {
    try {
        vets = await vetsAPI.getAll();
        const select = document.getElementById('veterinarian');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Seleccione un Veterinario</option>' +
                vets.map(v => `<option value="${v.id}">${v.firstName} ${v.lastName} — ${v.specialty}</option>`).join('');
        }
        // Poblar tipos de cita → select #type
        const typeSelect = document.getElementById('type');
        if (typeSelect) {
            typeSelect.innerHTML =
                '<option value="" disabled selected>Seleccione Tipo de Servicio</option>' +
                Object.entries(APPOINTMENT_TYPE_LABELS)
                    .map(([key, value]) =>
                        `<option value="${key}">${value}</option>`
                    )
                    .join('');
        }
    } catch (err) { console.error('Error cargando veterinarios:', err); }
};

// ── Cargar propietarios → select #owner, luego mascotas al cambiar
const loadOwners = async () => {
    try {
        owners = await ownersAPI.getAll();
        allPets = await petsAPI.getAll();
        const ownerSelect = document.getElementById('owner');
        if (ownerSelect) {
            ownerSelect.innerHTML = '<option value="" disabled selected>Buscar Propietario</option>' +
                owners.map(o => `<option value="${o.id}">${o.firstName} ${o.lastName} — ${o.document}</option>`).join('');
            // Al cambiar propietario, actualizar campo #pet con sus mascotas
            ownerSelect.addEventListener('change', () => {
                const ownerId = parseInt(ownerSelect.value);
                const ownerPets = allPets.filter(p => p.ownerId === ownerId || p.ownerFullName?.includes(owners.find(o => o.id === ownerId)?.firstName || ''));
                const petInput = document.getElementById('pet');
                if (petInput && ownerPets.length) {
                    // Convertir input a select temporalmente si hay mascotas
                    petInput.value = ownerPets[0].name;
                    petInput.setAttribute('data-pet-id', ownerPets[0].id);
                    petInput.setAttribute('list', 'pets-datalist');
                    let dl = document.getElementById('pets-datalist');
                    if (!dl) {
                        dl = document.createElement('datalist');
                        dl.id = 'pets-datalist';
                        petInput.parentElement.appendChild(dl);
                    }
                    dl.innerHTML = ownerPets.map(p => `<option value="${p.name}" data-id="${p.id}">`).join('');
                }
            });
        }
    } catch (err) { console.error('Error cargando propietarios:', err); }
};

// ── Cargar citas ───────────────────────────────────────────────
const loadAppointments = async () => {
    const container = document.getElementById('appointments-list');
    if (container) container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>Cargando citas...</p></div>';
    try {
        appointments = await appointmentsAPI.getAll();
        console.log('Citas cargadas:', appointments.length);
        console.log('Primera cita:', appointments[0]);
        renderAppointments(appointments);
    } catch (err) {
        console.error('Error:', err);
        if (container) container.innerHTML = '<p style="color:red;padding:20px;">Error cargando citas.</p>';
    }
};

// ── Renderizar citas con cards bien estructuradas ──────────────
const renderAppointments = (list) => {
    const container = document.getElementById('appointments-list');
    if (!container) return;
    if (!list.length) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#aaa;">📅 No hay citas registradas.</p>';
        return;
    }

    container.innerHTML = list.map(a => {
        const statusColor = STATUS_COLORS[a.status] || '#95a5a6';
        const statusLabel = APPOINTMENT_STATUS_LABELS[a.status] || a.status;
        const typeLabel = APPOINTMENT_TYPE_LABELS[a.type] || a.type;

        let actionsHtml = '';
        if (a.status === 'Scheduled') {
            actionsHtml = `
                <button class="icon-button complete" onclick="startAppointment(${a.id})" title="Iniciar">
                    <i class="fas fa-play"></i> Iniciar
                </button>
                <button class="icon-button edit" onclick="editAppointment(${a.id})" title="Editar">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="icon-button delete" onclick="cancelAppointment(${a.id})" title="Cancelar">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            `;
        } else if (a.status === 'InProgress') {
            actionsHtml = `
                <button class="icon-button complete" onclick="completeAppointment(${a.id})" title="Completar">
                    <i class="fas fa-check"></i> Completar
                </button>
                <button class="icon-button delete" onclick="cancelAppointment(${a.id})" title="Cancelar">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            `;
        } else if (a.status === 'Completed') {
            actionsHtml = `<span style="color:#2ecc71;font-weight:600;font-size:13px;">
                <i class="fas fa-check-circle"></i> Completada
                ${a.hasMedicalRecord ? ' · <i class="fas fa-file-medical"></i> Con historia' : ''}
            </span>`;
        } else if (a.status === 'Cancelled') {
            actionsHtml = `<span style="color:#e74c3c;font-weight:600;font-size:13px;">
                <i class="fas fa-ban"></i> Cancelada
            </span>`;
        }

        return `
        <div style="display:flex;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);
                    margin-bottom:14px;overflow:hidden;border-left:5px solid ${statusColor};">
            <div style="flex:1;padding:16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                    <h4 style="margin:0;font-size:15px;">
                        <i class="fas fa-paw"></i> <strong>${a.petName}</strong>
                        <span style="font-weight:400;color:#777;font-size:13px;"> — ${a.ownerFullName}</span>
                    </h4>
                    <span style="background:${statusColor};color:white;padding:4px 12px;
                                 border-radius:20px;font-size:12px;font-weight:700;">
                        ${statusLabel}
                    </span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:6px;margin-bottom:12px;">
                    <p style="margin:0;font-size:13px;color:#555;"><i class="fas fa-user-md"></i> ${a.veterinarianFullName}</p>
                    <p style="margin:0;font-size:13px;color:#555;"><i class="fas fa-calendar-alt"></i> ${formatDateTime(a.appointmentDate)}</p>
                    <p style="margin:0;font-size:13px;color:#555;"><i class="fas fa-tag"></i> ${typeLabel}</p>
                    ${a.notes ? `<p style="margin:0;font-size:13px;color:#777;"><i class="fas fa-sticky-note"></i> ${a.notes}</p>` : ''}
                </div>
                <div class="action-group">
                    ${actionsHtml}
                </div>
            </div>
        </div>`;
    }).join('');
};

// ── Validación de fechas según tipo de cita ───────────────────
const validateAppointmentDate = (dateVal, timeVal, typeVal) => {

    const appointmentDate = new Date(`${dateVal}T${timeVal}:00`);
    const now = new Date();

    if (isNaN(appointmentDate.getTime())) {
        return 'La fecha u hora ingresada no es válida.';
    }

    const diffMinutes =
        (appointmentDate.getTime() - now.getTime()) / 60000;

    // Nunca permitir fechas pasadas
    if (diffMinutes <= 0) {
        return 'No puedes agendar citas en horas pasadas.';
    }

    // IMPORTANTE:
    // typeVal ahora llega como STRING:
    // Emergency, General, Vaccination, Surgery, etc.

    switch (typeVal?.toLowerCase()) {

        case 'emergency':
            if (diffMinutes < 30) {
                return 'Las emergencias deben programarse con mínimo 30 minutos de anticipación.';
            }
            break;

        case 'generalconsult':
            if (diffMinutes < 120) {
                return 'Las consultas generales requieren mínimo 2 horas de anticipación.';
            }
            break;

        case 'checkup':
            if (diffMinutes < 60) {
                return 'Las citas de control requieren mínimo 1 hora de anticipación.';
            }
            break;

        case 'vaccination':
            if (diffMinutes < 1440) {
                return 'Las vacunaciones deben programarse mínimo para el día siguiente.';
            }
            break;

        case 'surgery':
            if (diffMinutes < 4320) {
                return 'Las cirugías requieren mínimo 3 días de anticipación.';
            }
            break;

        case 'hospitalization':
            if (diffMinutes < 60) {
                return 'Las hospitalizaciones requieren mínimo 1 hora de anticipación.';
            }
            break;

        case 'deworming':
            if (diffMinutes < 180) {
                return 'Las desparasitaciones requieren mínimo 3 horas de anticipación.';
            }
            break;

        case 'grooming':
            if (diffMinutes < 240) {
                return 'Los servicios de grooming requieren mínimo 4 horas de anticipación.';
            }
            break;
    }

    return null;
};

// ── Formulario nueva cita (IDs reales del HTML) ────────────────
const setupForm = () => {
    const form = document.getElementById('appointment-form');
    if (!form) return;

    // Limpiar form
    const clearBtn = document.getElementById('clear-form-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        form.reset();
        selectedAppointmentId = null;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // IDs reales del HTML
        const vetId = document.getElementById('veterinarian').value;
        const typeVal = document.getElementById('type').value;
        const dateVal = document.getElementById('date').value;
        const timeVal = document.getElementById('time').value;
        const petInput = document.getElementById('pet');
        const notesVal = document.getElementById('notes')?.value.trim() || null;

        if (!vetId || !typeVal || !dateVal || !timeVal) {
            showSysModal('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
            return;
        }

        // Encontrar petId: buscar la mascota por nombre en allPets
        const petName = petInput?.value.trim();
        const petDataId = petInput?.getAttribute('data-pet-id');
        let petId = petDataId ? parseInt(petDataId) : null;
        if (!petId && petName) {
            const found = allPets.find(p => p.name.toLowerCase() === petName.toLowerCase());
            petId = found?.id || null;
        }

        if (!petId) {
            showSysModal('Mascota no encontrada',
                'Selecciona un propietario primero para que sus mascotas aparezcan en el campo. Luego selecciona o escribe el nombre exacto de la mascota.');
            return;
        }

        const appointmentDate = new Date(`${dateVal}T${timeVal}:00`).toISOString();

        console.log('TIPO REAL:', typeVal);
        console.log('TIPO SELECT:', typeVal);
        console.log('TIPO ENVIADO:', APPOINTMENT_TYPE[typeVal]);

        const dateError = validateAppointmentDate(dateVal, timeVal, typeVal);

        if (dateError) {
            showSysModal('Fecha inválida', dateError);
            return;
        }

        const data = {
            petId: petId,
            veterinarianId: parseInt(vetId),
            appointmentDate: appointmentDate,
            type: APPOINTMENT_TYPE[typeVal],
            notes: notesVal,
        };

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';

        try {
            if (selectedAppointmentId) {
                await appointmentsAPI.update(selectedAppointmentId, data);
                showToast('Cita reagendada correctamente', 'success');
                selectedAppointmentId = null;
            } else {
                await appointmentsAPI.create(data);
                showToast('Cita agendada correctamente', 'success');
            }
            form.reset();
            await loadAppointments();
        } catch (err) {
            showSysModal('Error', err.message || 'No se pudo agendar la cita.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Agendar';
        }
    });
};

// ── Acciones ───────────────────────────────────────────────────
window.startAppointment = async (id) => {
    showSysModal('Confirmar', '¿Iniciar esta cita?', async () => {
        try {
            await appointmentsAPI.updateStatus(id, APPOINTMENT_STATUS.InProgress);
            showToast('Cita iniciada', 'info');
            await loadAppointments();
        } catch (err) { showSysModal('Error', err.message); }
    }, 'Sí, Iniciar');
};

window.completeAppointment = async (id) => {
    showSysModal('Confirmar', '¿Marcar esta cita como completada?', async () => {
        try {
            await appointmentsAPI.updateStatus(id, APPOINTMENT_STATUS.Completed);
            showToast('Cita completada', 'success');
            await loadAppointments();
        } catch (err) { showSysModal('Error', err.message); }
    }, 'Sí, Completar');
};

window.cancelAppointment = (id) => {
    showInputModal('Cancelar Cita', 'Escribe el motivo de cancelación...', async (reason) => {
        try {
            await appointmentsAPI.updateStatus(id, APPOINTMENT_STATUS.Cancelled, reason);
            showToast('Cita cancelada', 'warning');
            await loadAppointments();
        } catch (err) { showSysModal('Error', err.message); }
    });
};

window.editAppointment = async (id) => {
    try {
        const appt = await appointmentsAPI.getById(id);
        selectedAppointmentId = id;
        const dt = appt.appointmentDate?.slice(0, 16).split('T');
        document.getElementById('date').value = dt?.[0] || '';
        document.getElementById('time').value = dt?.[1] || '';
        document.getElementById('veterinarian').value = appt.veterinarianId;
        document.getElementById('type').value = appt.type;
        document.getElementById('pet').value = appt.petName || '';
        document.getElementById('pet').setAttribute('data-pet-id', appt.petId);
        if (document.getElementById('notes'))
            document.getElementById('notes').value = appt.notes || '';
        document.getElementById('appointment-form').scrollIntoView({ behavior: 'smooth' });
        showToast('Editando cita — modifica los campos y guarda', 'info');
    } catch (err) { showSysModal('Error', err.message); }
};
