from rest_framework import serializers
from .models import Account, Expense, Income, LedgerEntry


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = "__all__"
        read_only_fields = ("id", "balance", "created_at", "updated_at")


class ExpenseSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ("id", "reference", "created_at", "updated_at")


class IncomeSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = Income
        fields = "__all__"
        read_only_fields = ("id", "reference", "created_at", "updated_at")


class LedgerEntrySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = LedgerEntry
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class FinanceSummarySerializer(serializers.Serializer):
    total_income   = serializers.DecimalField(max_digits=16, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=16, decimal_places=2)
    net_profit     = serializers.DecimalField(max_digits=16, decimal_places=2)
    period         = serializers.CharField()
