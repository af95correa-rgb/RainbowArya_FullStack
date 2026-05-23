# 🐾 Rainbow Arya — Sistema de Gestión Veterinaria

Sistema web full-stack para la gestión integral de una clínica veterinaria.

## 👥 Integrantes del Grupo
- [Nombre Integrante 1]
- [Nombre Integrante 2]
- [Nombre Integrante 3]

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | .NET 8 Web API |
| ORM | Entity Framework Core 8 (Code-First) |
| Base de datos | SQL Server |
| Mapeo | AutoMapper |
| Documentación | Swagger / OpenAPI |
| Frontend | HTML5 + CSS3 + JavaScript (Vanilla) |

---

## 📁 Estructura del Proyecto

```
RainbowArya/
├── RainbowArya.sln
├── RainbowArya.API/              ← Presentación
│   ├── Controllers/
│   ├── DTOs/
│   │   ├── Request/
│   │   └── Response/
│   ├── Mappings/
│   ├── Middlewares/
│   ├── Program.cs
│   └── appsettings.json
├── RainbowArya.Domain/           ← Negocio
│   ├── Entities/
│   ├── Enums/
│   ├── Interfaces/
│   │   ├── Repositories/
│   │   └── Services/
│   └── Services/
├── RainbowArya.DataAccess/       ← Datos
│   ├── Context/
│   ├── Repositories/
│   └── Seeders/
└── Frontend/                     ← Interfaz Web
    ├── index.html
    ├── Login.html
    ├── Agendar.html
    ├── Consultar.html
    ├── Historia_clinica.html
    ├── Inventario.html
    ├── Facturar.html
    ├── Propietario.html
    ├── Admin.html
    └── ...
```

---

## ⚙️ Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server (Express, Developer o LocalDB)
- Visual Studio 2022 o VS Code
- Navegador moderno (Chrome, Edge, Firefox)

---

## 🚀 Configuración y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/[usuario]/rainbow-arya.git
cd rainbow-arya
```

### 2. Configurar cadena de conexión

Editar `RainbowArya.API/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=RainbowAryaDb;Trusted_Connection=true;TrustServerCertificate=true;"
}
```

Si usas usuario y contraseña SQL:
```
Server=localhost;Database=RainbowAryaDb;User Id=sa;Password=TuPassword;TrustServerCertificate=true;
```

### 3. Restaurar paquetes

```bash
dotnet restore
```

### 4. Crear y aplicar migraciones

```bash
dotnet ef migrations add InitialCreate --project RainbowArya.DataAccess --startup-project RainbowArya.API
dotnet ef database update --project RainbowArya.DataAccess --startup-project RainbowArya.API
```

> **Nota:** Al iniciar la aplicación por primera vez, el DataSeeder crea automáticamente datos de prueba: 3 veterinarios, 5 propietarios, 7 mascotas, 5 citas, 2 historias clínicas, 8 productos y 4 usuarios del sistema. No se requiere insertar datos manualmente.

### 5. Ejecutar el backend

```bash
cd RainbowArya.API
dotnet run
```

Swagger disponible en: `http://localhost:5000/swagger`

### 6. Abrir el frontend

Abrir `Frontend/Login.html` directamente en el navegador o servir con Live Server (VS Code).

> **Importante:** El frontend se conecta al backend en `http://localhost:5000`. Si tu API corre en otro puerto, actualizar la constante `API_BASE_URL` en `Frontend/Script.js`.

---

## 📋 Entidades del Sistema

| Entidad | Descripción |
|---------|-------------|
| `Owner` | Propietarios de mascotas |
| `Pet` | Mascotas registradas |
| `Veterinarian` | Médicos veterinarios |
| `Appointment` | Citas médicas |
| `MedicalRecord` | Historias clínicas |
| `Product` | Inventario de productos y medicamentos |
| `Invoice` | Facturas de servicios |
| `InvoiceProduct` | Tabla N:M entre factura y productos |
| `SystemUser` | Usuarios del sistema administrativo |

---

## 🔗 Endpoints Disponibles

