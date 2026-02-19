from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.users.views import RolePermissionViewSet, RoleViewSet, ScreenPermissionViewSet, UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="users")
router.register("roles", RoleViewSet, basename="roles")
router.register("screens", ScreenPermissionViewSet, basename="screens")
router.register("role-permissions", RolePermissionViewSet, basename="role-permissions")

urlpatterns = [
    path("", include(router.urls)),
]
