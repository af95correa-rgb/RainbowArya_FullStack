using System;
using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Entities
{
    public class Review
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public int? AppointmentId { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string VeterinarianName { get; set; } = string.Empty;
        public string PetName { get; set; } = string.Empty;  // 👈 AGREGAR ESTA LÍNEA
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public ReviewStatus Status { get; set; } = ReviewStatus.Pending;

        // Relaciones
        public virtual Owner? Owner { get; set; }
        public virtual Appointment? Appointment { get; set; }
    }
}