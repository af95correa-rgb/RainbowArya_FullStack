using Microsoft.EntityFrameworkCore;
using RainbowArya.DataAccess.Context;
using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;
using RainbowArya.Domain.Interfaces.Repositories;

namespace RainbowArya.DataAccess.Repositories;

// ── Generic ──
public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly RainbowAryaDbContext _context;
    protected readonly DbSet<T> _dbSet;
    public GenericRepository(RainbowAryaDbContext context) { _context = context; _dbSet = context.Set<T>(); }
    public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
    public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
    public async Task<T> CreateAsync(T entity) { await _dbSet.AddAsync(entity); await _context.SaveChangesAsync(); return entity; }
    public async Task UpdateAsync(T entity) { _dbSet.Update(entity); await _context.SaveChangesAsync(); }
    public async Task DeleteAsync(T entity) { _dbSet.Remove(entity); await _context.SaveChangesAsync(); }
}

// ── Owner ──
public class OwnerRepository : GenericRepository<Owner>, IOwnerRepository
{
    public OwnerRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<Owner?> GetByDocumentAsync(string doc) => await _dbSet.FirstOrDefaultAsync(o => o.Document == doc);
    public async Task<Owner?> GetByEmailAsync(string email) => await _dbSet.FirstOrDefaultAsync(o => o.Email == email);
    public async Task<Owner?> GetWithPetsAsync(int id) => await _dbSet.Include(o => o.Pets).FirstOrDefaultAsync(o => o.Id == id);
    public async Task<bool> ExistsAsync(int id) => await _dbSet.AnyAsync(o => o.Id == id && o.IsActive);
}

// ── Pet ──
public class PetRepository : GenericRepository<Pet>, IPetRepository
{
    public PetRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<IEnumerable<Pet>> GetByOwnerAsync(int ownerId)
        => await _dbSet.Include(p => p.Owner).Where(p => p.OwnerId == ownerId && p.IsActive).ToListAsync();
    public async Task<Pet?> GetWithDetailsAsync(int id)
        => await _dbSet.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id);
    public async Task<bool> ExistsAsync(int id) => await _dbSet.AnyAsync(p => p.Id == id && p.IsActive);
}

// ── Veterinarian ──
public class VeterinarianRepository : GenericRepository<Veterinarian>, IVeterinarianRepository
{
    public VeterinarianRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<Veterinarian?> GetByLicenseAsync(string license)
        => await _dbSet.FirstOrDefaultAsync(v => v.LicenseNumber == license);
    public async Task<bool> ExistsAsync(int id) => await _dbSet.AnyAsync(v => v.Id == id && v.IsActive);
}

