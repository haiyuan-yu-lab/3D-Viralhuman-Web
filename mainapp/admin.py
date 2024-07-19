from django.contrib import admin
from import_export import resources
from .models import *


# Register your models here.

class ProteinResource(resources.ModelResource):
    class Meta:
        model = Protein

class InterfaceResource(resources.ModelResource):
    class Meta:
        model = Interface

class PopVarEnrichmentResource(resources.ModelResource):
    class Meta:
        model = PopVarEnrichment

class PopVarResource(resources.ModelResource):
    class Meta:
        model = PopVar

class ViralMutEnrichmentResource(resources.ModelResource):
    class Meta:
        model = ViralMutEnrichment

class ViralMutResource(resources.ModelResource):
    class Meta:
        model = ViralMut

class DockedModelResource(resources.ModelResource):
    class Meta:
        model = DockedModel

class DrugResource(resources.ModelResource):
    class Meta:
        model = Drug