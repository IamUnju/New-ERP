from django.db import models
from django.utils import timezone
from apps.core.models import TimeStampedModel


class Account(TimeStampedModel):
    """Chart of accounts entry."""
    class AccountType(models.TextChoices):
        ASSET     = "asset",     "Asset"
        LIABILITY = "liability", "Liability"
        EQUITY    = "equity",    "Equity"
        INCOME    = "income",    "Income"
        EXPENSE   = "expense",   "Expense"

    code    = models.CharField(max_length=20, unique=True)
    name    = models.CharField(max_length=200)
    acct_type = models.CharField(max_length=20, choices=AccountType.choices)
    balance = models.DecimalField(max_digits=16, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} – {self.name}"


class Expense(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING  = "pending",  "Pending"
        APPROVED = "approved", "Approved"
        PAID     = "paid",     "Paid"
        REJECTED = "rejected", "Rejected"

    reference   = models.CharField(max_length=30, unique=True, blank=True)
    title       = models.CharField(max_length=200)
    account     = models.ForeignKey(Account, on_delete=models.PROTECT, null=True, blank=True)
    amount      = models.DecimalField(max_digits=14, decimal_places=2)
    expense_date = models.DateField(default=timezone.now)
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    description = models.TextField(blank=True)
    receipt     = models.FileField(upload_to="receipts/", null=True, blank=True)

    class Meta:
        ordering = ["-expense_date"]

    def __str__(self):
        return f"{self.reference} – {self.title}"

    def save(self, *args, **kwargs):
        if not self.reference:
            last = Expense.objects.order_by("-id").first()
            n = (last.id if last else 0) + 1
            self.reference = f"EXP{timezone.now().strftime('%Y%m')}{n:04d}"
        super().save(*args, **kwargs)


class Income(TimeStampedModel):
    reference   = models.CharField(max_length=30, unique=True, blank=True)
    title       = models.CharField(max_length=200)
    account     = models.ForeignKey(Account, on_delete=models.PROTECT, null=True, blank=True)
    amount      = models.DecimalField(max_digits=14, decimal_places=2)
    income_date = models.DateField(default=timezone.now)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["-income_date"]

    def save(self, *args, **kwargs):
        if not self.reference:
            last = Income.objects.order_by("-id").first()
            n = (last.id if last else 0) + 1
            self.reference = f"INC{timezone.now().strftime('%Y%m')}{n:04d}"
        super().save(*args, **kwargs)


class LedgerEntry(TimeStampedModel):
    """Double-entry ledger line."""
    class EntryType(models.TextChoices):
        DEBIT  = "debit",  "Debit"
        CREDIT = "credit", "Credit"

    account    = models.ForeignKey(Account, on_delete=models.PROTECT, related_name="entries")
    entry_type = models.CharField(max_length=10, choices=EntryType.choices)
    amount     = models.DecimalField(max_digits=14, decimal_places=2)
    reference  = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    entry_date = models.DateField(default=timezone.now)

    class Meta:
        ordering = ["-entry_date", "-created_at"]
