from rest_framework import serializers
from apps.sales.models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "unit_price", "line_total"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_input = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "order_number",
            "total_amount",
            "status",
            "items",
            "items_input",
            "created_at",
        ]
