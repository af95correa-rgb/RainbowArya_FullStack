namespace RainbowArya.Domain.Entities;

public class MedicalRecord : AuditBase
{
    public int PetId { get; set; }
    public int VeterinarianId { get; set; }
    public int AppointmentId { get; set; }

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

    // Navigation
    public Pet Pet { get; set; } = null!;
    public Veterinarian Veterinarian { get; set; } = null!;
    public Appointment Appointment { get; set; } = null!;
}
