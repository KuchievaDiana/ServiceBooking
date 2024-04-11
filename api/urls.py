from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterAPIView.as_view()),
    path('login/', views.LoginAPIView.as_view()),
    path('password-change/', views.ChangePasswordView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('user/<int:user_id>/', views.UserView.as_view()),

    path('services/<int:business_id>/', views.ServicesView.as_view()),
    path('service/<int:business_id>/<int:service_id>/', views.ServiceView.as_view()),

    path('providers/<int:business_id>/', views.ProvidersView.as_view()),
    path('provider/<int:business_id>/<int:provider_id>/', views.ProviderView.as_view()),

    path('provider/<int:business_id>/<int:provider_id>/schedule/', views.ScheduleView.as_view()),
    path('provider/<int:business_id>/<int:provider_id>/schedule-item/', views.ScheduleItemView.as_view()),

    path('bookings/', views.BookingsView.as_view()),
    path('booking/<int:booking_id>/', views.BookingView.as_view()),

    path('<int:business_id>/<int:service_id>/<int:service_provider_id>', views.AvailabilityView.as_view()),
]
