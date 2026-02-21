from rest_framework import serializers
from apps.users.models import Role, ScreenPermission, RolePermission, User


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "description",
            "effective_from",
            "effective_to",
            "remarks",
            "is_active",
        ]


class ScreenPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenPermission
        fields = ["id", "path", "description"]


class RolePermissionSerializer(serializers.ModelSerializer):
    screen = ScreenPermissionSerializer(read_only=True)
    screen_id = serializers.PrimaryKeyRelatedField(
        source="screen", queryset=ScreenPermission.objects.all(), write_only=True
    )

    class Meta:
        model = RolePermission
        fields = ["id", "role", "screen", "screen_id", "actions"]


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(many=True, slug_field="name", read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "roles",
            "permissions",
            "is_active",
            "created_at",
        ]

    def get_permissions(self, obj):
        return obj.get_permissions_map()


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    role_ids = serializers.PrimaryKeyRelatedField(
        source="roles", many=True, queryset=Role.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "password", "role_ids", "is_active"]
        extra_kwargs = {"password": {"write_only": True}}
