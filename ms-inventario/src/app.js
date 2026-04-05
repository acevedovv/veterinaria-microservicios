const express  = require('express');
const Joi      = require('joi');
const admin    = require('firebase-admin');
const path     = require('path');

const app = express();
app.use(express.json());

// Inicializar Firebase solo fuera de tests
if (process.env.NODE_ENV !== 'test') {
    const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const getDb = () => admin.firestore();

// Validación con Joi
const joiSchema = Joi.object({
    nombre:      Joi.string().min(2).required(),
    categoria:   Joi.string().valid('medicamento', 'insumo', 'alimento').required(),
    cantidad:    Joi.number().min(0).required(),
    precio:      Joi.number().min(0).required(),
    proveedor:   Joi.string().allow(null, '').optional(),
    vencimiento: Joi.string().allow(null, '').optional(),
});

// Health
app.get('/health', (req, res) =>
    res.json({ status: 'ok', service: 'ms-inventario' })
);

// Listar productos
app.get('/api/inventario', async (req, res) => {
    try {
        const snapshot = await getDb().collection('inventario').get();
        const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(productos);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Crear producto
app.post('/api/inventario', async (req, res) => {
    const { error } = joiSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
        const ref = getDb().collection('inventario').doc();
        const data = { ...req.body, createdAt: new Date().toISOString() };
        await ref.set(data);
        res.status(201).json({ id: ref.id, ...data });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Obtener por ID
app.get('/api/inventario/:id', async (req, res) => {
    try {
        const doc = await getDb().collection('inventario').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Actualizar producto
app.put('/api/inventario/:id', async (req, res) => {
    try {
        const ref = getDb().collection('inventario').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ error: 'Producto no encontrado' });
        await ref.update(req.body);
        const updated = await ref.get();
        res.json({ id: updated.id, ...updated.data() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Eliminar producto
app.delete('/api/inventario/:id', async (req, res) => {
    try {
        const ref = getDb().collection('inventario').doc(req.params.id);
        const doc = await ref.get();
        if (!doc.exists) return res.status(404).json({ error: 'Producto no encontrado' });
        await ref.delete();
        res.json({ message: 'Producto eliminado' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = { app };