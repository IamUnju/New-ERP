from repositories.base import BaseRepository
from apps.users.models import User, Role, ScreenPermission, RolePermission


class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__(User)


class RoleRepository(BaseRepository):
    def __init__(self):
        super().__init__(Role)


class ScreenPermissionRepository(BaseRepository):
    def __init__(self):
        super().__init__(ScreenPermission)


class RolePermissionRepository(BaseRepository):
    def __init__(self):
        super().__init__(RolePermission)
