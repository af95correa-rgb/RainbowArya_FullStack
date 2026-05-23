using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;
using RainbowArya.Domain.Interfaces.Repositories;
using RainbowArya.Domain.Interfaces.Services;

namespace RainbowArya.Domain.Services;

/// ════════════════════════════════════════════════
// OWNER SERVICE
// ════════════════════════════════════════════════
public class OwnerService : IOwnerService
{
    private readonly IOwnerRepository _ownerRepo;
    public OwnerService(IOwnerRepository ownerRepo) => _ownerRepo = ownerRepo;

    public async Task<IEnumerable<Owner>> GetAllAsync() => await _ownerRepo.GetAllAsync();
    public async Task<Owner?> GetByIdAsync(int id) => await _ownerRepo.GetByIdAsync(id);
    public async Task<Owner?> GetWithPetsAsync(int id) => await _ownerRepo.GetWithPetsAsync(id);

    public async Task<Owner> CreateAsync(Owner owner)
    {
        var byDoc = await _ownerRepo.GetByDocumentAsync(owner.Document);
        if (byDoc != null)
            throw new InvalidOperationException($"Ya existe un propietario con el documento '{owner.Document}'.");
        var byEmail = await _ownerRepo.GetByEmailAsync(owner.Email);
        if (byEmail != null)
            throw new InvalidOperationException($"Ya existe un propietario con el email '{owner.Email}'.");
        return await _ownerRepo.CreateAsync(owner);
    }

    public async Task UpdateAsync(int id, Owner owner)
    {
        var existing = await _ownerRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Propietario con ID {id} no encontrado.");
        var byDoc = await _ownerRepo.GetByDocumentAsync(owner.Document);
        if (byDoc != null && byDoc.Id != id)
            throw new InvalidOperationException("El documento ya está registrado por otro propietario.");
        existing.FirstName = owner.FirstName;
        existing.LastName = owner.LastName;
        existing.Email = owner.Email;
        existing.Phone = owner.Phone;
        existing.Address = owner.Address;
        existing.IsActive = owner.IsActive;  // 👈 AGREGA ESTA LÍNEA
        existing.UpdatedAt = DateTime.UtcNow;
        await _ownerRepo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var owner = await _ownerRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Propietario con ID {id} no encontrado.");
        owner.IsActive = false;
        owner.UpdatedAt = DateTime.UtcNow;
        await _ownerRepo.UpdateAsync(owner);
    }
}

// ════════════════════════════════════════════════
// PET SERVICE
// ════════════════════════════════════════════════
public class PetService : IPetService
{
    private readonly IPetRepository _petRepo;
    private readonly IOwnerRepository _ownerRepo;
    public PetService(IPetRepository petRepo, IOwnerRepository ownerRepo)
    { _petRepo = petRepo; _ownerRepo = ownerRepo; }

    public async Task<IEnumerable<Pet>> GetAllAsync() => await _petRepo.GetAllAsync();
    public async Task<Pet?> GetByIdAsync(int id) => await _petRepo.GetWithDetailsAsync(id);
    public async Task<IEnumerable<Pet>> GetByOwnerAsync(int ownerId)
    {
        if (!await _ownerRepo.ExistsAsync(ownerId))
            throw new KeyNotFoundException($"Propietario con ID {ownerId} no encontrado.");
        return await _petRepo.GetByOwnerAsync(ownerId);
    }

    public async Task<Pet> CreateAsync(Pet pet)
    {
        if (!await _ownerRepo.ExistsAsync(pet.OwnerId))
            throw new KeyNotFoundException($"Propietario con ID {pet.OwnerId} no encontrado.");
        return await _petRepo.CreateAsync(pet);
    }

