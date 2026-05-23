// historia_clinica.js — Búsqueda por propietario

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    await loadVetsIntoModal();
    await loadOwnersForSearch();
    setupSearchForm();
    setupNewPatientModal();
    setupHistorialModal();
});

let ownersList = [];
let currentOwnerId = null;
let currentPetId = null;

// ── Utilidad modal del sistema ─────────────────────────────────
const showSysModal = (title, message) => {
    const backdrop = document.getElementById('system-modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const actions = document.getElementById('modal-actions');
    if (!backdrop) { alert(message); return; }
    titleEl.textContent = title;
    msgEl.textContent = message;
    actions.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'button primary';
    btn.textContent = 'Aceptar';
    btn.onclick = () => { backdrop.style.display = 'none'; };
    actions.appendChild(btn);
    backdrop.style.display = 'flex';
};

window.closeModal = (id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
};

// ── Cargar vets en el select del modal historial ───────────────
const loadVetsIntoModal = async () => {
    try {
        const vets = await vetsAPI.getAll();
        const select = document.getElementById('historial-veterinario');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Seleccione veterinario</option>' +
                vets.map(v =>
                    `<option value="${v.id}">${v.firstName} ${v.lastName} — ${v.specialty}</option>`
                ).join('');
        }
    } catch (err) { console.error('Error cargando veterinarios:', err); }
};

// ── Cargar owners para búsqueda ────────────────────────────────
const loadOwnersForSearch = async () => {
    try {
        ownersList = await ownersAPI.getAll();
        console.log('Propietarios cargados:', ownersList.length);
    } catch (err) {
        console.error('Error cargando propietarios:', err);
    }
};

// ── Escapar HTML ───────────────────────────────────────────────
const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// ── Configurar búsqueda por propietario ────────────────────────
const setupSearchForm = () => {
    const ownerInput = document.getElementById('owner-search');
    const resetBtn = document.getElementById('reset-search-btn');
    const listEl = document.getElementById('records-history-list');

    if (!ownerInput) {
        console.error('No se encontró el campo owner-search');
        return;
    }

    // Función para buscar mientras escribe
    const performSearch = () => {
        const query = ownerInput.value.trim();
        console.log('Buscando:', query);

        if (query.length === 0) {
            document.getElementById('owner-results').style.display = 'none';
            return;
        }

        if (query.length < 2) {
            return;
        }

        searchOwners(query);
    };

    // Evento input para búsqueda en tiempo real
    ownerInput.addEventListener('input', performSearch);

    // Botón reset
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            ownerInput.value = '';
            document.getElementById('owner-results').style.display = 'none';
            document.getElementById('pets-container').style.display = 'none';
            document.getElementById('search-actions').style.display = 'none';
            currentOwnerId = null;
            currentPetId = null;
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-info-circle"></i>
                    <p>Busque un propietario por su cédula, nombre o correo para ver sus mascotas.</p>
                </div>`;
        });
    }
};

// ── Buscar propietarios ────────────────────────────────────────
const searchOwners = (query) => {
    const lowerQuery = query.toLowerCase();

    const results = ownersList.filter(owner => {
        const fullName = `${owner.firstName} ${owner.lastName}`.toLowerCase();
        const document = (owner.document || '').toLowerCase();
        const email = (owner.email || '').toLowerCase();

        return fullName.includes(lowerQuery) || document.includes(lowerQuery) || email.includes(lowerQuery);
    });

    console.log('Resultados encontrados:', results.length);

    const resultsContainer = document.getElementById('owner-results');
    const ownersListDiv = document.getElementById('owners-list-results');

    if (!resultsContainer || !ownersListDiv) {
        console.error('No se encontraron los contenedores de resultados');
        return;
    }

    if (results.length === 0) {
        ownersListDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No se encontraron propietarios con "${escapeHtml(query)}"</p>
            </div>`;
        resultsContainer.style.display = 'block';
        return;
    }

    ownersListDiv.innerHTML = results.map(owner => `
        <div class="owner-result-card" onclick="selectOwner(${owner.id}, '${escapeHtml(owner.firstName)} ${escapeHtml(owner.lastName)}')">
            <div class="owner-result-info">
                <div class="owner-result-name">
                    <i class="fas fa-user-circle"></i>
                    ${escapeHtml(owner.firstName)} ${escapeHtml(owner.lastName)}
                </div>
                <div class="owner-result-details">
                    <span><i class="fas fa-id-card"></i> ${escapeHtml(owner.document)}</span>
                    <span><i class="fas fa-phone"></i> ${escapeHtml(owner.phone) || '—'}</span>
                    <span><i class="fas fa-envelope"></i> ${escapeHtml(owner.email)}</span>
                </div>
            </div>
            <div class="owner-result-badge">
                <i class="fas fa-paw"></i> Ver mascotas
            </div>
        </div>
    `).join('');

    resultsContainer.style.display = 'block';
};

