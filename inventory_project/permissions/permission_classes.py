from rest_framework.permissions import BasePermission


class ScreenPermissionRequired(BasePermission):
    action_map = {
        "list": "view",
        "retrieve": "view",
        "create": "create",
        "update": "update",
        "partial_update": "update",
        "destroy": "delete",
    }

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True

        required_action = self.action_map.get(getattr(view, "action", None))
        if required_action is None:
            return True

        permissions_map = getattr(user, "permissions_map", None)
        if permissions_map is None:
            permissions_map = user.get_permissions_map()

        normalized_path = self._normalize_path(request.path)
        allowed_actions = permissions_map.get(normalized_path)
        if allowed_actions is None:
            matched_path = self._match_prefix(normalized_path, permissions_map.keys())
            allowed_actions = permissions_map.get(matched_path, []) if matched_path else []
        return required_action in allowed_actions

    @staticmethod
    def _normalize_path(path):
        if path.startswith("/api/v1/"):
            return "/api/" + path[len("/api/v1/"):]
        return path

    @staticmethod
    def _match_prefix(path, candidates):
        matches = [candidate for candidate in candidates if path.startswith(candidate)]
        if not matches:
            return None
        return max(matches, key=len)
