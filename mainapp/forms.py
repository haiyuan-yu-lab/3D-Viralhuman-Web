from django import forms

class UpdateVariablesForm(forms.Form):
    sasa_thre = forms.FloatField(label='sasa_thre')
    dsasa_thre = forms.FloatField(label='dsasa_thre')