// ── Seleccionar propietario y mostrar sus mascotas ─────────────
window.selectOwner = async (ownerId, ownerName) => {
    console.log('Seleccionando propietario:', ownerId, ownerName);
    currentOwnerId = ownerId;
    currentPetId = null;

    // Ocultar resultados de propietarios
    document.getElementById('owner-results').style.display = 'none';
    document.getElementById('search-actions').style.display = 'flex';

    // Cargar mascotas del propietario
    const petsContainer = document.getElementById('pets-container');
    const petsListDiv = document.getElementById('pets-list');

    petsListDiv.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando mascotas...</p>
        </div>`;
    petsContainer.style.display = 'block';

    try {
        const allPets = await petsAPI.getAll();
        const ownerPets = allPets.filter(pet => pet.ownerId === ownerId);

        console.log('Mascotas encontradas:', ownerPets.length);

        if (ownerPets.length === 0) {
            petsListDiv.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-paw"></i>
                    <p>Este propietario no tiene mascotas registradas.</p>
                </div>`;
            return;
        }

        const speciesMap = { 0: 'Canino', 1: 'Felino', 2: 'Ave', 3: 'Exótico', 4: 'Otro' };

        petsListDiv.innerHTML = ownerPets.map(pet => `
            <div class="pet-card" onclick="loadPetHistory(${pet.id}, '${escapeHtml(pet.name)}', '${escapeHtml(ownerName)}')">
                <div class="pet-info">
                    <div class="pet-name">
                        <i class="fas fa-paw"></i>
                        ${escapeHtml(pet.name)}
                    </div>
                    <div class="pet-details">
                        <span class="pet-badge">${speciesMap[pet.species] || 'Mascota'}</span>
                        ${pet.breed ? `<span>🐾 ${escapeHtml(pet.breed)}</span>` : ''}
                        ${pet.color ? `<span>🎨 ${escapeHtml(pet.color)}</span>` : ''}
                    </div>
                </div>
                <div class="pet-badge">
                    Ver historial →
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        petsListDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las mascotas</p>
            </div>`;
    }
};

