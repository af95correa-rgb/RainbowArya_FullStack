// calificaciones.js — Módulo de Calificaciones conectado al backend

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    buildUI();
    setupStars();
    await loadData();
    setupRatingForm();
});

let completedAppointments = [];
let userRatings = [];
let currentUser = null;
let currentRating = 0;

// ── Construir UI dentro del contenedor ─────────────────────────
const buildUI = () => {
    const container = document.getElementById('calificaciones-container');
    if (!container) return;

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card completed">
                <i class="fas fa-calendar-check"></i>
                <div class="stat-value" id="total-completed">0</div>
                <div class="stat-label">Citas Completadas</div>
            </div>
            <div class="stat-card ratings">
                <i class="fas fa-star-half-alt"></i>
                <div class="stat-value" id="total-ratings">0</div>
                <div class="stat-label">Calificaciones Realizadas</div>
            </div>
            <div class="stat-card average">
                <i class="fas fa-chart-line"></i>
                <div class="stat-value" id="avg-rating">—</div>
                <div class="stat-label">Promedio de Calificación</div>
            </div>
        </div>

        <div class="rating-form-card">
            <h3><i class="fas fa-edit"></i> Calificar un Servicio</h3>
            <form id="rating-form">
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Selecciona una cita completada:</label>
                    <select id="rating-appointment" class="custom-select" required>
                        <option value="">Cargando citas...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-star"></i> Tu calificación:</label>
                    <div class="stars-container" id="stars-container"></div>
                    <input type="hidden" id="rating-value" value="0">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-comment"></i> Tu comentario:</label>
                    <textarea id="rating-comment" rows="4" placeholder="Cuéntanos tu experiencia..."></textarea>
                </div>
                <button type="submit" class="button primary">
                    <i class="fas fa-save"></i> Guardar Calificación
                </button>
            </form>
        </div>

        <h3><i class="fas fa-list"></i> Mis Calificaciones</h3>
        <div id="ratings-list" class="ratings-list">
            <div class="loading-state">Cargando calificaciones...</div>
        </div>
    `;
};

// ── Función para verificar si una cita está completada ─────────
const isCompletedAppointment = (appointment) => {
    // Manejar tanto string como número
    if (typeof appointment.status === 'string') {
        return appointment.status === 'Completed';
    } else if (typeof appointment.status === 'number') {
        return appointment.status === 2; // Asumiendo que 2 = Completed
    }
    return false;
};

// ── Cargar datos ───────────────────────────────────────────────
const loadData = async () => {
    currentUser = SessionManager.getUser();

    try {
        // Cargar citas completadas
        const allAppointments = await appointmentsAPI.getAll();
        console.log('Todas las citas:', allAppointments);

        completedAppointments = allAppointments.filter(a => isCompletedAppointment(a));
        console.log('Citas completadas:', completedAppointments.length, completedAppointments);

        // Cargar calificaciones del usuario actual desde el backend
        const allReviews = await reviewsAPI.getAll();
        console.log('Todas las reviews:', allReviews);

        userRatings = allReviews.filter(r => r.ownerId === currentUser?.id);
        console.log('Mis calificaciones:', userRatings.length);

        updateStats();
        renderRatings();
        renderAppointmentSelect();

    } catch (err) {
        console.error('Error cargando datos:', err);
        showToast('Error cargando datos: ' + err.message, 'error');
    }
};

// ── Renderizar select de citas ─────────────────────────────────
const renderAppointmentSelect = () => {
    const select = document.getElementById('rating-appointment');
    if (!select) return;

    // Filtrar citas que ya tienen calificación
    const ratedIds = userRatings.map(r => r.appointmentId);
    const availableAppointments = completedAppointments.filter(a => !ratedIds.includes(a.id));

    if (availableAppointments.length === 0) {
        select.innerHTML = '<option value="">No hay citas disponibles para calificar</option>';
        return;
    }

    select.innerHTML = '<option value="">Selecciona una cita completada...</option>' +
        availableAppointments.map(a => `
            <option value="${a.id}" data-vet="${escapeHtml(a.veterinarianFullName || '')}">
                🐾 ${escapeHtml(a.petName || 'Mascota')} - Dr(a). ${escapeHtml(a.veterinarianFullName || 'Veterinario')} - ${formatDate(a.appointmentDate)}
            </option>
        `).join('');
};

// ── Actualizar estadísticas ────────────────────────────────────
const updateStats = () => {
    const totalCompleted = document.getElementById('total-completed');
    const totalRatings = document.getElementById('total-ratings');
    const avgRating = document.getElementById('avg-rating');

    if (totalCompleted) totalCompleted.textContent = completedAppointments.length;
    if (totalRatings) totalRatings.textContent = userRatings.length;

    if (avgRating) {
        if (userRatings.length > 0) {
            const avg = userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length;
            avgRating.textContent = avg.toFixed(1) + ' ★';
        } else {
            avgRating.textContent = '—';
        }
    }
};

// ── Sistema de estrellas ───────────────────────────────────────
const setupStars = () => {
    const container = document.getElementById('stars-container');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = 'far fa-star star-rating';
        star.dataset.value = i;
        star.addEventListener('mouseover', () => highlightStars(i));
        star.addEventListener('mouseout', () => highlightStars(currentRating));
        star.addEventListener('click', () => selectStars(i));
        container.appendChild(star);
    }
};

const highlightStars = (n) => {
    const stars = document.querySelectorAll('.star-rating');
    stars.forEach((star, index) => {
        if (index < n) {
            star.className = 'fas fa-star star-rating active';
        } else {
            star.className = 'far fa-star star-rating';
        }
    });
};

const selectStars = (n) => {
    currentRating = n;
    const ratingValue = document.getElementById('rating-value');
    if (ratingValue) ratingValue.value = n;
    highlightStars(n);
};

// ── Formulario de calificación ─────────────────────────────────
const setupRatingForm = () => {
    const form = document.getElementById('rating-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const appointmentId = document.getElementById('rating-appointment').value;
        const rating = currentRating;
        const comment = document.getElementById('rating-comment').value.trim();

        if (!appointmentId) {
            showToast('❌ Selecciona una cita para calificar', 'error');
            return;
        }

        if (rating === 0) {
            showToast('❌ Selecciona una puntuación de 1 a 5 estrellas', 'error');
            return;
        }

        if (!comment) {
            showToast('❌ Escribe un comentario sobre tu experiencia', 'error');
            return;
        }

        const selectedOption = document.querySelector('#rating-appointment option:checked');
        const veterinarianName = selectedOption?.dataset.vet || '';
        // Extraer el nombre de la mascota del texto de la opción
        const optionText = selectedOption?.text || '';
        const petName = optionText.split(' - ')[0]?.replace('🐾 ', '') || '';

        const data = {
            ownerId: currentUser.id,
            appointmentId: parseInt(appointmentId),
            rating: rating,
            comment: comment,
            veterinarianName: veterinarianName,
            petName: petName  // 👈 AGREGAR ESTA LÍNEA
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            await reviewsAPI.create(data);
            showToast('✅ Calificación guardada correctamente', 'success');

            // Resetear formulario
            form.reset();
            currentRating = 0;
            highlightStars(0);
            const ratingValue = document.getElementById('rating-value');
            if (ratingValue) ratingValue.value = 0;

            // Recargar datos
            await loadData();
            setupStars();

        } catch (err) {
            console.error(err);
            showToast(err.message || '❌ Error al guardar la calificación', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
};

// ── Renderizar lista de calificaciones ─────────────────────────
const renderRatings = () => {
    const container = document.getElementById('ratings-list');
    if (!container) return;

    if (userRatings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>No has realizado ninguna calificación aún.</p>
                <small>Califica tus citas completadas para compartir tu experiencia.</small>
            </div>
        `;
        return;
    }

    container.innerHTML = userRatings.map(r => `
        <div class="rating-card">
            <div class="rating-header">
                <div>
                    <div class="rating-pet">
                        <i class="fas fa-paw"></i> ${escapeHtml(r.petName || 'Mascota')}
                    </div>
                    <div class="rating-vet">
                        <i class="fas fa-user-md"></i> Dr(a). ${escapeHtml(r.veterinarianName)}
                    </div>
                </div>
                <div class="rating-stars">
                    ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                </div>
            </div>
            <div class="rating-comment">
                "${escapeHtml(r.comment)}"
            </div>
            <div class="rating-footer">
                <span class="rating-category">
                    <i class="fas fa-calendar"></i> ${formatDate(r.createdAt)}
                </span>
                <button class="delete-rating-btn" onclick="deleteRating(${r.id})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
};

// ── Eliminar calificación ──────────────────────────────────────
window.deleteRating = async (id) => {
    const confirmed = confirm('¿Estás seguro de eliminar esta calificación?');
    if (!confirmed) return;

    try {
        await reviewsAPI.delete(id);
        showToast('✅ Calificación eliminada', 'success');
        await loadData();
        setupStars();
    } catch (err) {
        console.error(err);
        showToast(err.message || '❌ Error al eliminar la calificación', 'error');
    }
};

// ── Función auxiliar para escapar HTML ─────────────────────────
const escapeHtml = (str) => {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

// ── Toast notification ─────────────────────────────────────────
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