from django.contrib import admin
from apps.users.models import Role, ScreenPermission, RolePermission, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "is_active", "is_staff")
    search_fields = ("email", "username")


admin.site.register(Role)
admin.site.register(ScreenPermission)
admin.site.register(RolePermission)
