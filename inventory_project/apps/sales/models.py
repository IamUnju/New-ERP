from django.conf import settings
from django.db import models
from apps.core.models import TimeStampedModel
from apps.products.models import Product


class Order(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        CANCELED = "CANCELED", "Canceled"

    customer_name = models.CharField(max_length=200, blank=True)
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COMPLETED)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        creating = self.pk is None
        super().save(*args, **kwargs)
        if creating and not self.order_number:
            self.order_number = f"ORD-{self.id}"
            super().save(update_fields=["order_number"])

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(TimeStampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.order_id} - {self.product.name}"
