import sys, os, pytest

# Activa modo test ANTES de importar app
os.environ['TESTING'] = 'true'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()

def test_health(client):
    assert client.get('/health').status_code == 200

def test_crear(client):
    r = client.post('/api/tratamientos', json={
        'paciente_id': 1, 'descripcion': 'Antibiótico oral completo',
        'medicamento': 'Amoxicilina', 'dosis': '250mg', 'duracion': '7 días'
    })
    assert r.status_code == 201

def test_descripcion_corta(client):
    r = client.post('/api/tratamientos', json={'paciente_id': 1, 'descripcion': 'ok'})
    assert r.status_code == 400

def test_paciente_id_cero(client):
    r = client.post('/api/tratamientos', json={'paciente_id': 0, 'descripcion': 'Test de validación'})
    assert r.status_code == 400

def test_listar(client):
    client.post('/api/tratamientos', json={'paciente_id': 1, 'descripcion': 'Descripción válida larga'})
    r = client.get('/api/tratamientos')
    assert r.status_code == 200
    assert len(r.get_json()) == 1

def test_actualizar(client):
    client.post('/api/tratamientos', json={'paciente_id': 1, 'descripcion': 'Descripción inicial larga'})
    r = client.put('/api/tratamientos/1', json={'medicamento': 'Ibuprofeno'})
    assert r.status_code == 200
    assert r.get_json()['medicamento'] == 'Ibuprofeno'

def test_eliminar(client):
    client.post('/api/tratamientos', json={'paciente_id': 1, 'descripcion': 'Para eliminar luego ahora'})
    assert client.delete('/api/tratamientos/1').status_code == 200