    public async Task UpdateAsync(int id, Pet pet)
    {
        var existing = await _petRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Mascota con ID {id} no encontrada.");
        if (!await _ownerRepo.ExistsAsync(pet.OwnerId))
            throw new KeyNotFoundException($"Propietario con ID {pet.OwnerId} no encontrado.");
        existing.Name = pet.Name;
        existing.Species = pet.Species;
        existing.Breed = pet.Breed;
        existing.BirthDate = pet.BirthDate;
        existing.Weight = pet.Weight;
        existing.PhotoUrl = pet.PhotoUrl;
        existing.Allergies = pet.Allergies;
        existing.ChronicConditions = pet.ChronicConditions;
        existing.OwnerId = pet.OwnerId;
        existing.UpdatedAt = DateTime.UtcNow;
        await _petRepo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var pet = await _petRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Mascota con ID {id} no encontrada.");
        pet.IsActive = false;
        pet.UpdatedAt = DateTime.UtcNow;
        await _petRepo.UpdateAsync(pet);
    }
}

// ════════════════════════════════════════════════
// VETERINARIAN SERVICE
// ════════════════════════════════════════════════
public class VeterinarianService : IVeterinarianService
{
    private readonly IVeterinarianRepository _vetRepo;
    public VeterinarianService(IVeterinarianRepository vetRepo) => _vetRepo = vetRepo;

    public async Task<IEnumerable<Veterinarian>> GetAllAsync() => await _vetRepo.GetAllAsync();
    public async Task<Veterinarian?> GetByIdAsync(int id) => await _vetRepo.GetByIdAsync(id);

    public async Task<Veterinarian> CreateAsync(Veterinarian vet)
    {
        var existing = await _vetRepo.GetByLicenseAsync(vet.LicenseNumber);
        if (existing != null)
            throw new InvalidOperationException($"Ya existe un veterinario con la matrícula '{vet.LicenseNumber}'.");
        return await _vetRepo.CreateAsync(vet);
    }

    public async Task UpdateAsync(int id, Veterinarian vet)
    {
        var existing = await _vetRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Veterinario con ID {id} no encontrado.");
        var byLicense = await _vetRepo.GetByLicenseAsync(vet.LicenseNumber);
        if (byLicense != null && byLicense.Id != id)
            throw new InvalidOperationException("La matrícula profesional ya está registrada.");
        existing.FirstName = vet.FirstName;
        existing.LastName = vet.LastName;
        existing.Specialty = vet.Specialty;
        existing.Email = vet.Email;
        existing.Phone = vet.Phone;
        existing.UpdatedAt = DateTime.UtcNow;
        await _vetRepo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var vet = await _vetRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Veterinario con ID {id} no encontrado.");
        vet.IsActive = false;
        vet.UpdatedAt = DateTime.UtcNow;
        await _vetRepo.UpdateAsync(vet);
    }
}

