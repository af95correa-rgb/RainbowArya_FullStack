using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using RainbowArya.API.DTOs.Request;
using RainbowArya.API.DTOs.Response;
using RainbowArya.Domain.Entities;
using RainbowArya.Domain.Enums;
using RainbowArya.Domain.Interfaces.Repositories;
using RainbowArya.Domain.Interfaces.Services;

namespace RainbowArya.API.Controllers;

// ════════════════════════════════════════════════
// OWNER CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class OwnerController : ControllerBase
{
    private readonly IOwnerService _service;
    private readonly IMapper _mapper;
    public OwnerController(IOwnerService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OwnerResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<OwnerResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<OwnerResponseDTO>> GetById(int id)
    {
        var owner = await _service.GetByIdAsync(id);
        if (owner == null) return NotFound(new { message = $"Propietario con ID {id} no encontrado." });
        return Ok(_mapper.Map<OwnerResponseDTO>(owner));
    }

    [HttpGet("{id}/pets")]
    public async Task<ActionResult<OwnerResponseDTO>> GetWithPets(int id)
    {
        var owner = await _service.GetWithPetsAsync(id);
        if (owner == null) return NotFound(new { message = $"Propietario con ID {id} no encontrado." });
        return Ok(_mapper.Map<OwnerResponseDTO>(owner));
    }

    [HttpPost]
    public async Task<ActionResult<OwnerResponseDTO>> Create(OwnerRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<Owner>(dto));
            var response = _mapper.Map<OwnerResponseDTO>(created);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, OwnerRequestDTO dto)
    {
        try
        {
            await _service.UpdateAsync(id, _mapper.Map<Owner>(dto));
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    // 👇 OPCIONAL: Agrega un endpoint específico para activar/desactivar
    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult> ToggleActive(int id)
    {
        try
        {
            var owner = await _service.GetByIdAsync(id);
            if (owner == null) return NotFound(new { message = $"Propietario con ID {id} no encontrado." });

            owner.IsActive = !owner.IsActive;
            await _service.UpdateAsync(id, owner);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// PET CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class PetController : ControllerBase
{
    private readonly IPetService _service;
    private readonly IMapper _mapper;
    public PetController(IPetService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PetResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<PetResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<PetResponseDTO>> GetById(int id)
    {
        var pet = await _service.GetByIdAsync(id);
        if (pet == null) return NotFound(new { message = $"Mascota con ID {id} no encontrada." });
        return Ok(_mapper.Map<PetResponseDTO>(pet));
    }

    [HttpGet("by-owner/{ownerId}")]
    public async Task<ActionResult<IEnumerable<PetResponseDTO>>> GetByOwner(int ownerId)
    {
        try { return Ok(_mapper.Map<IEnumerable<PetResponseDTO>>(await _service.GetByOwnerAsync(ownerId))); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPost]
    public async Task<ActionResult<PetResponseDTO>> Create(PetRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<Pet>(dto));
            var full = await _service.GetByIdAsync(created.Id);
            var response = _mapper.Map<PetResponseDTO>(full);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, PetRequestDTO dto)
    {
        try { await _service.UpdateAsync(id, _mapper.Map<Pet>(dto)); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// VETERINARIAN CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class VeterinarianController : ControllerBase
{
    private readonly IVeterinarianService _service;
    private readonly IMapper _mapper;
    public VeterinarianController(IVeterinarianService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VeterinarianResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<VeterinarianResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<VeterinarianResponseDTO>> GetById(int id)
    {
        var vet = await _service.GetByIdAsync(id);
        if (vet == null) return NotFound(new { message = $"Veterinario con ID {id} no encontrado." });
        return Ok(_mapper.Map<VeterinarianResponseDTO>(vet));
    }

    [HttpPost]
    public async Task<ActionResult<VeterinarianResponseDTO>> Create(VeterinarianRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<Veterinarian>(dto));
            var response = _mapper.Map<VeterinarianResponseDTO>(created);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, VeterinarianRequestDTO dto)
    {
        try { await _service.UpdateAsync(id, _mapper.Map<Veterinarian>(dto)); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// APPOINTMENT CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _service;
    private readonly IMapper _mapper;
    public AppointmentController(IAppointmentService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<AppointmentResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<AppointmentResponseDTO>> GetById(int id)
    {
        var appt = await _service.GetByIdAsync(id);
        if (appt == null) return NotFound(new { message = $"Cita con ID {id} no encontrada." });
        return Ok(_mapper.Map<AppointmentResponseDTO>(appt));
    }

    [HttpGet("by-date")]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetByDate([FromQuery] DateTime date)
        => Ok(_mapper.Map<IEnumerable<AppointmentResponseDTO>>(await _service.GetByDateAsync(date)));

    [HttpGet("by-vet/{vetId}")]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetByVet(int vetId)
        => Ok(_mapper.Map<IEnumerable<AppointmentResponseDTO>>(await _service.GetByVetAsync(vetId)));

    [HttpGet("by-pet/{petId}")]
    public async Task<ActionResult<IEnumerable<AppointmentResponseDTO>>> GetByPet(int petId)
        => Ok(_mapper.Map<IEnumerable<AppointmentResponseDTO>>(await _service.GetByPetAsync(petId)));

    [HttpPost]
    public async Task<ActionResult<AppointmentResponseDTO>> Create(AppointmentRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<Appointment>(dto));
            var full = await _service.GetByIdAsync(created.Id);
            var response = _mapper.Map<AppointmentResponseDTO>(full);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, AppointmentRequestDTO dto)
    {
        try { await _service.UpdateAsync(id, _mapper.Map<Appointment>(dto)); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, UpdateAppointmentStatusDTO dto)
    {
        try { await _service.UpdateStatusAsync(id, dto.Status, dto.CancellationReason); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// MEDICAL RECORD CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class MedicalRecordController : ControllerBase
{
    private readonly IMedicalRecordService _service;
    private readonly IMapper _mapper;
    public MedicalRecordController(IMedicalRecordService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet("{id}")]
    public async Task<ActionResult<MedicalRecordResponseDTO>> GetById(int id)
    {
        var record = await _service.GetByIdAsync(id);
        if (record == null) return NotFound(new { message = $"Historia clínica con ID {id} no encontrada." });
        return Ok(_mapper.Map<MedicalRecordResponseDTO>(record));
    }

    [HttpGet("by-pet/{petId}")]
    public async Task<ActionResult<IEnumerable<MedicalRecordResponseDTO>>> GetByPet(int petId)
        => Ok(_mapper.Map<IEnumerable<MedicalRecordResponseDTO>>(await _service.GetByPetAsync(petId)));

    [HttpGet("by-appointment/{appointmentId}")]
    public async Task<ActionResult<MedicalRecordResponseDTO>> GetByAppointment(int appointmentId)
    {
        var record = await _service.GetByAppointmentAsync(appointmentId);
        if (record == null) return NotFound(new { message = "Esta cita no tiene historia clínica registrada." });
        return Ok(_mapper.Map<MedicalRecordResponseDTO>(record));
    }

    [HttpPost]
    public async Task<ActionResult<MedicalRecordResponseDTO>> Create(MedicalRecordRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<MedicalRecord>(dto));
            var full = await _service.GetByIdAsync(created.Id);
            var response = _mapper.Map<MedicalRecordResponseDTO>(full);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, MedicalRecordRequestDTO dto)
    {
        try { await _service.UpdateAsync(id, _mapper.Map<MedicalRecord>(dto)); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// PRODUCT CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _service;
    private readonly IMapper _mapper;
    public ProductController(IProductService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<ProductResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductResponseDTO>> GetById(int id)
    {
        var product = await _service.GetByIdAsync(id);
        if (product == null) return NotFound(new { message = $"Producto con ID {id} no encontrado." });
        return Ok(_mapper.Map<ProductResponseDTO>(product));
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ProductResponseDTO>>> GetLowStock()
        => Ok(_mapper.Map<IEnumerable<ProductResponseDTO>>(await _service.GetLowStockAsync()));

    [HttpPost]
    public async Task<ActionResult<ProductResponseDTO>> Create(ProductRequestDTO dto)
    {
        try
        {
            var created = await _service.CreateAsync(_mapper.Map<Product>(dto));
            var response = _mapper.Map<ProductResponseDTO>(created);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, ProductRequestDTO dto)
    {
        try { await _service.UpdateAsync(id, _mapper.Map<Product>(dto)); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/stock")]
    public async Task<ActionResult> UpdateStock(int id, UpdateStockDTO dto)
    {
        try { await _service.UpdateStockAsync(id, dto.Quantity); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// INVOICE CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _service;
    private readonly IMapper _mapper;
    private readonly IAppointmentRepository _appointmentRepo;
    public InvoiceController(IInvoiceService service, IMapper mapper, IAppointmentRepository appointmentRepo)
    { _service = service; _mapper = mapper; _appointmentRepo = appointmentRepo; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<InvoiceResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<InvoiceResponseDTO>> GetById(int id)
    {
        var invoice = await _service.GetByIdAsync(id);
        if (invoice == null) return NotFound(new { message = $"Factura con ID {id} no encontrada." });
        return Ok(_mapper.Map<InvoiceResponseDTO>(invoice));
    }

    [HttpGet("by-owner/{ownerId}")]
    public async Task<ActionResult<IEnumerable<InvoiceResponseDTO>>> GetByOwner(int ownerId)
        => Ok(_mapper.Map<IEnumerable<InvoiceResponseDTO>>(await _service.GetByOwnerAsync(ownerId)));

    [HttpPost]
    public async Task<ActionResult<InvoiceResponseDTO>> Create(InvoiceRequestDTO dto)
    {
        try
        {
            // Resolver OwnerId desde la cita si no viene explícito
            int resolvedOwnerId;
            if (dto.AppointmentId.HasValue && !dto.OwnerId.HasValue)
            {
                var appt = await _appointmentRepo.GetWithDetailsAsync(dto.AppointmentId.Value);
                if (appt == null)
                    return NotFound(new { message = $"Cita con ID {dto.AppointmentId} no encontrada." });
                resolvedOwnerId = appt.Pet.OwnerId;
            }
            else if (dto.OwnerId.HasValue)
            {
                resolvedOwnerId = dto.OwnerId.Value;
            }
            else
            {
                return BadRequest(new { message = "Debe proporcionar OwnerId o AppointmentId." });
            }

            var invoice = new Domain.Entities.Invoice
            {
                OwnerId = resolvedOwnerId,
                AppointmentId = dto.AppointmentId,
                PaymentMethod = dto.PaymentMethod,
                Notes = dto.Notes
            };
            var products = dto.Products.Select(p => (p.ProductId, p.Quantity)).ToList();
            var created = await _service.CreateAsync(invoice, products);
            var full = await _service.GetByIdAsync(created.Id);
            var response = _mapper.Map<InvoiceResponseDTO>(full);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, UpdateInvoiceStatusDTO dto)
    {
        try { await _service.UpdateStatusAsync(id, dto.Status, dto.AmountPaid); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try { await _service.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// SYSTEM USER CONTROLLER
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class SystemUserController : ControllerBase
{
    private readonly ISystemUserService _service;
    private readonly IMapper _mapper;
    public SystemUserController(ISystemUserService service, IMapper mapper) { _service = service; _mapper = mapper; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SystemUserResponseDTO>>> GetAll()
        => Ok(_mapper.Map<IEnumerable<SystemUserResponseDTO>>(await _service.GetAllAsync()));

    [HttpGet("{id}")]
    public async Task<ActionResult<SystemUserResponseDTO>> GetById(int id)
    {
        var user = await _service.GetByIdAsync(id);
        if (user == null) return NotFound(new { message = $"Usuario con ID {id} no encontrado." });
        return Ok(_mapper.Map<SystemUserResponseDTO>(user));
    }

    [HttpPost]
    public async Task<ActionResult<SystemUserResponseDTO>> Create(SystemUserRequestDTO dto)
    {
        try
        {
            var user = new Domain.Entities.SystemUser
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Document = dto.Document,
                Email = dto.Email,
                PasswordHash = dto.Password,
                Phone = dto.Phone,
                Role = dto.Role
            };
            var created = await _service.CreateAsync(user);
            var response = _mapper.Map<SystemUserResponseDTO>(created);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, SystemUserRequestDTO dto)
    {
        try
        {
            var user = new Domain.Entities.SystemUser
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone,
                Role = dto.Role
            };
            await _service.UpdateAsync(id, user);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPatch("{id}/toggle-active")]
    public async Task<ActionResult> ToggleActive(int id)
    {
        try { await _service.ToggleActiveAsync(id); return NoContent(); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
}

// ════════════════════════════════════════════════
// REVIEW CONTROLLER (Calificaciones)
// ════════════════════════════════════════════════
[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _service;
    private readonly IMapper _mapper;

    public ReviewController(IReviewService service, IMapper mapper)
    {
        _service = service;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetAll()
    {
        var reviews = await _service.GetAllAsync();
        return Ok(_mapper.Map<IEnumerable<ReviewResponseDTO>>(reviews));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReviewResponseDTO>> GetById(int id)
    {
        var review = await _service.GetByIdAsync(id);
        if (review == null)
            return NotFound(new { message = $"Calificación con ID {id} no encontrada." });
        return Ok(_mapper.Map<ReviewResponseDTO>(review));
    }

    [HttpGet("by-owner/{ownerId}")]
    public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetByOwner(int ownerId)
    {
        var reviews = await _service.GetByOwnerAsync(ownerId);
        return Ok(_mapper.Map<IEnumerable<ReviewResponseDTO>>(reviews));
    }

    [HttpGet("pending")]
    public async Task<ActionResult<IEnumerable<ReviewResponseDTO>>> GetPending()
    {
        var reviews = await _service.GetPendingAsync();
        return Ok(_mapper.Map<IEnumerable<ReviewResponseDTO>>(reviews));
    }

    [HttpPost]
    public async Task<ActionResult<ReviewResponseDTO>> Create(ReviewRequestDTO dto)
    {
        try
        {
            Console.WriteLine($"Recibido: OwnerId={dto.OwnerId}, Rating={dto.Rating}, Comment={dto.Comment}, VetName={dto.VeterinarianName}, PetName={dto.PetName}");

            var review = new Review
            {
                OwnerId = dto.OwnerId,
                AppointmentId = dto.AppointmentId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                VeterinarianName = dto.VeterinarianName,
                PetName = dto.PetName,
                CreatedAt = DateTime.UtcNow,
                Status = ReviewStatus.Pending,
                IsActive = true
            };

            var created = await _service.CreateAsync(review);
            var response = _mapper.Map<ReviewResponseDTO>(created);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            Console.WriteLine($"StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = ex.Message, details = ex.InnerException?.Message });
        }
    }

    // 👇 AGREGAR ESTE MÉTODO DELETE
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            Console.WriteLine($"Eliminando review con ID: {id}");
            await _service.DeleteAsync(id);
            Console.WriteLine($"Review {id} eliminada correctamente");
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            Console.WriteLine($"Review no encontrada: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error eliminando review: {ex.Message}");
            return StatusCode(500, new { message = ex.Message });
        }
    }
}