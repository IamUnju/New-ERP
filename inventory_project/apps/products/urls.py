from django.urls import include, path
from rest_framework.routers import DefaultRouter
from apps.products.views import (
    CategoryViewSet,
    MainCategoryViewSet,
    SubCategoryViewSet,
    SupplierViewSet,
    WarehouseViewSet,
    ProductViewSet,
    StockMovementViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="categories")
router.register("main-categories", MainCategoryViewSet, basename="main-categories")
router.register("subcategories", SubCategoryViewSet, basename="subcategories")
router.register("suppliers", SupplierViewSet, basename="suppliers")
router.register("warehouses", WarehouseViewSet, basename="warehouses")
router.register("products", ProductViewSet, basename="products")
router.register("stock-movements", StockMovementViewSet, basename="stock-movements")

urlpatterns = [
    path("", include(router.urls)),
]
