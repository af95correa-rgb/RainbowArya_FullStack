// index.js — Dashboard conectado a API real

const showModal = (title, message, isSuccess = true, callback = null) => {
    const modal = document.getElementById('notification-modal');
    const titleElement = document.getElementById('modal-title');
    const messageElement = document.getElementById('modal-message');
    const iconElement = document.getElementById('modal-icon');
    const contentElement = modal.querySelector('.modal-content');
    const closeBtn = document.getElementById('modal-close-btn');

    titleElement.textContent = title;
    messageElement.textContent = message;
    closeBtn.textContent = 'Aceptar';
    closeBtn.style.backgroundColor = 'var(--arya-secondary)';

    if (isSuccess) {
        iconElement.className = 'icon-large fas fa-check-circle';
        iconElement.style.color = 'var(--arya-secondary)';
        contentElement.style.borderTopColor = 'var(--arya-secondary)';
    } else {
        iconElement.className = 'icon-large fas fa-times-circle';
        iconElement.style.color = 'var(--danger-color)';
        contentElement.style.borderTopColor = 'var(--danger-color)';
    }

    closeBtn.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
    modal.style.display = 'flex';
};

const closeModal = () => {
    document.getElementById('notification-modal').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = SessionManager.getUser();

    if (!user) {
        window.location.replace('login.html');
        return;
    }

    const roleMap = {
        Admin: 'Administrador',
        Veterinarian: 'Veterinario',
        Receptionist: 'Recepcionista',
        AuxVet: 'Auxiliar'
    };

    const userRole = roleMap[user.role] || 'Usuario';
    document.getElementById('welcome-message').innerHTML = `👋 Bienvenido ${user.firstName} | Rol: ${userRole}`;
    document.getElementById('role-alert').innerHTML = `⚠️ Rol Activo: <strong>${userRole}</strong>`;

    await renderSummaryCards(userRole);
    renderModules(userRole);
    setupLogout();
});

// Función auxiliar para comparar si una fecha es hoy
const isToday = (dateString) => {
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let appointmentDate = new Date(dateString);

    // Si la fecha es inválida, intentar parsear solo la parte de la fecha
    if (isNaN(appointmentDate.getTime())) {
        const datePart = dateString.split('T')[0];
        appointmentDate = new Date(datePart);
    }

    appointmentDate.setHours(0, 0, 0, 0);

    return appointmentDate.getTime() === today.getTime();
};

// Función para verificar si la cita no está cancelada
const isNotCancelled = (status) => {
    // Manejar tanto strings como números
    if (typeof status === 'string') {
        return status !== 'Cancelled';
    } else if (typeof status === 'number') {
        return status !== 3; // Asumiendo que 3 es Cancelled
    }
    return true;
};

