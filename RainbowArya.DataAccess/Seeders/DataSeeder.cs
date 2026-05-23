using Microsoft.EntityFrameworkCore;
using RainbowArya.DataAccess.Context;
using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;

namespace RainbowArya.DataAccess.Seeders;

public static class DataSeeder
{
    public static async Task SeedAsync(RainbowAryaDbContext context)
    {
        if (await context.Veterinarians.AnyAsync()) return;

        // ═══ 1. VETERINARIOS ═══
        var vets = new List<Veterinarian>
        {
            new() { FirstName="Diana", LastName="Ospina", LicenseNumber="VET-001", Specialty="Medicina General", Email="diana.ospina@rainbowarya.com", Phone="3001234567" },
            new() { FirstName="Camilo", LastName="Torres", LicenseNumber="VET-002", Specialty="Cirugía", Email="camilo.torres@rainbowarya.com", Phone="3009876543" },
            new() { FirstName="Marcela", LastName="Ríos", LicenseNumber="VET-003", Specialty="Dermatología", Email="marcela.rios@rainbowarya.com", Phone="3015556677" },
        };
        context.Veterinarians.AddRange(vets);
        await context.SaveChangesAsync();

        // ═══ 2. PROPIETARIOS ═══
        var owners = new List<Owner>
        {
            new() { FirstName="Andrés", LastName="Correa", Document="1020345678", Email="andres.correa@email.com", Phone="3112345678", Address="Calle 50 #30-10, Medellín" },
            new() { FirstName="Laura", LastName="Salinas", Document="1020345679", Email="laura.salinas@email.com", Phone="3123456789", Address="Carrera 70 #45-20, Medellín" },
            new() { FirstName="Carlos", LastName="González", Document="1020345680", Email="carlos.gonzalez@email.com", Phone="3134567890", Address="Av. El Poblado #15-5, Medellín" },
            new() { FirstName="Valentina", LastName="Muñoz", Document="1020345681", Email="valentina.munoz@email.com", Phone="3145678901", Address="Calle 10 #43-50, Medellín" },
            new() { FirstName="Sebastián", LastName="Pérez", Document="1020345682", Email="sebastian.perez@email.com", Phone="3156789012", Address="Carrera 80 #33-22, Medellín" },
        };
        context.Owners.AddRange(owners);
        await context.SaveChangesAsync();

        // ═══ 3. MASCOTAS ═══
        var pets = new List<Pet>
        {
            new() { Name="Max", Species=PetSpecies.Dog, Breed="Labrador Retriever", BirthDate=new DateTime(2020,3,15), Weight=28.5m, OwnerId=owners[0].Id },
            new() { Name="Luna", Species=PetSpecies.Cat, Breed="Siamés", BirthDate=new DateTime(2021,7,20), Weight=4.2m, OwnerId=owners[0].Id },
            new() { Name="Rocky", Species=PetSpecies.Dog, Breed="Bulldog Francés", BirthDate=new DateTime(2019,11,5), Weight=12.0m, Allergies="Pollo", OwnerId=owners[1].Id },
            new() { Name="Mia", Species=PetSpecies.Cat, Breed="Persa", BirthDate=new DateTime(2022,1,10), Weight=3.8m, OwnerId=owners[2].Id },
            new() { Name="Coco", Species=PetSpecies.Bird, Breed="Loro Amazónico", BirthDate=new DateTime(2018,6,1), Weight=0.5m, OwnerId=owners[2].Id },
            new() { Name="Thor", Species=PetSpecies.Dog, Breed="Golden Retriever", BirthDate=new DateTime(2021,4,22), Weight=32.0m, OwnerId=owners[3].Id },
            new() { Name="Nala", Species=PetSpecies.Dog, Breed="Beagle", BirthDate=new DateTime(2020,9,14), Weight=10.5m, OwnerId=owners[4].Id },
        };
        context.Pets.AddRange(pets);
        await context.SaveChangesAsync();

        // ═══ 4. CITAS ═══
        var appointments = new List<Appointment>
        {
            new() { PetId=pets[0].Id, VeterinarianId=vets[0].Id, AppointmentDate=DateTime.UtcNow.AddDays(-10), Type=AppointmentType.GeneralConsult, Status=AppointmentStatus.Completed, Notes="Revisión general" },
            new() { PetId=pets[2].Id, VeterinarianId=vets[0].Id, AppointmentDate=DateTime.UtcNow.AddDays(-5), Type=AppointmentType.Vaccination, Status=AppointmentStatus.Completed, Notes="Vacuna antirrábica" },
            new() { PetId=pets[5].Id, VeterinarianId=vets[1].Id, AppointmentDate=DateTime.UtcNow.AddDays(1), Type=AppointmentType.Surgery, Status=AppointmentStatus.Scheduled, Notes="Esterilización programada" },
            new() { PetId=pets[1].Id, VeterinarianId=vets[2].Id, AppointmentDate=DateTime.UtcNow.AddDays(2), Type=AppointmentType.GeneralConsult, Status=AppointmentStatus.Scheduled, Notes="Revisión dermatológica" },
            new() { PetId=pets[3].Id, VeterinarianId=vets[0].Id, AppointmentDate=DateTime.UtcNow.AddDays(3), Type=AppointmentType.Control, Status=AppointmentStatus.Scheduled },
        };
        context.Appointments.AddRange(appointments);
        await context.SaveChangesAsync();

        // ═══ 5. HISTORIAS CLÍNICAS (para citas completadas) ═══
        var records = new List<MedicalRecord>
        {
            new() {
                PetId=pets[0].Id, VeterinarianId=vets[0].Id, AppointmentId=appointments[0].Id,
                ReasonForVisit="Revisión general anual", PhysicalExam="Paciente alerta, buen estado general",
                Weight=28.5m, Temperature=38.6m, HeartRate=80,
                Diagnosis="Paciente sano", Treatment="Ninguno requerido",
                Prescriptions="Vitaminas mensual 1 tableta/día", NextVisitDate=DateTime.UtcNow.AddMonths(6)
            },
            new() {
                PetId=pets[2].Id, VeterinarianId=vets[0].Id, AppointmentId=appointments[1].Id,
                ReasonForVisit="Vacunación antirrábica", PhysicalExam="Buen estado general, peso estable",
                Weight=12.0m, Temperature=38.4m, HeartRate=90,
                Diagnosis="Sano - Vacunación preventiva", Treatment="Vacuna antirrábica aplicada",
                Observations="Alergia a pollo documentada - evitar productos con pollo", NextVisitDate=DateTime.UtcNow.AddYears(1)
            },
        };
        context.MedicalRecords.AddRange(records);
        await context.SaveChangesAsync();

        // ═══ 6. PRODUCTOS ═══
        var products = new List<Product>
        {
            new() { Name="Vacuna Antirrábica", Category=ProductCategory.Vaccine, Price=35000m, Stock=50, MinStock=10, ExpiryDate=DateTime.UtcNow.AddYears(1), Supplier="Laboratorios Virbac" },
            new() { Name="Amoxicilina 250mg", Category=ProductCategory.Medicine, Price=15000m, Stock=100, MinStock=20, ExpiryDate=DateTime.UtcNow.AddMonths(18), Supplier="MSD Animal Health" },
            new() { Name="Ivermectina 1%", Category=ProductCategory.Medicine, Price=12000m, Stock=3, MinStock=10, ExpiryDate=DateTime.UtcNow.AddMonths(12), Supplier="Laboratorio VetFarm" },
            new() { Name="Alimento Royal Canin Adulto 3kg", Category=ProductCategory.Food, Price=85000m, Stock=30, MinStock=5, Supplier="Royal Canin Colombia" },
            new() { Name="Shampoo Antipulgas", Category=ProductCategory.Medicine, Price=28000m, Stock=25, MinStock=8, Supplier="PetLife" },
            new() { Name="Vitaminas Caninas Compuesto", Category=ProductCategory.Supplement, Price=45000m, Stock=40, MinStock=15, ExpiryDate=DateTime.UtcNow.AddMonths(24), Supplier="Zoetis" },
            new() { Name="Collar Isabelino Talla M", Category=ProductCategory.Accessory, Price=18000m, Stock=2, MinStock=5, Supplier="PetCare" },
            new() { Name="Jeringa 5ml", Category=ProductCategory.Other, Price=800m, Stock=500, MinStock=100, Supplier="Medplus" },
        };
        context.Products.AddRange(products);
        await context.SaveChangesAsync();

        // ═══ 7. USUARIOS DEL SISTEMA ═══
        var users = new List<SystemUser>
        {
            new() { FirstName="Admin", LastName="Rainbow", Document="900000001", Email="admin@rainbowarya.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("Admin123!"), Phone="6044444444", Role=UserRole.Admin },
            new() { FirstName="Diana", LastName="Ospina", Document="1020345690", Email="diana.ospina@rainbowarya.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("Vet123!"), Phone="3001234567", Role=UserRole.Veterinarian },
            new() { FirstName="Sofía", LastName="Restrepo", Document="1020345691", Email="sofia.restrepo@rainbowarya.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("Rec123!"), Phone="3007654321", Role=UserRole.Receptionist },
            new() { FirstName="Juan", LastName="Mesa", Document="1020345692", Email="juan.mesa@rainbowarya.com", PasswordHash=BCrypt.Net.BCrypt.HashPassword("Aux123!"), Phone="3009999999", Role=UserRole.AuxVet },
        };
        context.SystemUsers.AddRange(users);
        await context.SaveChangesAsync();
    }
}
