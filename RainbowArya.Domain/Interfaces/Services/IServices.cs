using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Interfaces.Services;

public interface IOwnerService
{
    Task<IEnumerable<Owner>> GetAllAsync();
    Task<Owner?> GetByIdAsync(int id);
    Task<Owner?> GetWithPetsAsync(int id);
    Task<Owner> CreateAsync(Owner owner);
    Task UpdateAsync(int id, Owner owner);
    Task DeleteAsync(int id);
}

public interface IPetService
{
    Task<IEnumerable<Pet>> GetAllAsync();
    Task<Pet?> GetByIdAsync(int id);
    Task<IEnumerable<Pet>> GetByOwnerAsync(int ownerId);
    Task<Pet> CreateAsync(Pet pet);
    Task UpdateAsync(int id, Pet pet);
    Task DeleteAsync(int id);
}

public interface IVeterinarianService
{
    Task<IEnumerable<Veterinarian>> GetAllAsync();
    Task<Veterinarian?> GetByIdAsync(int id);
    Task<Veterinarian> CreateAsync(Veterinarian vet);
    Task UpdateAsync(int id, Veterinarian vet);
    Task DeleteAsync(int id);
}

public interface IAppointmentService
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date);
    Task<IEnumerable<Appointment>> GetByVetAsync(int vetId);
    Task<IEnumerable<Appointment>> GetByPetAsync(int petId);
    Task<Appointment?> GetByIdAsync(int id);
    Task<Appointment> CreateAsync(Appointment appointment);
    Task UpdateAsync(int id, Appointment appointment);
    Task UpdateStatusAsync(int id, AppointmentStatus status, string? reason = null);
    Task DeleteAsync(int id);
}

public interface IMedicalRecordService
{
    Task<IEnumerable<MedicalRecord>> GetByPetAsync(int petId);
    Task<MedicalRecord?> GetByIdAsync(int id);
    Task<MedicalRecord?> GetByAppointmentAsync(int appointmentId);
    Task<MedicalRecord> CreateAsync(MedicalRecord record);
    Task UpdateAsync(int id, MedicalRecord record);
    Task DeleteAsync(int id);
}

public interface IProductService
{
    Task<IEnumerable<Product>> GetAllAsync();
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetLowStockAsync();
    Task<Product> CreateAsync(Product product);
    Task UpdateAsync(int id, Product product);
    Task DeleteAsync(int id);
    Task UpdateStockAsync(int id, int quantity);
}

public interface IInvoiceService
{
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<Invoice?> GetByIdAsync(int id);
    Task<IEnumerable<Invoice>> GetByOwnerAsync(int ownerId);
    Task<Invoice> CreateAsync(Invoice invoice, List<(int productId, int quantity)> products);
    Task UpdateStatusAsync(int id, InvoiceStatus status, decimal amountPaid);
    Task DeleteAsync(int id);
}

public interface ISystemUserService
{
    Task<IEnumerable<SystemUser>> GetAllAsync();
    Task<SystemUser?> GetByIdAsync(int id);
    Task<SystemUser> CreateAsync(SystemUser user);
    Task UpdateAsync(int id, SystemUser user);
    Task ToggleActiveAsync(int id);
}

public interface IReviewService
{
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review?> GetByIdAsync(int id);
    Task<IEnumerable<Review>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Review>> GetPendingAsync();
    Task<Review> CreateAsync(Review review);
    Task UpdateStatusAsync(int id, int status);
    Task DeleteAsync(int id);
}