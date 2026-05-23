using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Interfaces.Repositories;

public interface IGenericRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> CreateAsync(T entity);
    Task UpdateAsync(T entity);
    Task DeleteAsync(T entity);
}

public interface IOwnerRepository : IGenericRepository<Owner>
{
    Task<Owner?> GetByDocumentAsync(string document);
    Task<Owner?> GetByEmailAsync(string email);
    Task<Owner?> GetWithPetsAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public interface IPetRepository : IGenericRepository<Pet>
{
    Task<IEnumerable<Pet>> GetByOwnerAsync(int ownerId);
    Task<Pet?> GetWithDetailsAsync(int id);
    Task<bool> ExistsAsync(int id);
}

public interface IVeterinarianRepository : IGenericRepository<Veterinarian>
{
    Task<Veterinarian?> GetByLicenseAsync(string license);
    Task<bool> ExistsAsync(int id);
}

public interface IAppointmentRepository : IGenericRepository<Appointment>
{
    Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date);
    Task<IEnumerable<Appointment>> GetByVetAsync(int vetId);
    Task<IEnumerable<Appointment>> GetByPetAsync(int petId);
    Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status);
    Task<Appointment?> GetWithDetailsAsync(int id);
    Task<bool> HasConflictAsync(int vetId, DateTime date, int? excludeId = null);
}

public interface IMedicalRecordRepository : IGenericRepository<MedicalRecord>
{
    Task<IEnumerable<MedicalRecord>> GetByPetAsync(int petId);
    Task<MedicalRecord?> GetByAppointmentAsync(int appointmentId);
    Task<MedicalRecord?> GetWithDetailsAsync(int id);
}

public interface IProductRepository : IGenericRepository<Product>
{
    Task<IEnumerable<Product>> GetLowStockAsync();
    Task<IEnumerable<Product>> GetByCategory(ProductCategory category);
    Task<Product?> GetByBarcodeAsync(string barcode);
    Task<bool> ExistsAsync(int id);
}

public interface IInvoiceRepository : IGenericRepository<Invoice>
{
    Task<IEnumerable<Invoice>> GetByOwnerAsync(int ownerId);
    Task<Invoice?> GetWithDetailsAsync(int id);
    Task<string> GenerateInvoiceNumberAsync();
}

public interface ISystemUserRepository : IGenericRepository<SystemUser>
{
    Task<SystemUser?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> DocumentExistsAsync(string document);
}

public interface IReviewRepository : IGenericRepository<Review>
{
    Task<IEnumerable<Review>> GetByOwnerAsync(int ownerId);
    Task<IEnumerable<Review>> GetPendingAsync();
    Task<IEnumerable<Review>> GetPublishedAsync();
    Task<double> GetAverageRatingByVetAsync(string vetName);
}