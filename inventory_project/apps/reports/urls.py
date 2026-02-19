from django.urls import path
from apps.reports.views import DashboardReportView, SalesReportView, StockMovementReportView

urlpatterns = [
    path("reports/dashboard/", DashboardReportView.as_view(), name="report-dashboard"),
    path("reports/sales/", SalesReportView.as_view(), name="report-sales"),
    path("reports/stock-movements/", StockMovementReportView.as_view(), name="report-stock-movements"),
]