// ════════════════════════════════════════════════
// APPOINTMENT SERVICE
// ════════════════════════════════════════════════
public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _apptRepo;
    private readonly IPetRepository _petRepo;
    private readonly IVeterinarianRepository _vetRepo;
    public AppointmentService(IAppointmentRepository apptRepo, IPetRepository petRepo, IVeterinarianRepository vetRepo)
    { _apptRepo = apptRepo; _petRepo = petRepo; _vetRepo = vetRepo; }

    public async Task<IEnumerable<Appointment>> GetAllAsync() => await _apptRepo.GetAllAsync();
    public async Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date) => await _apptRepo.GetByDateAsync(date);
    public async Task<IEnumerable<Appointment>> GetByVetAsync(int vetId) => await _apptRepo.GetByVetAsync(vetId);
    public async Task<IEnumerable<Appointment>> GetByPetAsync(int petId) => await _apptRepo.GetByPetAsync(petId);
    public async Task<Appointment?> GetByIdAsync(int id) => await _apptRepo.GetWithDetailsAsync(id);

    public async Task<Appointment> CreateAsync(Appointment appt)
    {
        if (!await _petRepo.ExistsAsync(appt.PetId))
            throw new KeyNotFoundException($"Mascota con ID {appt.PetId} no encontrada.");
        if (!await _vetRepo.ExistsAsync(appt.VeterinarianId))
            throw new KeyNotFoundException($"Veterinario con ID {appt.VeterinarianId} no encontrado.");
        if (appt.AppointmentDate <= DateTime.Now)
            throw new InvalidOperationException("La fecha de la cita debe ser futura.");
        if (await _apptRepo.HasConflictAsync(appt.VeterinarianId, appt.AppointmentDate))
            throw new InvalidOperationException("El veterinario ya tiene una cita en ese horario.");
        appt.Status = AppointmentStatus.Scheduled;
        return await _apptRepo.CreateAsync(appt);
    }

    public async Task UpdateAsync(int id, Appointment appt)
    {
        var existing = await _apptRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cita con ID {id} no encontrada.");
        if (existing.Status != AppointmentStatus.Scheduled)
            throw new InvalidOperationException("Solo se pueden editar citas en estado Programado.");
        if (!await _vetRepo.ExistsAsync(appt.VeterinarianId))
            throw new KeyNotFoundException($"Veterinario con ID {appt.VeterinarianId} no encontrado.");
        if (appt.AppointmentDate <= DateTime.UtcNow)
            throw new InvalidOperationException("La fecha de la cita debe ser futura.");
        if (await _apptRepo.HasConflictAsync(appt.VeterinarianId, appt.AppointmentDate, id))
            throw new InvalidOperationException("El veterinario ya tiene una cita en ese horario.");
        existing.VeterinarianId = appt.VeterinarianId;
        existing.AppointmentDate = appt.AppointmentDate;
        existing.Type = appt.Type;
        existing.Notes = appt.Notes;
        existing.RescheduleCount++;
        existing.UpdatedAt = DateTime.UtcNow;
        await _apptRepo.UpdateAsync(existing);
    }

    public async Task UpdateStatusAsync(int id, AppointmentStatus newStatus, string? reason = null)
    {
        var appt = await _apptRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cita con ID {id} no encontrada.");
        var valid = (appt.Status, newStatus) switch
        {
            (AppointmentStatus.Scheduled, AppointmentStatus.InProgress) => true,
            (AppointmentStatus.InProgress, AppointmentStatus.Completed) => true,
            (AppointmentStatus.Scheduled, AppointmentStatus.Cancelled) => true,
            (AppointmentStatus.InProgress, AppointmentStatus.Cancelled) => true,
            _ => false
        };
        if (!valid)
            throw new InvalidOperationException($"No se puede cambiar de {appt.Status} a {newStatus}.");
        if (newStatus == AppointmentStatus.Cancelled && string.IsNullOrWhiteSpace(reason))
            throw new InvalidOperationException("Se requiere un motivo para cancelar la cita.");
        appt.Status = newStatus;
        appt.CancellationReason = reason;
        appt.UpdatedAt = DateTime.UtcNow;
        await _apptRepo.UpdateAsync(appt);
    }

    public async Task DeleteAsync(int id)
    {
        var appt = await _apptRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cita con ID {id} no encontrada.");
        if (appt.Status == AppointmentStatus.Completed)
            throw new InvalidOperationException("No se puede eliminar una cita ya completada.");
        await _apptRepo.DeleteAsync(appt);
    }
}

// ════════════════════════════════════════════════
// MEDICAL RECORD SERVICE
// ════════════════════════════════════════════════
public class MedicalRecordService : IMedicalRecordService
{
    private readonly IMedicalRecordRepository _recordRepo;
    private readonly IAppointmentRepository _apptRepo;
    private readonly IPetRepository _petRepo;
    private readonly IVeterinarianRepository _vetRepo;
    public MedicalRecordService(IMedicalRecordRepository recordRepo, IAppointmentRepository apptRepo,
        IPetRepository petRepo, IVeterinarianRepository vetRepo)
    { _recordRepo = recordRepo; _apptRepo = apptRepo; _petRepo = petRepo; _vetRepo = vetRepo; }