// ── Appointment ──
public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
{
    public AppointmentRepository(RainbowAryaDbContext context) : base(context) { }

    public async Task<IEnumerable<Appointment>> GetByDateAsync(DateTime date)
        => await _dbSet
            .Include(a => a.Pet).ThenInclude(p => p.Owner)
            .Include(a => a.Veterinarian)
            .Where(a => a.AppointmentDate.Date == date.Date)
            .OrderBy(a => a.AppointmentDate)
            .ToListAsync();

    public async Task<IEnumerable<Appointment>> GetByVetAsync(int vetId)
        => await _dbSet
            .Include(a => a.Pet).ThenInclude(p => p.Owner)
            .Include(a => a.Veterinarian)
            .Where(a => a.VeterinarianId == vetId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();

    public async Task<IEnumerable<Appointment>> GetByPetAsync(int petId)
        => await _dbSet
            .Include(a => a.Veterinarian)
            .Where(a => a.PetId == petId)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();

    public async Task<IEnumerable<Appointment>> GetByStatusAsync(AppointmentStatus status)
        => await _dbSet
            .Include(a => a.Pet).ThenInclude(p => p.Owner)
            .Include(a => a.Veterinarian)
            .Where(a => a.Status == status)
            .OrderBy(a => a.AppointmentDate)
            .ToListAsync();

    public async Task<Appointment?> GetWithDetailsAsync(int id)
        => await _dbSet
            .Include(a => a.Pet).ThenInclude(p => p.Owner)
            .Include(a => a.Veterinarian)
            .Include(a => a.MedicalRecord)
            .FirstOrDefaultAsync(a => a.Id == id);

    public async Task<bool> HasConflictAsync(int vetId, DateTime date, int? excludeId = null)
    {
        var window = TimeSpan.FromMinutes(30);
        var query = _dbSet.Where(a =>
            a.VeterinarianId == vetId &&
            a.Status != AppointmentStatus.Cancelled &&
            a.AppointmentDate >= date.Add(-window) &&
            a.AppointmentDate <= date.Add(window));
        if (excludeId.HasValue) query = query.Where(a => a.Id != excludeId.Value);
        return await query.AnyAsync();
    }

    public new async Task<IEnumerable<Appointment>> GetAllAsync()
        => await _dbSet
            .Include(a => a.Pet).ThenInclude(p => p.Owner)
            .Include(a => a.Veterinarian)
            .OrderByDescending(a => a.AppointmentDate)
            .ToListAsync();
}

// ── MedicalRecord ──
public class MedicalRecordRepository : GenericRepository<MedicalRecord>, IMedicalRecordRepository
{
    public MedicalRecordRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<IEnumerable<MedicalRecord>> GetByPetAsync(int petId)
        => await _dbSet
            .Include(mr => mr.Veterinarian)
            .Include(mr => mr.Appointment)
            .Where(mr => mr.PetId == petId && mr.IsActive)
            .OrderByDescending(mr => mr.CreatedAt)
            .ToListAsync();
    public async Task<MedicalRecord?> GetByAppointmentAsync(int apptId)
        => await _dbSet.FirstOrDefaultAsync(mr => mr.AppointmentId == apptId);
    public async Task<MedicalRecord?> GetWithDetailsAsync(int id)
        => await _dbSet
            .Include(mr => mr.Pet).ThenInclude(p => p.Owner)
            .Include(mr => mr.Veterinarian)
            .Include(mr => mr.Appointment)
            .FirstOrDefaultAsync(mr => mr.Id == id);
}

// ── Product ──
public class ProductRepository : GenericRepository<Product>, IProductRepository
{
    public ProductRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<IEnumerable<Product>> GetLowStockAsync()
        => await _dbSet.Where(p => p.IsActive && p.Stock <= p.MinStock).ToListAsync();
    public async Task<IEnumerable<Product>> GetByCategory(ProductCategory category)
        => await _dbSet.Where(p => p.Category == category && p.IsActive).ToListAsync();
    public async Task<Product?> GetByBarcodeAsync(string barcode)
        => await _dbSet.FirstOrDefaultAsync(p => p.Barcode == barcode);
    public async Task<bool> ExistsAsync(int id) => await _dbSet.AnyAsync(p => p.Id == id && p.IsActive);

    public new async Task<IEnumerable<Product>> GetAllAsync()
        => await _dbSet.Where(p => p.IsActive).OrderBy(p => p.Name).ToListAsync();
}

// ── Invoice ──
public class InvoiceRepository : GenericRepository<Invoice>, IInvoiceRepository
{
    public InvoiceRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<IEnumerable<Invoice>> GetByOwnerAsync(int ownerId)
        => await _dbSet
            .Include(i => i.InvoiceProducts).ThenInclude(ip => ip.Product)
            .Where(i => i.OwnerId == ownerId && i.IsActive)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    public async Task<Invoice?> GetWithDetailsAsync(int id)
        => await _dbSet
            .Include(i => i.Owner)
            .Include(i => i.InvoiceProducts).ThenInclude(ip => ip.Product)
            .Include(i => i.Appointment)
            .FirstOrDefaultAsync(i => i.Id == id);
    public async Task<string> GenerateInvoiceNumberAsync()
    {
        var count = await _dbSet.CountAsync();
        return $"FV-{DateTime.UtcNow.Year}-{(count + 1):D5}";
    }
}

// ── SystemUser ──
public class SystemUserRepository : GenericRepository<SystemUser>, ISystemUserRepository
{
    public SystemUserRepository(RainbowAryaDbContext context) : base(context) { }
    public async Task<SystemUser?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    public async Task<bool> EmailExistsAsync(string email)
        => await _dbSet.AnyAsync(u => u.Email == email);
    public async Task<bool> DocumentExistsAsync(string doc)
        => await _dbSet.AnyAsync(u => u.Document == doc);
}


public class ReviewRepository : GenericRepository<Review>, IReviewRepository
{
    public ReviewRepository(RainbowAryaDbContext context) : base(context) { }

    public async Task<IEnumerable<Review>> GetByOwnerAsync(int ownerId)
        => await _dbSet
            .Include(r => r.Owner)
            .Where(r => r.OwnerId == ownerId && r.IsActive)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Review>> GetPendingAsync()
        => await _dbSet
            .Include(r => r.Owner)
            .Where(r => r.Status == ReviewStatus.Pending && r.IsActive)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Review>> GetPublishedAsync()
        => await _dbSet
            .Include(r => r.Owner)
            .Where(r => r.Status == ReviewStatus.Published && r.IsActive)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public async Task<double> GetAverageRatingByVetAsync(string vetName)
    {
        var reviews = await _dbSet
            .Where(r => r.VeterinarianName == vetName && r.Status == ReviewStatus.Published && r.IsActive)
            .ToListAsync();
        return reviews.Any() ? reviews.Average(r => r.Rating) : 0;
    }
}