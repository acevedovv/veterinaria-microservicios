import os
from flask import Flask, jsonify, request
from marshmallow import Schema, fields, validate, ValidationError

app   = Flask(__name__)
TEST  = os.getenv('TESTING', 'false') == 'true'

if not TEST:
    import firebase_admin
    from firebase_admin import credentials, firestore
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
else:
    db = None

class ItemSchema(Schema):
    descripcion = fields.Str(required=True)
    cantidad    = fields.Int(required=True, validate=validate.Range(min=1))
    precio      = fields.Float(required=True, validate=validate.Range(min=0))

class FacturaSchema(Schema):
    paciente_id = fields.Int(required=True, validate=validate.Range(min=1))
    cita_id     = fields.Int(required=True, validate=validate.Range(min=1))
    items       = fields.List(fields.Nested(ItemSchema), required=True,
                              validate=validate.Length(min=1))
    total       = fields.Float(required=True, validate=validate.Range(min=0))
    estado      = fields.Str(
        validate=validate.OneOf(['pendiente','pagada','anulada']),
        load_default='pendiente'
    )

factura_schema = FacturaSchema()

@app.get('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'ms-facturacion'})

@app.post('/api/facturacion')
def crear():
    try:
        data = factura_schema.load(request.json or {})
    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400

    if TEST:
        return jsonify({'id': 'test-001', **data}), 201

    ref = db.collection('facturas').document()
    ref.set(data)
    return jsonify({'id': ref.id, **data}), 201

@app.get('/api/facturacion')
def listar():
    if TEST:
        return jsonify([])
    docs = db.collection('facturas').stream()
    return jsonify([{'id': d.id, **d.to_dict()} for d in docs])

@app.get('/api/facturacion/<id>')
def obtener(id):
    if TEST:
        return jsonify({'error': 'No encontrada'}), 404
    doc = db.collection('facturas').document(id).get()
    if not doc.exists:
        return jsonify({'error': 'Factura no encontrada'}), 404
    return jsonify({'id': doc.id, **doc.to_dict()})

if __name__ == '__main__':
    app.run(port=8005, debug=True)