using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Entities;

public class Product : AuditBase
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int MinStock { get; set; } = 5;
    public DateTime? ExpiryDate { get; set; }
    public string? Supplier { get; set; }
    public string? Barcode { get; set; }

    // Navigation (N:M con Invoice)
    public ICollection<InvoiceProduct> InvoiceProducts { get; set; } = new List<InvoiceProduct>();
}
