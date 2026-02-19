from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem, SupplierPayment


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = "__all__"
        read_only_fields = ("id", "line_total", "created_at", "updated_at")


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ("id", "order_number", "subtotal", "total_amount", "created_at", "updated_at")


class PurchaseOrderCreateSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True)

    class Meta:
        model = PurchaseOrder
        fields = "__all__"
        read_only_fields = ("id", "order_number", "subtotal", "total_amount", "created_at", "updated_at")

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = PurchaseOrder.objects.create(**validated_data)
        subtotal = 0
        for item_data in items_data:
            item = PurchaseOrderItem.objects.create(order=order, **item_data)
            subtotal += item.line_total
        order.subtotal = subtotal
        order.total_amount = subtotal + order.tax_amount
        order.save()
        return order


class SupplierPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplierPayment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
