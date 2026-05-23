# 🐾 Rainbow Arya — Sistema de Gestión Veterinaria

Sistema web full-stack para la gestión integral de una clínica veterinaria.

---

## 👥 Integrantes del Grupo

- [Nombre Integrante 1]
- [Nombre Integrante 2]
- [Nombre Integrante 3]

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
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
├── RainbowArya.API/                  ← Backend API
│   ├── Controllers/
│   ├── DTOs/
│   │   ├── Request/
│   │   └── Response/
│   ├── Mappings/
│   ├── Middlewares/
│   ├── Program.cs
│   ├── appsettings.json
│   └── wwwroot/                      ← Frontend (archivos estáticos)
│       ├── assets/                   ← Imágenes y recursos
│       │   └── RAINBOW_ARYA_LOGO.png
│       ├── CSS/                      ← Estilos globales
│       │   ├── styles.css
│       │   ├── admin.css
│       │   ├── agendar.css
│       │   ├── calificaciones.css
│       │   ├── facturar.css
│       │   ├── historia_clinica.css
│       │   ├── inventario.css
│       │   └── propietario.css
│       ├── JS/                       ← Scripts
│       │   ├── api.js
│       │   ├── admin.js
│       │   ├── agendar.js
│       │   ├── calificaciones.js
│       │   ├── facturar.js
│       │   ├── historia_clinica.js
│       │   ├── index.js
│       │   ├── inventario.js
│       │   ├── login.js
│       │   └── propietario.js
│       ├── NAV/                      ← Módulos del sistema
│       │   ├── admin.html
│       │   ├── agendar.html
│       │   ├── calificaciones.html
│       │   ├── facturar.html
│       │   ├── historia_clinica.html
│       │   ├── inventario.html
│       │   └── propietario.html
│       ├── index.html                ← Dashboard principal
│       └── login.html                ← Pantalla de acceso
├── RainbowArya.Domain/               ← Capa de negocio
│   ├── Entities/
│   ├── Enums/
│   ├── Interfaces/
│   │   ├── Repositories/
│   │   └── Services/
│   └── Services/
└── RainbowArya.DataAccess/           ← Capa de datos
    ├── Context/
    ├── Repositories/
    └── Seeders/
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

### 3. Restaurar paquetes

```bash
dotnet restore
```

### 4. Crear y aplicar migraciones

```bash
dotnet ef migrations add InitialCreate --project RainbowArya.DataAccess --startup-project RainbowArya.API
dotnet ef database update --project RainbowArya.DataAccess --startup-project RainbowArya.API
```

> **Nota:** Al iniciar la aplicación por primera vez, el `DataSeeder` crea automáticamente datos de prueba.

### 5. Ejecutar el backend

```bash
cd RainbowArya.API
dotnet run
```

Swagger disponible en: `https://localhost:60665/swagger`

### 6. Acceder al frontend

Abrir en el navegador: `https://localhost:60665/index.html`

---

## 🔐 Credenciales de Acceso

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | admin@rainbowarya.com | Admin123! |
| Veterinario | diana.ospina@rainbowarya.com | Vet123! |
| Recepcionista | sofia.restrepo@rainbowarya.com | Rec123! |
| Auxiliar | juan.mesa@rainbowarya.com | Aux123! |

> **Importante:** El frontend está configurado para conectarse al backend en `https://localhost:60665`. Si tu API corre en otro puerto, actualizar la constante `API_BASE` en `wwwroot/JS/api.js`.

---

## 📋 Entidades del Sistema

| Entidad | Descripción |
|---|---|
| `Owner` | Propietarios de mascotas |
| `Pet` | Mascotas registradas |
| `Veterinarian` | Médicos veterinarios |
| `Appointment` | Citas médicas |
| `MedicalRecord` | Historias clínicas |
| `Product` | Inventario de productos y medicamentos |
| `Invoice` | Facturas de servicios |
| `InvoiceProduct` | Tabla N:M entre factura y productos |
| `SystemUser` | Usuarios del sistema administrativo |
| `Review` | Calificaciones de servicios |

---

## 🔗 Endpoints Disponibles

### 🏠 Propietarios — `/api/Owner`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Owner` | Listar propietarios |
| `GET` | `/api/Owner/{id}` | Obtener propietario |
| `GET` | `/api/Owner/{id}/pets` | Propietario con mascotas |
| `POST` | `/api/Owner` | Registrar propietario |
| `PUT` | `/api/Owner/{id}` | Actualizar propietario |
| `DELETE` | `/api/Owner/{id}` | Desactivar propietario |

### 🐶 Mascotas — `/api/Pet`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Pet` | Listar mascotas |
| `GET` | `/api/Pet/{id}` | Obtener mascota |
| `GET` | `/api/Pet/by-owner/{ownerId}` | Mascotas de un propietario |
| `POST` | `/api/Pet` | Registrar mascota |
| `PUT` | `/api/Pet/{id}` | Actualizar mascota |
| `DELETE` | `/api/Pet/{id}` | Desactivar mascota |

