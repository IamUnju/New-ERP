from .models import AuditLog


class AuditLogMixin:
    audit_model_label = None

    def _audit_model_label(self, instance=None):
        if self.audit_model_label:
            return self.audit_model_label
        if instance is not None:
            return instance.__class__.__name__
        return self.__class__.__name__

    def _audit_ip(self):
        try:
            return self.request.META.get("REMOTE_ADDR")
        except Exception:
            return None

    def log_action(self, action, instance=None, changes=None):
        user = getattr(self.request, "user", None)
        try:
            AuditLog.objects.create(
                actor=user if getattr(user, "is_authenticated", False) else None,
                action=action,
                model=self._audit_model_label(instance),
                object_id=str(getattr(instance, "id", "")) if instance else "",
                object_repr=str(instance) if instance else "",
                changes=changes or {},
                ip_address=self._audit_ip(),
            )
        except Exception:
            # Never block the main request if audit logging fails.
            return

    def perform_create(self, serializer):
        super().perform_create(serializer)
        self.log_action(
            AuditLog.Action.CREATE,
            instance=serializer.instance,
            changes=serializer.data,
        )

    def perform_update(self, serializer):
        super().perform_update(serializer)
        self.log_action(
            AuditLog.Action.UPDATE,
            instance=serializer.instance,
            changes=serializer.data,
        )

    def perform_destroy(self, instance):
        self.log_action(AuditLog.Action.DELETE, instance=instance)
        super().perform_destroy(instance)
