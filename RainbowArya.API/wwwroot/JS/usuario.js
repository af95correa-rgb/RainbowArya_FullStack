// Usuario.js — Registro de Propietario y Mascota conectado al backend

document.addEventListener('DOMContentLoaded', () => {
    // Esta página NO requiere auth — es el registro público
    setupForm();
    document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
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

const setupForm = () => {
    const form = document.getElementById('full-registration-form');
    if (!form) return;
    form.addEventListener('submit', handleRegistration);
};

const handleRegistration = async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';

    // Datos del propietario
    const firstName = document.getElementById('reg-name').value.trim();
    const lastName  = document.getElementById('reg-lastname').value.trim();
    const document_ = document.getElementById('reg-document')?.value.trim()
                   || document.getElementById('reg-age')?.value.trim() || '';
    const email     = document.getElementById('reg-email').value.trim();
    const phone     = document.getElementById('reg-phone').value.trim();
    const address   = document.getElementById('reg-address')?.value.trim() || '';

    // Datos de la mascota
    const petName   = document.getElementById('pet-name').value.trim();
    const petType   = document.getElementById('pet-type').value;
    const petBreed  = document.getElementById('pet-breed')?.value.trim() || 'Sin especificar';
    const petWeight = parseFloat(document.getElementById('pet-weight')?.value) || 1.0;
    const petBirth  = document.getElementById('pet-birthdate')?.value
                   || document.getElementById('pet-age')?.value || '';
    const petColor  = document.getElementById('pet-color')?.value.trim() || '';

    // Validación básica
    if (!firstName || !lastName || !email || !phone) {
        showModal('Error', 'Completa todos los campos del propietario.', false);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Registrar Propietario y Mascota';
        return;
    }
    if (!petName || !petType) {
        showModal('Error', 'Completa los datos de la mascota.', false);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Registrar Propietario y Mascota';
        return;
    }

    // Mapear tipo de mascota al enum del backend
    const speciesMap = {
        'Canino': 0, 'Dog': 0,
        'Felino': 1, 'Cat': 1,
        'Ave': 2, 'Bird': 2,
        'Exotico': 3, 'SmallMammal': 3,
        'Otro': 4, 'Other': 4,
    };
    const speciesValue = speciesMap[petType] ?? 4;

    // Calcular fecha de nacimiento si viene edad en años
    let birthDate = petBirth;
    if (!birthDate || birthDate === '') {
        birthDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    try {
        // 1. Crear propietario
        const ownerData = {
            firstName,
            lastName,
            document: document_ || email.replace('@', '').replace('.', '').substring(0, 10),
            email,
            phone,
            address,
        };
        const newOwner = await ownersAPI.create(ownerData);

        // 2. Crear mascota vinculada al propietario
        const petData = {
            name:      petName,
            species:   speciesValue,
            breed:     petBreed,
            birthDate: birthDate,
            weight:    petWeight,
            allergies: petColor ? `Color: ${petColor}` : null,
            ownerId:   newOwner.id,
        };
        await petsAPI.create(petData);

        showModal(
            '¡Registro Exitoso!',
            `¡Bienvenido ${firstName}! Tu cuenta y la mascota ${petName} han sido registradas correctamente.`,
            true,
            () => { closeModal(); window.location.href = 'login.html'; }
        );
    } catch (err) {
        showModal('Error en el Registro', err.message || 'No se pudo completar el registro.', false);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Registrar Propietario y Mascota';
    }
};
