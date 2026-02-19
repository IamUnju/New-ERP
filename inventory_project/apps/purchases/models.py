from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel


class PurchaseOrder(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT     = "draft",     "Draft"
        ORDERED   = "ordered",   "Ordered"
        RECEIVED  = "received",  "Received"
        PARTIAL   = "partial",   "Partially Received"
        CANCELLED = "cancelled", "Cancelled"

    order_number = models.CharField(max_length=30, unique=True, blank=True)
    supplier     = models.ForeignKey("products.Supplier", on_delete=models.PROTECT, related_name="purchase_orders")
    status       = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    order_date   = models.DateField(default=timezone.now)
    expected_date = models.DateField(null=True, blank=True)
    subtotal     = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    tax_amount   = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    amount_paid  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    notes        = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            last = PurchaseOrder.objects.order_by("-id").first()
            n = (last.id if last else 0) + 1
            self.order_number = f"PO{timezone.now().strftime('%Y%m')}{n:04d}"
        super().save(*args, **kwargs)


class PurchaseOrderItem(TimeStampedModel):
    order    = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name="items")
    product  = models.ForeignKey("products.Product", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_cost = models.DecimalField(max_digits=14, decimal_places=2)
    received  = models.PositiveIntegerField(default=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_cost
        super().save(*args, **kwargs)


class SupplierPayment(TimeStampedModel):
    supplier   = models.ForeignKey("products.Supplier", on_delete=models.PROTECT, related_name="payments")
    order      = models.ForeignKey(PurchaseOrder, on_delete=models.SET_NULL, null=True, blank=True)
    amount     = models.DecimalField(max_digits=14, decimal_places=2)
    method     = models.CharField(max_length=50, default="cash")
    reference  = models.CharField(max_length=100, blank=True)
    payment_date = models.DateField(default=timezone.now)
    notes      = models.TextField(blank=True)
