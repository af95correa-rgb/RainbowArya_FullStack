// Facturar.js — Facturación conectado al backend

document.addEventListener('DOMContentLoaded', async () => {
    SessionManager.requireAuth();
    await loadOwners();      // Cargar owners primero
    await loadProducts();    // Luego productos
    await loadInvoices();    // Finalmente facturas (usará owners para mostrar nombres)
    setupForm();
});

let owners = [];
let products = [];
let invoices = [];
let invoiceItems = [];

// ── Cargar datos ───────────────────────────────────────────────
const loadOwners = async () => {
    try {
        owners = await ownersAPI.getAll();
        const select = document.getElementById('client');
        if (select) {
            select.innerHTML = '<option value="">📋 Seleccione un Cliente</option>' +
                owners.map(o => `
                    <option value="${o.id}" data-name="${o.firstName} ${o.lastName}">
                        👤 ${o.firstName} ${o.lastName} — 📄 ${o.document}
                    </option>
                `).join('');
        }
    } catch (err) {
        console.error('Error cargando propietarios:', err);
        showToast('Error al cargar los clientes', 'error');
    }
};

const loadProducts = async () => {
    try {
        products = await productsAPI.getAll();
    } catch (err) {
        console.error('Error cargando productos:', err);
        showToast('Error al cargar los productos', 'error');
    }
};

const loadInvoices = async () => {
    const container = document.getElementById('invoices-list');
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando facturas...</p>
            </div>`;
    }
    try {
        invoices = await invoicesAPI.getAll();
        renderInvoices(invoices);
    } catch (err) {
        console.error('Error cargando facturas:', err);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar las facturas</p>
                </div>`;
        }
    }
};

