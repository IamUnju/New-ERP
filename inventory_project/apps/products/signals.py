from django.db.models import F
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.products.models import StockMovement


@receiver(post_save, sender=StockMovement)
def update_product_stock(sender, instance, created, **kwargs):
    if not created:
        return
    quantity = instance.quantity
    if instance.movement_type == StockMovement.Type.IN:
        instance.product.stock_quantity = F("stock_quantity") + quantity
    else:
        instance.product.stock_quantity = F("stock_quantity") - quantity
    instance.product.save(update_fields=["stock_quantity"])
