from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied, APIException
from rest_framework.permissions import IsAuthenticated

from .models import User, Service, CUSTOMER, BUSINESS_ADMIN, Provider, Schedule, Booking
from .serializers import RegisterSerializer, LoginSerializer, ChangePasswordSerializer, ServiceSerializer, \
    ProviderSerializer, BookingSerializer, UserSerializer, ScheduleSerializer
from django.contrib.auth import authenticate
from django.db import DatabaseError
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from datetime import datetime, timedelta

DATE_TIME_FORMAT = "%Y-%m-%dT%H:%M:%S"


class RegisterAPIView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if User.objects.filter(email=request.data.get('email')).exists():
            return Response({'message': 'This email already exists.'}, status=status.HTTP_409_CONFLICT)

        try:
            user = self.perform_create(serializer)
            token, created = Token.objects.get_or_create(user=user)
            headers = self.get_success_headers(serializer.data)
            return Response({'token': token.key}, status=status.HTTP_201_CREATED, headers=headers)
        except DatabaseError:
            return Response({'message': 'Database error!'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        password = self.request.data.get('password', '')
        instance = serializer.save()
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class LoginAPIView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data.get('email'),
            password=serializer.validated_data.get('password')
        )

        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)

        return Response({'token': token.key}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def change_password(self, user, new_password):
        user.set_password(new_password)
        user.save()

    def post(self, request):
        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)

        old_password = serializer.validated_data.get("old_password")
        new_password = serializer.validated_data.get("new_password")

        if not check_password(old_password, request.user.password):
            return Response({"detail": "Invalid old password."}, status=status.HTTP_403_FORBIDDEN)

        self.change_password(request.user, new_password)

        return Response({"success": "Password changed successfully"}, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(instance=self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class UserView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs['user_id']
        return Response(UserSerializer(User.objects.filter(id=user_id).first()).data)


def get_user(business_id):
    user = User.objects.filter(id=business_id).first()
    if not user or user.user_type != BUSINESS_ADMIN:
        raise ValidationError('Invalid business id')
    return user


def get_service(business_id, service_id):
    service = Service.objects.filter(id=service_id).first()
    if not service or service.owner_id != business_id:
        raise ValidationError('Incorrect service id')

    return service


def check_user_permissions(request, user):
    if request.user.id != user.id or request.user.user_type == CUSTOMER:
        raise PermissionDenied('Permission denied')


class ServicesView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        serializer = self.serializer_class(Service.objects.filter(owner=user, is_active=True), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        check_user_permissions(request, user)

        service_data = request.data
        service_data['owner'] = request.user.id
        serializer = self.serializer_class(data=service_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ServiceView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceSerializer

    def get(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        return Response(ServiceSerializer(service).data)

    def patch(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        check_user_permissions(request, user)

        serializer = ServiceSerializer(service, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        business_id, service_id = self.kwargs['business_id'], self.kwargs['service_id']
        user, service = get_user(business_id), get_service(business_id, service_id)
        check_user_permissions(request, user)

        try:
            service.is_active = False
            service.save()
            return Response('Service deactivated successfully', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


def get_provider(business_id, provider_id):
    provider = Provider.objects.filter(id=provider_id).first()
    if not provider or provider.owner_id != business_id:
        raise ValidationError('Incorrect provider id')

    return provider


class ProvidersView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSerializer

    def get(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        serializer = self.serializer_class(Provider.objects.filter(owner=user, is_active=True), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id = self.kwargs['business_id']
        user = get_user(business_id)
        check_user_permissions(request, user)

        provider_data = request.data
        provider_data['owner'] = request.user.id
        serializer = self.serializer_class(data=provider_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProviderView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProviderSerializer

    def get(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        return Response(ProviderSerializer(provider).data)

    def patch(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        serializer = ProviderSerializer(provider, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        try:
            provider.is_active = False
            provider.save()
            return Response('Provider deactivated successfully', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


class ScheduleView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer

    def get(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)

        serializer = self.serializer_class(Schedule.objects.filter(service_provider=provider), many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        schedule_data = request.data
        schedule_data['service_provider'] = provider_id
        serializer = self.serializer_class(data=schedule_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ScheduleItemView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer

    def get(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)

        serializer = self.serializer_class(
            Schedule.objects.filter(service_provider_id=provider_id, day_of_week=request.data.get('day_of_week')),
            many=True
        )
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        try:
            schedule = Schedule.objects.get(service_provider_id=provider_id,
                                            day_of_week=request.data.get('day_of_week'))
        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.serializer_class(schedule, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        business_id, provider_id = self.kwargs['business_id'], self.kwargs['provider_id']
        user, provider = get_user(business_id), get_provider(business_id, provider_id)
        check_user_permissions(request, user)

        try:
            schedule = Schedule.objects.get(service_provider_id=provider_id,
                                            day_of_week=request.data.get('day_of_week'))
        except Schedule.DoesNotExist:
            return Response({"error": "Schedule not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            schedule.delete()
            return Response('Schedule successfully deleted.', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


class BookingsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get(self, request, *args, **kwargs):
        user = User.objects.get(id=request.user.id)
        if user.user_type == CUSTOMER:
            serializer = self.serializer_class(Booking.objects.filter(customer=user).order_by('-start_time'), many=True)
        else:
            serializer = self.serializer_class(Booking.objects.filter(business=user).order_by('-start_time'), many=True)
        return Response(serializer.data)

    def post(self, request):
        user = User.objects.get(id=request.user.id)
        if user.user_type == BUSINESS_ADMIN:
            raise PermissionDenied('Permission denied')

        try:
            service = Service.objects.get(id=request.data.get('service'))
            provider = Provider.objects.get(id=request.data.get('service_provider'))
            if User.objects.get(id=service.owner_id) != User.objects.get(id=provider.owner_id):
                raise ValidationError('Service and provider have different owner')
            if service.owner_id != int(request.data.get('business')):
                raise ValidationError('Invalid business id or service id')

            booking_data = request.data
            booking_data['customer'] = request.user.id

            end_time_dt = datetime.strptime(request.data.get('start_time'),
                                            DATE_TIME_FORMAT) + service.execution_duration
            booking_data['end_time'] = end_time_dt.strftime(DATE_TIME_FORMAT)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))

        serializer = self.serializer_class(data=booking_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


def get_booking(user, booking_id):
    booking = Booking.objects.filter(id=booking_id).first()
    if not booking:
        raise ValidationError('Incorrect booking id')
    if user.user_type == CUSTOMER and booking.customer_id != user.id:
        raise ValidationError('Incorrect booking id')
    if user.user_type == BUSINESS_ADMIN and booking.business_id != user.id:
        raise ValidationError('Incorrect booking id')
    return booking


class BookingView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get(self, request, *args, **kwargs):
        booking_id = self.kwargs['booking_id']

        user = User.objects.get(id=request.user.id)
        booking = get_booking(user, booking_id)
        return Response(BookingSerializer(booking).data)

    def patch(self, request, *args, **kwargs):
        booking_id = self.kwargs['booking_id']
        user = User.objects.get(id=request.user.id)
        if user.user_type == BUSINESS_ADMIN:
            raise PermissionDenied('Permission denied')
        booking = get_booking(user, booking_id)

        serializer = BookingSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        booking_id = self.kwargs['booking_id']
        user = User.objects.get(id=request.user.id)
        booking = get_booking(user, booking_id)

        try:
            booking.is_active = False
            booking.save()
            return Response('Booking canceled successfully', status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))


def is_provider_available(provider: Provider, start_datetime: datetime, required_duration):
    try:
        if Schedule.objects.filter(service_provider=provider, day_of_week=start_datetime.isoweekday()).first() is None:
            print("Not working")
            return []

        working_hours_start = Schedule.objects.filter(service_provider=provider,
                                                      day_of_week=start_datetime.isoweekday()).first().start_time
        working_hours_end = Schedule.objects.filter(service_provider=provider,
                                                    day_of_week=start_datetime.isoweekday()).first().end_time

        print(working_hours_start, working_hours_end)

        end_date_time = start_datetime + timedelta(days=1)
        bookings = Booking.objects.filter(service_provider=provider, start_time__range=(start_datetime, end_date_time),
                                          end_time__range=(start_datetime, end_date_time), is_active=True)
        booked_slots = [(booking.start_time, booking.end_time) for booking in bookings]
        print(booked_slots)

        available_slots = []

        current_time = start_datetime

        while current_time + required_duration <= end_date_time:
            if current_time.time() <= working_hours_start or current_time.time() >= working_hours_end:
                current_time = current_time + required_duration
                continue
            overlaps = False

            for booked_start, booked_end in booked_slots:
                # Check if current slot overlaps with a booked slot
                if current_time < booked_end and current_time + required_duration > booked_start:
                    overlaps = True
            if not overlaps:
                available_slots.append((current_time, current_time + required_duration))

            current_time = current_time + required_duration

    except Exception as e:
        raise APIException('Unexpected error occurred: ' + str(e))

    return available_slots


class AvailabilityView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get(self, request, *args, **kwargs):
        user = User.objects.get(id=request.user.id)
        if user.user_type == BUSINESS_ADMIN:
            raise PermissionDenied('Permission denied')

        business_id, service_id, service_provider_id = self.kwargs['business_id'], self.kwargs['service_id'], \
            self.kwargs['service_provider_id']
        try:
            business = get_user(business_id)
            service = get_service(business.id, service_id)
            provider = get_provider(business.id, service_provider_id)

            result = []
            current_time = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            for i in range(0, 2):
                result += is_provider_available(provider, current_time, service.execution_duration)

                current_time = current_time + timedelta(days=1)

        except Exception as e:
            raise APIException('Unexpected error occurred: ' + str(e))

        return JsonResponse({'dates': result}, safe=False)
