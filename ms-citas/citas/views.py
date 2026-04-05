from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Cita
from .serializers import CitaSerializer

class CitaViewSet(viewsets.ModelViewSet):
    queryset         = Cita.objects.all()
    serializer_class = CitaSerializer

@api_view(['GET'])
def health(request):
    return Response({'status': 'ok', 'service': 'ms-citas'})
