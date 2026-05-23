using RainbowArya.Domain.Enums;

namespace RainbowArya.API.DTOs.Response;

public class OwnerResponseDTO
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public int PetsCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PetResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public decimal Weight { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicConditions { get; set; }
    public int OwnerId { get; set; }
    public string OwnerFullName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VeterinarianResponseDTO
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class AppointmentResponseDTO
{
    public int Id { get; set; }
    public int PetId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public string OwnerFullName { get; set; } = string.Empty;
    public int VeterinarianId { get; set; }
    public string VeterinarianFullName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public int RescheduleCount { get; set; }
    public bool HasMedicalRecord { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MedicalRecordResponseDTO
{
    public int Id { get; set; }
    public int PetId { get; set; }
    public string PetName { get; set; } = string.Empty;
    public string OwnerFullName { get; set; } = string.Empty;
    public int VeterinarianId { get; set; }
    public string VeterinarianFullName { get; set; } = string.Empty;
    public int AppointmentId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string ReasonForVisit { get; set; } = string.Empty;
    public string PhysicalExam { get; set; } = string.Empty;
    public decimal Weight { get; set; }
    public decimal Temperature { get; set; }
    public int HeartRate { get; set; }
    public string Diagnosis { get; set; } = string.Empty;
    public string Treatment { get; set; } = string.Empty;
    public string? Prescriptions { get; set; }
    public string? Observations { get; set; }
    public DateTime? NextVisitDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductResponseDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int MinStock { get; set; }
    public bool IsLowStock { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Supplier { get; set; }
    public string? Barcode { get; set; }
    public bool IsActive { get; set; }
}

public class InvoiceProductResponseDTO
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class InvoiceResponseDTO
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int OwnerId { get; set; }
    public string OwnerFullName { get; set; } = string.Empty;
    public int? AppointmentId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public List<InvoiceProductResponseDTO> Products { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class SystemUserResponseDTO
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewResponseDTO
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public int? AppointmentId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string VeterinarianName { get; set; } = string.Empty;
    public string PetName { get; set; } = string.Empty;  // 👈 Debe existir
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