// ── Cargar historial de una mascota ────────────────────────────
window.loadPetHistory = async (petId, petName, ownerName = '') => {
    console.log('Cargando historial de:', petName, petId);
    currentPetId = petId;
    const listEl = document.getElementById('records-history-list');
    listEl.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Cargando historial...</p></div>';

    try {
        const records = await medicalRecordsAPI.getByPet(petId);

        if (!records || records.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-medical"></i>
                    <p><strong>${escapeHtml(petName)}</strong> no tiene historias clínicas aún.</p>
                    <button class="button primary" style="margin-top:12px;"
                        onclick="openHistorialModal(${petId})">
                        <i class="fas fa-plus"></i> Agregar Historia Clínica
                    </button>
                </div>`;
            return;
        }

        listEl.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #8e44ad, #6c3483); padding: 15px; border-radius: 12px; color: white;">
                    <h3 style="margin: 0;"><i class="fas fa-paw"></i> ${escapeHtml(petName)}</h3>
                    <p style="margin: 5px 0 0; opacity: 0.9;"><i class="fas fa-user"></i> Propietario: ${escapeHtml(ownerName)}</p>
                </div>
            </div>
            ${records.map(r => `
                <div class="record-card" style="margin-bottom:14px;">
                    <h4><i class="fas fa-file-medical"></i> Consulta #${r.id}
                        <small> — ${formatDate(r.createdAt)}</small>
                    </h4>
                    <p><i class="fas fa-user-md"></i> Veterinario: ${r.veterinarianFullName || 'No especificado'}</p>
                    <div class="vitals">
                        <span>⚖️ ${r.weight} kg</span>
                        <span>🌡️ ${r.temperature}°C</span>
                        <span>❤️ ${r.heartRate} bpm</span>
                    </div>
                    <p><strong>Diagnóstico:</strong> ${r.diagnosis}</p>
                    <p><strong>Tratamiento:</strong> ${r.treatment}</p>
                    ${r.observations ? `<p><strong>Observaciones:</strong> ${r.observations}</p>` : ''}
                </div>
            `).join('')}
            <div style="margin-top: 15px; text-align: center;">
                <button class="button primary" onclick="openHistorialModal(${petId})">
                    <i class="fas fa-plus"></i> Nueva Entrada
                </button>
            </div>
        `;
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty-state"><p style="color:red;">Error cargando historial.</p></div>';
    }
};

// ── Modal nuevo paciente ───────────────────────────────────────
const setupNewPatientModal = () => {
    const openBtn = document.getElementById('open-new-patient-modal-btn');
    const backdrop = document.getElementById('patient-modal-backdrop');
    const form = document.getElementById('new-patient-form');

    if (openBtn) openBtn.addEventListener('click', () => {
        if (backdrop) backdrop.style.display = 'flex';
    });

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('owner-name').value.trim();
        const lastName = document.getElementById('owner-lastname').value.trim();
        const phone = document.getElementById('owner-phone').value.trim();
        const email = document.getElementById('owner-email').value.trim();
        const password = document.getElementById('owner-password').value.trim();

        if (!firstName || !lastName || !phone || !email || !password) {
            showSysModal('Campos requeridos', 'Por favor complete todos los campos');
            return;
        }

        const petName = document.getElementById('patient-name').value.trim();
        const petSpecies = document.getElementById('patient-species').value;
        const petBreed = document.getElementById('patient-breed').value.trim() || 'No especificada';
        const petBirth = document.getElementById('patient-birthdate').value;
        const petAge = parseFloat(document.getElementById('patient-age').value) || 1;
        const petColor = document.getElementById('patient-color').value.trim() || 'No especificado';

        if (!petName || !petSpecies) {
            showSysModal('Campos requeridos', 'Complete el nombre y especie de la mascota');
            return;
        }

        const speciesMap = { 'Canino': 0, 'Felino': 1, 'Ave': 2, 'Otro': 4 };
        const speciesVal = speciesMap[petSpecies] ?? 4;
        const doc = email.split('@')[0].replace(/\W/g, '').substring(0, 10) + Date.now().toString().slice(-4);

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            const owner = await ownersAPI.create({
                firstName, lastName, document: doc, email, phone, address: ''
            });

            const birthDate = petBirth || `${new Date().getFullYear() - petAge}-01-01`;

            const pet = await petsAPI.create({
                name: petName, species: speciesVal, breed: petBreed,
                birthDate: birthDate, color: petColor, weight: 5.0, ownerId: owner.id
            });

            backdrop.style.display = 'none';
            form.reset();

            await loadOwnersForSearch();
            alert(`✅ ${petName} y su propietario ${firstName} ${lastName} registrados correctamente`);

        } catch (err) {
            console.error(err);
            alert('Error: ' + (err.message || 'Ocurrió un error al registrar'));
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
};

// ── Modal agregar historial ────────────────────────────────────
window.openHistorialModal = (petId) => {
    currentPetId = petId;
    document.getElementById('historial-pet-id').value = petId;
    const backdrop = document.getElementById('historial-modal-backdrop');
    if (backdrop) backdrop.style.display = 'flex';
};

const setupHistorialModal = () => {
    const form = document.getElementById('historial-entry-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const petId = parseInt(document.getElementById('historial-pet-id').value);
        const vetId = parseInt(document.getElementById('historial-veterinario').value);

        if (!vetId) {
            alert('Por favor seleccione un veterinario');
            return;
        }

        let appointmentId = null;
        try {
            const appts = await appointmentsAPI.getByPet(petId);
            const valid = appts.filter(a =>
                (a.status === 'InProgress' || a.status === 'Completed') && !a.hasMedicalRecord
            );
            if (valid.length) {
                appointmentId = valid[0].id;
            } else {
                alert('Esta mascota no tiene citas disponibles para registrar historia clínica');
                return;
            }
        } catch (err) {
            alert('Error al cargar las citas');
            return;
        }

        const data = {
            appointmentId: appointmentId,
            reasonForVisit: document.getElementById('historial-diagnostico').value.trim() || 'Consulta registrada',
            physicalExam: 'Examen físico registrado',
            weight: parseFloat(document.getElementById('historial-peso').value),
            temperature: parseFloat(document.getElementById('historial-temperatura').value),
            heartRate: parseInt(document.getElementById('historial-frecuencia').value),
            diagnosis: document.getElementById('historial-diagnostico').value.trim(),
            treatment: document.getElementById('historial-tratamiento').value.trim(),
            prescriptions: null,
            observations: null,
        };

        if (!data.diagnosis || !data.treatment) {
            alert('Por favor complete diagnóstico y tratamiento');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            await medicalRecordsAPI.create(data);
            document.getElementById('historial-modal-backdrop').style.display = 'none';
            form.reset();
            alert('Historia clínica registrada');

            const pets = await petsAPI.getAll();
            const pet = pets.find(p => p.id === petId);
            const owners = await ownersAPI.getAll();
            const owner = owners.find(o => o.id === pet?.ownerId);
            await loadPetHistory(petId, pet?.name || 'Mascota', owner ? `${owner.firstName} ${owner.lastName}` : '');
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Guardar Entrada';
        }
    });
};