### 🏠 Propietarios — `/api/Owner`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Owner` | Listar propietarios |
| GET | `/api/Owner/{id}` | Obtener propietario |
| GET | `/api/Owner/{id}/pets` | Propietario con mascotas |
| POST | `/api/Owner` | Registrar propietario |
| PUT | `/api/Owner/{id}` | Actualizar propietario |
| DELETE | `/api/Owner/{id}` | Desactivar propietario |

### 🐶 Mascotas — `/api/Pet`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Pet` | Listar mascotas |
| GET | `/api/Pet/{id}` | Obtener mascota |
| GET | `/api/Pet/by-owner/{ownerId}` | Mascotas de un propietario |
| POST | `/api/Pet` | Registrar mascota |
| PUT | `/api/Pet/{id}` | Actualizar mascota |
| DELETE | `/api/Pet/{id}` | Desactivar mascota |

### 👨‍⚕️ Veterinarios — `/api/Veterinarian`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Veterinarian` | Listar veterinarios |
| GET | `/api/Veterinarian/{id}` | Obtener veterinario |
| POST | `/api/Veterinarian` | Registrar veterinario |
| PUT | `/api/Veterinarian/{id}` | Actualizar veterinario |
| DELETE | `/api/Veterinarian/{id}` | Desactivar veterinario |

### 📅 Citas — `/api/Appointment`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Appointment` | Listar todas las citas |
| GET | `/api/Appointment/{id}` | Obtener cita |
| GET | `/api/Appointment/by-date?date=` | Citas por fecha |
| GET | `/api/Appointment/by-vet/{vetId}` | Citas por veterinario |
| GET | `/api/Appointment/by-pet/{petId}` | Citas por mascota |
| POST | `/api/Appointment` | Agendar cita |
| PUT | `/api/Appointment/{id}` | Reagendar cita |
| PATCH | `/api/Appointment/{id}/status` | Cambiar estado de cita |
| DELETE | `/api/Appointment/{id}` | Eliminar cita |

Estados de cita: `0=Scheduled`, `1=InProgress`, `2=Completed`, `3=Cancelled`

Transiciones válidas:
- `Scheduled → InProgress`
- `InProgress → Completed`
- `Scheduled → Cancelled` (requiere motivo)
- `InProgress → Cancelled` (requiere motivo)

### 📋 Historias Clínicas — `/api/MedicalRecord`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/MedicalRecord/{id}` | Obtener historia clínica |
| GET | `/api/MedicalRecord/by-pet/{petId}` | Historial de una mascota |
| GET | `/api/MedicalRecord/by-appointment/{id}` | Historia de una cita |
| POST | `/api/MedicalRecord` | Registrar historia clínica |
| PUT | `/api/MedicalRecord/{id}` | Actualizar historia clínica |
| DELETE | `/api/MedicalRecord/{id}` | Desactivar historia clínica |

### 💊 Inventario — `/api/Product`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Product` | Listar productos |
| GET | `/api/Product/{id}` | Obtener producto |
| GET | `/api/Product/low-stock` | Productos con stock bajo |
| POST | `/api/Product` | Crear producto |
| PUT | `/api/Product/{id}` | Actualizar producto |
| PATCH | `/api/Product/{id}/stock` | Ajustar stock |
| DELETE | `/api/Product/{id}` | Desactivar producto |

### 🧾 Facturas — `/api/Invoice`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/Invoice` | Listar facturas |
| GET | `/api/Invoice/{id}` | Obtener factura con detalle |
| GET | `/api/Invoice/by-owner/{ownerId}` | Facturas de un propietario |
| POST | `/api/Invoice` | Crear factura |
| PATCH | `/api/Invoice/{id}/status` | Registrar pago / cancelar |
| DELETE | `/api/Invoice/{id}` | Desactivar factura |

### 👤 Usuarios del Sistema — `/api/SystemUser`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/SystemUser` | Listar usuarios |
| GET | `/api/SystemUser/{id}` | Obtener usuario |
| POST | `/api/SystemUser` | Crear usuario |
| PUT | `/api/SystemUser/{id}` | Actualizar usuario |
| PATCH | `/api/SystemUser/{id}/toggle-active` | Activar / desactivar usuario |

