namespace RainbowArya.Domain.Entities;

public class Owner : AuditBase
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Document { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }

    // Navigation
    public ICollection<Pet> Pets { get; set; } = new List<Pet>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

}
