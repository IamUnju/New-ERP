from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, CustomerTransactionViewSet

router = DefaultRouter()
router.register("customers",             CustomerViewSet,            basename="customer")
router.register("customer-transactions", CustomerTransactionViewSet, basename="customer-transaction")

urlpatterns = router.urls
