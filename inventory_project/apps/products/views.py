from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend

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
    filterset_fields = ["parent", "is_active"]
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return only active categories"""
        categories = self.get_queryset().filter(is_active=True)
        page = self.paginate_queryset(categories)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)


class MainCategoryViewSet(CategoryViewSet):
    """ViewSet for main/parent categories only"""
    def get_queryset(self):
        return super().get_queryset().filter(parent__isnull=True)
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return only active main categories"""
        categories = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(parent=None)

    def perform_update(self, serializer):
        serializer.save(parent=None)


class SubCategoryViewSet(CategoryViewSet):
    """ViewSet for subcategories only"""
    def get_queryset(self):
        qs = super().get_queryset().filter(parent__isnull=False)
        # Allow filtering by parent ID
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            qs = qs.filter(parent_id=parent_id)
        return qs
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return active subcategories, optionally filtered by parent"""
        categories = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        parent = serializer.validated_data.get("parent")
        if parent is None:
            raise ValidationError({"parent": "Subcategory requires a main category."})
        if parent.parent_id is not None:
            raise ValidationError({"parent": "Main category cannot be a subcategory."})
        serializer.save()

    def perform_update(self, serializer):
        parent = serializer.validated_data.get("parent", serializer.instance.parent)
        if parent is None:
            raise ValidationError({"parent": "Subcategory requires a main category."})
        if parent.parent_id is not None:
            raise ValidationError({"parent": "Main category cannot be a subcategory."})
        serializer.save()


class SupplierViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by("name")
    serializer_class = SupplierSerializer
    permission_classes = [ScreenPermissionRequired]
    search_fields = ["name", "contact_email"]
    ordering_fields = ["name", "created_at"]
    filterset_fields = ["is_active"]
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return only active suppliers"""
        suppliers = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)


class WarehouseViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Warehouse.objects.all().order_by("name")
    serializer_class = WarehouseSerializer
    permission_classes = [ScreenPermissionRequired]
    search_fields = ["name", "location"]
    ordering_fields = ["name", "created_at"]
    filterset_fields = ["is_active"]
    
    @action(detail=False, methods=["get"], url_path="active")
    def active_only(self, request):
        """Return only active warehouses"""
        warehouses = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(warehouses, many=True)
        return Response(serializer.data)


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
