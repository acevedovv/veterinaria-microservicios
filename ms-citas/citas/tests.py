from django.test import TestCase
from rest_framework.test import APIClient
from .models import Cita
from datetime import datetime, timezone

class CitaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.datos = {
            'paciente_id': 1,
            'veterinario': 'Dr. López',
            'fecha': '2025-06-15T10:00:00Z',
            'motivo': 'Vacunación anual'
        }

    def test_crear_cita(self):
        res = self.client.post('/api/citas/', self.datos, format='json')
        self.assertEqual(res.status_code, 201)

    def test_listar_citas(self):
        Cita.objects.create(**{**self.datos, 'fecha': datetime.now(timezone.utc)})
        res = self.client.get('/api/citas/')
        self.assertEqual(res.status_code, 200)

    def test_validar_paciente_id_invalido(self):
        datos = {**self.datos, 'paciente_id': -1}
        res = self.client.post('/api/citas/', datos, format='json')
        self.assertEqual(res.status_code, 400)

    def test_actualizar_estado_cita(self):
        cita = Cita.objects.create(**{**self.datos, 'fecha': datetime.now(timezone.utc)})
        res = self.client.patch(f'/api/citas/{cita.id}/', {'estado': 'completada'}, format='json')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['estado'], 'completada')

    def test_eliminar_cita(self):
        cita = Cita.objects.create(**{**self.datos, 'fecha': datetime.now(timezone.utc)})
        res = self.client.delete(f'/api/citas/{cita.id}/')
        self.assertEqual(res.status_code, 204)
