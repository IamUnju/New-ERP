from rest_framework import serializers
from .models import StockMovement, StockLevel


class StockMovementSerializer(serializers.ModelSerializer):
    product_name   = serializers.CharField(source="product.name", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)

    class Meta:
        model = StockMovement
        fields = "__all__"
        read_only_fields = ("id", "before_qty", "after_qty", "created_at", "updated_at")


class StockLevelSerializer(serializers.ModelSerializer):
    product_name   = serializers.CharField(source="product.name", read_only=True)
    product_sku    = serializers.CharField(source="product.sku", read_only=True)
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)

    class Meta:
        model = StockLevel
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
