// =================================================================
// api.js — Servicio central de comunicación con el backend
// Reemplaza Data.js para conectar el frontend real con la API
// =================================================================

const API_BASE = 'http://localhost:60666/api';

// ── Utilidad base ──────────────────────────────────────────────
async function apiRequest(method, endpoint, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(error.message || `Error ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
}

const api = {
    get:    (endpoint)        => apiRequest('GET',    endpoint),
    post:   (endpoint, body)  => apiRequest('POST',   endpoint, body),
    put:    (endpoint, body)  => apiRequest('PUT',    endpoint, body),
    patch:  (endpoint, body)  => apiRequest('PATCH',  endpoint, body),
    delete: (endpoint)        => apiRequest('DELETE', endpoint),
};

// =================================================================
// OWNERS (Propietarios)
// =================================================================
const ownersAPI = {
    getAll:       ()      => api.get('/Owner'),
    getById:      (id)    => api.get(`/Owner/${id}`),
    getWithPets:  (id)    => api.get(`/Owner/${id}/pets`),
    create:       (data)  => api.post('/Owner', data),
    update:       (id, d) => api.put(`/Owner/${id}`, d),
    delete:       (id)    => api.delete(`/Owner/${id}`),
};

// =================================================================
// PETS (Mascotas)
// =================================================================
const petsAPI = {
    getAll:      ()         => api.get('/Pet'),
    getById:     (id)       => api.get(`/Pet/${id}`),
    getByOwner:  (ownerId)  => api.get(`/Pet/by-owner/${ownerId}`),
    create:      (data)     => api.post('/Pet', data),
    update:      (id, d)    => api.put(`/Pet/${id}`, d),
    delete:      (id)       => api.delete(`/Pet/${id}`),
};

// =================================================================
// VETERINARIANS
// =================================================================
const vetsAPI = {
    getAll:  ()       => api.get('/Veterinarian'),
    getById: (id)     => api.get(`/Veterinarian/${id}`),
    create:  (data)   => api.post('/Veterinarian', data),
    update:  (id, d)  => api.put(`/Veterinarian/${id}`, d),
    delete:  (id)     => api.delete(`/Veterinarian/${id}`),
};

// =================================================================
// APPOINTMENTS (Citas)
// =================================================================
const appointmentsAPI = {
    getAll:     ()        => api.get('/Appointment'),
    getById:    (id)      => api.get(`/Appointment/${id}`),
    getByDate:  (date)    => api.get(`/Appointment/by-date?date=${date}`),
    getByVet:   (vetId)   => api.get(`/Appointment/by-vet/${vetId}`),
    getByPet:   (petId)   => api.get(`/Appointment/by-pet/${petId}`),
    create:     (data)    => api.post('/Appointment', data),
    update:     (id, d)   => api.put(`/Appointment/${id}`, d),
    updateStatus: (id, status, reason = null) =>
        api.patch(`/Appointment/${id}/status`, { status, cancellationReason: reason }),
    delete:     (id)      => api.delete(`/Appointment/${id}`),
};

// Estados como constantes legibles
const APPOINTMENT_STATUS = {
    Scheduled:  0,
    InProgress: 1,
    Completed:  2,
    Cancelled:  3,
};

const APPOINTMENT_TYPE = {
    GeneralConsult: 'GeneralConsult',
    Vaccination: 'Vaccination',
    Surgery: 'Surgery',
    Emergency: 'Emergency',
    Hospitalization: 'Hospitalization',
    Deworming: 'Deworming',
    Control: 'Control',
};

const APPOINTMENT_TYPE_LABELS = {
    GeneralConsult:   'Consulta General',
    Vaccination:      'Vacunación',
    Surgery:          'Cirugía',
    Emergency:        'Emergencia',
    Hospitalization:  'Hospitalización',
    Deworming:        'Desparasitación',
    Control:          'Control',
};

const APPOINTMENT_STATUS_LABELS = {
    Scheduled:  'Programada',
    InProgress: 'En Curso',
    Completed:  'Completada',
    Cancelled:  'Cancelada',
};

// =================================================================
// MEDICAL RECORDS (Historias Clínicas)
// =================================================================
const medicalRecordsAPI = {
    getById:           (id)     => api.get(`/MedicalRecord/${id}`),
    getByPet:          (petId)  => api.get(`/MedicalRecord/by-pet/${petId}`),
    getByAppointment:  (apptId) => api.get(`/MedicalRecord/by-appointment/${apptId}`),
    create:            (data)   => api.post('/MedicalRecord', data),
    update:            (id, d)  => api.put(`/MedicalRecord/${id}`, d),
    delete:            (id)     => api.delete(`/MedicalRecord/${id}`),
};

// =================================================================
// PRODUCTS (Inventario)
// =================================================================
const productsAPI = {
    getAll:       ()          => api.get('/Product'),
    getById:      (id)        => api.get(`/Product/${id}`),
    getLowStock:  ()          => api.get('/Product/low-stock'),
    create:       (data)      => api.post('/Product', data),
    update:       (id, d)     => api.put(`/Product/${id}`, d),
    updateStock:  (id, qty)   => api.patch(`/Product/${id}/stock`, { quantity: qty }),
    delete:       (id)        => api.delete(`/Product/${id}`),
};

const PRODUCT_CATEGORY_LABELS = {
    Medicine:    'Medicamento',
    Vaccine:     'Vacuna',
    Food:        'Alimento',
    Accessory:   'Accesorio',
    Supplement:  'Suplemento',
    Other:       'Otro',
};

const PET_SPECIES_LABELS = {
    Dog:         'Canino',
    Cat:         'Felino',
    Bird:        'Ave',
    SmallMammal: 'Pequeño Mamífero',
    Other:       'Otro',
};

// =================================================================
// INVOICES (Facturas)
// =================================================================
const invoicesAPI = {
    getAll:       ()       => api.get('/Invoice'),
    getById:      (id)     => api.get(`/Invoice/${id}`),
    getByOwner:   (ownerId)=> api.get(`/Invoice/by-owner/${ownerId}`),
    create:       (data)   => api.post('/Invoice', data),
    updateStatus: (id, d)  => api.patch(`/Invoice/${id}/status`, d),
    delete:       (id)     => api.delete(`/Invoice/${id}`),
};

const PAYMENT_METHOD_LABELS = {
    Cash:     'Efectivo',
    Card:     'Tarjeta',
    Transfer: 'Transferencia',
};

const INVOICE_STATUS_LABELS = {
    Pending:        'Pendiente',
    Paid:           'Pagada',
    PartiallyPaid:  'Pago Parcial',
    Cancelled:      'Cancelada',
};

// =================================================================
// SYSTEM USERS (Usuarios del sistema)
// =================================================================
const usersAPI = {
    getAll:        ()      => api.get('/SystemUser'),
    getById:       (id)    => api.get(`/SystemUser/${id}`),
    create:        (data)  => api.post('/SystemUser', data),
    update:        (id, d) => api.put(`/SystemUser/${id}`, d),
    toggleActive:  (id)    => api.patch(`/SystemUser/${id}/toggle-active`),
};

const USER_ROLE_LABELS = {
    Admin:        'Administrador',
    Veterinarian: 'Veterinario',
    Receptionist: 'Recepcionista',
    AuxVet:       'Auxiliar Vet.',
};

// =================================================================
// SESIÓN (Login simple sin JWT — basado en SystemUser)
// =================================================================
const SessionManager = {
    setUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },
    getUser() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    },
    isLoggedIn() {
        return !!sessionStorage.getItem('currentUser');
    },
    logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
        return this.getUser();
    }
};

// =================================================================
// UTILIDADES UI
// =================================================================
function showToast(message, type = 'success') {
    let toast = document.getElementById('ra-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'ra-toast';
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            padding:14px 22px; border-radius:10px; font-size:14px;
            font-weight:600; color:#fff; max-width:360px;
            box-shadow:0 4px 20px rgba(0,0,0,0.2);
            transition: opacity 0.4s ease;
            opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    const colors = {
        success: '#2ecc71',
        error:   '#e74c3c',
        warning: '#f39c12',
        info:    '#3498db',
    };
    toast.style.background = colors[type] || colors.success;
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}
// =================================================================
// REVIEWS (Calificaciones)
// =================================================================
const reviewsAPI = {
    getAll: () => api.get('/Review'),
    getById: (id) => api.get(`/Review/${id}`),
    getByOwner: (ownerId) => api.get(`/Review/by-owner/${ownerId}`),
    getPending: () => api.get('/Review/pending'),
    create: (data) => api.post('/Review', data),
    updateStatus: (id, status) => api.patch(`/Review/${id}/status`, { status }),
    delete: (id) => api.delete(`/Review/${id}`),
};

const REVIEW_STATUS_LABELS = {
    Pending: 'Pendiente',
    Published: 'Publicada',
    Rejected: 'Rechazada'
};

// =================================================================
// UTILIDADES UI
// =================================================================
function showToast(message, type = 'success') {
    // ... tu código existente ...
}

function showLoading(containerId, message = 'Cargando...') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div style="text-align:center;padding:40px;color:#999;">
        <div style="font-size:28px;margin-bottom:8px;">⏳</div>${message}</div>`;
}

function showEmpty(containerId, message = 'Sin datos disponibles.', icon = '📭') {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = `<div style="text-align:center;padding:40px;color:#aaa;">
        <div style="font-size:36px;margin-bottom:8px;">${icon}</div>${message}</div>`;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}


