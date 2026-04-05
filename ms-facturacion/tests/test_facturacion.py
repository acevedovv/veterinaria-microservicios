import os, sys, pytest
os.environ['TESTING'] = 'true'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    return app.test_client()

BASE = {
    'paciente_id': 1, 'cita_id': 1,
    'items': [{'descripcion': 'Consulta', 'cantidad': 1, 'precio': 50000}],
    'total': 50000
}

def test_health(client):
    assert client.get('/health').status_code == 200

def test_crear_factura(client):
    r = client.post('/api/facturacion', json=BASE)
    assert r.status_code == 201
    assert r.get_json()['estado'] == 'pendiente'

def test_total_negativo(client):
    assert client.post('/api/facturacion', json={**BASE, 'total': -1}).status_code == 400

def test_items_vacios(client):
    assert client.post('/api/facturacion', json={**BASE, 'items': []}).status_code == 400

def test_estado_invalido(client):
    assert client.post('/api/facturacion', json={**BASE, 'estado': 'borrador'}).status_code == 400

def test_paciente_id_cero(client):
    assert client.post('/api/facturacion', json={**BASE, 'paciente_id': 0}).status_code == 400

def test_item_cantidad_cero(client):
    datos = {**BASE, 'items': [{'descripcion': 'X', 'cantidad': 0, 'precio': 1000}]}
    assert client.post('/api/facturacion', json=datos).status_code == 400