### 👨‍⚕️ Veterinarios — `/api/Veterinarian`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Veterinarian` | Listar veterinarios |
| `GET` | `/api/Veterinarian/{id}` | Obtener veterinario |
| `POST` | `/api/Veterinarian` | Registrar veterinario |
| `PUT` | `/api/Veterinarian/{id}` | Actualizar veterinario |
| `DELETE` | `/api/Veterinarian/{id}` | Desactivar veterinario |

### 📅 Citas — `/api/Appointment`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Appointment` | Listar todas las citas |
| `GET` | `/api/Appointment/{id}` | Obtener cita |
| `GET` | `/api/Appointment/by-date?date=` | Citas por fecha |
| `GET` | `/api/Appointment/by-vet/{vetId}` | Citas por veterinario |
| `GET` | `/api/Appointment/by-pet/{petId}` | Citas por mascota |
| `POST` | `/api/Appointment` | Agendar cita |
| `PUT` | `/api/Appointment/{id}` | Reagendar cita |
| `PATCH` | `/api/Appointment/{id}/status` | Cambiar estado de cita |
| `DELETE` | `/api/Appointment/{id}` | Eliminar cita |

### 📋 Historias Clínicas — `/api/MedicalRecord`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/MedicalRecord/{id}` | Obtener historia clínica |
| `GET` | `/api/MedicalRecord/by-pet/{petId}` | Historial de una mascota |
| `GET` | `/api/MedicalRecord/by-appointment/{id}` | Historia de una cita |
| `POST` | `/api/MedicalRecord` | Registrar historia clínica |
| `PUT` | `/api/MedicalRecord/{id}` | Actualizar historia clínica |
| `DELETE` | `/api/MedicalRecord/{id}` | Desactivar historia clínica |

### 💊 Inventario — `/api/Product`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Product` | Listar productos |
| `GET` | `/api/Product/{id}` | Obtener producto |
| `GET` | `/api/Product/low-stock` | Productos con stock bajo |
| `POST` | `/api/Product` | Crear producto |
| `PUT` | `/api/Product/{id}` | Actualizar producto |
| `PATCH` | `/api/Product/{id}/stock` | Ajustar stock |
| `DELETE` | `/api/Product/{id}` | Desactivar producto |

### 🧾 Facturas — `/api/Invoice`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Invoice` | Listar facturas |
| `GET` | `/api/Invoice/{id}` | Obtener factura con detalle |
| `GET` | `/api/Invoice/by-owner/{ownerId}` | Facturas de un propietario |
| `POST` | `/api/Invoice` | Crear factura |
| `PATCH` | `/api/Invoice/{id}/status` | Registrar pago / cancelar |
| `DELETE` | `/api/Invoice/{id}` | Desactivar factura |

### 👤 Usuarios del Sistema — `/api/SystemUser`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/SystemUser` | Listar usuarios |
| `GET` | `/api/SystemUser/{id}` | Obtener usuario |
| `POST` | `/api/SystemUser` | Crear usuario |
| `PUT` | `/api/SystemUser/{id}` | Actualizar usuario |
| `PATCH` | `/api/SystemUser/{id}/toggle-active` | Activar / desactivar usuario |

### ⭐ Calificaciones — `/api/Review`

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/Review` | Listar calificaciones |
| `GET` | `/api/Review/{id}` | Obtener calificación |
| `GET` | `/api/Review/by-owner/{ownerId}` | Calificaciones de un propietario |
| `GET` | `/api/Review/pending` | Calificaciones pendientes |
| `POST` | `/api/Review` | Crear calificación |
| `PATCH` | `/api/Review/{id}/status` | Aprobar/rechazar calificación |
| `DELETE` | `/api/Review/{id}` | Eliminar calificación |

---

## ✅ Reglas de Negocio

### Propietarios y Mascotas

- Documento y email únicos por propietario
- La mascota debe tener un propietario existente
- Eliminación lógica (`IsActive = false`)

### Citas

- Solo se agendan citas con fecha futura
- Un veterinario no puede tener dos citas en el mismo horario
- La cancelación requiere motivo obligatorio

### Historias Clínicas

- Solo se registran en citas con estado `InProgress` o `Completed`
- Una cita solo puede tener una historia clínica

### Inventario

- El precio siempre debe ser mayor a 0
- El stock no puede quedar negativo al facturar
- Alerta automática cuando el stock ≤ stock mínimo

### Facturas

- Deben tener al menos un producto
- Al crear, descuenta stock automáticamente
- IVA del 19% calculado automáticamente

---

## 🖥️ Módulos del Frontend

| Módulo | Archivo | Descripción |
|---|---|---|
| Dashboard | `index.html` | Panel principal con resúmenes y acceso a módulos |
| Registro Cliente | `NAV/propietario.html` | Registro de propietarios y mascotas |
| Agendar Citas | `NAV/agendar.html` | Programación de citas |
| Historia Clínica | `NAV/historia_clinica.html` | Gestión de historiales médicos |
| Facturación | `NAV/facturar.html` | Creación y gestión de facturas |
| Inventario | `NAV/inventario.html` | Control de stock de productos |
| Calificaciones | `NAV/calificaciones.html` | Evaluación de servicios |
| Administración | `NAV/admin.html` | Gestión de usuarios y catálogos |

---

## 📝 Licencia

Proyecto desarrollado para la **Veterinaria Rainbow ARYA**.