// ── Renderizar facturas mejorado ────────────────────────────────────────
const renderInvoices = (list) => {
    const container = document.getElementById('invoices-list');
    if (!container) return;

    if (!list || !list.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No hay facturas registradas</p>
                <small>Crea tu primera factura en el panel izquierdo</small>
            </div>`;
        return;
    }

    const STATUS_CONFIG = {
        'Pending': { color: '#f39c12', icon: 'fa-clock', label: 'Pendiente' },
        'Paid': { color: '#2ecc71', icon: 'fa-check-circle', label: 'Pagada' },
        'PartiallyPaid': { color: '#3498db', icon: 'fa-half-alt', label: 'Pago Parcial' },
        'Cancelled': { color: '#e74c3c', icon: 'fa-times-circle', label: 'Cancelada' }
    };

    container.innerHTML = list.map(inv => {
        const status = STATUS_CONFIG[inv.status] || STATUS_CONFIG['Pending'];
        const showPaymentButton = inv.status === 'Pending' || inv.status === 'PartiallyPaid';

        // Obtener nombre del cliente desde el array owners usando ownerId
        let clientName = 'Cliente no especificado';
        if (inv.ownerId && owners.length) {
            const owner = owners.find(o => o.id === inv.ownerId);
            if (owner) {
                clientName = `${owner.firstName} ${owner.lastName}`;
            }
        }
        if (clientName === 'Cliente no especificado' && inv.ownerFullName) {
            clientName = inv.ownerFullName;
        }

        return `
            <div class="invoice-card fade-in">
                <div class="invoice-header">
                    <div>
                        <h4>
                            <i class="fas fa-file-invoice"></i>
                            ${inv.invoiceNumber || 'FACTURA-' + inv.id}
                        </h4>
                        <div class="invoice-date">
                            <i class="far fa-calendar-alt"></i> ${formatDate(inv.createdAt)}
                        </div>
                    </div>
                    <div class="invoice-status" style="background: ${status.color}">
                        <i class="fas ${status.icon}"></i> ${status.label}
                    </div>
                </div>
                
                <div class="invoice-body">
                    <div class="invoice-line">
                        <i class="fas fa-user"></i>
                        <span>Cliente:</span>
                        <strong>${clientName}</strong>
                    </div>
                    <div class="invoice-line">
                        <i class="fas fa-credit-card"></i>
                        <span>Método de pago:</span>
                        <strong>${PAYMENT_METHOD_LABELS[inv.paymentMethod] || 'Efectivo'}</strong>
                    </div>
                    <div class="invoice-line">
                        <i class="fas fa-chart-line"></i>
                        <span>Subtotal:</span>
                        <strong>${formatCurrency(inv.subtotal)}</strong>
                    </div>
                    <div class="invoice-line">
                        <i class="fas fa-percent"></i>
                        <span>IVA (19%):</span>
                        <strong>${formatCurrency(inv.tax)}</strong>
                    </div>
                    <div class="invoice-line">
                        <i class="fas fa-calculator"></i>
                        <span>Total:</span>
                        <strong style="color: var(--arya-secondary); font-size: 1.1em;">${formatCurrency(inv.total)}</strong>
                    </div>
                    ${inv.amountPaid > 0 ? `
                        <div class="invoice-line">
                            <i class="fas fa-money-bill-wave"></i>
                            <span>Pagado:</span>
                            <strong style="color: #27ae60;">${formatCurrency(inv.amountPaid)}</strong>
                        </div>
                    ` : ''}
                </div>

                ${inv.products && inv.products.length ? `
                    <div class="invoice-products">
                        <strong><i class="fas fa-boxes"></i> Productos/Servicios:</strong>
                        <ul>
                            ${inv.products.map(p => `
                                <li>
                                    <i class="fas fa-tag"></i> ${p.productName || 'Producto'} 
                                    × ${p.quantity} = ${formatCurrency(p.subtotal)}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${showPaymentButton ? `
                    <div class="invoice-actions">
                        <button class="button primary" onclick="registerPayment(${inv.id}, ${inv.total})">
                            <i class="fas fa-money-bill-wave"></i> Registrar Pago
                        </button>
                        <button class="button danger" onclick="cancelInvoice(${inv.id})">
                            <i class="fas fa-ban"></i> Cancelar Factura
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
};

// ── Formulario nueva factura ───────────────────────────────────
const setupForm = () => {
    const form = document.getElementById('billing-form');
    if (!form) return;

    const addBtn = document.getElementById('add-item-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    const container = document.getElementById('items-list');
    if (container) {
        container.innerHTML = '';
        addNewItemToContainer();
    }

    if (addBtn) {
        const newAddBtn = addBtn.cloneNode(true);
        addBtn.parentNode.replaceChild(newAddBtn, addBtn);
        newAddBtn.addEventListener('click', () => addNewItemToContainer());
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('client').value = '';
            const container = document.getElementById('items-list');
            if (container) {
                container.innerHTML = '';
                addNewItemToContainer();
            }
            invoiceItems = [];
            updateInvoiceTotals();
            showToast('Formulario reiniciado', 'info');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const clientSelect = document.getElementById('client');
        const clientValue = clientSelect.value;

        if (!clientValue) {
            showToast('⚠️ Por favor selecciona un cliente', 'error');
            clientSelect.focus();
            return;
        }

        if (!invoiceItems.length) {
            showToast('⚠️ Agrega al menos un producto o servicio', 'error');
            return;
        }

        const ownerId = parseInt(clientValue);

        // IMPORTANTE: Agrupar productos por ID para evitar duplicados
        const groupedProducts = [];
        invoiceItems.forEach(item => {
            const existing = groupedProducts.find(g => g.productId === item.productId);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                groupedProducts.push({
                    productId: item.productId,
                    quantity: item.quantity
                });
            }
        });

        const data = {
            ownerId: ownerId,
            appointmentId: null,
            paymentMethod: 0,
            notes: null,
            products: groupedProducts
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        try {
            await invoicesAPI.create(data);
            showToast('✅ Factura generada correctamente', 'success');

            // Resetear formulario
            clientSelect.value = '';
            invoiceItems = [];
            const container = document.getElementById('items-list');
            if (container) {
                container.innerHTML = '';
                addNewItemToContainer();
            }
            updateInvoiceTotals();
            await loadInvoices();

        } catch (err) {
            console.error(err);
            showToast(err.message || '❌ Error generando factura', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
};

// ── Agregar nuevo item al container (con validación de duplicados) ───
const addNewItemToContainer = () => {
    const container = document.getElementById('items-list');
    if (!container) return;

    const itemId = Date.now();
    const newItemDiv = document.createElement('div');
    newItemDiv.className = 'invoice-item-row fade-in';
    newItemDiv.id = `item-${itemId}`;

    // Obtener productos ya seleccionados para no mostrarlos otra vez
    const selectedProductIds = [];
    document.querySelectorAll('.product-select').forEach(select => {
        if (select.value) {
            selectedProductIds.push(parseInt(select.value));
        }
    });

    newItemDiv.innerHTML = `
        <div class="product-group">
            <select class="product-select custom-select" data-id="${itemId}">
                <option value="">🔍 Seleccione un producto</option>
                ${products
            .filter(p => !selectedProductIds.includes(p.id))
            .map(p => `
                        <option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">
                            🧴 ${p.name} - ${formatCurrency(p.price)} (Stock: ${p.stock})
                        </option>
                    `).join('')}
                ${selectedProductIds.length === products.length ? '<option disabled>⚠️ No hay más productos disponibles</option>' : ''}
            </select>
        </div>
        <div class="qty-group">
            <label><i class="fas fa-hashtag"></i></label>
            <input type="number"
                   class="product-qty"
                   data-id="${itemId}"
                   min="1"
                   value="1">
        </div>
        <button type="button"
                class="remove-item-btn"
                onclick="removeInvoiceItem(${itemId})"
                title="Eliminar producto">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;

    container.appendChild(newItemDiv);

    const newSelect = newItemDiv.querySelector('.product-select');
    const newQty = newItemDiv.querySelector('.product-qty');

    if (newSelect) newSelect.onchange = syncInvoiceItems;
    if (newQty) newQty.oninput = syncInvoiceItems;
};

// ── Sincronizar items (agrupando productos duplicados) ─────────────────────────
const syncInvoiceItems = () => {
    const tempItems = [];
    const items = document.querySelectorAll('.invoice-item-row');

    items.forEach(item => {
        const select = item.querySelector('.product-select');
        const qtyInput = item.querySelector('.product-qty');

        if (!select || !select.value) return;

        const option = select.options[select.selectedIndex];
        const price = parseFloat(option.dataset.price);
        const quantity = parseInt(qtyInput?.value) || 1;
        const productId = parseInt(select.value);

        tempItems.push({
            productId: productId,
            quantity: quantity,
            price: price,
            subtotal: quantity * price
        });
    });

    // Agrupar productos duplicados (sumar cantidades del mismo producto)
    const groupedItems = [];
    tempItems.forEach(item => {
        const existing = groupedItems.find(g => g.productId === item.productId);
        if (existing) {
            existing.quantity += item.quantity;
            existing.subtotal = existing.quantity * existing.price;
        } else {
            groupedItems.push({ ...item });
        }
    });

    invoiceItems = groupedItems;
    updateInvoiceTotals();
    refreshProductSelects();
};

// ── Eliminar item (actualizar selectores disponibles) ────────────────
window.removeInvoiceItem = (id) => {
    const el = document.getElementById(`item-${id}`);
    if (el) {
        el.remove();
        syncInvoiceItems();
        refreshProductSelects();
        showToast('Producto eliminado', 'info');
    }
};

// ── Refrescar selects para mostrar productos disponibles ──────────────
const refreshProductSelects = () => {
    // Obtener productos ya seleccionados
    const selectedProductIds = [];
    document.querySelectorAll('.product-select').forEach(select => {
        if (select.value) {
            selectedProductIds.push(parseInt(select.value));
        }
    });

    // Actualizar cada select
    document.querySelectorAll('.product-select').forEach(select => {
        const currentValue = select.value;
        const currentId = currentValue ? parseInt(currentValue) : null;

        // Reconstruir opciones
        let options = '<option value="">🔍 Seleccione un producto</option>';
        products.forEach(p => {
            // Si el producto ya está seleccionado en otro select, deshabilitarlo
            const isSelectedElsewhere = selectedProductIds.includes(p.id) && p.id !== currentId;
            const disabledAttr = isSelectedElsewhere ? 'disabled' : '';
            options += `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}" ${disabledAttr}>
                🧴 ${p.name} - ${formatCurrency(p.price)} (Stock: ${p.stock})
            </option>`;
        });

        select.innerHTML = options;

        // Restaurar valor seleccionado
        if (currentValue) {
            select.value = currentValue;
        }
    });
};

// ── Actualizar totales ────────────────────────────────────────
const updateInvoiceTotals = () => {
    const subtotal = invoiceItems.reduce((s, i) => s + i.subtotal, 0);
    const tax = subtotal * 0.19;
    const total = subtotal + tax;

    const totalDetails = document.getElementById('total-details');
    if (totalDetails) {
        totalDetails.innerHTML = `
            <div class="total-row">
                <span>💰 Subtotal:</span>
                <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
                <span>📊 IVA (19%):</span>
                <span>${formatCurrency(tax)}</span>
            </div>
            <div class="total-row total-final">
                <span><strong>💵 Total a Pagar:</strong></span>
                <span><strong style="color: #2ecc71;">${formatCurrency(total)}</strong></span>
            </div>
        `;
    }
};

// ── Acciones sobre facturas ────────────────────────────────────
window.registerPayment = async (id, total) => {
    const modal = document.getElementById('payment-modal');
    const amountInput = document.getElementById('payment-amount');
    const totalText = document.getElementById('payment-total-text');
    const confirmBtn = document.getElementById('confirm-payment-btn');

    totalText.innerHTML = `<strong>💰 Total pendiente:</strong> ${formatCurrency(total)}`;
    amountInput.value = total;
    modal.style.display = 'flex';

    confirmBtn.onclick = async () => {
        const paid = parseFloat(amountInput.value);
        if (isNaN(paid) || paid <= 0) {
            showToast('❌ Monto inválido', 'error');
            return;
        }
        if (paid > total) {
            showToast('⚠️ El monto no puede ser mayor al total pendiente', 'error');
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

        try {
            await invoicesAPI.updateStatus(id, {
                status: paid >= total ? 1 : 2,
                amountPaid: paid
            });
            closePaymentModal();
            showToast(paid >= total ? '✅ Factura pagada completamente' : '✅ Pago parcial registrado', 'success');
            await loadInvoices();
        } catch (err) {
            showToast('❌ Error al registrar el pago', 'error');
            console.error(err);
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = 'Confirmar Pago';
        }
    };
};

window.closePaymentModal = () => {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.cancelInvoice = async (id) => {
    if (confirm('¿Estás seguro de cancelar esta factura? Esta acción no se puede deshacer.')) {
        try {
            await invoicesAPI.updateStatus(id, { status: 3, amountPaid: 0 });
            showToast('⚠️ Factura cancelada', 'warning');
            await loadInvoices();
        } catch (err) {
            showToast('❌ Error al cancelar la factura', 'error');
            console.error(err);
        }
    }
};

// Función auxiliar para mostrar toasts si no existe
if (typeof showToast !== 'function') {
    window.showToast = (message, type = 'success') => {
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
    };
}