from django.core.management.base import BaseCommand
from apps.users.models import Role, ScreenPermission, RolePermission


class Command(BaseCommand):
    help = "Grant all permissions to Admin role"

    def handle(self, *args, **options):
        try:
            admin_role = Role.objects.get(name="Admin")
            self.stdout.write(f"Found Admin role (ID: {admin_role.id})")

            # Get all screens
            all_screens = ScreenPermission.objects.all()
            self.stdout.write(f"Found {all_screens.count()} screens")

            # Delete existing permissions for admin
            deleted_count, _ = RolePermission.objects.filter(role=admin_role).delete()
            self.stdout.write(f"Deleted {deleted_count} existing permissions")

            # Grant all permissions
            all_actions = ["view", "create", "update", "delete"]
            created_count = 0

            for screen in all_screens:
                RolePermission.objects.create(
                    role=admin_role,
                    screen=screen,
                    actions=all_actions
                )
                created_count += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"\n✓ Successfully granted all permissions to Admin role!\n"
                    f"  - Created {created_count} permission records\n"
                    f"  - Actions: {', '.join(all_actions)}\n"
                )
            )

        except Role.DoesNotExist:
            self.stdout.write(
                self.style.ERROR("Admin role not found!")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"Error: {str(e)}")
            )
