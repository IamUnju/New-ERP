from django.db import transaction
from apps.products.models import StockMovement


# Domain operations for inventory operations live here.


def record_stock_movement(product, movement_type, quantity, reference=None, created_by=None):
    with transaction.atomic():
        return StockMovement.objects.create(
            product=product,
            movement_type=movement_type,
            quantity=quantity,
            reference=reference,
            created_by=created_by,
        )
