from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockMovement, StockLevel
from .serializers import StockMovementSerializer, StockLevelSerializer


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related("product", "warehouse").all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["movement_type", "warehouse", "product"]
    ordering_fields = ["created_at", "quantity"]

    def perform_create(self, serializer):
        movement = serializer.save(created_by=self.request.user)
        # Update StockLevel
        sl, _ = StockLevel.objects.get_or_create(
            product=movement.product, warehouse=movement.warehouse
        )
        before = sl.quantity
        sl.quantity += movement.quantity
        sl.save()
        movement.before_qty = before
        movement.after_qty  = sl.quantity
        movement.save()


class StockLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockLevel.objects.select_related("product", "warehouse").all()
    serializer_class = StockLevelSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["warehouse", "product"]
    search_fields = ["product__name", "product__sku", "warehouse__name"]
