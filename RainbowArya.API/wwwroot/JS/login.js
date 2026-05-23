// login.js — Autenticación conectada al backend real
// Usa api.js para validar contra SystemUser

document.addEventListener('DOMContentLoaded', () => {
    // Si ya hay sesión activa, redirigir directo
    if (SessionManager.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
});

const showModal = (title, message, isSuccess = true, callback = null) => {
    const modal      = document.getElementById('notification-modal');
    const titleEl    = document.getElementById('modal-title');
    const messageEl  = document.getElementById('modal-message');
    const iconEl     = document.getElementById('modal-icon');
    const contentEl  = modal.querySelector('.modal-content');
    const closeBtn   = document.getElementById('modal-close-btn');

    titleEl.textContent   = title;
    messageEl.textContent = message;
    closeBtn.textContent  = 'Aceptar';

    if (isSuccess) {
        iconEl.className              = 'icon-large fas fa-check-circle';
        iconEl.style.color            = 'var(--arya-secondary)';
        contentEl.style.borderTopColor = 'var(--arya-secondary)';
        closeBtn.style.backgroundColor = 'var(--arya-secondary)';
    } else {
        iconEl.className              = 'icon-large fas fa-times-circle';
        iconEl.style.color            = 'var(--danger-color, #e74c3c)';
        contentEl.style.borderTopColor = 'var(--danger-color, #e74c3c)';
        closeBtn.style.backgroundColor = 'var(--danger-color, #e74c3c)';
    }

    closeBtn.onclick = callback || closeModal;
    modal.style.display = 'flex';
};

const closeModal = () => {
    document.getElementById('notification-modal').style.display = 'none';
};

const handleLogin = async (e) => {
    e.preventDefault();

    const emailInput    = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const btn           = e.target.querySelector('button[type="submit"]');

    btn.disabled     = true;
    btn.textContent  = 'Verificando...';

    try {
        // Traer todos los usuarios del sistema y buscar por email + contraseña
        // (sin JWT, validación en frontend — igual que el original con Data.js)
        const users = await usersAPI.getAll();

        // Credenciales del seeder:
        // admin@rainbowarya.com / Admin123!
        // diana.ospina@rainbowarya.com / Vet123!
        // sofia.restrepo@rainbowarya.com / Rec123!
        // juan.mesa@rainbowarya.com / Aux123!

        const user = users.find(u =>
            u.email.toLowerCase().trim() === emailInput.toLowerCase().trim() &&
            u.isActive === true
        );

        if (!user) {
            throw new Error('Usuario no encontrado o inactivo.');
        }

        // Contraseñas conocidas del sistema
        const savedPasswords = JSON.parse(
            localStorage.getItem('ra_passwords') || '{}'
        );

        const knownPasswords = {
            'admin@rainbowarya.com': 'Admin123!',
            'diana.ospina@rainbowarya.com': 'Vet123!',
            'sofia.restrepo@rainbowarya.com': 'Rec123!',
            'juan.mesa@rainbowarya.com': 'Aux123!',
            ...savedPasswords
        };

        const expectedPassword =
            knownPasswords[emailInput.toLowerCase()];

        const passwordOk =
            expectedPassword &&
            passwordInput === expectedPassword;

        if (!passwordOk) {
            throw new Error('Contraseña incorrecta.');
        }

        if (passwordOk) {
            // Guardar sesión
            SessionManager.setUser({
                id:        user.id,
                firstName: user.firstName,
                lastName:  user.lastName,
                email:     user.email,
                role:      user.role,
            });

            const roleLabel = {
                Admin:        'Administrador',
                Veterinarian: 'Veterinario',
                Receptionist: 'Recepcionista',
                AuxVet:       'Auxiliar',
            }[user.role] || user.role;

            showModal(
                '¡Acceso Exitoso!',
                `Bienvenido(a) ${user.firstName} — ${roleLabel}`,
                true,
                () => { closeModal(); window.location.href = 'index.html'; }
            );
        } else {
            showModal(
                'Error de Acceso',
                'Correo o contraseña incorrectos. Verifica tus credenciales.',
                false
            );
        }
    } catch (err) {

        showModal(
            'Error de Acceso',
            err.message || 'No se pudo iniciar sesión.',
            false
        );

        console.error(err);

    } finally {
        btn.disabled    = false;
        btn.innerHTML   = '<i class="fas fa-sign-in-alt"></i> Entrar al Dashboard';
    }
};
