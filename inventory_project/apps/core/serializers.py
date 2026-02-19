from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_email = serializers.CharField(source="actor.email", read_only=True)

    class Meta:
        model = AuditLog
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "actor_email")
