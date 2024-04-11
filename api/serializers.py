from rest_framework import serializers
from .models import Service, Provider, User, Booking, Schedule


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "company_name", "user_type"]
        extra_kwargs = {"password": {"write_only": True, "required": True}}

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


class ChangePasswordSerializer(serializers.Serializer):
    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "user_type", "email", "first_name", "last_name", "company_name"]
        extra_kwargs = {"user_type": {"read_only": True}, "email": {"read_only": True}, "password": {"required": True}}


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "owner", "description", "execution_duration", "is_active"]
        extra_kwargs = {
            "name": {"required": True},
            "execution_duration": {"required": True},
            "id": {"read_only": True},
            "owner": {"required": True},
        }


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = ["id", "first_name", "last_name", "owner", "is_active"]
        extra_kwargs = {
            "first_name": {"required": True},
            "id": {"read_only": True},
            "owner": {"required": True},
        }


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ["id", "day_of_week", "start_time", "end_time", "service_provider"]
        extra_kwargs = {
            "day_of_week": {"required": True},
            "id": {"read_only": True},
            "service_provider": {"required": True},
        }


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "customer", "business", "service", "service_provider", "start_time", "end_time", "is_active",
                  "rating", "comment"]
        extra_kwargs = {
            "id": {"read_only": True},
            "start_time": {"required": True},
            "customer": {"required": True},
            "business": {"required": True},
            "service": {"required": True},
            "service_provider": {"required": True},
        }
