using Microsoft.EntityFrameworkCore;
using RainbowArya.Domain.Entities;

namespace RainbowArya.DataAccess.Context;

public class RainbowAryaDbContext : DbContext
{
    public RainbowAryaDbContext(DbContextOptions<RainbowAryaDbContext> options) : base(options) { }

    public DbSet<Owner> Owners { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<Veterinarian> Veterinarians { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Invoice> Invoices { get; set; }
    public DbSet<InvoiceProduct> InvoiceProducts { get; set; }
    public DbSet<SystemUser> SystemUsers { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Owner ──
        modelBuilder.Entity<Owner>()
            .HasIndex(o => o.Document).IsUnique();
        modelBuilder.Entity<Owner>()
            .HasIndex(o => o.Email).IsUnique();

        // ── Pet ──
        modelBuilder.Entity<Pet>()
            .HasOne(p => p.Owner)
            .WithMany(o => o.Pets)
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Pet>()
            .Property(p => p.Weight).HasPrecision(8, 2);

        // ── Veterinarian ──
        modelBuilder.Entity<Veterinarian>()
            .HasIndex(v => v.LicenseNumber).IsUnique();

        // ── Appointment ──
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Pet)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PetId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Appointment>()
            .HasOne(a => a.Veterinarian)
            .WithMany(v => v.Appointments)
            .HasForeignKey(a => a.VeterinarianId)
            .OnDelete(DeleteBehavior.Restrict);

        // ── MedicalRecord ──
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(mr => mr.Pet)
            .WithMany(p => p.MedicalRecords)
            .HasForeignKey(mr => mr.PetId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(mr => mr.Veterinarian)
            .WithMany(v => v.MedicalRecords)
            .HasForeignKey(mr => mr.VeterinarianId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(mr => mr.Appointment)
            .WithOne(a => a.MedicalRecord)
            .HasForeignKey<MedicalRecord>(mr => mr.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<MedicalRecord>()
            .HasIndex(mr => mr.AppointmentId).IsUnique();
        modelBuilder.Entity<MedicalRecord>()
            .Property(mr => mr.Weight).HasPrecision(8, 2);
        modelBuilder.Entity<MedicalRecord>()
            .Property(mr => mr.Temperature).HasPrecision(5, 2);

        // ── Product ──
        modelBuilder.Entity<Product>()
            .Property(p => p.Price).HasPrecision(18, 2);

        // ── Invoice ──
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Owner)
            .WithMany(o => o.Invoices)
            .HasForeignKey(i => i.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Invoice>()
            .HasOne(i => i.Appointment)
            .WithMany()
            .HasForeignKey(i => i.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
        modelBuilder.Entity<Invoice>()
            .Property(i => i.Subtotal).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>()
            .Property(i => i.Tax).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>()
            .Property(i => i.Total).HasPrecision(18, 2);
        modelBuilder.Entity<Invoice>()
            .Property(i => i.AmountPaid).HasPrecision(18, 2);

        // ── InvoiceProduct (N:M) ──
        modelBuilder.Entity<InvoiceProduct>()
            .HasKey(ip => new { ip.InvoiceId, ip.ProductId });
        modelBuilder.Entity<InvoiceProduct>()
            .HasOne(ip => ip.Invoice)
            .WithMany(i => i.InvoiceProducts)
            .HasForeignKey(ip => ip.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
        modelBuilder.Entity<InvoiceProduct>()
            .HasOne(ip => ip.Product)
            .WithMany(p => p.InvoiceProducts)
            .HasForeignKey(ip => ip.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<InvoiceProduct>()
            .Property(ip => ip.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<InvoiceProduct>()
            .Property(ip => ip.Subtotal).HasPrecision(18, 2);

        // ── SystemUser ──
        modelBuilder.Entity<SystemUser>()
            .HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<SystemUser>()
            .HasIndex(u => u.Document).IsUnique();

        // ── Review ──
        modelBuilder.Entity<Review>()
            .HasOne(r => r.Owner)
            .WithMany(o => o.Reviews)
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Appointment)
            .WithMany()
            .HasForeignKey(r => r.AppointmentId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);

        modelBuilder.Entity<Review>()
            .Property(r => r.Comment)
            .HasMaxLength(500);

        modelBuilder.Entity<Review>()
            .Property(r => r.VeterinarianName)
            .HasMaxLength(100);

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.Status);

        modelBuilder.Entity<Review>()
            .Property(r => r.Status)
            .HasConversion<int>();
    }
}