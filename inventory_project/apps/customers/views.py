from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer, CustomerTransaction
from .serializers import CustomerSerializer, CustomerTransactionSerializer
from apps.core.audit import AuditLogMixin


class CustomerViewSet(AuditLogMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["is_active"]
    search_fields = ["name", "email", "phone", "code"]
    ordering_fields = ["name", "balance", "created_at"]

    @action(detail=True, methods=["get"])
    def transactions(self, request, pk=None):
        customer = self.get_object()
        txns = customer.transactions.all()
        serializer = CustomerTransactionSerializer(txns, many=True)
        return Response(serializer.data)


class CustomerTransactionViewSet(viewsets.ModelViewSet):
    queryset = CustomerTransaction.objects.select_related("customer").all()
    serializer_class = CustomerTransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["customer", "txn_type"]
    ordering_fields = ["created_at", "amount"]