const renderSummaryCards = async (role) => {
    const summaryContainer = document.getElementById('summary-dashboard');
    summaryContainer.innerHTML = '<div style="text-align:center;padding:20px;">Cargando datos...</div>';

    try {
        const appointments = await appointmentsAPI.getAll();
        const owners = await ownersAPI.getAll();
        const products = await productsAPI.getAll();

        console.log('📋 Todas las citas recibidas:', appointments);

        // Filtrar citas de hoy usando la función auxiliar
        const todayAppointments = appointments.filter(a => {
            const appointmentDate = a.appointmentDate || a.date || a.scheduledDate;
            const isTodayDate = isToday(appointmentDate);
            const notCancelled = isNotCancelled(a.status);

            if (appointmentDate) {
                console.log(`Cita ID: ${a.id}, Fecha: ${appointmentDate}, Es hoy: ${isTodayDate}, No cancelada: ${notCancelled}`);
            }

            return isTodayDate && notCancelled;
        });

        console.log('✅ Citas de hoy encontradas:', todayAppointments.length);

        const lowStockItems = products.filter(p => p.stock < 20);

        let cards = [];

        // Tarjeta de citas de hoy (todos ven esto)
        cards.push({
            icon: 'fas fa-calendar-alt',
            title: 'Citas Hoy',
            value: todayAppointments.length,
            colorClass: 'blue',
            detail: 'Citas programadas para hoy'
        });

        // Stock crítico solo para Administrador y Auxiliar
        if (role === 'Administrador' || role === 'Auxiliar') {
            cards.push({
                icon: 'fas fa-exclamation-triangle',
                title: 'Stock Crítico',
                value: lowStockItems.length,
                colorClass: 'orange',
                detail: 'Productos con stock bajo'
            });
        }

        // Propietarios solo para Administrador y Recepcionista
        if (role === 'Administrador' || role === 'Recepcionista') {
            cards.push({
                icon: 'fas fa-users',
                title: 'Propietarios',
                value: owners.length,
                colorClass: 'purple',
                detail: 'Clientes registrados'
            });
        }

        // Total facturado (solo administrador)
        if (role === 'Administrador') {
            try {
                const invoices = await invoicesAPI.getAll();
                const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
                cards.push({
                    icon: 'fas fa-dollar-sign',
                    title: 'Facturado Total',
                    value: formatCurrency(totalInvoiced),
                    colorClass: 'green',
                    detail: 'Ingresos totales'
                });
            } catch (err) {
                console.error('Error cargando facturas:', err);
            }
        }

        summaryContainer.innerHTML = cards.map(card => `
            <div class="summary-card" data-color="${card.colorClass}">
                <i class="${card.icon}"></i>
                <p>${card.title}</p>
                <div class="value">${card.value}</div>
                <p class="detail">${card.detail}</p>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error dashboard:', error);
        summaryContainer.innerHTML = '<div class="summary-card"><p>Error cargando datos del dashboard</p></div>';
    }
};

const renderModules = (role) => {
    const modules = [
        { name: 'Registro Cliente', icon: 'fas fa-user-plus', color: '#e74c3c', href: 'NAV/propietario.html', roles: ['Administrador', 'Recepcionista'] },
        { name: 'Gestionar Citas', icon: 'fas fa-calendar-check', color: '#3498db', href: 'NAV/agendar.html', roles: ['Administrador', 'Recepcionista', 'Veterinario'] },
        { name: 'Generar Facturas', icon: 'fas fa-file-invoice-dollar', color: '#2ecc71', href: 'NAV/facturar.html', roles: ['Administrador', 'Recepcionista', 'Auxiliar'] },
        { name: 'Historia Clínica', icon: 'fas fa-clipboard-list', color: '#8e44ad', href: 'NAV/historia_clinica.html', roles: ['Administrador', 'Veterinario'] },
        { name: 'Gestión de Inventario', icon: 'fas fa-boxes', color: '#f1c40f', href: 'NAV/inventario.html', roles: ['Administrador', 'Auxiliar'] },
        { name: 'Calificaciones', icon: 'fas fa-paw', color: '#3498db', href: 'NAV/calificaciones.html', roles: ['Administrador', 'Recepcionista', 'Veterinario', 'Auxiliar'] },
        { name: 'Módulo Administrativo', icon: 'fas fa-cogs', color: '#2c3e50', href: 'NAV/admin.html', roles: ['Administrador'] }
    ];

    const allowedModules = modules.filter(m => m.roles.includes(role));
    const container = document.getElementById('modules-container');

    if (!container) return;

    container.innerHTML = allowedModules.map(module => `
        <div class="module-card">
            <i class="${module.icon}" style="color: ${module.color};"></i>
            <h2>${module.name}</h2>
            <p>Gestión de ${module.name.toLowerCase()}</p>
            <a href="${module.href}">Ir a ${module.name} →</a>
        </div>
    `).join('');

    if (allowedModules.length === 0) {
        container.innerHTML = '<div class="module-card"><p>No tienes módulos asignados. Contacta al administrador.</p></div>';
    }
};

const setupLogout = () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showModal('Cierre de Sesión', '¿Está seguro de que desea cerrar la sesión?', false, () => {
                SessionManager.logout();
            });
        });
    }
};