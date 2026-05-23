using RainbowArya.Domain.Enums;

namespace RainbowArya.Domain.Entities;

public class Invoice : AuditBase
{
    public int OwnerId { get; set; }
    public int? AppointmentId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public decimal AmountPaid { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
    public string? Notes { get; set; }

    // Navigation
    public Owner Owner { get; set; } = null!;
    public Appointment? Appointment { get; set; }
    public ICollection<InvoiceProduct> InvoiceProducts { get; set; } = new List<InvoiceProduct>();
}

public class InvoiceProduct
{
    public int InvoiceId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }

    // Navigation
    public Invoice Invoice { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
