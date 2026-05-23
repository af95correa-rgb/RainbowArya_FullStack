using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Entities;

public class Pet : AuditBase
{
    public string Name { get; set; } = string.Empty;
    public PetSpecies Species { get; set; }
    public string Breed { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public decimal Weight { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicConditions { get; set; }

    public int OwnerId { get; set; }
    public Owner Owner { get; set; } = null!;

    // Navigation
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
}
