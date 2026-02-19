from django.contrib import admin
from apps.products.models import Category, Supplier, Warehouse, Product, StockMovement


admin.site.register(Category)
admin.site.register(Supplier)
admin.site.register(Warehouse)
admin.site.register(Product)
admin.site.register(StockMovement)
