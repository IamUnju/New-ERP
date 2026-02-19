from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel


class StockMovement(TimeStampedModel):
    """Every stock change is recorded here."""
    class MovementType(models.TextChoices):
        IN       = "in",       "Stock In"
        OUT      = "out",      "Stock Out"
        TRANSFER = "transfer", "Transfer"
        ADJUST   = "adjust",   "Adjustment"

    product       = models.ForeignKey("products.Product", on_delete=models.PROTECT, related_name="inv_movements")
    warehouse     = models.ForeignKey("products.Warehouse", on_delete=models.PROTECT, related_name="inv_movements")
    dest_warehouse = models.ForeignKey(
        "products.Warehouse", on_delete=models.PROTECT,
        null=True, blank=True, related_name="inbound_transfers"
    )
    movement_type = models.CharField(max_length=20, choices=MovementType.choices)
    quantity      = models.IntegerField()          # positive = in, negative = out
    before_qty    = models.IntegerField(default=0)
    after_qty     = models.IntegerField(default=0)
    reference     = models.CharField(max_length=100, blank=True)  # order no / PO no
    note          = models.TextField(blank=True)
    created_by    = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="inv_stock_movements"
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} {self.quantity} × {self.product}"


class StockLevel(TimeStampedModel):
    """Current stock quantity per product per warehouse."""
    product   = models.ForeignKey("products.Product",  on_delete=models.CASCADE, related_name="stock_levels")
    warehouse = models.ForeignKey("products.Warehouse", on_delete=models.CASCADE, related_name="stock_levels")
    quantity  = models.IntegerField(default=0)

    class Meta:
        unique_together = ("product", "warehouse")

    def __str__(self):
        return f"{self.product} @ {self.warehouse} = {self.quantity}"