    public async Task<IEnumerable<MedicalRecord>> GetByPetAsync(int petId) => await _recordRepo.GetByPetAsync(petId);
    public async Task<MedicalRecord?> GetByIdAsync(int id) => await _recordRepo.GetWithDetailsAsync(id);
    public async Task<MedicalRecord?> GetByAppointmentAsync(int apptId) => await _recordRepo.GetByAppointmentAsync(apptId);

    public async Task<MedicalRecord> CreateAsync(MedicalRecord record)
    {
        var appt = await _apptRepo.GetByIdAsync(record.AppointmentId)
            ?? throw new KeyNotFoundException($"Cita con ID {record.AppointmentId} no encontrada.");
        if (appt.Status != AppointmentStatus.InProgress && appt.Status != AppointmentStatus.Completed)
            throw new InvalidOperationException("Solo se puede registrar historia clínica en citas en curso o completadas.");
        var existing = await _recordRepo.GetByAppointmentAsync(record.AppointmentId);
        if (existing != null)
            throw new InvalidOperationException("Esta cita ya tiene una historia clínica registrada.");
        record.PetId = appt.PetId;
        record.VeterinarianId = appt.VeterinarianId;
        return await _recordRepo.CreateAsync(record);
    }

    public async Task UpdateAsync(int id, MedicalRecord record)
    {
        var existing = await _recordRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Historia clínica con ID {id} no encontrada.");
        existing.ReasonForVisit = record.ReasonForVisit;
        existing.PhysicalExam = record.PhysicalExam;
        existing.Weight = record.Weight;
        existing.Temperature = record.Temperature;
        existing.HeartRate = record.HeartRate;
        existing.Diagnosis = record.Diagnosis;
        existing.Treatment = record.Treatment;
        existing.Prescriptions = record.Prescriptions;
        existing.Observations = record.Observations;
        existing.NextVisitDate = record.NextVisitDate;
        existing.UpdatedAt = DateTime.UtcNow;
        await _recordRepo.UpdateAsync(existing);
    }

    public async Task DeleteAsync(int id)
    {
        var record = await _recordRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Historia clínica con ID {id} no encontrada.");
        record.IsActive = false;
        record.UpdatedAt = DateTime.UtcNow;
        await _recordRepo.UpdateAsync(record);
    }
}

// ════════════════════════════════════════════════
// PRODUCT SERVICE
// ════════════════════════════════════════════════
public class ProductService : IProductService
{
    private readonly IProductRepository _productRepo;
    public ProductService(IProductRepository productRepo) => _productRepo = productRepo;

    public async Task<IEnumerable<Product>> GetAllAsync() => await _productRepo.GetAllAsync();
    public async Task<Product?> GetByIdAsync(int id) => await _productRepo.GetByIdAsync(id);
    public async Task<IEnumerable<Product>> GetLowStockAsync() => await _productRepo.GetLowStockAsync();

    public async Task<Product> CreateAsync(Product product)
    {
        if (product.Price <= 0) throw new InvalidOperationException("El precio debe ser mayor a 0.");
        if (product.Stock < 0) throw new InvalidOperationException("El stock no puede ser negativo.");
        if (product.ExpiryDate.HasValue && product.ExpiryDate.Value <= DateTime.Now)
            throw new InvalidOperationException("La fecha de vencimiento debe ser futura.");
        return await _productRepo.CreateAsync(product);
    }

    public async Task UpdateAsync(int id, Product product)
    {
        var existing = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Producto con ID {id} no encontrado.");
        if (product.Price <= 0) throw new InvalidOperationException("El precio debe ser mayor a 0.");
        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.Category = product.Category;
        existing.Price = product.Price;
        existing.MinStock = product.MinStock;
        existing.ExpiryDate = product.ExpiryDate;
        existing.Supplier = product.Supplier;
        existing.Barcode = product.Barcode;
        existing.UpdatedAt = DateTime.UtcNow;
        await _productRepo.UpdateAsync(existing);
    }

