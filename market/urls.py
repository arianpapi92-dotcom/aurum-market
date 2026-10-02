from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),
    path('api/history/', views.history, name='history'),
    path('api/latest/', views.latest, name='latest'),
]
