from django.db import models

class Cita(models.Model):
    ESTADOS = [('pendiente','Pendiente'),('completada','Completada'),('cancelada','Cancelada')]

    paciente_id  = models.IntegerField()
    veterinario  = models.CharField(max_length=100)
    fecha        = models.DateTimeField()
    motivo       = models.CharField(max_length=200)
    estado       = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'citas'
        ordering = ['-fecha']


