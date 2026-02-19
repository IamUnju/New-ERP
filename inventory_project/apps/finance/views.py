from datetime import date
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django_filters.rest_framework import DjangoFilterBackend
from .models import Account, Expense, Income, LedgerEntry
from .serializers import (
    AccountSerializer, ExpenseSerializer, IncomeSerializer,
    LedgerEntrySerializer, FinanceSummarySerializer,
)
from apps.core.audit import AuditLogMixin


class AccountViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ["acct_type", "is_active"]
    search_fields = ["code", "name"]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("account").all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "account"]
    search_fields = ["title", "reference"]
    ordering_fields = ["expense_date", "amount"]


class IncomeViewSet(viewsets.ModelViewSet):
    queryset = Income.objects.select_related("account").all()
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["account"]
    search_fields = ["title", "reference"]
    ordering_fields = ["income_date", "amount"]


class LedgerEntryViewSet(viewsets.ModelViewSet):
    queryset = LedgerEntry.objects.select_related("account").all()
    serializer_class = LedgerEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["account", "entry_type"]
    ordering_fields = ["entry_date", "amount"]


class FinanceSummaryViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        year  = int(request.query_params.get("year",  date.today().year))
        month = request.query_params.get("month")

        income_qs  = Income.objects.all()
        expense_qs = Expense.objects.filter(status="paid")

        if month:
            income_qs  = income_qs.filter(income_date__year=year, income_date__month=int(month))
            expense_qs = expense_qs.filter(expense_date__year=year, expense_date__month=int(month))
            period = f"{year}-{str(month).zfill(2)}"
        else:
            income_qs  = income_qs.filter(income_date__year=year)
            expense_qs = expense_qs.filter(expense_date__year=year)
            period = str(year)

        total_income   = income_qs.aggregate(t=Sum("amount"))["t"] or 0
        total_expenses = expense_qs.aggregate(t=Sum("amount"))["t"] or 0
        data = {
            "total_income":   total_income,
            "total_expenses": total_expenses,
            "net_profit":     total_income - total_expenses,
            "period":         period,
        }
        return Response(FinanceSummarySerializer(data).data)
