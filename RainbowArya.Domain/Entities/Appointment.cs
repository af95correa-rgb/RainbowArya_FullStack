using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Entities;

public class Appointment : AuditBase
{
    public int PetId { get; set; }
    public int VeterinarianId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public AppointmentType Type { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public int RescheduleCount { get; set; } = 0;

    // Navigation
    public Pet Pet { get; set; } = null!;
    public Veterinarian Veterinarian { get; set; } = null!;
    public MedicalRecord? MedicalRecord { get; set; }
}
