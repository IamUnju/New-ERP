from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, SupplierPaymentViewSet

router = DefaultRouter()
router.register("purchase-orders",   PurchaseOrderViewSet,   basename="purchase-order")
router.register("supplier-payments", SupplierPaymentViewSet, basename="supplier-payment")

urlpatterns = router.urls
