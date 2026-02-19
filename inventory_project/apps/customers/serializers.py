from rest_framework import serializers
from .models import Customer, CustomerTransaction


class CustomerSerializer(serializers.ModelSerializer):
    outstanding = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ("id", "code", "balance", "created_at", "updated_at")

    def get_outstanding(self, obj):
        return float(obj.balance)


class CustomerTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerTransaction
        fields = "__all__"
        read_only_fields = ("id", "balance_after", "created_at", "updated_at")
