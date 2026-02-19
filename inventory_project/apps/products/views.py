from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.products.models import Category, Supplier, Warehouse, Product, StockMovement
from apps.products.serializers import (
    CategorySerializer,
    SupplierSerializer,
    WarehouseSerializer,
    ProductSerializer,
    StockMovementSerializer,
)
from permissions.permission_classes import ScreenPermissionRequired
from apps.core.audit import AuditLogMixin


class CategoryViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [ScreenPermissionRequired]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


class SupplierViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by("name")
    serializer_class = SupplierSerializer
    permission_classes = [ScreenPermissionRequired]
    search_fields = ["name", "contact_email"]
    ordering_fields = ["name", "created_at"]


class WarehouseViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Warehouse.objects.all().order_by("name")
    serializer_class = WarehouseSerializer
    permission_classes = [ScreenPermissionRequired]
    search_fields = ["name", "location"]
    ordering_fields = ["name", "created_at"]


class ProductViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [ScreenPermissionRequired]
    filterset_fields = ["category", "supplier", "warehouse", "is_active"]
    search_fields = ["sku", "name"]
    ordering_fields = ["sku", "name", "created_at", "stock_quantity"]

    @action(detail=False, methods=["get"], permission_classes=[ScreenPermissionRequired])
    def low_stock(self, request):
        products = self.get_queryset().filter(stock_quantity__lte=F("low_stock_threshold"))
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().select_related("product").order_by("-created_at")
    serializer_class = StockMovementSerializer
    permission_classes = [ScreenPermissionRequired]
    filterset_fields = ["movement_type", "product"]
    ordering_fields = ["created_at"]