---

## 📦 Datos de Prueba (Swagger)

### Registrar propietario
```json
POST /api/Owner
{
  "firstName": "María",
  "lastName": "López",
  "document": "1020999888",
  "email": "maria.lopez@email.com",
  "phone": "3101234567",
  "address": "Calle 10 #40-20, Medellín"
}
```

### Registrar mascota
```json
POST /api/Pet
{
  "name": "Toby",
  "species": 0,
  "breed": "Poodle",
  "birthDate": "2022-05-10",
  "weight": 6.5,
  "ownerId": 1
}
```
Especies: `0=Dog`, `1=Cat`, `2=Bird`, `3=SmallMammal`, `4=Other`

### Agendar cita
```json
POST /api/Appointment
{
  "petId": 1,
  "veterinarianId": 1,
  "appointmentDate": "2026-06-10T10:00:00",
  "type": 0,
  "notes": "Revisión anual"
}
```
Tipos: `0=GeneralConsult`, `1=Vaccination`, `2=Surgery`, `3=Emergency`, `4=Hospitalization`, `5=Deworming`, `6=Control`

### Cambiar estado de cita
```json
PATCH /api/Appointment/1/status
{
  "status": 1
}
```

### Cancelar cita
```json
PATCH /api/Appointment/1/status
{
  "status": 3,
  "cancellationReason": "Propietario no pudo asistir"
}
```

### Registrar historia clínica
```json
POST /api/MedicalRecord
{
  "appointmentId": 1,
  "reasonForVisit": "Revisión general anual",
  "physicalExam": "Paciente alerta, buen estado general",
  "weight": 28.5,
  "temperature": 38.6,
  "heartRate": 80,
  "diagnosis": "Paciente sano",
  "treatment": "Ninguno requerido",
  "prescriptions": "Vitaminas 1 tableta/día",
  "nextVisitDate": "2026-12-01"
}
```

### Crear factura
```json
POST /api/Invoice
{
  "ownerId": 1,
  "appointmentId": 1,
  "paymentMethod": 0,
  "notes": "Consulta + medicamentos",
  "products": [
    { "productId": 1, "quantity": 1 },
    { "productId": 2, "quantity": 2 }
  ]
}
```
Métodos de pago: `0=Cash`, `1=Card`, `2=Transfer`

### Registrar pago de factura
```json
PATCH /api/Invoice/1/status
{
  "status": 1,
  "amountPaid": 85000
}
```

---

## ✅ Reglas de Negocio

### Propietarios y Mascotas
- Documento y email únicos por propietario
- Mascota debe tener propietario existente
- Eliminación lógica (IsActive = false)

### Citas
- Solo se agendan citas con fecha futura
- Un veterinario no puede tener dos citas en el mismo horario (ventana de 30 min)
- Máquina de estados: `Scheduled → InProgress → Completed`
- La cancelación requiere motivo obligatorio
- No se pueden editar citas que no estén en estado `Scheduled`

### Historias Clínicas
- Solo se registran en citas `InProgress` o `Completed`
- Una cita solo puede tener una historia clínica (relación 1:1)

### Inventario
- Precio siempre mayor a 0
- Stock no puede quedar negativo al facturar
- Alerta automática cuando stock ≤ stock mínimo

### Facturas (N:M con Productos)
- Deben tener al menos un producto
- Al crear, descuenta stock automáticamente
- No se puede eliminar una factura pagada
- IVA del 19% calculado automáticamente

### Veterinarios
- Matrícula profesional única en el sistema

---

## 🗄️ Relaciones de la Base de Datos

| Tipo | Relación |
|------|---------|
| 1:N | Owner → Pets |
| 1:N | Owner → Invoices |
| 1:N | Pet → Appointments |
| 1:N | Pet → MedicalRecords |
| 1:N | Veterinarian → Appointments |
| 1:N | Veterinarian → MedicalRecords |
| 1:1 | Appointment → MedicalRecord |
| **N:M** | **Invoice ↔ Product** (tabla InvoiceProduct) |
