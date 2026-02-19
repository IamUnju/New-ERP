from django.db.models import F, Sum
from django.utils import timezone
from apps.products.models import Product, StockMovement
from apps.sales.models import Order


def dashboard_metrics():
    today = timezone.now().date()
    start_month = today.replace(day=1)
    total_sales = Order.objects.filter(created_at__date__gte=start_month).aggregate(sum=Sum("total_amount"))["sum"] or 0
    low_stock = Product.objects.filter(stock_quantity__lte=F("low_stock_threshold")).count()
    recent_movements = StockMovement.objects.order_by("-created_at")[:10].count()
    return {
        "monthly_sales": total_sales,
        "low_stock_count": low_stock,
        "recent_movements": recent_movements,
    }
