from flask import Flask, jsonify, request, abort
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields, validate, ValidationError
import os

app = Flask(__name__)

# Usa SQLite en tests, PostgreSQL en producción
if os.getenv('TESTING') == 'true':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = \
        'postgresql://postgres:123@localhost:5432/vet_tratamientos'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Tratamiento(db.Model):
    __tablename__ = 'tratamientos'
    id          = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, nullable=False)
    cita_id     = db.Column(db.Integer)
    descripcion = db.Column(db.String(300), nullable=False)
    medicamento = db.Column(db.String(100))
    dosis       = db.Column(db.String(50))
    duracion    = db.Column(db.String(50))
    created_at  = db.Column(db.DateTime, server_default=db.func.now())

class TratamientoSchema(Schema):
    id          = fields.Int(dump_only=True)
    paciente_id = fields.Int(required=True, validate=validate.Range(min=1))
    cita_id     = fields.Int(load_default=None)
    descripcion = fields.Str(required=True, validate=validate.Length(min=5, max=300))
    medicamento = fields.Str(load_default=None)
    dosis       = fields.Str(load_default=None)
    duracion    = fields.Str(load_default=None)

schema_one  = TratamientoSchema()
schema_many = TratamientoSchema(many=True)

def get_tratamiento_or_404(id):
    tratamiento = db.session.get(Tratamiento, id)
    if tratamiento is None:
        abort(404)
    return tratamiento

@app.get('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'ms-tratamientos'})

@app.get('/api/tratamientos')
def listar():
    return jsonify(schema_many.dump(Tratamiento.query.all()))

@app.post('/api/tratamientos')
def crear():
    try:
        data = schema_one.load(request.json or {})
    except ValidationError as e:
        return jsonify({'errors': e.messages}), 400
    t = Tratamiento(**data)
    db.session.add(t)
    db.session.commit()
    return jsonify(schema_one.dump(t)), 201

@app.get('/api/tratamientos/<int:id>')
def obtener(id):
    return jsonify(schema_one.dump(get_tratamiento_or_404(id)))

@app.put('/api/tratamientos/<int:id>')
def actualizar(id):
    t = get_tratamiento_or_404(id)
    for k, v in (request.json or {}).items():
        if hasattr(t, k):
            setattr(t, k, v)
    db.session.commit()
    return jsonify(schema_one.dump(t))

@app.delete('/api/tratamientos/<int:id>')
def eliminar(id):
    t = get_tratamiento_or_404(id)
    db.session.delete(t)
    db.session.commit()
    return jsonify({'message': 'Tratamiento eliminado'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=8003, debug=True)