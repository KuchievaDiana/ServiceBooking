from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

MAX_LENGTH = 150
BUSINESS_ADMIN = 0
CUSTOMER = 1


class UserManager(BaseUserManager):
    def create_user(self, email, user_type, password=None, first_name="", last_name=""):
        if not email:
            raise ValueError("Users must have an email address")
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            user_type=user_type,
            first_name=first_name,
            last_name=last_name,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    email = models.EmailField(_("email address"), max_length=MAX_LENGTH, unique=True, blank=False, null=False)
    first_name = models.CharField(_("first name"), max_length=MAX_LENGTH, blank=True)
    last_name = models.CharField(_("last name"), max_length=MAX_LENGTH, blank=True)
    company_name = models.CharField(_("company name"), max_length=MAX_LENGTH, blank=True)

    USER_TYPES = [(BUSINESS_ADMIN, "BusinessAdmin"), (CUSTOMER, "Customer")]
    user_type = models.IntegerField(_("user type"), choices=USER_TYPES)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["user type"]

    objects = UserManager()

    def get_full_name(self):
        full_name = "%s %s %s" % (self.first_name, self.last_name, self.company_name)
        return full_name.strip()

    def get_short_name(self):
        return self.first_name


class Service(models.Model):
    name = models.CharField(max_length=MAX_LENGTH, null=False)
    description = models.TextField(null=True)
    execution_duration = models.DurationField(null=False)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey("User", on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class Provider(models.Model):
    first_name = models.CharField(max_length=MAX_LENGTH)
    last_name = models.CharField(max_length=MAX_LENGTH, blank=True)
    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey("User", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ServiceProviderRelation(models.Model):
    service = models.ForeignKey("Service", on_delete=models.CASCADE)
    service_provider = models.ForeignKey("Provider", on_delete=models.CASCADE)

    def __str__(self):
        return f"service provider: {self.service_provider.first_name} " \
               f"service: {self.service.name} "


class Schedule(models.Model):
    DAY_CHOICES = [(1, "Monday"), (2, "Tuesday"), (3, "Wednesday"), (4, "Thursday"), (5, "Friday"), (6, "Saturday"),
                   (7, "Sunday")]

    service_provider = models.ForeignKey("Provider", on_delete=models.CASCADE)
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField(default="00:00:00")
    end_time = models.TimeField(default="00:00:00")

    def __str__(self):
        return f"service provider: {self.service_provider.first_name} " \
               f"day of week: {self.day_of_week} " \
               f"start time: {self.start_time} " \
               f"end time: {self.end_time}"


class Booking(models.Model):
    customer = models.ForeignKey("User", on_delete=models.CASCADE)
    business = models.ForeignKey("User", on_delete=models.CASCADE, related_name='business', default=None)
    service = models.ForeignKey("Service", on_delete=models.CASCADE)
    service_provider = models.ForeignKey("Provider", on_delete=models.CASCADE)
    start_time = models.DateTimeField(default=None)
    end_time = models.DateTimeField(default=None)
    is_active = models.BooleanField(default=True)
    comment = models.TextField(null=True)
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True,
                                              default=None)

    def __str__(self):
        return f"customer: {self.customer} " \
               f"business: {self.business} " \
               f"service: {self.service.name} " \
               f"service provider: {self.service_provider.first_name} " \
               f"start time: {self.start_time}" \
               f"end time: {self.end_time}"
