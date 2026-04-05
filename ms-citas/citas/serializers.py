from rest_framework import serializers
from .models import Cita

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Cita
        fields = '__all__'

    def validate_paciente_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("El ID del paciente debe ser mayor a 0")
        return value

    def validate_veterinario(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Nombre del veterinario muy corto")
        return value