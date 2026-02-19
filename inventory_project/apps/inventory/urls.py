from rest_framework.routers import DefaultRouter
from .views import StockMovementViewSet, StockLevelViewSet

router = DefaultRouter()
router.register("stock-movements",StockMovementViewSet,basename="stock-movement")
router.register("stock-levels",   StockLevelViewSet,   basename="stock-level")

urlpatterns = router.urls
