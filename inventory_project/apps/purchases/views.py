from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import PurchaseOrder, PurchaseOrderItem, SupplierPayment
from .serializers import (
    PurchaseOrderSerializer,
    PurchaseOrderCreateSerializer, SupplierPaymentSerializer,
)


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.select_related("supplier").prefetch_related("items").all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "supplier"]
    search_fields = ["order_number"]
    ordering_fields = ["order_date", "total_amount", "created_at"]

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return PurchaseOrderCreateSerializer
        return PurchaseOrderSerializer

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        """Mark order as received and update stock."""
        order = self.get_object()
        if order.status in ("received", "cancelled"):
            return Response({"detail": "Order cannot be received."}, status=status.HTTP_400_BAD_REQUEST)
        order.status = PurchaseOrder.Status.RECEIVED
        order.save()
        return Response(PurchaseOrderSerializer(order).data)


class SupplierPaymentViewSet(viewsets.ModelViewSet):
    queryset = SupplierPayment.objects.select_related("supplier", "order").all()
    serializer_class = SupplierPaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["supplier", "order"]
    ordering_fields = ["payment_date", "amount"]
