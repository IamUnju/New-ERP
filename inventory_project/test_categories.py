"""
Quick test script to add sample categories for testing cascading dropdowns
Run: python manage.py shell < test_categories.py
"""

from apps.products.models import Category

# Create main categories
main_categories = [
    {"name": "Electronics", "description": "Electronic devices and gadgets"},
    {"name": "Furniture", "description": "Office and home furniture"},
    {"name": "Stationery", "description": "Office supplies and stationery"},
]

for cat_data in main_categories:
    Category.objects.get_or_create(
        name=cat_data["name"],
        defaults={"description": cat_data["description"], "is_active": True}
    )

# Get main categories
electronics = Category.objects.get(name="Electronics")
furniture = Category.objects.get(name="Furniture")
stationery = Category.objects.get(name="Stationery")

# Create subcategories for Electronics
electronics_subs = [
    {"name": "Laptops", "parent": electronics},
    {"name": "Phones", "parent": electronics},
    {"name": "Tablets", "parent": electronics},
]

for sub_data in electronics_subs:
    Category.objects.get_or_create(
        name=sub_data["name"],
        defaults={"parent": sub_data["parent"], "is_active": True}
    )

# Create subcategories for Furniture  
furniture_subs = [
    {"name": "Desks", "parent": furniture},
    {"name": "Chairs", "parent": furniture},
    {"name": "Cabinets", "parent": furniture},
]

for sub_data in furniture_subs:
    Category.objects.get_or_create(
        name=sub_data["name"],
        defaults={"parent": sub_data["parent"], "is_active": True}
    )

# Create subcategories for Stationery
stationery_subs = [
    {"name": "Pens", "parent": stationery},
    {"name": "Papers", "parent": stationery},
    {"name": "Folders", "parent": stationery},
]

for sub_data in stationery_subs:
    Category.objects.get_or_create(
        name=sub_data["name"],
        defaults={"parent": sub_data["parent"], "is_active": True}
    )

print("✅ Sample categories created successfully!")
print("\nMain Categories:")
for cat in Category.objects.filter(parent__isnull=True, is_active=True):
    print(f"  - {cat.name}")
    subs = Category.objects.filter(parent=cat, is_active=True)
    for sub in subs:
        print(f"    └─ {sub.name}")
