using System.ComponentModel.DataAnnotations;
using RainbowArya.Domain.Enums;

namespace RainbowArya.API.DTOs.Request;

public class OwnerRequestDTO
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName { get; set; } = string.Empty;
    [Required] public string Document { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
}

public class PetRequestDTO
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public PetSpecies Species { get; set; }
    [Required] public string Breed { get; set; } = string.Empty;
    [Required] public DateTime BirthDate { get; set; }
    [Required, Range(0.1, 200)] public decimal Weight { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicConditions { get; set; }
    [Required] public int OwnerId { get; set; }
}

public class VeterinarianRequestDTO
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName { get; set; } = string.Empty;
    [Required] public string LicenseNumber { get; set; } = string.Empty;
    [Required] public string Specialty { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Phone { get; set; } = string.Empty;
}

public class AppointmentRequestDTO
{
    [Required] public int PetId { get; set; }
    [Required] public int VeterinarianId { get; set; }
    [Required] public DateTime AppointmentDate { get; set; }
    [Required] public AppointmentType Type { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentStatusDTO
{
    [Required] public AppointmentStatus Status { get; set; }
    public string? CancellationReason { get; set; }
}

public class MedicalRecordRequestDTO
{
    [Required] public int AppointmentId { get; set; }
    [Required] public string ReasonForVisit { get; set; } = string.Empty;
    [Required] public string PhysicalExam { get; set; } = string.Empty;
    [Required, Range(0.1, 500)] public decimal Weight { get; set; }
    [Required, Range(35, 42)] public decimal Temperature { get; set; }
    [Required, Range(40, 300)] public int HeartRate { get; set; }
    [Required] public string Diagnosis { get; set; } = string.Empty;
    [Required] public string Treatment { get; set; } = string.Empty;
    public string? Prescriptions { get; set; }
    public string? Observations { get; set; }
    public DateTime? NextVisitDate { get; set; }
}

public class ProductRequestDTO
{
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required] public ProductCategory Category { get; set; }
    [Required, Range(0.01, double.MaxValue)] public decimal Price { get; set; }
    [Required, Range(0, int.MaxValue)] public int Stock { get; set; }
    [Range(0, int.MaxValue)] public int MinStock { get; set; } = 5;
    public DateTime? ExpiryDate { get; set; }
    public string? Supplier { get; set; }
    public string? Barcode { get; set; }
}

public class UpdateStockDTO
{
    [Required] public int Quantity { get; set; }
}

public class InvoiceProductItemDTO
{
    [Required] public int ProductId { get; set; }
    [Required, Range(1, int.MaxValue)] public int Quantity { get; set; }
}

public class InvoiceRequestDTO
{
    public int? OwnerId { get; set; }        // opcional si viene AppointmentId
    public int? AppointmentId { get; set; }  // opcional si viene OwnerId directo
    [Required] public PaymentMethod PaymentMethod { get; set; }
    public string? Notes { get; set; }
    [Required, MinLength(1)] public List<InvoiceProductItemDTO> Products { get; set; } = new();
}

public class UpdateInvoiceStatusDTO
{
    [Required] public InvoiceStatus Status { get; set; }
    [Range(0, double.MaxValue)] public decimal AmountPaid { get; set; }
}

public class SystemUserRequestDTO
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName { get; set; } = string.Empty;
    [Required] public string Document { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required, MinLength(8)] public string Password { get; set; } = string.Empty;
    [Required] public string Phone { get; set; } = string.Empty;
    [Required] public UserRole Role { get; set; }
}

public class ReviewRequestDTO
{
    [Required]
    public int OwnerId { get; set; }

    public int? AppointmentId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [Required]
    [StringLength(500)]
    public string Comment { get; set; } = string.Empty;

    [Required]
    public string VeterinarianName { get; set; } = string.Empty;

    [Required]
    public string PetName { get; set; } = string.Empty;  // 👈 AGREGAR ESTA LÍNEA
}