    public async Task UpdateStockAsync(int id, int quantity)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Producto con ID {id} no encontrado.");
        if (product.Stock + quantity < 0)
            throw new InvalidOperationException("Stock insuficiente para realizar la operación.");
        product.Stock += quantity;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepo.UpdateAsync(product);
    }

    public async Task DeleteAsync(int id)
    {
        var product = await _productRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Producto con ID {id} no encontrado.");
        if (product.Stock > 0)
            throw new InvalidOperationException("No se puede eliminar un producto con stock disponible.");
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _productRepo.UpdateAsync(product);
    }
}

// ════════════════════════════════════════════════
// INVOICE SERVICE
// ════════════════════════════════════════════════
public class InvoiceService : IInvoiceService
{
    private readonly IInvoiceRepository _invoiceRepo;
    private readonly IOwnerRepository _ownerRepo;
    private readonly IProductRepository _productRepo;
    public InvoiceService(IInvoiceRepository invoiceRepo, IOwnerRepository ownerRepo, IProductRepository productRepo)
    { _invoiceRepo = invoiceRepo; _ownerRepo = ownerRepo; _productRepo = productRepo; }

    public async Task<IEnumerable<Invoice>> GetAllAsync() => await _invoiceRepo.GetAllAsync();
    public async Task<Invoice?> GetByIdAsync(int id) => await _invoiceRepo.GetWithDetailsAsync(id);
    public async Task<IEnumerable<Invoice>> GetByOwnerAsync(int ownerId) => await _invoiceRepo.GetByOwnerAsync(ownerId);

    public async Task<Invoice> CreateAsync(Invoice invoice, List<(int productId, int quantity)> products)
    {
        if (!await _ownerRepo.ExistsAsync(invoice.OwnerId))
            throw new KeyNotFoundException($"Propietario con ID {invoice.OwnerId} no encontrado.");
        if (!products.Any())
            throw new InvalidOperationException("La factura debe tener al menos un producto o servicio.");

        invoice.InvoiceNumber = await _invoiceRepo.GenerateInvoiceNumberAsync();
        invoice.InvoiceProducts = new List<InvoiceProduct>();

        decimal subtotal = 0;
        foreach (var (productId, qty) in products)
        {
            var product = await _productRepo.GetByIdAsync(productId)
                ?? throw new KeyNotFoundException($"Producto con ID {productId} no encontrado.");
            if (product.Stock < qty)
                throw new InvalidOperationException($"Stock insuficiente para '{product.Name}'. Disponible: {product.Stock}.");
            var lineSubtotal = product.Price * qty;
            subtotal += lineSubtotal;
            invoice.InvoiceProducts.Add(new InvoiceProduct
            {
                ProductId = productId,
                Quantity = qty,
                UnitPrice = product.Price,
                Subtotal = lineSubtotal
            });
            product.Stock -= qty;
            await _productRepo.UpdateAsync(product);
        }

        invoice.Subtotal = subtotal;
        invoice.Tax = Math.Round(subtotal * 0.19m, 2);
        invoice.Total = invoice.Subtotal + invoice.Tax;
        invoice.Status = InvoiceStatus.Pending;
        return await _invoiceRepo.CreateAsync(invoice);
    }

    public async Task UpdateStatusAsync(int id, InvoiceStatus status, decimal amountPaid)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Factura con ID {id} no encontrada.");
        if (invoice.Status == InvoiceStatus.Cancelled)
            throw new InvalidOperationException("No se puede modificar una factura cancelada.");
        invoice.AmountPaid = amountPaid;
        invoice.Status = amountPaid >= invoice.Total ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
        if (status == InvoiceStatus.Cancelled) invoice.Status = InvoiceStatus.Cancelled;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoiceRepo.UpdateAsync(invoice);
    }

    public async Task DeleteAsync(int id)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Factura con ID {id} no encontrada.");
        if (invoice.Status == InvoiceStatus.Paid)
            throw new InvalidOperationException("No se puede eliminar una factura pagada.");
        invoice.IsActive = false;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _invoiceRepo.UpdateAsync(invoice);
    }
}

