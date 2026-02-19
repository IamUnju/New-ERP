from decimal import Decimal
from django.db import transaction
from django.db.models import F
from apps.products.models import Product, StockMovement
from apps.sales.models import Order, OrderItem


# Sales logic performs stock validation and writes stock movements.


def create_sale(user, payload):
    items = payload.get("items", [])
    with transaction.atomic():
        order = Order.objects.create(
            customer_name=payload.get("customer_name", ""),
            status=payload.get("status", Order.Status.COMPLETED),
            created_by=user,
        )

        total_amount = Decimal("0.00")
        for item in items:
            product = Product.objects.select_for_update().get(id=item["product_id"])
            quantity = int(item["quantity"])
            if product.stock_quantity < quantity:
                raise ValueError(f"Insufficient stock for {product.name}")

            unit_price = product.price
            line_total = unit_price * quantity
            total_amount += line_total

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )

            StockMovement.objects.create(
                product=product,
                movement_type=StockMovement.Type.OUT,
                quantity=quantity,
                reference=f"SALE-{order.id}",
                created_by=user,
            )

        order.total_amount = total_amount
        order.save()

    return order
