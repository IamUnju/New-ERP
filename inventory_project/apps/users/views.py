from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import Role, ScreenPermission, RolePermission, User
from apps.users.serializers import (
    RolePermissionSerializer,
    RoleSerializer,
    ScreenPermissionSerializer,
    UserCreateUpdateSerializer,
    UserSerializer,
)
from permissions.permission_classes import ScreenPermissionRequired
from services.users import assign_role_permissions, create_user, update_user
from apps.core.audit import AuditLogMixin
from apps.core.models import AuditLog


class UserViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-created_at")
    permission_classes = [ScreenPermissionRequired]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return UserCreateUpdateSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = create_user(serializer.validated_data)
        serializer.instance = user
        self.log_action(AuditLog.Action.CREATE, instance=user, changes=serializer.validated_data)

    def perform_update(self, serializer):
        user = update_user(self.get_object(), serializer.validated_data)
        serializer.instance = user
        self.log_action(AuditLog.Action.UPDATE, instance=user, changes=serializer.validated_data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request):
        user = request.user
        data = {
            "user_id": user.id,
            "username": user.username,
            "roles": list(user.roles.values_list("name", flat=True)),
            "permissions": user.get_permissions_map(),
        }
        return Response(data)


class RoleViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Role.objects.all().order_by("name")
    serializer_class = RoleSerializer
    permission_classes = [ScreenPermissionRequired]


class ScreenPermissionViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = ScreenPermission.objects.all().order_by("path")
    serializer_class = ScreenPermissionSerializer
    permission_classes = [ScreenPermissionRequired]


class RolePermissionViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = RolePermission.objects.all().select_related("role", "screen")
    serializer_class = RolePermissionSerializer
    permission_classes = [ScreenPermissionRequired]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["post"], permission_classes=[ScreenPermissionRequired])
    def bulk_assign(self, request):
        role_id = request.data.get("role_id")
        permissions = request.data.get("permissions", [])
        role = Role.objects.get(id=role_id)
        assign_role_permissions(role, permissions)
        return Response({"status": "updated"})
