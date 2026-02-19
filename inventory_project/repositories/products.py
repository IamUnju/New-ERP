from repositories.base import BaseRepository
from apps.products.models import Category, Supplier, Warehouse, Product, StockMovement


class CategoryRepository(BaseRepository):
    def __init__(self):
        super().__init__(Category)


class SupplierRepository(BaseRepository):
    def __init__(self):
        super().__init__(Supplier)


class WarehouseRepository(BaseRepository):
    def __init__(self):
        super().__init__(Warehouse)


class ProductRepository(BaseRepository):
    def __init__(self):
        super().__init__(Product)


class StockMovementRepository(BaseRepository):
    def __init__(self):
        super().__init__(StockMovement)
