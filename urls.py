from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('login/', index),
    path('register/', index),
    path('register/admin', index),
    path('profile/', index),
    path('admin/', index),
    path('admin/services', index),
    path('admin/providers', index),
    path('test/', index),
    path('booking/<int:admin_id>/', index),
    path('profile/bookings', index),
    path('admin/bookings', index)
]
