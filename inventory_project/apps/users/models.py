from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.contrib.postgres.fields import ArrayField
from apps.core.models import TimeStampedModel


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class Role(TimeStampedModel):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


class ScreenPermission(TimeStampedModel):
    path = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.path


class RolePermission(TimeStampedModel):
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="role_permissions")
    screen = models.ForeignKey(ScreenPermission, on_delete=models.CASCADE, related_name="screen_permissions")
    actions = ArrayField(models.CharField(max_length=20), default=list)

    class Meta:
        unique_together = ("role", "screen")


class User(TimeStampedModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    roles = models.ManyToManyField(Role, through="UserRole", related_name="users")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_permissions_map(self):
        permissions = {}
        role_ids = self.roles.values_list("id", flat=True)
        for rp in RolePermission.objects.filter(role_id__in=role_ids).select_related("screen"):
            permissions.setdefault(rp.screen.path, [])
            for action in rp.actions:
                if action not in permissions[rp.screen.path]:
                    permissions[rp.screen.path].append(action)
        return permissions


class UserRole(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("user", "role")
