using AutoMapper;
using RainbowArya.API.DTOs.Request;
using RainbowArya.API.DTOs.Response;
using RainbowArya.Domain.Entities;

namespace RainbowArya.API.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Owner
        CreateMap<OwnerRequestDTO, Owner>();
        CreateMap<Owner, OwnerResponseDTO>()
            .ForMember(d => d.PetsCount, o => o.MapFrom(s => s.Pets.Count));

        // Pet
        CreateMap<PetRequestDTO, Pet>();
        CreateMap<Pet, PetResponseDTO>()
            .ForMember(d => d.Species, o => o.MapFrom(s => s.Species.ToString()))
            .ForMember(d => d.OwnerFullName, o => o.MapFrom(s => s.Owner != null ? s.Owner.FirstName + " " + s.Owner.LastName : string.Empty));

        // Veterinarian
        CreateMap<VeterinarianRequestDTO, Veterinarian>();
        CreateMap<Veterinarian, VeterinarianResponseDTO>();

        // Appointment
        CreateMap<AppointmentRequestDTO, Appointment>();
        CreateMap<Appointment, AppointmentResponseDTO>()
            .ForMember(d => d.PetName, o => o.MapFrom(s => s.Pet != null ? s.Pet.Name : string.Empty))
            .ForMember(d => d.OwnerId, o => o.MapFrom(s => s.Pet != null ? s.Pet.OwnerId : 0))
            .ForMember(d => d.OwnerFullName, o => o.MapFrom(s => s.Pet != null && s.Pet.Owner != null ? s.Pet.Owner.FirstName + " " + s.Pet.Owner.LastName : string.Empty))
            .ForMember(d => d.VeterinarianFullName, o => o.MapFrom(s => s.Veterinarian != null ? s.Veterinarian.FirstName + " " + s.Veterinarian.LastName : string.Empty))
            .ForMember(d => d.Type, o => o.MapFrom(s => s.Type.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.HasMedicalRecord, o => o.MapFrom(s => s.MedicalRecord != null));

        // MedicalRecord
        CreateMap<MedicalRecordRequestDTO, MedicalRecord>();
        CreateMap<MedicalRecord, MedicalRecordResponseDTO>()
            .ForMember(d => d.PetName, o => o.MapFrom(s => s.Pet != null ? s.Pet.Name : string.Empty))
            .ForMember(d => d.OwnerFullName, o => o.MapFrom(s => s.Pet != null && s.Pet.Owner != null ? s.Pet.Owner.FirstName + " " + s.Pet.Owner.LastName : string.Empty))
            .ForMember(d => d.VeterinarianFullName, o => o.MapFrom(s => s.Veterinarian != null ? s.Veterinarian.FirstName + " " + s.Veterinarian.LastName : string.Empty))
            .ForMember(d => d.AppointmentDate, o => o.MapFrom(s => s.Appointment != null ? s.Appointment.AppointmentDate : default));

        // Product
        CreateMap<ProductRequestDTO, Product>();
        CreateMap<Product, ProductResponseDTO>()
            .ForMember(d => d.Category, o => o.MapFrom(s => s.Category.ToString()))
            .ForMember(d => d.IsLowStock, o => o.MapFrom(s => s.Stock <= s.MinStock));

        // Invoice
        CreateMap<Invoice, InvoiceResponseDTO>()
            .ForMember(d => d.OwnerFullName, o => o.MapFrom(s => s.Owner != null ? s.Owner.FirstName + " " + s.Owner.LastName : string.Empty))
            .ForMember(d => d.PaymentMethod, o => o.MapFrom(s => s.PaymentMethod.ToString()))
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Products, o => o.MapFrom(s => s.InvoiceProducts));
        CreateMap<InvoiceProduct, InvoiceProductResponseDTO>()
            .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product != null ? s.Product.Name : string.Empty));

        // SystemUser
        CreateMap<SystemUser, SystemUserResponseDTO>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));

        // Review
        CreateMap<Review, ReviewResponseDTO>()
            .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner != null ? $"{src.Owner.FirstName} {src.Owner.LastName}" : ""))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<ReviewRequestDTO, Review>();
    }


}
