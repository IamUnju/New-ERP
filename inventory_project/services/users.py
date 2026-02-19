from django.db import transaction
from apps.users.models import RolePermission, ScreenPermission
from repositories.users import UserRepository


# Service layer isolates business rules from API and persistence.


def create_user(data):
    repo = UserRepository()
    password = data.pop("password", None)
    roles = data.pop("roles", [])
    user = repo.create(**data)
    if password:
        user.set_password(password)
        user.save()
    if roles:
        user.roles.set(roles)
    return user


def update_user(instance, data):
    repo = UserRepository()
    password = data.pop("password", None)
    roles = data.pop("roles", None)
    user = repo.update(instance, **data)
    if password:
        user.set_password(password)
        user.save()
    if roles is not None:
        user.roles.set(roles)
    return user


def assign_roles(user, roles):
    user.roles.set(roles)
    return user


def assign_role_permissions(role, screen_permissions_payload):
    with transaction.atomic():
        RolePermission.objects.filter(role=role).delete()
        for item in screen_permissions_payload:
            screen_id = item.get("screen_id") or item.get("screen")
            screen = ScreenPermission.objects.get(id=screen_id)
            actions = item.get("actions", [])
            RolePermission.objects.create(role=role, screen=screen, actions=actions)
