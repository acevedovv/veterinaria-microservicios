import http from 'k6/http';
import { check, sleep } from 'k6';

const GATEWAY = 'http://localhost:8000';

// ── Setup: registrar y autenticar usuario de prueba
export function setup() {
    http.post(`${GATEWAY}/api/auth/register`, JSON.stringify({
        name: 'K6 Tester', email: 'k6@vet.com', password: 'k6pass123'
    }), { headers: { 'Content-Type': 'application/json' } });

    const res = http.post(`${GATEWAY}/api/auth/login`, JSON.stringify({
        email: 'k6@vet.com', password: 'k6pass123'
    }), { headers: { 'Content-Type': 'application/json' } });

    return { token: JSON.parse(res.body).token };
}

// ── Umbrales globales de éxito
export const options = {
    thresholds: {
        http_req_duration: ['p(95)<3000'],  // 95% de peticiones < 3s
        http_req_failed:   ['rate<0.1'],    // menos del 10% de errores
    },
};

// ── Función helper para headers
function headers(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

// ── Escenarios por microservicio
function testPacientes(token) {
    const crear = http.post(`${GATEWAY}/api/proxy/pacientes`, JSON.stringify({
        nombre: `Mascota-${__VU}-${__ITER}`,
        especie: 'perro',
        edad: 3,
        propietario: `Dueño-${__VU}`,
        telefono: '3001234567'
    }), { headers: headers(token), tags: { ms: 'pacientes' } });

    check(crear, {
        '[Pacientes] crear → 201': r => r.status === 201,
        '[Pacientes] tiempo < 2s': r => r.timings.duration < 2000,
    });

    const listar = http.get(`${GATEWAY}/api/proxy/pacientes`,
        { headers: headers(token), tags: { ms: 'pacientes' } });

    check(listar, {
        '[Pacientes] listar → 200': r => r.status === 200,
    });
}

function testCitas(token) {
    const crear = http.post(`${GATEWAY}/api/proxy/citas`, JSON.stringify({
        paciente_id: 1,
        veterinario: 'Dr. López',
        fecha: '2026-08-10T09:00:00Z',
        motivo: 'Vacunación anual'
    }), { headers: headers(token), tags: { ms: 'citas' } });

    check(crear, {
        '[Citas] crear → 201': r => r.status === 201,
        '[Citas] tiempo < 2s': r => r.timings.duration < 2000,
    });

    const listar = http.get(`${GATEWAY}/api/proxy/citas`,
        { headers: headers(token), tags: { ms: 'citas' } });

    check(listar, { '[Citas] listar → 200': r => r.status === 200 });
}

function testTratamientos(token) {
    const crear = http.post(`${GATEWAY}/api/proxy/tratamientos`, JSON.stringify({
        paciente_id: 1,
        descripcion: 'Antibiótico oral para infección respiratoria',
        medicamento: 'Amoxicilina',
        dosis: '250mg',
        duracion: '7 días'
    }), { headers: headers(token), tags: { ms: 'tratamientos' } });

    check(crear, {
        '[Tratamientos] crear → 201': r => r.status === 201,
        '[Tratamientos] tiempo < 2s': r => r.timings.duration < 2000,
    });

    const listar = http.get(`${GATEWAY}/api/proxy/tratamientos`,
        { headers: headers(token), tags: { ms: 'tratamientos' } });

    check(listar, { '[Tratamientos] listar → 200': r => r.status === 200 });
}

function testInventario(token) {
    const crear = http.post(`${GATEWAY}/api/proxy/inventario`, JSON.stringify({
        nombre: `Producto-${__VU}-${__ITER}`,
        categoria: 'medicamento',
        cantidad: 50,
        precio: 15000
    }), { headers: headers(token), tags: { ms: 'inventario' } });

    check(crear, {
        '[Inventario] crear → 201': r => r.status === 201,
        '[Inventario] tiempo < 2s': r => r.timings.duration < 2000,
    });

    const listar = http.get(`${GATEWAY}/api/proxy/inventario`,
        { headers: headers(token), tags: { ms: 'inventario' } });

    check(listar, { '[Inventario] listar → 200': r => r.status === 200 });
}

function testFacturacion(token) {
    const crear = http.post(`${GATEWAY}/api/proxy/facturacion`, JSON.stringify({
        paciente_id: 1,
        cita_id: 1,
        items: [{ descripcion: 'Consulta', cantidad: 1, precio: 50000 }],
        total: 50000
    }), { headers: headers(token), tags: { ms: 'facturacion' } });

    check(crear, {
        '[Facturación] crear → 201': r => r.status === 201,
        '[Facturación] tiempo < 4s': r => r.timings.duration < 4000,
    });

    const listar = http.get(`${GATEWAY}/api/proxy/facturacion`,
        { headers: headers(token), tags: { ms: 'facturacion' } });

    check(listar, { '[Facturación] listar → 200': r => r.status === 200 });
}

// ── Función principal
export default function (data) {
    testPacientes(data.token);
    sleep(0.5);
    testCitas(data.token);
    sleep(0.5);
    testTratamientos(data.token);
    sleep(0.5);
    testInventario(data.token);
    sleep(0.5);
    testFacturacion(data.token);
    sleep(1);
}