from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('downloads', views.downloads, name='downloads'),
    path('about', views.about, name='about'),
    path('intsearch', views.intsearch, name='intsearch'),
    path('inttable', views.inttable, name='inttable'),
#    path('favicon.ico', RedirectView.as_view(url='static/images/infobutton.jpg', permanent=True)),
    path('<str:interaction>/', views.interaction, name='interaction'),
    path('favicon.ico', lambda x: HttpResponse(status=204))
]
