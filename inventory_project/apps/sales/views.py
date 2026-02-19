from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status

from apps.sales.models import Order
from apps.sales.serializers import OrderSerializer
from permissions.permission_classes import ScreenPermissionRequired
from services.sales import create_sale


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [ScreenPermissionRequired]
    filterset_fields = ["status"]
    search_fields = ["order_number", "customer_name"]
    ordering_fields = ["created_at", "total_amount"]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = serializer.validated_data
        payload["items"] = request.data.get("items", request.data.get("items_input", []))
        try:
            order = create_sale(request.user, payload)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        output = self.get_serializer(order)
        return Response(output.data, status=status.HTTP_201_CREATED)
