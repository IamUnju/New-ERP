from rest_framework import serializers
from apps.products.models import Category, Supplier, Warehouse, Product, StockMovement


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", read_only=True)
    full_name = serializers.SerializerMethodField()
    is_main = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "parent",
            "parent_name",
            "full_name",
            "is_main",
            "created_at",
        ]

    def get_full_name(self, obj):
        if obj.parent:
            return f"{obj.parent.name} / {obj.name}"
        return obj.name

    def get_is_main(self, obj):
        return obj.parent_id is None


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ["id", "name", "contact_email", "phone", "created_at"]


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "name", "location", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "sku",
            "name",
            "description",
            "category",
            "category_name",
            "supplier",
            "supplier_name",
            "warehouse",
            "warehouse_name",
            "price",
            "stock_quantity",
            "low_stock_threshold",
            "is_low_stock",
            "is_active",
            "created_at",
        ]


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = ["id", "product", "product_name", "movement_type", "quantity", "reference", "created_by", "created_at"]
