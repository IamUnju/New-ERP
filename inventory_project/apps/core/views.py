from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["action", "model", "actor"]
    search_fields = ["model", "object_repr", "object_id", "actor__email"]
    ordering_fields = ["created_at"]

    @action(detail=False, methods=["post"], url_path="log")
    def log_action(self, request):
        action_value = request.data.get("action")
        model_name = request.data.get("model")
        object_id = request.data.get("object_id", "")
        object_repr = request.data.get("object_repr", "")
        changes = request.data.get("changes", {})

        if action_value not in [AuditLog.Action.IMPORT, AuditLog.Action.EXPORT]:
            return Response({"detail": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
        if not model_name:
            return Response({"detail": "Model is required"}, status=status.HTTP_400_BAD_REQUEST)

        AuditLog.objects.create(
            actor=request.user,
            action=action_value,
            model=model_name,
            object_id=str(object_id),
            object_repr=str(object_repr),
            changes=changes if isinstance(changes, dict) else {},
            ip_address=request.META.get("REMOTE_ADDR"),
        )
        return Response({"status": "ok"})
