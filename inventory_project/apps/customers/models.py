from django.db import models
from apps.core.models import TimeStampedModel


class Customer(TimeStampedModel):
    """Customer master record."""
    code = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    credit_limit = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    # running balance: positive = customer owes us, negative = we owe customer
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} – {self.name}"

    def save(self, *args, **kwargs):
        if not self.code:
            last = Customer.objects.order_by("-id").first()
            n = (last.id if last else 0) + 1
            self.code = f"CUST{n:05d}"
        super().save(*args, **kwargs)


class CustomerTransaction(TimeStampedModel):
    """Ledger entry for every financial movement on a customer account."""
    class TxnType(models.TextChoices):
        SALE    = "sale",    "Sale"
        PAYMENT = "payment", "Payment"
        RETURN  = "return",  "Return"
        ADJUST  = "adjust",  "Adjustment"

    customer  = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="transactions")
    txn_type  = models.CharField(max_length=20, choices=TxnType.choices)
    reference = models.CharField(max_length=100, blank=True)
    amount    = models.DecimalField(max_digits=14, decimal_places=2)   # positive = debit
    balance_after = models.DecimalField(max_digits=14, decimal_places=2)
    note      = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
