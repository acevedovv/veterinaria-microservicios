Sistema de Gestión Veterinaria — Microservicios

Sistema basado en arquitectura de microservicios para gestión veterinaria, desarrollado con Laravel, Django, Flask y Express.

---

## Arquitectura del sistema

El sistema está compuesto por un API Gateway y 5 microservicios que se comunican mediante APIs REST. Todas las peticiones externas pasan obligatoriamente por el API Gateway, que se encarga de autenticar al usuario mediante JWT antes de redirigir la petición al microservicio correspondiente.

- API Gateway — Puerto 8000 — Laravel — MySQL
- MS Pacientes — Puerto 8001 — Laravel — MySQL
- MS Citas — Puerto 8002 — Django — PostgreSQL
- MS Tratamientos — Puerto 8003 — Flask — PostgreSQL
- MS Inventario — Puerto 8004 — Express — Firebase
- MS Facturación — Puerto 8005 — Flask — Firebase

---

## Endpoints documentados

### API Gateway (Puerto 8000)

- POST /api/auth/register — Registrar usuario (sin auth)
- POST /api/auth/login — Iniciar sesión (sin auth)
- POST /api/auth/logout — Cerrar sesión (requiere token)
- POST /api/auth/recover — Recuperar contraseña (sin auth)
- ANY /api/proxy/{servicio}/{id?} — Proxy a microservicios (requiere token)

### MS Pacientes — Laravel (Puerto 8001)

- GET /api/pacientes — Listar pacientes
- POST /api/pacientes — Crear paciente
- GET /api/pacientes/{id} — Ver paciente
- PUT /api/pacientes/{id} — Actualizar paciente
- DELETE /api/pacientes/{id} — Eliminar paciente

Campos: nombre, especie, raza (opcional), edad, propietario, telefono, observaciones (opcional)

### MS Citas — Django (Puerto 8002)

- GET /api/citas/ — Listar citas
- POST /api/citas/ — Crear cita
- GET /api/citas/{id}/ — Ver cita
- PATCH /api/citas/{id}/ — Actualizar estado
- DELETE /api/citas/{id}/ — Eliminar cita

Campos: paciente_id, veterinario, fecha, motivo, estado (pendiente/completada/cancelada)

### MS Tratamientos — Flask (Puerto 8003)

- GET /api/tratamientos — Listar tratamientos
- POST /api/tratamientos — Crear tratamiento
- GET /api/tratamientos/{id} — Ver tratamiento
- PUT /api/tratamientos/{id} — Actualizar tratamiento
- DELETE /api/tratamientos/{id} — Eliminar tratamiento

Campos: paciente_id, cita_id (opcional), descripcion, medicamento, dosis, duracion

### MS Inventario — Express (Puerto 8004)

- GET /api/inventario — Listar productos
- POST /api/inventario — Agregar producto
- GET /api/inventario/{id} — Ver producto
- PUT /api/inventario/{id} — Actualizar producto
- DELETE /api/inventario/{id} — Eliminar producto

Campos: nombre, categoria (medicamento/insumo/alimento), cantidad, precio, proveedor, vencimiento

### MS Facturación — Flask (Puerto 8005)

- GET /api/facturacion — Listar facturas
- POST /api/facturacion — Crear factura
- GET /api/facturacion/{id} — Ver factura
- DELETE /api/facturacion/{id} — Eliminar factura

Campos: paciente_id, cita_id, items[] (descripcion, cantidad, precio), total, estado (pendiente/pagada/anulada)

---

## Despliegue con Docker

### Requisitos previos

- Docker Desktop instalado y corriendo
- Git
- Cuenta en Firebase con Firestore activo

### Archivos necesarios antes de levantar

Estos archivos no se suben al repositorio por seguridad y deben crearse manualmente.

**api-gateway/.env**

