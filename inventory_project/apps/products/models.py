from django.conf import settings
from django.db import models
from apps.core.models import TimeStampedModel


class Category(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="subcategories",
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Supplier(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    contact_email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Warehouse(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    sku = models.CharField(max_length=50, unique=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="products")
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name="products")
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, related_name="products")
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold

    def save(self, *args, **kwargs):
        # Generate SKU automatically if not provided
        if not self.sku:
            from django.utils import timezone
            last_product = Product.objects.order_by("-id").first()
            n = (last_product.id if last_product else 0) + 1
            self.sku = f"SKU{timezone.now().strftime('%Y%m')}{n:05d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sku} - {self.name}"


class StockMovement(TimeStampedModel):
    class Type(models.TextChoices):
        IN = "IN", "Stock In"
        OUT = "OUT", "Stock Out"

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=3, choices=Type.choices)
    quantity = models.PositiveIntegerField()
    reference = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.product.sku} {self.movement_type} {self.quantity}"