// ════════════════════════════════════════════════
// SYSTEM USER SERVICE
// ════════════════════════════════════════════════
public class SystemUserService : ISystemUserService
{
    private readonly ISystemUserRepository _userRepo;
    public SystemUserService(ISystemUserRepository userRepo) => _userRepo = userRepo;

    public async Task<IEnumerable<SystemUser>> GetAllAsync() => await _userRepo.GetAllAsync();
    public async Task<SystemUser?> GetByIdAsync(int id) => await _userRepo.GetByIdAsync(id);

    public async Task<SystemUser> CreateAsync(SystemUser user)
    {
        if (await _userRepo.EmailExistsAsync(user.Email))
            throw new InvalidOperationException($"El email '{user.Email}' ya está registrado.");
        if (await _userRepo.DocumentExistsAsync(user.Document))
            throw new InvalidOperationException($"El documento '{user.Document}' ya está registrado.");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
        return await _userRepo.CreateAsync(user);
    }

    public async Task UpdateAsync(int id, SystemUser user)
    {
        var existing = await _userRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuario con ID {id} no encontrado.");
        existing.FirstName = user.FirstName;
        existing.LastName = user.LastName;
        existing.Phone = user.Phone;
        existing.Role = user.Role;
        existing.UpdatedAt = DateTime.UtcNow;
        await _userRepo.UpdateAsync(existing);
    }

    public async Task ToggleActiveAsync(int id)
    {
        var user = await _userRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Usuario con ID {id} no encontrado.");
        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepo.UpdateAsync(user);
    }
}

// ════════════════════════════════════════════════
// REVIEW SERVICE (Calificaciones)
// ════════════════════════════════════════════════
public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepo;
    private readonly IOwnerRepository _ownerRepo;

    public ReviewService(IReviewRepository reviewRepo, IOwnerRepository ownerRepo)
    {
        _reviewRepo = reviewRepo;
        _ownerRepo = ownerRepo;
    }

    public async Task<IEnumerable<Review>> GetAllAsync()
        => await _reviewRepo.GetAllAsync();

    public async Task<Review?> GetByIdAsync(int id)
        => await _reviewRepo.GetByIdAsync(id);

    public async Task<IEnumerable<Review>> GetByOwnerAsync(int ownerId)
        => await _reviewRepo.GetByOwnerAsync(ownerId);

    public async Task<IEnumerable<Review>> GetPendingAsync()
        => await _reviewRepo.GetPendingAsync();

    public async Task<Review> CreateAsync(Review review)
    {
        if (!await _ownerRepo.ExistsAsync(review.OwnerId))
            throw new KeyNotFoundException($"Propietario con ID {review.OwnerId} no encontrado.");

        if (review.Rating < 1 || review.Rating > 5)
            throw new InvalidOperationException("La calificación debe ser entre 1 y 5 estrellas.");

        review.Status = ReviewStatus.Pending;
        review.CreatedAt = DateTime.UtcNow;

        return await _reviewRepo.CreateAsync(review);
    }

    public async Task UpdateStatusAsync(int id, int status)
    {
        var review = await _reviewRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Calificación con ID {id} no encontrada.");

        review.Status = (ReviewStatus)status;
        await _reviewRepo.UpdateAsync(review);
    }

    public async Task DeleteAsync(int id)
    {
        var review = await _reviewRepo.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Calificación con ID {id} no encontrada.");

        // Eliminación física en lugar de lógica
        await _reviewRepo.DeleteAsync(review);
    }
}