APP_NAME=ApiGateway
APP_ENV=production
APP_KEY=base64:TU_CLAVE_AQUI
APP_DEBUG=false
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vet_gateway
DB_USERNAME=root
DB_PASSWORD=secret
JWT_SECRET=veterinaria_super_secreto_2024

**ms-pacientes/.env**

APP_NAME=MsPacientes
APP_ENV=production
APP_KEY=base64:TU_CLAVE_AQUI
APP_DEBUG=false
APP_URL=http://localhost:8001
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vet_pacientes
DB_USERNAME=root
DB_PASSWORD=secret

Para generar las APP_KEY ejecuta:

```bash
echo "base64:$(openssl rand -base64 32)"
```

Tambien se deben agregar los archivos ms-inventario/serviceAccountKey.json y ms-facturacion/serviceAccountKey.json descargados desde Firebase Console en Configuracion del proyecto, Cuentas de servicio, Generar nueva clave privada.

### Pasos para levantar el sistema

**1. Clonar el repositorio**

```bash
git clone https://github.com/acevedovv/veterinaria-microservicios.git
cd veterinaria-microservicios
```

**2. Crear los archivos .env y serviceAccountKey.json** segun la seccion anterior.

**3. Construir las imagenes**

```bash
docker compose build
```

**4. Levantar los contenedores**

```bash
docker compose up -d
```

**5. Verificar que todos esten corriendo**

```bash
docker compose ps
```

**6. Ejecutar migraciones**

```bash
docker compose exec api-gateway php artisan migrate --force
docker compose exec ms-pacientes php artisan migrate --force
docker compose exec ms-citas python manage.py migrate
docker compose exec ms-tratamientos python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

**7. Registrar un usuario**

```bash
curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Dr. Admin","email":"admin@vet.com","password":"admin123"}'
```

---

## Probar todos los servicios

**Obtener token**

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@vet.com","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

**MS Pacientes**

```bash
curl -s -X POST http://localhost:8000/api/proxy/pacientes \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre":"Firulais","especie":"perro","raza":"Labrador","edad":3,"propietario":"Carlos","telefono":"3001234567"}'

curl -s http://localhost:8000/api/proxy/pacientes \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**MS Citas**

```bash
curl -s -X POST http://localhost:8000/api/proxy/citas \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"paciente_id":1,"veterinario":"Dr. Lopez","fecha":"2026-06-10T10:00:00Z","motivo":"Vacunacion"}'

curl -s http://localhost:8000/api/proxy/citas \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**MS Tratamientos**

```bash
curl -s -X POST http://localhost:8000/api/proxy/tratamientos \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"paciente_id":1,"descripcion":"Antibiotico oral para infeccion","medicamento":"Amoxicilina","dosis":"250mg","duracion":"7 dias"}'

curl -s http://localhost:8000/api/proxy/tratamientos \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**MS Inventario**

```bash
curl -s -X POST http://localhost:8000/api/proxy/inventario \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"nombre":"Amoxicilina 250mg","categoria":"medicamento","cantidad":50,"precio":15000}'

curl -s http://localhost:8000/api/proxy/inventario \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**MS Facturacion**

```bash
curl -s -X POST http://localhost:8000/api/proxy/facturacion \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"paciente_id":1,"cita_id":1,"items":[{"descripcion":"Consulta","cantidad":1,"precio":50000}],"total":50000}'

curl -s http://localhost:8000/api/proxy/facturacion \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Detener el sistema

```bash
docker compose down

docker compose down -v

docker compose logs ms-pacientes
```

---

## Pruebas unitarias

```bash
cd api-gateway && php artisan test
cd ms-pacientes && php artisan test
cd ms-citas && python manage.py test
cd ms-tratamientos && pytest -v
cd ms-inventario && npm test
cd ms-facturacion && pytest -v
```

---

## Pruebas de rendimiento

Instala k6 desde https://k6.io/docs/getting-started/installation

```bash
k6 run Rendimiento/capacidad.js
k6 run Rendimiento/carga.js
k6 run Rendimiento/estres.js
```
README
