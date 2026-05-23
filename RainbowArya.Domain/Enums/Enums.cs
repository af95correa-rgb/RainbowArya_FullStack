namespace RainbowArya.Domain.Enums;

public enum AppointmentStatus
{
    Scheduled = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

public enum AppointmentType
{
    GeneralConsult = 0,
    Vaccination = 1,
    Surgery = 2,
    Emergency = 3,
    Hospitalization = 4,
    Deworming = 5,
    Control = 6
}

public enum PetSpecies
{
    Dog = 0,
    Cat = 1,
    Bird = 2,
    SmallMammal = 3,
    Other = 4
}

public enum UserRole
{
    Admin = 0,
    Veterinarian = 1,
    Receptionist = 2,
    AuxVet = 3
}

public enum PaymentMethod
{
    Cash = 0,
    Card = 1,
    Transfer = 2
}

public enum InvoiceStatus
{
    Pending = 0,
    Paid = 1,
    PartiallyPaid = 2,
    Cancelled = 3
}

public enum ProductCategory
{
    Medicine = 0,
    Vaccine = 1,
    Food = 2,
    Accessory = 3,
    Supplement = 4,
    Other = 5
}
public enum ReviewStatus
{
    Pending = 0,
    Published = 1,
    Rejected = 2
}
