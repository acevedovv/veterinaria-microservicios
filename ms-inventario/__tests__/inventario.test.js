const request = require('supertest');

// Mock de Firebase ANTES de importar app
jest.mock('firebase-admin', () => {
    const productos = new Map();
    let counter = 1;

    const docMock = (id) => ({
        id,
        exists: productos.has(id),
        data: () => productos.get(id),
        get: jest.fn(async function () {
            return { id, exists: productos.has(id), data: () => productos.get(id) };
        }),
        set: jest.fn(async (data) => { productos.set(id, data); }),
        update: jest.fn(async (data) => {
            productos.set(id, { ...productos.get(id), ...data });
        }),
        delete: jest.fn(async () => { productos.delete(id); }),
    });

    const collectionMock = {
        doc: jest.fn((id) => {
            const newId = id || `mock-id-${counter++}`;
            return docMock(newId);
        }),
        get: jest.fn(async () => ({
            docs: Array.from(productos.entries()).map(([id, data]) => ({
                id, data: () => data
            }))
        })),
    };

    return {
        initializeApp: jest.fn(),
        credential: { cert: jest.fn() },
        firestore: jest.fn(() => ({
            collection: jest.fn(() => collectionMock)
        })),
    };
});

process.env.NODE_ENV = 'test';
const { app } = require('../src/app');

const producto = {
    nombre: 'Jeringa 5ml',
    categoria: 'insumo',
    cantidad: 100,
    precio: 500
};

test('GET /health → ok', async () => {
    const r = await request(app).get('/health');
    expect(r.body.status).toBe('ok');
});

test('POST crea producto → 201', async () => {
    const r = await request(app).post('/api/inventario').send(producto);
    expect(r.status).toBe(201);
    expect(r.body.nombre).toBe('Jeringa 5ml');
});

test('GET lista productos → 200', async () => {
    const r = await request(app).get('/api/inventario');
    expect(r.status).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
});

test('POST categoría inválida → 400', async () => {
    const r = await request(app).post('/api/inventario')
        .send({ ...producto, categoria: 'otro' });
    expect(r.status).toBe(400);
});

test('POST cantidad negativa → 400', async () => {
    const r = await request(app).post('/api/inventario')
        .send({ ...producto, cantidad: -10 });
    expect(r.status).toBe(400);
});

test('GET id inexistente → 404', async () => {
    const r = await request(app).get('/api/inventario/id-que-no-existe');
    expect(r.status).toBe(404);
});