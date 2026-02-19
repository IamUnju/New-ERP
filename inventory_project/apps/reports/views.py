from datetime import timedelta
from django.db.models import F, Sum
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import StockMovement, Product
from apps.sales.models import Order
from permissions.permission_classes import ScreenPermissionRequired


class DashboardReportView(APIView):
    permission_classes = [ScreenPermissionRequired]

    def get(self, request):
        today = timezone.now().date()
        start_month = today.replace(day=1)
        monthly_sales = Order.objects.filter(created_at__date__gte=start_month).aggregate(sum=Sum("total_amount"))["sum"] or 0
        low_stock = Product.objects.filter(stock_quantity__lte=F("low_stock_threshold")).count()
        return Response({"monthly_sales": monthly_sales, "low_stock_count": low_stock})


class SalesReportView(APIView):
    permission_classes = [ScreenPermissionRequired]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now() - timedelta(days=days)
        totals = Order.objects.filter(created_at__gte=start_date).aggregate(sum=Sum("total_amount"))
        return Response({"range_days": days, "total_sales": totals["sum"] or 0})


class StockMovementReportView(APIView):
    permission_classes = [ScreenPermissionRequired]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now() - timedelta(days=days)
        movements = StockMovement.objects.filter(created_at__gte=start_date).count()
        return Response({"range_days": days, "movement_count": movements})
